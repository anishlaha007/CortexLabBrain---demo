# Cortex prototype

A clickable prototype of Cortex for getting feedback from researchers, PIs and investors before the real build. It has no backend. Everything runs in the browser from mock data. The plan is in [`../PROTOTYPE-PLAN.md`](../PROTOTYPE-PLAN.md).

**Demo lab:** *Robophysics Lab*, built from the public work of Georgia Tech's CRAB Lab (Prof. Dan Goldman). The papers, robots and press are real and credited (see [`LAB-INVENTORY.md`](LAB-INVENTORY.md)). The teammates, their chats, everyday lab files and every number are illustrative. Not affiliated with the lab.

![Home: the lab brain in the light theme](preview/home-light.jpg)

## Open it

| How | When |
|-----|------|
| **[`release/cortex-prototype.html`](release/cortex-prototype.html)** | Download and double-click. Works offline, no install. Best for meetings |
| GitHub Pages | After merging to `main` and turning on Pages (Settings → Pages → Source: GitHub Actions) |
| `npm install && npm run dev` | Working on it |

**Useful links and keys**
- `?theme=light`, `?theme=dark` or `?theme=mocha` picks a theme. The switch in the top bar does the same, and the choice is remembered.
- `?chat=c-slip` opens straight into the split view with the full example conversation.
- `?ambient=off`, `?ambient=calm` or `?ambient=busy` sets how much teammates do on their own, for this visit only.
- `,` (the comma key) opens **presenter setup**. So does `?setup`, and a copied setup link brings your whole setup with it.
- `Esc` backs out one layer at a time and finally flies back to the whole lab.

## What's in this version

Every button does something. New this round: zooming into a chat, teammates who act on their own, 87 questions, and presenter setup.

**Zoom into a chat.**
- Scroll in on any chat, double-click it, or use **Lab › Topic › Chat** at the top of the brain. The chat unfolds into its prompts in order. Each prompt shows the file or output it used, with a dot in the colour of the person who asked.
- Click a prompt to open the chat at that exact message, which flashes. Click its file to open the source.
- Every new answer adds a memory dot, so the prompt chain grows as people ask.

**The lab lives on its own.**
- Teammates type questions live, so you can watch the draft appear. The Lab AI's cited answer then streams in, and a new memory dot joins the chat on the brain.
- They also branch, pull papers and chats in, and merge. The Lab AI links findings across topics, and Lucas, Elena and Sam come online partway through.
- Everything shows up in the Live feed, the People rail statuses, the top-bar avatars and the pulsing rings. Follow anyone to watch them work.
- When a teammate opens a chat **you** made, then pulls it into their own work, you get a notification. Nothing else interrupts you.
- It plays in the same order every time. Set it to off, calm or busy in presenter setup.

| Zoom into a chat | The lab, live (busy) |
|------|-------|
| ![The sidewinder chat unfolded into its four prompts, each with the file it used](preview/zoom-in.jpg) | ![Live feed full of teammates asking, pulling and linking on their own](preview/lab-live.jpg) |

**87 questions.**
- Every topic is covered, along with people ("who knows the snake robot?"), meeting prep, finding files, drafts, new ideas that suggest pulling in a teammate's chat, general background, and things outside Cortex's reach.
- Asked inside a chat, answers from that chat's topic win close calls. After each answer, **Ask next** offers three follow-ups from the same topic.
- Search lists matching questions as you type. Anything else gets an honest "not found" with the closest files.

**Presenter setup** (`,`, or You menu → Presenter setup).
- Rename the lab, yourself and every teammate. New names flow into answers, notes, notifications, the feed and the tour.
- Recolour people by clicking their avatar, and set anyone to live, away, offline or alumni.
- Choose how busy the lab is, show or hide Mei's cursor and the demo chip, and pick a theme.
- **Copy setup link** shares the exact setup. **Reset** returns to the original demo lab.
- Saved in this browser.

![Presenter setup: the lab renamed and Kofi renamed and recoloured](preview/presenter-setup.jpg)

