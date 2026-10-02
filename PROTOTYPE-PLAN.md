# Cortex Prototype Plan

> A clickable, self-running prototype of Cortex to put in front of researchers, PIs and investors, so we get feedback before building the real thing.
> Version 0.1 · 2 Oct 2026 · Status: plan for review, nothing built yet
> Built from: [`SPEC.md`](SPEC.md), [`ARCHITECTURE.md`](ARCHITECTURE.md), the UI vision board, the "Oatmeal & Ink" style card, and the earlier `lab-brain-demo` prototype and design canvas.

---

## 0. What we're making

This is a web prototype that looks and behaves like the finished Cortex but has no backend. Inside it is a mock research lab: 9 people, 7 research topics, 5 connected sources, about 120 chats and 300 files. A simulation keeps the lab alive, so while you watch, teammates move between chats, type, branch and merge. You can use it in three ways:

- **Explore:** click around freely.
- **Guided tour:** a newcomer gets walked through it in about 2 minutes.
- **Auto demo:** a scripted, cursor-driven film of the whole product that you can screen record.

**Multiplayer is the hero.** Cortex should feel like Figma or Google Docs, but for doing research with AI.

**It works when:**
- A researcher who has never heard of Cortex can tell what it does within 30 seconds of seeing the home screen, without anyone explaining it.
- After watching the auto demo (about 3½ minutes), an investor can retell its four ideas:
  - it reads everything the lab has made
  - every answer cites the exact source
  - the whole lab works together live
  - the lab never forgets
- The auto demo plays the same way every time. It runs at 60 fps at 1080p and 1440p and looks like a product launch video.
- It runs offline from a single file, so bad conference Wi-Fi can't break it.
- Anyone can rename the lab and its people to suit the audience in under a minute.
- Feedback comes back structured, feature by feature: what people would keep, change or cut.

---

## 1. Three ways to use it

| Mode | Who drives | Best for | How it starts |
|------|-----------|----------|---------------|
| **Explore** | The viewer | Hands-on feedback sessions, or sending someone a link | Default on open |
| **Guided tour** | The viewer, with coach marks | First-time and non-technical viewers on their own | A "Show me around" button, 7 steps |
| **Auto demo** | The script | Screen recording, a backdrop while you pitch, a kiosk | The `D` key or a `?demo` link. You can pick a chapter. `H` hides the controls |
| **Presenter setup** | You | Tailoring the lab before a meeting | The `,` key or a `?setup` link |

In Explore and Guided tour the lab keeps living in the background. A "Simulate lab activity" switch turns this off.

---

## 2. Design direction: Oatmeal & Ink

### 2.1 The idea
"Premium paper, quiet confidence." Everything you read sits on **paper** (oatmeal). The lab's brain glows on an **ink slate** with one rounded corner, like the black panel on the style card. Paper is for reading and ink is for knowing. This also reconciles the two references: the vision board's graphs are dark and Obsidian-like, and the style card is light.

### 2.2 Tokens (a starting point, tuned in the style frame)

| Token | Value | Used for |
|-------|-------|----------|
| `paper` | `#F3EDE2` | App background and the chat surface |
| `paper-raised` | `#F9F6F0` | Cards, the composer, popovers |
| `stone` | `#D8D1C7` | Borders, dividers, quiet chips |
| `stone-text` | `#6B655C` | Secondary text on paper (about 5:1 contrast) |
| `ink` | `#2B2B2B` | Text, primary buttons, the brain slate |
| `ink-raised` | `#353432` | Panels and cards on the slate |
| `ink-line` | `#4A4844` | Graph edges at rest |

**People's colours** are 8 muted pigments: terracotta, slate blue, moss, plum, ochre, teal, rose and graphite. Each is checked for contrast on both paper and ink. They also differ in lightness and not just hue, so colour-blind viewers can tell them apart.

### 2.3 Rules
1. **Colour always means a person.** The interface itself is paper and ink. Any colour on screen tells you *who*.
2. **Nothing moves without a cause.** Every animation is a person or the AI doing something. When nothing is happening, the UI is still. That's how it "signals depth, not noise".
3. **The AI has no colour.** It's drawn in ink, with a soft shimmer while it thinks. The people are the colourful ones.
4. **Line style carries meaning, not colour:** branch = solid, merge = dashed, pull = dotted, as in the spec.
5. **Plain words.** "Pull into this chat", not "inject context". Every label should make sense to a non-technical investor.

