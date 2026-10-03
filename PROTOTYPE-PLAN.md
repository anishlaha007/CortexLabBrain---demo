# Cortex Prototype Plan

> A clickable, self-running prototype of Cortex to put in front of researchers, PIs and investors, so we get feedback before building the real thing.
> Version 0.5 · 3 Oct 2026 · Status: steps 0–1, 3, 5 and 7 done, and step 4 mostly done. You can zoom into a chat's prompts, teammates act on their own, the question bank has 87 questions, and presenter setup works. See [`prototype/`](prototype/).
> Built from: [`SPEC.md`](SPEC.md), [`ARCHITECTURE.md`](ARCHITECTURE.md), the UI vision board, the "Oatmeal & Ink" and brown palette cards, and the earlier `lab-brain-demo` prototype and design canvas.

---

## 0. What we're making

This is a web prototype that looks and behaves like the finished Cortex but has no backend. Inside it is **one real, well-known Georgia Tech lab, rebuilt from its public work**: its research topics, papers, videos, talks and press. Mock teammates use it together. A simulation keeps the lab alive, so while you watch, people move between chats, type, branch and merge.

**Multiplayer is the hero.** Cortex should feel like Figma or Google Docs, but for doing research with AI.

**It works when:**
- Someone with no science background gets what the lab studies, and what Cortex does for it, within 30 seconds of the home screen.
- You can present it live, and the tutorial can walk anyone through every feature without you.
- It runs offline from a single file, so bad conference Wi-Fi can't break it.
- Typed questions cover every kind of thing a real lab asks, from "where's that file?" to "I just joined, where do I start?" to "here's a brand-new idea".
- Later, the auto demo can be recorded as a launch-quality video. This is designed for now but built last (§8).

### Decisions so far

| # | Question | Decision |
|---|----------|----------|
| 1 | Look | **Light and dark modes with a toggle, plus a third brown "Mocha" theme.** The browns also add warm contrast inside the other two. **Nodes carry people's colours**, and the same colours are used everywhere (avatars, cursors, carets, rings), as in Figma or Google Docs. |
| 2 | Lab | **Georgia Tech's CRAB Lab** (Prof. Dan Goldman: snakes, sand, ants and robots), **built from everything it has made public**, with **fictional teammates**. Details in §5 and [`prototype/LAB-INVENTORY.md`](prototype/LAB-INVENTORY.md). |
| 3 | Audience | **You present it for now.** A **tutorial** walks through every feature. Feedback collection comes later. |
| 4 | Typed questions | **A question bank plus an honest "not found".** The bank is as varied as possible (§6): new ideas with suggested context, new members finding their way, and much more. |
| 5 | Demo video | **Later.** The storyboard and demo engine stay in this plan (§8) for when you're ready. |

---

## 1. Ways to use it

| Mode | Who drives | Best for | How it starts |
|------|-----------|----------|---------------|
| **Explore** | You (presenting) or the viewer | Live walkthroughs while you explain | Default on open |
| **Tutorial** | The viewer, step by step | Showing every feature. Also shows how a new lab member would be onboarded | A "Take the tour" button. Resumable and skippable |
| **Presenter setup** | You | Renaming the lab and people, recolouring them, setting who's around and how busy the lab is, picking a theme | The `,` key, the You menu, or a `?setup` link (a copied setup link brings your whole setup with it) |
| **Auto demo** *(later)* | The script | The demo video | The `D` key or a `?demo` link |

### 1.1 The tutorial (every feature, in order)
Each step points at one thing and asks the viewer to try it. If they don't want to, a **"Show me"** button does it for them.

| # | Step | Feature |
|---|------|---------|
| 1 | "This is your lab's brain" | Home, topic hubs, chats, files |
| 2 | "Colour means a person" | People rail, live dots, pulsing bubbles |
| 3 | "Where it reads from" | Sources: GitHub, Drive, OneDrive, lab PCs, uploads |
| 4 | "Search the whole lab" | Semantic search lighting up the graph |
| 5 | "Ask anything" | A cited answer with visible search steps |
| 6 | "Check the source" | Citation → the source viewer |
| 7 | "What did the AI see?" | The context manifest |
| 8 | "Zoom into a chat" | The chat unfolds into prompts and outputs |
| 9 | "Pull in context" | Drag a node into the tray |
| 10 | "Cortex suggests context" | The suggested pull |
| 11 | "Watch a teammate, live" | Live drafts, follow, cursors |
| 12 | "Branch to collaborate" | Branch from an answer, and the owner's notification |
| 13 | "Merge it back" | Merge preview → merge |
| 14 | "The lab remembers" | A reworded old question cites an old chat |
| 15 | "Start something new" | A new idea, with Cortex suggesting related work |
| 16 | "See how ideas grew" | The Lineage layout |
| 17 | "Make it yours" | The themes, and you're done |