**Still here from before:**

**Drag anything into a chat.**
- Grab any dot on the brain (a chat, paper, robot, file, saved answer or a whole topic) and drag it out. It springs back into place, and a card follows your cursor on an elastic tether.
- The chat lights up as a drop target.
- Let go and the card flies into the context tray and pops in as a chip. The token budget fills, and a dotted "pulled in" line draws itself across the brain with a pulse at both ends.
- The chat logs it ("You pulled … into this chat"), and so does the Live feed.
- You can also drop a node on the open chat's own dot in the brain.
- On the home screen, dropping into the People rail starts a new chat with that context. **+ New chat** opens an empty chat to drag several things into before asking.

**Ask, branch, merge.**
- The search box lights up matching dots as you type, and Enter asks the Lab AI in a new chat.
- Answers come from the 87-question bank above.
- Asking in Kofi's live chat starts a branch, and Kofi is notified. A few seconds later he merges your findings back, with a dashed merge line on the brain, a merge card in his chat and a notification for you.
- Click any message's port, or the header Branch button, to branch from that exact point.

**Every other control.**
- **Answers:** citations open the source as it looks where it lives, with real papers linking to their public pages. "What did the AI see?" opens the context manifest. The thumbs register a rating.
- **Chat panel:** "show" reveals earlier messages. Pull it in and Not now act on the suggestion. Chip × removes context. The filters are real dropdowns.
- **Downloads:** Export saves a `.md` of the chat, and the ⋯ menu copies a link, shows the chat on the brain, or downloads its memory card.
- **Top bar:** notifications open the chats they mention. The live avatars and the People rail's Follow make the camera follow that teammate. The You menu offers the tour, credits and a restart.
- **Brain:** Lineage glides every chat into topic rows, with branches and merges flowing right.
- **Take the tour:** 14 steps covering every feature, including zooming into a chat. Each "Show me" button does the step for you, including a guided drag-in.

**Keyboard:** `,` opens presenter setup. `Esc` backs out one layer at a time: setup, then panel, then drag, then tour, then chat.

| Dragging a paper into a new chat | It lands: chip, budget, a “pulled in” line on the brain |
|------|-------|
| ![Mid-drag: a tether from the paper to the card, the tray lit up as a drop target](preview/drag-tether.jpg) | ![After the drop: the chip pops into the tray and a dotted line draws on the brain](preview/drag-landed.jpg) |

![Kofi merged your branch back into his chat](preview/merge-back.jpg)

| Dark | Mocha |
|------|-------|
| ![Dark theme](preview/home-dark.jpg) | ![Mocha theme](preview/home-mocha.jpg) |
| ![Split view, light](preview/split-light.jpg) | ![Split view, mocha](preview/split-mocha.jpg) |

## Develop

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # static site in dist/ (what GitHub Pages serves)
npm run build:single   # one offline HTML file in dist-single/ → copy to release/
npx vite preview & node scripts/shots.mjs       # screenshots of every theme into shots/
npx vite preview & node scripts/clicktest.mjs   # 38 checks: every control, drags, zoom, the bank, setup, ambient life
node scripts/clicktest.mjs "file://$PWD/release/cortex-prototype.html"   # the same checks on the offline file
```

```text
src/
  app/      shell, top bar + search, rails, tour, source viewer + manifest, drag layer + toasts
  brain/    graph data + force layout (graph.ts), canvas renderer, camera, drag-out (Brain.tsx)
  chat/     chat panel, message renderer, inline chart
  engine/   store, actions (every button), world (the live graph), question bank,
            ambient (teammates acting on their own), setup (presenter setup)
  lab/      the lab: people, topics, papers, robots, files, chats, threads, prompts, source contents
  styles/   tokens.css (three themes) and app.css
  ui/       icons, avatars, cursors
```

**Design rules** (from the plan):
- Colour always means a person.
- Nothing moves without a cause.
- The AI has no colour.
- Line style carries meaning: branch = solid, merge = dashed, pulled in = dotted.
- Use plain words.