### 2.4 Type
- **Hanken Grotesk** for the UI and headlines. Bold and tight for headings, like the style card.
- **Instrument Serif Italic** for editorial moments: demo captions, big numbers, empty states. This is the "academic" note.
- **JetBrains Mono** for file paths, line numbers and code.
- All fonts are bundled with the app, so it works offline.

### 2.5 Motion
- **UI:** 180–280 ms ease-out. Panels slide in on a soft spring with no bounce.
- **Graph:** real physics. It settles in about 1.5 s, and dragging a node stretches elastic tethers, as in Obsidian.
- **"Alive" pulses:** at resting-heart-rate speed (about 1.1 s), in the colour of the person who is active.
- **Signals:** when context moves between chats, a small light travels along the edge. This is the neural metaphor behind the name *Cortex*.

---

## 3. Screens

### 3.1 Home: the Lab Brain (the vision board's "new home screen")
The layout has four parts:
- a left rail, **Live in the lab**
- the ink slate with the graph in the centre
- a right rail, **People**
- an **intelligent semantic search** bar across the top

| Part | Behaviour |
|------|-----------|
| **Nodes** | **Topic hubs** are big and labelled, sized by how much work is in them. **Chats** are dots in the colour of whoever started them. **Files and outputs** are small squares that show their source on hover. |
| **Pulsing bubbles** | Wherever someone is active, a ring pulses in their colour. When they're typing, the pulse gets faster. |
| **Hover / click** | Hovering lights up a node's neighbourhood and dims the rest. Clicking a topic flies the camera into it. Clicking a chat opens split view. |
| **Semantic zoom** | Three levels: **Lab → Topic → Chat**. At the chat level the bubble breaks into its key prompt chunks, chosen intelligently, in a vertical chain. Plots, files and outputs hang off each chunk. Branch lines leave from the exact answer they branched from, as in the top sketch. |
| **Layouts** | **Brain** is the organic layout. **Lineage** goes left to right by branch and merge and top to bottom by time, which is the spec's MAP-2 layout. Nodes fly between the two. |
| **Search** | As you type, matching nodes light up across the graph. Enter asks the Lab AI. |
| **People rail** | Each person shows a live, away or offline dot and what they're doing ("typing in *CFD vs tunnel mismatch*"). Clicking a person **follows** them, Figma style. |
| **Live in the lab** | The activity feed made visual: an avatar, a pulsing bubble, the action and its target. Click an item to jump to it. |
| **Map basics** | Minimap, zoom controls, legend, and filters by person, topic, kind and date (MAP-1, MAP-5). |

### 3.2 Split view: brain + chat (the vision board's "split screen view")
The brain is on the left, with the open chat's node pulsing in your colour. New connections form live as the AI cites things. The chat is on the right.

