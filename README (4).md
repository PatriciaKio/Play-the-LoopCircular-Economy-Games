# Play the Loop: Circular Economy Games, Refined

A one-page website that showcases nine student-designed circular economy games, with refined rules based on a sentiment analysis of peer feedback. Visitors can filter games by feedback theme, like their favorites, and play a refined demo of **Recycling Rush**.

The site is a single `index.html` file with no build step and no dependencies, so it runs on GitHub Pages as is.

## What's on the page

| Section | What it does |
|---|---|
| **What the feedback said** | Summarizes the sentiment analysis of 10 peer comments (80% positive, 0 negative) and the four improvement themes. |
| **The games** | One card per game: format, audience, topics, original rules and refined logic. Each change is labeled with the theme it addresses and the peer comment behind it. Rules reviewers praised are marked *kept*. |
| **Like buttons** | A heart button on every card. You can sort by *Most liked*. |
| **Filters** | Show only the games refined for a given theme: Clarity, Learning in play, Fairer mechanics or Age-appropriate. |
| **Recycling Rush demo** | A playable 45-second sorting game. A wrong sort explains why and pauses the clock while you read, the correct bin glows the next time that item appears, and the end screen lists your most-missed items. |

### How the feedback shaped the refinements

| Theme from the analysis | Example refinement |
|---|---|
| Clarity and visual cues (comments #2, #3, #10) | Open-eye and closed-eye trade icons and a turn strip in *Close the Loop!*, and a guided Round 0 in *Scrap to Scale* |
| Learning built into play (#1, #3) | Instant "why" explanations in *Recycling Rush*, and a fact on every card in *Close the Loop!* |
| Fairer mechanics and decision rules (#4, #5) | Salvage in place of all-or-nothing projects, and a Village Council vote in *Let's Build a Well* |
| Age-appropriate language (#9) | Kids and Expert reading levels in *Tim the Builder* |

Comment #7 (food waste) and comment #9 (the "peanut level") were about games that aren't in the game document, so their themes are applied to other games instead.

## Publish on GitHub Pages

1. Create a new public repository on GitHub, for example `play-the-loop`.
2. Upload `index.html` and `README.md` to the root of the repository: **Add file → Upload files → Commit changes**.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the `main` branch and the `/ (root)` folder, then click **Save**.
5. After a minute or two the site is live at `https://<your-username>.github.io/play-the-loop/`.

To preview it locally, open `index.html` in any browser.

## How the like buttons work

GitHub Pages only serves static files, so it can't store data from visitors. By default:

- Each like is saved in the visitor's own browser (`localStorage`) and is still there when they come back.
- The button shows **Like** or **Liked**. Sorting by *Most liked* puts that visitor's liked games first.
- Visitors can't see each other's likes.

### Optional: shared like totals

To show totals from everyone, connect a small counter API. Set `LIKES_API` near the top of the `<script>` in `index.html`:

```js
const LIKES_API = "https://your-worker.example.workers.dev/likes";
```

The page expects three endpoints:

| Request | Response |
|---|---|
| `GET {LIKES_API}` | `{"recycling-rush": 12, "build-a-well": 7, ...}` |
| `POST {LIKES_API}/{gameId}/like` | `{"count": 13}` |
| `POST {LIKES_API}/{gameId}/unlike` | `{"count": 12}` |

A ready-made Cloudflare Worker is included in `worker.js`. Upload it with the other files, or keep it out of the repo, because it runs on Cloudflare, not GitHub. Steps:

1. Create a free Cloudflare account. Go to **Storage & Databases → KV**, create a namespace named `LIKES`.
2. Go to **Workers & Pages → Create → Worker**, name it (e.g. `play-the-loop-likes`), deploy, then **Edit code**, paste in `worker.js` and deploy again.
3. In the Worker's **Settings → Bindings**, add a **KV namespace** binding with variable name `LIKES` pointing at the namespace.
4. In **Settings → Variables and Secrets**, add `ALLOWED_ORIGIN` = `https://<your-username>.github.io`.
5. Open `https://play-the-loop-likes.<your-subdomain>.workers.dev/likes`. You should see all nine games with a count of 0.
6. Set `LIKES_API` in `index.html` to that URL and commit.

The Worker allows one like per game for each visitor, matched by a hashed IP address. People sharing a school network count as one visitor.

Any free serverless option works, for example a Cloudflare Worker with KV storage or a Supabase or Firebase function. Allow cross-origin requests (CORS) from your `github.io` domain. Once `LIKES_API` is set, the buttons show live counts, and the page still works with local-only likes if the API can't be reached.

Game IDs: `recycling-rush`, `close-the-loop-cards`, `build-a-well`, `close-the-loop-furniture`, `furniture-rescue-race`, `scrap-to-scale`, `build-recover-rebuild`, `tim-the-builder`, `second-life`.

## Editing the content

All game content is in the `GAMES` array in the `<script>` section of `index.html`. Each game looks like this:

```js
{
  id: "build-a-well",                 // unique, used for likes
  title: "Let's Build a Well",
  meta: "Co-op board game · 3–6 players · families 8+",
  topics: ["Upcycling / repurposing"], // grey tags
  pitch: "One-sentence description.",
  original: "The original rules.",
  link: "https://...",                 // optional "Play original" button (none set by default)
  changes: [
    { theme: "fair", text: "What changed.", why: "Which feedback it answers" }
  ]
}
```

`theme` must be one of `clarity`, `learning`, `fair`, `age` or `kept`. The demo's items and their explanations are in the `ITEMS` array.

## Accessibility

- Every control is a real button that you can reach by keyboard, and toggles use `aria-pressed`.
- In the demo, keys **1–5** choose Paper, Plastic, Glass, Metal and Not here. **Enter** closes an explanation.
- Results and hints are announced to screen readers through live regions.
- Animations turn off for visitors who have *reduce motion* switched on.

## Credits and notes

- The game concepts were designed by students. The refinements are design proposals drawn from peer feedback, and the original creators decide which ones to adopt.
- Environmental scores in these games are teaching models, not life-cycle assessments. Recycling rules vary by city, so check what your local service accepts.