---

## 2. Design direction

### 2.1 The idea
"Premium paper, quiet confidence." Everything you read sits on a calm surface. The lab's brain sits on a deeper **slate** with one rounded corner, like the black panel on the style card. Paper is for reading and the slate is for knowing. The browns bring warmth and add contrast to the darks without adding noise.

### 2.2 Three themes (toggle in the top bar, remembered per viewer)

| Token | **Light** (Oatmeal) | **Dark** (Ink) | **Mocha** (brown) |
|-------|---------------------|----------------|-------------------|
| Background | `#F3EDE2` | `#232322` | `#291C0E` |
| Raised (cards, composer) | `#F9F6F0` | `#2B2B2B` | `#35261A` |
| Chips and quiet fills | `#E1D4C2` | `#353432` | `#6E473B` |
| Lines | `#D8D1C7` | `#3D3B38` | `#6E473B` |
| Text | `#2B2B2B` | `#F3EDE2` | `#E1D4C2` |
| Secondary text | `#6E473B` | `#BEB5A9` | `#BEB5A9` |
| Brain slate | `#291C0E` (espresso) | `#1A1918` | `#1E140A` |
| Warm accent (selection, topic hubs) | `#A78D78` | `#A78D78` | `#A78D78` |

Light mode puts the brain on espresso rather than pure black, so the warm contrast carries through. All text pairs are checked to 4.5:1. Final values get tuned in the style frame.

### 2.3 People's colours
There are 8 collaborator colours, clear and confident like Figma's, but warmed to sit with the browns:

| Coral | Cobalt | Jade | Violet | Saffron | Teal | Rose | Olive |
|-------|--------|------|--------|---------|------|------|-------|
| `#E2674A` | `#3B6FE0` | `#23A47A` | `#8E5BE8` | `#E3A21A` | `#1C9FB0` | `#E0508C` | `#7FA82E` |

- **One person, one colour, everywhere:** their dot on the brain, their pulsing ring, avatar, cursor, typing caret, name tag and message accent.
- Each colour has a fill shade and a text shade per theme, so it stays readable on paper, ink and mocha.
- Colours also differ in lightness, so colour-blind viewers can still tell people apart.

### 2.4 Rules
1. **Colour always means a person.** Everything else is the neutral palette (paper, ink, browns).
2. **Nothing moves without a cause.** Every animation is a person or the AI doing something. When nothing is happening, the UI is still. That's how it "signals depth, not noise".
3. **The AI has no colour.** It's drawn in the neutral palette, with a soft shimmer while it thinks.
4. **Line style carries meaning:** branch = solid, merge = dashed, pull = dotted, as in the spec.
5. **Plain words.** "Pull into this chat", not "inject context".

### 2.5 Type and motion
- **Type:**
  - **Hanken Grotesk** for the UI and headlines
  - **Instrument Serif Italic** for editorial moments
  - **JetBrains Mono** for file paths and code
  - all bundled with the app, so it works offline
- **UI motion:** 180–280 ms ease-out, with soft springs.
- **Graph motion:** real physics, plus Obsidian-style elastic drag.
- **Pulses:** at resting-heart-rate speed, in the active person's colour.
- **Signals:** when context moves between chats, a small light travels along the edge.

---

## 3. Screens

### 3.1 Home: the Lab Brain (the vision board's "new home screen")
The layout has four parts:
- a left rail, **Live in the lab**
- the brain slate in the centre
- a right rail, **People**
- an **intelligent semantic search** bar across the top

