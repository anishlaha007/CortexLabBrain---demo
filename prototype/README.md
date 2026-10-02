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
- `Esc` closes a chat and flies back to the whole lab.

## What's in this version (step 1: the style frame)

- **The lab brain** (home): an Obsidian-style graph with 11 research topics plus the lab's centre, about 80 chats, the real papers and robots, everyday files, raw data, and every saved question and answer.
  - Chats are dots in the colour of whoever started them.
  - Rings pulse where people are working right now.
  - Mei's cursor wanders the brain live, Figma style.
  - Hover to light up a neighbourhood, drag nodes, scroll to zoom, click a topic to fly in, click a chat to open it.
- **Split view:** the brain beside the chat, with the open chat pulsing and signals travelling along its connections.
- **The example conversation:**
  - cited answers that say where they read from
  - an inline chart
  - a teammate's branch from a specific answer
  - an answer drawn from a graduated student's chats (lab memory)
  - Kofi typing live, Google Docs style
  - the "you'll start a branch" composer
  - the context tray with its budget
  - a suggested pull from a teammate's related chat
- **Rails:** Live in the lab (pulsing bubbles), research topics, people with presence, and the sources Cortex reads from.
- **Three themes:** Light (oatmeal), Dark (ink) and Mocha (brown).

Not yet:
- Lineage layout
- zooming into a chat's prompt chain
- asking new questions
- branching and merging for real
- the tutorial
- presenter setup
- the auto demo

These are steps 2 to 8 in the plan.

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
npx vite preview & node scripts/shots.mjs   # screenshots of every theme into shots/
```

```text
src/
  app/      shell, top bar, rails, themes
  brain/    graph data + force layout (graph.ts), canvas renderer and camera (Brain.tsx)
  chat/     chat panel, inline chart
  lab/      the lab: people, topics, papers, robots, files, chats, live activity
  styles/   tokens.css (three themes) and app.css
  ui/       icons, avatars, cursors
```

**Design rules** (from the plan):
- Colour always means a person.
- Nothing moves without a cause.
- The AI has no colour.
- Line style carries meaning: branch = solid, merge = dashed, pulled in = dotted.
- Use plain words.
