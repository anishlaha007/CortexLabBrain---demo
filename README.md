# Cortex · build docs

A shared AI memory for university research labs. These docs take us from the scoped idea (1 Oct 2026) to the Summit pitch in late November.

| Doc | Read it for |
|-----|-------------|
| [`SPEC.md`](SPEC.md) | **What** the MVP must do: goals, non-goals, every requirement with acceptance criteria, data model, API, evaluation, demo script |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | **How** it's built: the stack, swappable interfaces, ingestion and answer flows, the lab map, live updates, deployment, security |
| [`DEV-PLAN.md`](DEV-PLAN.md) | **Who and when**: four lanes, day-0 contracts, R1 and R2 task cards with hours, the parallel timeline, cut lines, pilot operations |
| [`PROTOTYPE-PLAN.md`](PROTOTYPE-PLAN.md) | **The feedback prototype**: a mock-lab Cortex with Explore, Guided tour and Auto demo modes, the Oatmeal & Ink design, the multiplayer flows, the demo storyboard and the build order |

**Key dates:** contracts by Sun 4 Oct → R1 code freeze Fri 23 Oct → **R1 live in the lab Mon 26 Oct** → feature freeze Sun 15 Nov → Summit late Nov.

**Tool agnostic:** plain markdown with no tool-specific instructions. Any AI coding tool or person can build from a task card (`DEV-PLAN.md` §10). Every vendor sits behind an interface (`ARCHITECTURE.md` §3).

**Visual companions**
- UI designs + architecture diagrams (design canvas): https://claude.ai/artifact/T1z8SrnDKzmTY77tEypfkP. Page "UI designs": lab map with context pulling (interactive), chat with cited answers, "What did the AI see?", sources, component states. Page "Architecture + plan": system diagram, ingestion and answering steps, parallel lanes.
- Summit pitch deck: https://claude.ai/artifact/SiYFMgHtDXuYufVxzNL4sv
- Clickable prototype: `../lab-brain-demo/` (live at anishlaha007.github.io/lab-brain-demo)
