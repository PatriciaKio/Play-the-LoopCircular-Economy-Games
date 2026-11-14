// Like counter for "Play the Loop" — Cloudflare Worker + KV
//
// Endpoints (match LIKES_API in index.html):
//   GET  /likes              -> {"recycling-rush": 12, ...}
//   POST /likes/{id}/like    -> {"count": 13}
//   POST /likes/{id}/unlike  -> {"count": 12}
//
// Needs:
//   - KV namespace bound as  LIKES
//   - Variable ALLOWED_ORIGIN, e.g. https://your-username.github.io  (no trailing slash, no path)

const GAME_IDS = [
  "recycling-rush",
  "close-the-loop-cards",
  "build-a-well",
  "close-the-loop-furniture",
  "furniture-rescue-race",
  "scrap-to-scale",
  "build-recover-rebuild",
  "tim-the-builder",
  "second-life",
];

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: cors });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const parts = new URL(request.url).pathname.split("/").filter(Boolean);
    if (parts[0] !== "likes") return json({ error: "Not found" }, 404);

    // GET /likes : all counts
    if (request.method === "GET" && parts.length === 1) {
      const counts = {};
      await Promise.all(
        GAME_IDS.map(async (id) => {
          counts[id] = parseInt((await env.LIKES.get("count:" + id)) || "0", 10);
        })
      );
      return json(counts);
    }

    // POST /likes/{id}/like|unlike
    if (request.method === "POST" && parts.length === 3) {
      const [, id, action] = parts;
      if (!GAME_IDS.includes(id)) return json({ error: "Unknown game" }, 400);
      if (action !== "like" && action !== "unlike") return json({ error: "Bad action" }, 400);

      // One like per visitor per game, keyed by a hash of their IP (the IP itself is never stored)
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const voteKey = "vote:" + id + ":" + (await sha256(ip + id));
      const countKey = "count:" + id;

      const hasVoted = (await env.LIKES.get(voteKey)) !== null;
      let count = parseInt((await env.LIKES.get(countKey)) || "0", 10);

      if (action === "like" && !hasVoted) {
        count += 1;
        await env.LIKES.put(voteKey, "1");
        await env.LIKES.put(countKey, String(count));
      } else if (action === "unlike" && hasVoted) {
        count = Math.max(0, count - 1);
        await env.LIKES.delete(voteKey);
        await env.LIKES.put(countKey, String(count));
      }
      return json({ count });
    }

    return json({ error: "Not found" }, 404);
  },
};

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
