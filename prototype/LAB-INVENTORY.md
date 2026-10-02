# Lab inventory: what goes into the prototype's brain

> Step 0 of [`PROTOTYPE-PLAN.md`](../PROTOTYPE-PLAN.md). The demo lab is built from the **public work of Georgia Tech's CRAB Lab** (Complex Rheology And Biomechanics, Prof. Daniel I. Goldman, School of Physics). The teammates and their chats are fictional.
> Version 0.1 · 2 Oct 2026 · Status: for your review. Tell me anything that's missing or that you'd rather leave out.

**How the lab shows on screen:** the workspace is called **Robophysics Lab**. A credit line reads: *"Research from the public work of Georgia Tech's CRAB Lab (Prof. Dan Goldman). People and chats are fictional. Not affiliated."* Every source below is listed on an in-app Credits page.

**How this list was built:** the `gatech.edu` sites are blocked from my build environment, so everything here was checked through journal pages, arXiv, NSF and PubMed records, and press coverage. Each paper's title, venue and year below was matched against at least one of the linked sources. Rows marked *(to verify)* weren't fully confirmed and stay out of the app until they are.

---

## 1. Topic hubs (the big nodes on the brain)

Each hub is a question anyone can understand, with the lab's public work hanging off it.

| # | Hub | The question, in plain words | Public work it's built from |
|---|-----|------------------------------|-----------------------------|
| 1 | **Swimming in sand** | How does a lizard swim *through* sand? | Sandfish lizard (Science 2009), sandfish robot, resistive force theory |
| 2 | **Snakes on sand dunes** | How do sidewinder rattlesnakes climb sand dunes without sliding back? | Sidewinding (Science 2014), the snake robot built with CMU |
| 3 | **Snakes through obstacles** | Why do snakes bounce off posts like light through a grating? | Mechanical diffraction (PNAS 2019) |
| 4 | **Robots that wiggle** | Can a robot get through clutter without "thinking"? | Mechanical intelligence in limbless robots (Science Robotics 2023), worm-inspired robots (2024 feature) |
| 5 | **The maths of wiggling** | Why do worms, snakes and lizards all use the same wave? | Geometric phase across scales (PNAS 2024) |
| 6 | **Many legs** | Why do centipedes have so many legs, and do robots need them too? | Multilegged matter transport (Science 2023), frictional swimming (PNAS 2023), Ground Control Robotics |
| 7 | **Fire ant tunnels** | How do thousands of ants dig without traffic jams? | Climbing, falling and jamming (PNAS 2013), collective clog control (Science 2018) |
| 8 | **Robots made of robots** | Can simple robots that only flap their arms team up into one robot? | Smarticles (Science Robotics 2019), worm and robot blobs (PNAS 2021) |
| 9 | **Legs on soft ground** | Why do legged robots sink in sand, and how do baby sea turtles not? | Terradynamics (Science 2013), FlipperBot and loggerhead hatchlings (2013) |
| 10 | **First steps on land** | How did the first animals leave the water 360 million years ago? | Mudskippers and MuddyBot (Science 2016) |
| 11 | **Rovers on other planets** | How can a Mars-style rover avoid getting stuck in sand? | Rear rotator pedaling (Science Robotics 2020) |
| — | **Robophysics** (the lab's centre) | Robots as physical models for discovering principles of movement | Review on locomotion robophysics (Rep. Prog. Phys. 2016) |

---

## 2. Papers (each becomes a file node, with its real title, authors, year and journal)

| Year | Title | Journal | Hub | Source |
|------|-------|---------|-----|--------|
| 2009 | Undulatory swimming in sand: subsurface locomotion of the sandfish lizard | *Science* 325:314 | 1 | [arXiv 0910.3248](https://www.arxiv.org/abs/0910.3248) |
| 2011 | Robotic sandfish study, *Int. J. Robotics Research* 30:793–805 *(exact title to verify)* | *IJRR* | 1 | [PDF listing](https://goldmanlab.gatech.edu/pages/publications/pdf/The%20International%20Journal%20of%20Robotics%20Research-2011-Maladen-793-805.pdf) |
| 2013 | A terradynamics of legged locomotion on granular media | *Science* 339:1408 | 9 | [arXiv 1303.7065](https://arxiv.org/html/1303.7065), [ScienceDaily](https://sciencedaily.com/releases/2013/03/130321141443.htm) |
| 2013 | Climbing, falling, and jamming during ant locomotion in confined environments | *PNAS* | 7 | [arXiv 1305.5860](https://www.arxiv.org/pdf/1305.5860) |
| 2013 | FlipperBot and loggerhead hatchlings *(exact title to verify)* | *Bioinspiration & Biomimetics* | 9 | [GT Physics news](https://physics.gatech.edu/node/85), [ScienceDaily](https://www.sciencedaily.com/releases/2013/04/130423211711.htm) |
| 2014 | Sidewinding with minimal slip: Snake and robot ascent of sandy slopes | *Science* | 2 | [CMU RI](https://ri.cmu.edu/?p=107798), [GT QBioS](https://qbios.gatech.edu/node/445) |
| 2016 | Tail use improves performance on soft substrates in models of early vertebrate land locomotors | *Science* 353:154–158 | 10 | [TechXplore](https://techxplore.com/news/2016-07-robot-animals-million-years.html), [EurekAlert](https://eurekalert.org/news-releases/489671) |
| 2016 | A review on locomotion robophysics: the study of movement at the intersection of robotics, soft matter and dynamical systems | *Rep. Prog. Phys.* 79(11) | Centre | [arXiv 1602.04712](https://www.arxiv.org/abs/1602.04712) |
| 2018 | Collective clog control: Optimizing traffic flow in confined biological and robophysical excavation | *Science* | 7 | [GT QBioS](https://qbios.gatech.edu/node/351) |
| 2019 | Mechanical diffraction reveals the role of passive dynamics in a slithering snake | *PNAS* | 3 | [PMC6421434](https://pmc.ncbi.nlm.nih.gov/articles/PMC6421434), [NSF PAR](https://par.nsf.gov/biblio/10095040) |
| 2019 | A robot made of robots: Emergent transport and control of a smarticle ensemble | *Science Robotics* | 8 | [Nanowerk](https://www.nanowerk.com/news2/robotics/newsid=53630.php), [GT CoS](https://d7.cos.gatech.edu/node/3605) |
| 2020 | Material remodeling on granular terrain yields robustness benefits for a robophysical rover | *Science Robotics* (cover) | 11 | [GT QBioS](https://qbios.gatech.edu/node/291), [Army.mil](https://www.army.mil/article/235573) |
| 2021 | Collective dynamics in entangled worm and robot blobs | *PNAS* | 8 | [Newswise](https://www.newswise.com/articles/collective-worm-and-robot-blobs-protect-individuals-swarm-together) |
| 2023 | Multilegged matter transport: A framework for locomotion on noisy landscapes | *Science* | 6 | [GT Chemistry news](https://chemistry.gatech.edu/news/build-better-crawly-robot-add-legs-lots-legs) |
| 2023 | Self-propulsion via slipping: Frictional swimming in multilegged locomotors | *PNAS* | 6 | [arXiv 2207.10604](https://arxiv.org/pdf/2207.10604) |
| 2023 | Mechanical intelligence simplifies control in terrestrial limbless locomotion | *Science Robotics* | 4 | [arXiv 2304.08652](https://arxiv.org/abs/2304.08652), [GT Research feature](https://research.gatech.edu/feature/wiggly-robots) |
| 2024 | Geometric phase predicts locomotion performance in undulating living systems across scales | *PNAS* | 5 | [arXiv 2405.09696](https://arxiv.org/abs/2405.09696v1), [NSF PAR](https://par.nsf.gov/servlets/purl/10536079) |

In the app, each paper shows its real author list exactly as published. Its "contents" are an abstract-level summary and descriptions of the key figures, written from the public abstract and press coverage. No paper text is reproduced.

## 3. Robots and rigs (nodes with a photo-style card and specs from public coverage)

| Robot or rig | What it does | Hub |
|--------------|--------------|-----|
| Sandfish robot | Swims through granular media with a body wave | 1 |
| Modular snake robot (with CMU) | 16 joints, about 37 inches long. Climbs sandy slopes up to about 20° once given the sidewinder's strategy | 2 |
| Post-array trackway | Pegs in a sand-like bed, used to study snake "diffraction" | 3 |
| Cable-driven limbless robot | Two cables bend it left and right. Body compliance lets it slip through clutter without sensing | 4 |
| Multilegged "centipede" robots | Varying numbers of leg pairs. More legs means robust movement over rough ground | 6 |
| Fire-ant tunnel setups + digging robots | Up to three robots dig well in a narrow tunnel. A fourth causes a clog | 7 |
| Smarticles / supersmarticle | 3D-printed robots that only flap two arms. Five in a ring move as one, and can steer toward light | 8 |
| Robot blob | Six smarticles meshed together like a worm blob | 8 |
| Small legged robot on granular media | Tests leg shapes and stride frequencies (terradynamics) | 9 |
| FlipperBot | About 19 cm and 970 g, with two servo flippers and flexible "wrists". Crawls on poppy seeds like a hatchling turtle | 9 |
| MuddyBot | Two limbs and a powerful tail, used to test how early tetrapods "crutched" up sandy slopes | 10 |
| Robophysical rover | Combines paddling, walking and wheel spinning ("rear rotator pedaling") to climb loose slopes | 11 |
| Tilting sand beds + high-speed and X-ray imaging | The lab's signature setups for watching movement in and on sand | All |

## 4. People in the public record (cited, never "chatting")
Real authors appear **only in citations**, exactly as published. Examples:
- Maladen, Gravish, Marvi, McInroe and Aguilar
- Schiebel, Rieser, Savoie, Shrivastava and Ozkan-Aydin
- Chong, Wang, and many more

**Public theses** become alumni-knowledge nodes, for example:
- [Perrin Schiebel, 2019](https://crablab.gatech.edu/pages/publications/pdf/Schiebel_Spring2019_Thesis.pdf)
- [Tianyu Wang, 2025](https://goldmanlab.gatech.edu/pages/publications/pdf/2025%20PhD_Thesis_Tianyu%20Wang.pdf)

## 5. Press, talks and spin-outs (nodes on the brain, shown on the Sources page as "Web clippings")
- [Physics World: "Slithering snakes diffract like quantum particles"](https://physicsworld.com/a/slithering-snakes-diffract-like-quantum-particles/)
- [Christian Science Monitor: sidewinders and snake robots (2014)](https://csmonitor.com/Science/2014/1009/Scientists-study-sidewinding-reptiles-to-improve-snakebot)
- [Scientific American blog: "Tunnel Vision: Probing the Physics of Fire Ants"](https://www.scientificamerican.com/blog/cocktail-party-physics/tunnel-vision-probing-the-physics-of-fire-ants)
- [Big Think: worm blobs and robot swarms](https://bigthink.com/surprising-science/worm-blob-robot-swarms)
- [World Economic Forum: smarticles (2019)](https://weforum.org/agenda/2019/09/meet-robot-smaller-bots-called-smarticles)
- [Georgia Tech Research: "Worms inspire wiggly robots" (May 2024)](https://research.gatech.edu/feature/wiggly-robots)
- [IEEE Spectrum: Ground Control Robotics](https://spectrum.ieee.org/ground-control-robot-insects), the Atlanta start-up co-founded by Prof. Goldman that builds centipede-style robots for weeding specialty crops. Based on the 2023 *Science* paper.
- [UBC Physics talk: "Robophysics: robotics meets physics"](https://phas.ubc.ca/robophysics-robotics-meets-physics) (a public talk listing)

## 6. Illustrative files (made up, marked "illustrative" in the app)
A real lab also has everyday files that are never published. To show Cortex reading every kind of file, the brain gets realistic stand-ins:

| Kind | Examples | Source in the app |
|------|----------|-------------------|
| Analysis code | `rft/forces.py`, `gait/geometric_phase.ipynb`, `ants/tunnel_flux.py` | GitHub `robophysics-lab/analysis` |
| Robot code and CAD | `centipede/firmware/`, `limbless/cable_ctrl.py`, `smarticle_v3.step` | GitHub `robophysics-lab/robots` |
| Raw data | `sidewinder/2025-06/trial_14.mp4` (high-speed, metadata only), `trackway/posts_run7.csv` | Lab machines (imaging PC) |
| Protocols | "Fire ant colony care", "Tilting bed calibration", "Snake handling" | Google Drive "Robophysics Lab · Shared" |
| Slides and notes | Group meeting decks, reading-group notes, field trip notes | Google Drive, OneDrive |
| Drafts | Abstract drafts, a grant paragraph | OneDrive (via the sync tool) |

## 7. The fictional team

| Person | Role | Mostly works on | Colour |
|--------|------|-----------------|--------|
| Prof. Elena Ruiz | PI | Everything, plus grants and reading group | Violet |
| Dr. Kofi Mensah | Postdoc | Robots that wiggle, snakes through obstacles | Cobalt |
| Priya Raman | PhD, year 4 | Many legs, the centipede robots | Coral |
| Jonah Kim | PhD, year 3 | Fire ant tunnels | Jade |
| Mei Tanaka | PhD, year 2 | Swimming in sand, resistive force theory | Saffron |
| Lucas Ferreira | MS | Rovers on other planets | Teal |
| Ava Okonkwo | Undergrad | Robots made of robots | Rose |
| Sam Whitfield | Research engineer | Rigs, CAD, fabrication | Olive |
| Noor Haddad | Alumna, graduated 2025 | Built the sidewinding trackway. Her chats still answer questions | Graphite (greyed) |

None of these names match anyone in the lab's public author lists.