| Part | Behaviour |
|------|-----------|
| **Header** | Title, kind badge, who started it, a lineage breadcrumb ("Branched from *Baseline wing CFD runs* › answer 2"), and live viewer avatars |
| **Answers** | Numbered citation chips showing the source icon, file and location. Plots and tables appear inline as small charts. Under each answer: "Searched 4,812 files across 5 sources · What did the AI see?" |
| **While answering** | Visible steps tick off ("GitHub ✓ Drive ✓ Rig PC ✓ Lab memory ✓"). On the brain, the cited nodes light up and lines draw to this chat. |
| **Message ports** | Each message has the small connector circles from the sketch. Drag from one to branch from that point. Hover actions: *Branch from here*, *Pull into…*, *Copy link*. |
| **Context tray** | Chips for: this chat, goals, pulled chats and pinned files. A budget bar and a drop zone. **Drag any node from the brain into the tray** to pull it in, with a smooth Obsidian-like tether. |
| **Suggested pull** | Above the composer: "Priya was also working on this: *Skin stiffness at Re 80k*. Pull it in?" (from the vision board's "Also" note and MEM-4) |
| **Source viewer** | A citation opens the file as it looks where it lives: GitHub code with highlighted lines and the commit, a Drive slide with its number, a PDF page with the passage highlighted, a sheet summary, or a metadata-only card for CAD and raw data |
| **Memory card** | Each chat's rolling markdown summary, which is what the brain stores. You can view it and export it as `.md`. |

### 3.3 Sources: "everything your lab already makes"
- **Connector cards:**
  - GitHub (2 repos)
  - Google Drive (a shared folder)
  - OneDrive (via the sync tool)
  - Lab machines (the tunnel DAQ PC and HPC scratch)
  - Uploads
  - Greyed out as "coming later": Slack, Overleaf, Zotero
- **Activity:** a live sync feed, ticking counters, and a file-type breakdown showing what is read in full and what gets metadata only.
- **Connect:** the button plays a believable connect-and-first-sync. The brain visibly grows as files arrive.
- **Privacy panel**, in plain words: files stay on Cortex's server, only snippets go to the AI, nothing is used for training.

### 3.4 What did the AI see?
The context manifest (CTX-8) in plain language:
- a budget bar split by section
- which chats and files went in
- what was cited and what wasn't
- what left the server

### 3.5 Lab pulse (the PI's view)
Weekly active people, questions this week, the share of useful answers, time-to-answer before and with Cortex, the most-cited files, and knowledge kept from alumni. Every number is labelled as illustrative (see §12).

### 3.6 Notifications
A bell plus quiet toasts for things like:
- someone branched your chat
- a branch has new findings: merge?
- someone pulled your chat
- the AI linked a chat to a goal
- someone mentioned you

---

## 4. Multiplayer: the hero

### 4.1 Presence everywhere

| Where | What you see |
|-------|--------------|
| Brain | Pulsing rings on the chats people are in. Live Figma-style cursors (a coloured arrow with a name tag) when someone is on the map with you |
| People rail | Live, away or offline, and where each person is |
| Chat header | Avatars of everyone viewing, plus a *Follow* option |
| Chat body | Other people's **live drafts**: their coloured caret and text appear as they type, Google Docs style |

### 4.2 Watch live, branch to collaborate (the core flow)
1. **Sam opens Maya's chat.** Maya's avatar is in the header, and her draft appears live: "plot drag error against Re for ses…".
2. **Sam's composer** reads: "Maya is working here. Your question will start a branch, so you won't interrupt her." He can also hover any of Maya's answers and click **Branch from here**.
3. **Sam sends.** A branch chat is created off that exact answer, carrying Maya's context. On the brain, a new node sprouts from Maya's with a solid line. The AI's first message says what it carried over.
4. **Maya gets a quiet toast:** "Sam branched from your answer about run 3 → *Why does run 3 separate early?*" with **Peek** and **Follow** buttons.
5. **Sam's branch finds something.** Maya sees: "Sam's branch has new findings. Merge into your chat?"
6. **Maya opens the merge preview.** It shows what would come in: a summary, the key citations, and where it agrees or conflicts with her chat. She clicks **Merge**. The branch line curves back into her node as a dashed line, her chat gets a merge card she can expand, and Sam is notified.

**Merge selected** (2+ chats → a new chat, CTX-5) also works from the brain.

### 4.3 Ambient lab life
A seeded simulation runs teammates through believable behaviour:
- opening chats and typing questions from a question bank
- AI answers streaming in
- the occasional branch, pull or new chat on a different topic
- people going idle or offline

It plays out the same way every time for a given seed. Intensity can be set to calm, busy or off. It never touches the chat you're in unless the demo script says so.

### 4.4 Two windows (stretch)
Two browser windows on one laptop stay in sync for real (using the browser's `BroadcastChannel`). Be Maya in one and Sam in the other to demo it live to someone across the table.

---

## 5. The mock lab

### 5.1 Flagship: Morphing Wing Lab (continues the existing storyline)

| Person | Role | Works on | Colour |
|--------|------|----------|--------|
| Prof. Nia Okafor | PI | Lit reviews, test plans, everything | Plum |
| Dr. Priya Nair | Postdoc | Morphing skin materials | Ochre |
| Maya Chen | PhD, year 4 | CFD baseline and validation | Terracotta |
| Dev Raman | PhD, year 3 | Wind tunnel testing | Slate blue |
| Hana Sato | PhD, year 2 | Actuation and control | Rose |
| Sam Lee | MS | Meshing and the run 3 investigation | Moss |
| Leo Martins | Undergrad | Rig hardware and CAD | Teal |
| Tom Becker | Alumnus, graduated May 2026 | Built the original tunnel rig | Graphite, greyed |
| You / guest | Viewer | Whoever is watching | Ink |

**Topics (the hub nodes):**
- CFD baseline and validation
- September wind tunnel campaign
- Morphing skin materials
- Actuation and control
- Rig hardware and CAD
- Papers and abstracts
- Lab ops and calibration

**Sources:**
- GitHub `okafor-lab/wing` and `okafor-lab/cfd-scripts`
- Google Drive "Morphing Wing Lab · Shared"
- OneDrive through the sync tool on the rig PC
- HPC scratch (metadata only)
- Uploads

**Volume:**
- **~12 hero chats**, fully written: 4–10 turns each, with believable citations.
- **~110 background chats:** a title, a summary and 1–2 turns each.
- **~300 files** with realistic paths, owners and dates.
- **~40 answerable questions**, plus the "not found" fallback.
- **4 goals.**

The content is plausible but fictional (see §12).

### 5.2 More labs (presets)
Presets have the same structure but different science, so you can show a neuroscientist a neuroscience lab. Possible fields: neural circuits (imaging, behaviour rigs, spike sorting), battery materials (cycling data, XRD, SEM), computational biology (pipelines, notebooks) and ML research (experiments, checkpoints, logs).

Each preset fills the same **story slots**, for example "a founding chat by person A", "the question person B branches with" and "the reworded memory question". That way one auto-demo script plays with every preset.

### 5.3 Customise in a minute (Presenter setup)
- Pick a preset.
- Rename the lab, the university and every person (name, role, colour). Use initials or upload a photo.
- Add the viewer as a guest ("Alex · visiting"). They show up in the people list, and the demo greets them.
- Choose which sources appear. For example, relabel Drive as Box or SharePoint for a lab that uses those.
- Set the demo speed, turn captions on or off, and set how busy the simulation is.
- Settings travel in the link, so you can send someone a tailored version.

---

## 6. Auto demo

### 6.1 Storyboard (about 3:30, 10 chapters)

| # | Chapter | Time | What happens | Caption (draft) |
|---|---------|------|--------------|-----------------|
| 0 | Cold open | 0:00–0:12 | An ink screen. Icons for GitHub, Drive, OneDrive, a lab PC, a PDF and a notebook drift in, turn into dots and pull together into the brain. Title. | *Every lab already has a brain. It's just scattered.* |
| 1 | Connect | 0:12–0:35 | Sources page. The cursor connects GitHub and a Drive folder. Counters tick, file types fill in, and CAD files show "metadata only". The brain grows alongside. | *Cortex reads what your lab already makes. Read-only.* |
| 2 | The living lab | 0:35–0:55 | Home. The people rail fills up (5 live) and bubbles pulse across topics. The cursor hovers "September wind tunnel campaign" and its neighbourhood lights up. | *See what your whole lab is working on, right now.* |
| 3 | Ask | 0:55–1:25 | Search: "which tunnel sessions used the old tap map?" Matches glow and split view opens. Search steps tick off and the answer streams in with citations. Clicking [1] opens the GitHub README with lines 12–17 highlighted. | *Answers cite the exact file, line and slide.* |
| 4 | Zoom in | 1:25–1:40 | The camera dives into Maya's chat. Her bubble breaks into prompt chunks, with plots and CSVs attached. | *Every chat becomes part of the lab's memory.* |
| 5 | Live together | 1:40–2:10 | **Two screens side by side: Maya's and Sam's.** Sam opens Maya's chat and sees her typing live. He branches from her second answer, a new node sprouts, and Maya gets a toast. | *Join anyone's work live, without interrupting it.* |
| 6 | Pull context | 2:10–2:30 | Sam drags Dev's tunnel-cleanup chat from the brain into his tray. Cortex suggests Priya's chat and he pulls that too. The answer cites both, and signals travel along the edges. | *Pull any chat, file or teammate's work into the conversation.* |
| 7 | Merge back | 2:30–2:55 | On Maya's screen: "Sam's branch has new findings. Merge?" She previews it and merges. The branch curves back into her chat, and the merge note shows where they agree and where they conflict. | *Branch and merge ideas, like code.* |
| 8 | Memory | 2:55–3:15 | "Six weeks later." Leo, a new undergrad, asks a reworded question. Cortex cites Maya's and Sam's chats and one of Tom's from last spring. Tom's node reads "graduated May 2026 · 41 chats still answering". | *When people graduate, the lab keeps what they knew.* |
| 9 | Close | 3:15–3:30 | Pull back to the whole brain with cursors drifting across it. Stats, the pitch line, the logo, and "Demo lab, illustrative data". | *NotebookLM answers from the files you hand it. Cortex answers from everything your lab has made.* |

There are two cuts. The **full cut** is about 3:30, as above. A **teaser** of about 60 seconds compresses chapters 0, 3, 5, 7 and 9.

### 6.2 The demo engine (what makes it look good)
- **Cursor:** a macOS-style pointer that moves on natural curves (eased, with a slight overshoot). It has click ripples and a drag state. Teammates' cursors are coloured and carry name tags.
- **Typing:** a human rhythm, with variable speed, short pauses at punctuation and the occasional typo that gets fixed.
- **Camera:** smooth pans and zooms on the brain and on the UI. It zooms into a region of the screen when the text there is small. A spotlight softly dims everything else.
- **Two-screen scenes:** two framed screens labelled "Maya's screen" and "Sam's screen". Each is cropped tight on the chat so the text stays readable at 1080p.
- **Captions:** two lines at most, in Instrument Serif italic, at the lower left. They can be turned off and edited in setup.
- **Chapters:** jump to any chapter, play one alone, loop, and change speed from 0.5× to 2×.
- **Recording mode:**
  - a fixed 16:9 stage at 1920×1080, still crisp at 1440p and 4K
  - the real mouse and all controls hidden
  - a frame-accurate clock, so every take is identical
- **Optional extras:** a **Record** button that saves the tab as a video in Chrome, and quiet UI sounds (a click, a notification chime) for the recording.

---

## 7. Collecting feedback
The point is to learn what to keep, change or cut, so feedback is built in:
- **Feedback mode** (a toggle) puts a small marker on each feature. Clicking it asks three things: *Would you use this?* (Yes, Maybe, No), *Keep, change or cut?*, and a comment. You can also drop a comment pin anywhere, Figma style.
- **The end card** asks three questions: the most valuable thing, the least valuable, and what's missing.
- **Where it goes:** see the open questions. By default it's saved in the browser and exported as markdown or CSV.

---

## 8. Where the prototype differs from `SPEC.md`
These differences come from the vision board. The prototype shows them so we can test them with real people before committing the build.

| # | Vision board | `SPEC.md` today | Prototype does | Worth asking researchers |
|---|--------------|-----------------|----------------|--------------------------|
| 1 | Home is an Obsidian-style brain of topics, chats and files | Home is the lab map of chat cards (MAP-1) | Brain is home. The Lineage layout keeps MAP-2 | Which view would you open first? |
| 2 | Others watch live and branch to contribute | Anyone can post in any chat (SHARE-1) | Watch, then branch. The owner merges back | Does branching feel natural, or in the way? |
| 3 | Other people can see your live draft text | Only "who's typing" (SHARE-2) | Live drafts, with a per-person "share my drafts live" setting | Do you mind half-typed questions being seen? |
| 4 | Branch from a specific answer | Branch from a whole chat (CTX-4) | Branch from any message | n/a |
| 5 | Merge a branch back into my own chat | Merge always creates a new chat (CTX-5) | Both: merge back, and merge into a new chat | Which one do you reach for? |
| 6 | Big nodes are research topics | Goals only (GOAL-1) | The AI clusters topics automatically. Goals stay as tags | Do the auto topics match how you think about the lab? |
| 7 | On zoom, chats unfold into prompt chunks and artifacts | Not in the spec | Semantic zoom | n/a |
| 8 | Files and outputs appear as nodes | The map shows chats only | Files shown, with a toggle to hide them | Too noisy? |

---

## 9. How it's built
- **Stack:**
  - Vite + React + TypeScript
  - Zustand for state and Framer Motion for UI animation
  - **d3-force + Canvas 2D** for the brain, which keeps hundreds of nodes at 60 fps. A DOM layer on top holds labels, cursors and cards.
  - Tailwind, with the tokens as CSS variables
  - fonts bundled with the app
- **Event-driven world:** every change is an event, named like the real live API in SPEC §10 (`chat.created`, `message.delta`, `presence.update`, `typing`, `edge.created`, `node.moved`…). The ambient simulation, the demo script and your own clicks all emit the same events. Later, the real frontend can reuse these components and swap the simulator for the WebSocket.
- **Demo director:** a timeline of steps: move the cursor to an element, click, type, move the camera, show a caption, wait, emit events. Steps target named UI anchors (`data-demo="…"`), so layout changes don't break the script. A fixed clock and seeded randomness make every run the same.
- **Data:** each preset is one typed file holding people, topics, sources, files, chats, the question bank and story slots. Hero content is written by hand. Background content is generated from seeds.
- **Typed questions:**
  - A typed question is matched against the preset's question bank, by keyword and fuzzy match.
  - With no match, it answers honestly: "I couldn't find this in the lab's files", plus the 3 closest files. That is ASK-2 behaviour, so even a miss demos a real feature.
  - Suggested questions are always on screen.
- **Ships as:** a static site on GitHub Pages from this repo (it's public), plus a single offline HTML file.
- **Screen size:** built for desktop (1280px and up), tuned for 1440×900 and 1920×1080. On a phone it shows a "best on a laptop" card and the demo video.

```text
prototype/
  src/
    app/          shell, routing, modes
    brain/        force graph, renderer, camera, semantic zoom
    chat/         messages, citations, context tray, composer, source viewer
    multiplayer/  presence, cursors, live drafts, notifications, merge
    sources/  pulse/  manifest/
    engine/       world store + events, ambient simulation, question matcher
    demo/         director, cursor, camera, captions, chapters, recorder
    presets/      morphing-wing.ts, …
    feedback/
  public/
```

---

## 10. Build order and check-ins
Each step ends with a preview link for you to react to before the next one starts.

| Step | What | You review |
|------|------|------------|
| 1 | **Style frame:** home and chat, static, in Oatmeal & Ink | Look and feel, type, colours |
| 2 | Flagship lab data and the world engine | Cast, topics, chat titles, hero chats |
| 3 | **Brain:** graph, zoom levels, hover, search, presence pulses, people and live rails | The home screen |
| 4 | **Chat and split view:** answers, citations, source viewer, tray, drag to pull, suggestions, manifest | Asking questions |
| 5 | **Multiplayer:** cursors, live drafts, branch to collaborate, notifications, merge back, ambient life | The hero feature |
| 6 | Sources, Lab pulse, the memory moment | The supporting story |
| 7 | **Auto demo:** director, cursor, camera, captions, chapters, two-screen scenes, recording mode | A first full take |
| 8 | Presenter setup, presets, guided tour, feedback mode | Tailoring and feedback |
| 9 | Polish, performance, offline build, deploy | Final |

---

## 11. Not in the prototype
- Real connections to GitHub, Drive or OneDrive, real search, or a real AI model (unless we decide otherwise, see the open questions)
- Accounts, sign-in, or real multiplayer across devices
- A phone layout for the brain (the spec also makes the map desktop-only)
- Billing, admin and audit pages

---

## 12. Honesty guardrails
- All lab content, people and numbers are fictional. A small "Demo lab · illustrative data" mark stays on screen. It's hidden in recording mode, and the demo's end card says it instead.
- The Lab pulse numbers are labelled illustrative until the pilot produces real ones. There's a slot to drop in real Summit numbers later.

---

## 13. Open questions (answers change the build)
1. **Look:** Paper & Ink split (the default), all-ink dark, or all-oatmeal light?
2. **Labs:** Morphing Wing Lab only, or alternate presets too? If so, which fields?
3. **Audience:** mostly presented live by us, or links people explore alone? And where should feedback land?
4. **Typed questions:** question bank plus "not found" (the default), or an optional real AI model?
5. **Demo cut:** captions, or will there be a voice-over? Is the 60-second teaser wanted?