| Part | Behaviour |
|------|-----------|
| **Nodes** | **Topic hubs** are big and labelled, sized by how much work is in them. **Chats** are dots in the colour of whoever started them. **Files and outputs** (papers, videos, data, code) are small squares that show their source on hover. |
| **Pulsing bubbles** | Wherever someone is active, a ring pulses in their colour. When they're typing, the pulse gets faster. |
| **Hover / click** | Hovering lights up a node's neighbourhood and dims the rest. Clicking a topic flies the camera into it. Clicking a chat opens split view. |
| **Semantic zoom** | Three levels: **Lab → Topic → Chat**. At the chat level the bubble breaks into its key prompt chunks, with plots, files and outputs hanging off each chunk. Branch lines leave from the exact answer they branched from, as in the top sketch. |
| **Layouts** | **Brain** is the organic layout. **Lineage** goes left to right by branch and merge and top to bottom by time (the spec's MAP-2 layout). Nodes fly between the two. |
| **Search** | As you type, matching nodes light up. Enter asks the Lab AI. |
| **People rail** | Each person shows a live, away or offline dot and what they're doing. Clicking a person **follows** them, Figma style. |
| **Live in the lab** | The activity feed made visual: an avatar, a pulsing bubble, the action and its target. Click an item to jump to it. |
| **Map basics** | Minimap, zoom controls, legend, and filters by person, topic, kind and date |

### 3.2 Split view: brain + chat (the vision board's "split screen view")
The brain is on the left, with the open chat's node pulsing in your colour. New connections form live as the AI cites things. The chat is on the right.

| Part | Behaviour |
|------|-----------|
| **Header** | Title, kind badge, who started it, a lineage breadcrumb, live viewer avatars |
| **Answers** | Numbered citation chips (source icon, file, location). Plots and tables appear inline. Under each answer: "Searched N files across M sources · What did the AI see?" |
| **While answering** | Visible steps tick off (papers ✓ videos ✓ data ✓ lab memory ✓). On the brain, cited nodes light up and lines draw to this chat. |
| **Message ports** | Each message has the small connector circles from the sketch. Drag from one to branch from that point. Hover actions: *Branch from here*, *Pull into…*, *Copy link*. |
| **Context tray** | Chips for: this chat, goals, pulled chats and pinned files. A budget bar and a drop zone. **Drag any node from the brain into the tray** to pull it in. |
| **Suggested pull** | Above the composer: "[Teammate] was also working on this: *[chat]*. Pull it in?" |
| **Source viewer** | A citation opens the file as it looks where it lives: a paper page with the passage highlighted, a video at the right timestamp, code with highlighted lines, a slide, a sheet summary |
| **Memory card** | Each chat's rolling markdown summary, which is what the brain stores. Exportable as `.md`. |

### 3.3 Sources: "everything your lab already makes"
- **Connector cards:** GitHub, Google Drive, OneDrive (via the sync tool), lab machines (camera PC, analysis workstation), Uploads. Slack, Overleaf and Zotero are greyed out as "coming later".
- **Activity:** a live sync feed and ticking counters, plus a file-type breakdown showing what's read in full and what gets metadata only. Raw high-speed video, for example, is metadata only.
- **Connect:** the button plays a believable connect-and-first-sync. The brain visibly grows as files arrive.
- **Privacy panel**, in plain words.

### 3.4 Other screens
- **What did the AI see?** The context manifest (CTX-8) in plain language.
- **Lab pulse (the PI's view):** activity and impact numbers, all labelled illustrative.
- **Notifications:** a bell and quiet toasts for branches, merges, pulls, goal links and mentions.

---

## 4. Multiplayer: the hero

### 4.1 Presence everywhere

| Where | What you see |
|-------|--------------|
| Brain | Pulsing rings on the chats people are in. Live Figma-style cursors (a coloured arrow with a name tag) when someone is on the map with you |
| People rail | Live, away or offline, and where each person is |
| Chat header | Avatars of everyone viewing, plus *Follow* |
| Chat body | Other people's **live drafts**: their coloured caret and text appear as they type, Google Docs style |

### 4.2 Watch live, branch to collaborate (the core flow)
1. **B opens A's chat.** A's avatar is in the header, and A's draft appears live as they type.
2. **B's composer** reads: "A is working here. Your question will start a branch, so you won't interrupt them." B can also hover any of A's answers and click **Branch from here**.
3. **B sends.** A branch chat is created off that exact answer, carrying A's context. A new node sprouts from A's with a solid line. The AI's first message says what it carried over.
4. **A gets a quiet toast:** "B branched from your answer about …" with **Peek** and **Follow** buttons.
5. **B's branch finds something.** A sees: "B's branch has new findings. Merge into your chat?"
6. **A opens the merge preview.** It shows the summary, the key citations, and where the branch agrees or conflicts with A's chat. A clicks **Merge**. The branch curves back into A's node as a dashed line, A's chat gets a merge card, and B is notified.

**Merge selected** (2+ chats → a new chat, CTX-5) also works from the brain.

### 4.3 Ambient lab life
A scripted simulation runs teammates through believable behaviour:
- typing questions live (you see the draft as they type), then the Lab AI's cited answer streaming in, with a new memory dot on the brain
- branching from a chat, pulling a paper or another chat in, and merging chats
- the Lab AI linking findings across topics
- people coming online partway through, and moving between chats
- someone noticing a chat **you** made: they open it, then pull it into their own work. Only this kind of event sends you a notification

It plays out in the same order every time. Intensity can be set to off, calm (about every 8 seconds) or busy (every few seconds) in presenter setup or with `?ambient=`. Kofi stays in the demo chat so the tour always finds him. A teammate may type in a chat you have open, just as in a real shared lab, and asking there starts a branch so nobody is interrupted.

### 4.4 Two windows (stretch)
Two browser windows on one laptop stay in sync for real. Be one person in each window and demo it live to someone across the table.

---

## 5. The lab: the CRAB Lab's public work, with a fictional team

**Lab:** Georgia Tech's **CRAB Lab** (Complex Rheology And Biomechanics, Prof. Daniel I. Goldman, School of Physics). It studies how animals and robots move through sand, mud and clutter, using robots as physical models. That covers sidewinder rattlesnakes climbing dunes, lizards that swim through sand, fire ants digging tunnels without traffic jams, centipede robots, and "smarticles" that team up into one robot. Anyone gets it, and the robots are very visual.

**On screen:**
- The workspace is called **Robophysics Lab**.
- A credit line reads: *"Research from the public work of Georgia Tech's CRAB Lab (Prof. Dan Goldman). People and chats are fictional. Not affiliated."*

**What goes into the brain** (the full list with sources is in [`prototype/LAB-INVENTORY.md`](prototype/LAB-INVENTORY.md)):
- **11 topic hubs** plus the lab's centre:
  - swimming in sand
  - snakes on sand dunes
  - snakes through obstacles
  - robots that wiggle
  - the maths of wiggling
  - many legs
  - fire ant tunnels
  - robots made of robots
  - legs on soft ground
  - first steps on land
  - rovers on other planets
- **15 real papers**, 2009–2024 (*Science*, *PNAS*, *Science Robotics*, *Rep. Prog. Phys.*), each checked against a public source.
- **12 robots and rigs** from public coverage, plus press, public theses, and the Ground Control Robotics spin-out.
- **Illustrative everyday files** (code, raw video, protocols, slides, drafts), marked as illustrative.

**The team** (fictional, and checked against the public author lists so no name matches a real lab member):

| Person | Role | Works on |
|--------|------|----------|
| Prof. Elena Ruiz | PI | Everything |
| Dr. Kofi Mensah | Postdoc | Snakes and wiggling robots |
| Priya Raman | PhD | Many legs |
| Jonah Kim | PhD | Fire ants |
| Mei Tanaka | PhD | Swimming in sand |
| Lucas Ferreira | MS | Rovers |
| Ava Okonkwo | Undergrad | Smarticles |
| Sam Whitfield | Research engineer | Rigs and fabrication |
| Noor Haddad | Alumna, 2025 | Her chats still answer questions |

Real authors appear only in citations, exactly as published.

---

## 6. The question bank (as varied as possible)
Each question has a scripted answer with citations. Some also carry a chart, a suggested pull, or a follow-up thread. Anything typed that isn't in the bank gets an honest "I couldn't find this in the lab's files", plus the 3 closest files (ASK-2).

Examples use the CRAB Lab demo.

| Kind | Example |
|------|---------|
| **Find a file** | "Where's the high-speed video of the sidewinder trials?" |
| **Ask with citations** | "What did the lab learn about sidewinders on sandy slopes?" |
| **Follow-up** | "…and did the robot manage it too?" |
| **Compare across topics** | "How is the fire-ant clog result like the smarticle ring?" |
| **Explain a figure** | "What is this slip-vs-angle plot actually showing?" |
| **Methods how-to** | "How do we calibrate the tilting sand bed?" |
| **Reproduce** | "Which notebook made Figure 3 in the snake diffraction paper, and with what settings?" |
| **Who knows?** | "Who in the lab has worked with fire ants?" |
| **What changed?** | "What's new in the lab this week?" |
| **New member** | "I just joined. What does this lab work on, and where should I start?" Answered with a map tour, a reading list and the people to talk to |
| **New member, deeper** | "Explain 'geometric phase' like I'm new to physics" |
| **Pivot to a new idea** | A fresh chat: "Could a centipede robot weed under blueberry bushes?" Cortex starts the idea, then suggests pulling in the many-legs chats and the rubble-course chat as context |
| **Connect the dots** | "Does anything from the sandfish work help the rover get unstuck?" |
| **Spot disagreements** | "Do any chats disagree about why the snake robot pitches?" |
| **Draft writing** | "Draft a grant paragraph on spatial redundancy, with citations" |
| **Plan the next step** | "What haven't we tested yet on the snake robot?" |
| **Meeting prep** | "Summarise everything on fire ants this month for Friday's group meeting" |
| **Lab memory** | A reworded version of a question answered weeks ago cites the old chat |
| **Alumni knowledge** | "How did Noor set up the sidewinding trackway?" |
| **Protocols** | "What's the care protocol for the ant colonies?" |
| **General background** | "What's a granular medium?" Answered, but clearly labelled as general background, not from the lab's files |
| **Not found** | "What's the lab's budget for next year?" → not found, with the closest files |
| **Outside Cortex's reach** | "Is the X-ray rig free on Thursday?" → explains that calendars aren't connected yet |

The bank has 87 questions across every topic, people, meetings, files, drafts, background and things outside Cortex's reach. Asked inside a chat, answers from that chat's topic win close calls. After each answer, three follow-up questions from the same topic appear, and search lists matching questions as you type. Suggested questions are always on screen so nobody has to guess.

---

## 7. Multiplayer flows in the tutorial and explore mode
The flows in §4 are scripted around the lab's real topics. For example, Priya branches from Kofi's answer about the slipping snake robot to ask why it pitches at 18°, and later Kofi merges her finding back into his chat. The ambient simulation uses the same question bank, so even background activity reads as real research.

---

## 8. Auto demo (later, kept here for when you're ready)
- **Storyboard** (about 3:30, 10 chapters, to be rewritten with the chosen lab):
  1. Cold open: scattered files become a brain
  2. Connect sources
  3. The living lab
  4. Ask with citations
  5. Zoom into a chat
  6. Live together, on two screens side by side
  7. Pull context
  8. Merge back
  9. Lab memory: "when people graduate, the lab keeps what they knew"
  10. Close on the pitch line
- **Cuts:** the full version, plus a 60-second teaser.
- **Engine:**
  - a natural-moving cursor with click ripples, and teammates' named cursors
  - human-rhythm typing
  - camera pans, zooms and spotlight
  - captions you can switch off for a voice-over
  - chapters and speed control
  - a fixed 16:9 recording stage, the same every take
- **Built on:** the tutorial's "Show me" actions. Every tutorial step already knows how to perform itself, so the demo engine reuses them rather than starting from scratch.

---

## 9. Feedback collection (later)
- **Feedback mode:** a "keep, change or cut?" marker on each feature, plus Figma-style comment pins and an end card. Off for now, since you'll be presenting.
- **Already in place:** the §10 table lists the questions worth asking researchers as you present.

---

## 10. Where the prototype differs from `SPEC.md`

| # | Vision board | `SPEC.md` today | Prototype does | Worth asking researchers |
|---|--------------|-----------------|----------------|--------------------------|
| 1 | Home is an Obsidian-style brain | Home is the lab map (MAP-1) | Brain is home. The Lineage layout keeps MAP-2 | Which view would you open first? |
| 2 | Others watch live and branch to contribute | Anyone can post in any chat (SHARE-1) | Watch, then branch. The owner merges back | Does branching feel natural? |
| 3 | Other people can see your live draft text | Only "who's typing" (SHARE-2) | Live drafts, with a "share my drafts live" setting | Do you mind half-typed questions being seen? |
| 4 | Branch from a specific answer | Branch from a whole chat (CTX-4) | Branch from any message | n/a |
| 5 | Merge a branch back into my own chat | Merge always creates a new chat (CTX-5) | Both | Which one do you reach for? |
| 6 | Big nodes are research topics | Goals only (GOAL-1) | The AI clusters topics automatically. Goals stay as tags | Do the auto topics match how you think about the lab? |
| 7 | On zoom, chats unfold into prompts and outputs | Not in the spec | Semantic zoom | n/a |
| 8 | Files and outputs appear as nodes | The map shows chats only | Files shown, with a toggle to hide them | Too noisy? |

---

## 11. How it's built
- **Stack:**
  - Vite + React + TypeScript
  - Zustand for state and Framer Motion for UI animation
  - **d3-force + Canvas 2D** for the brain, with a DOM layer on top for labels, cursors and cards
  - plain CSS, with the three themes as CSS variables (no Tailwind: fewer moving parts)
  - fonts bundled with the app
- **Event-driven world:** every change is an event, named like the real live API in SPEC §10 (`chat.created`, `message.delta`, `presence.update`, `typing`, `edge.created`…). Your clicks, the ambient simulation and the tutorial all emit the same events. Later, the real frontend can reuse components and swap the simulator for the WebSocket.
- **Data:** the lab is one typed data file holding topics, sources, files, people, chats, the question bank and the tutorial script, plus a credits list of public sources.
- **Ships as:**
  - a static site on GitHub Pages from this repo
  - a single offline HTML file
  - preview links for each check-in
- **Screen size:** built for desktop and tuned for 1440×900 and 1920×1080. On a phone it shows a "best on a laptop" card.

```text
prototype/
  src/
    app/          shell, themes, modes, presenter setup
    brain/        force graph, renderer, camera, semantic zoom
    chat/         messages, citations, context tray, composer, source viewer
    multiplayer/  presence, cursors, live drafts, notifications, merge
    sources/  pulse/  manifest/
    engine/       world store + events, ambient simulation, question matcher
    tutorial/     steps, coach marks, "Show me" actions
    lab/          the lab's data, question bank, credits
    demo/         (later) director, cursor, camera, captions, recorder
  public/
```

---

## 12. Build order and check-ins
Each step ends with a preview link for you to react to.

| Step | What | You review |
|------|------|------------|
| 0 ✅ | **Lab confirmed.** Its public work is gathered into [`prototype/LAB-INVENTORY.md`](prototype/LAB-INVENTORY.md) | The inventory: anything missing or off-limits? |
| 1 ✅ | **Style frame:** home and chat in all three themes, with people's colours on the nodes. Built as the real app's foundation, so nothing is thrown away | Look and feel, themes, colours |
| 2 | Lab data and the world engine | Topics, cast, chats, files |
| 3 ✅ | **Brain:** graph, zoom levels, hover, search, presence pulses, people and live rails, search glow, Lineage, follow mode, drag-out. Zooming into a chat (scroll in, double-click, or Lab › Topic › Chat) unfolds its prompts in order, each with the file it used. Click a prompt to jump to that message | The home screen |
| 4 ◐ | **Chat and split view:** answers, citations, source viewer, tray, drag to pull, suggestions, manifest, the question bank. *Done:* all of these, with an 87-question bank, topic-aware matching and follow-up questions. *Still to come:* full written conversations for more chats | Asking questions |
| 5 ✅ | **Multiplayer:** cursors, live drafts, branch to collaborate, notifications, merge back, and ambient life: teammates type, ask, branch, pull and merge on their own, come online, and notice your chats | The hero feature |
| 6 | Sources, Lab pulse, memory and alumni moments | The supporting story |
| 7 ✅ | **Tutorial**, presenter setup, theme toggle polish. The 14-step tour with “Show me” on each step (now including zooming into a chat), the themes, and presenter setup: lab name, your name, each teammate's name, colour, role and status, how busy the lab is, Mei's cursor, the demo chip, a shareable setup link and reset | Presenting it |
| 8 | Polish, performance, offline build, deploy | Final |
| Later | Auto demo + recording, feedback mode, two-window sync | When you're ready |

---

## 13. Not in the prototype
- Real connections to GitHub, Drive or OneDrive, real search, or a real AI model
- Accounts, sign-in, or real multiplayer across devices
- A phone layout for the brain
- Billing, admin and audit pages

---

## 14. Honesty guardrails
- **What's real:** the research content comes from the lab's public work and is credited on a Credits page with links.
- **What's illustrative:** the everyday lab files, the teammates, their chats and every usage number. A small "Demo · illustrative data" mark stays on screen.
- **No implied customer:** unless the lab agrees, the prototype says it's built from their public work and that we're not affiliated.

---

## 15. Open questions
1. **Style frame sign-off:** do the look, the three themes and the people's colours work? Anything to change before step 2?
2. **Inventory:** is there anything in [`prototype/LAB-INVENTORY.md`](prototype/LAB-INVENTORY.md) you'd add, or rather leave out?
