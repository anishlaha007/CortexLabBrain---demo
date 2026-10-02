import type { PersonId } from './people'

// Built from the public work of Georgia Tech's CRAB Lab (see prototype/LAB-INVENTORY.md).
// Papers and robots are real and credited. Chats, teammates and everyday files are illustrative.

export type HubId =
  | 'core' | 'sand' | 'dunes' | 'posts' | 'wiggle' | 'maths'
  | 'legs' | 'ants' | 'smarticles' | 'soft' | 'land' | 'rovers'

export interface Hub {
  id: HubId
  label: string
  question: string
}

export const HUBS: Hub[] = [
  { id: 'core', label: 'Robophysics', question: 'Robots as physical models for discovering how things move' },
  { id: 'sand', label: 'Swimming in sand', question: 'How does a lizard swim through sand?' },
  { id: 'dunes', label: 'Snakes on sand dunes', question: 'How do sidewinders climb dunes without sliding back?' },
  { id: 'posts', label: 'Snakes through obstacles', question: 'Why do snakes scatter off posts like light through a grating?' },
  { id: 'wiggle', label: 'Robots that wiggle', question: 'Can a robot get through clutter without “thinking”?' },
  { id: 'maths', label: 'The maths of wiggling', question: 'Why do worms, snakes and lizards share one wave?' },
  { id: 'legs', label: 'Many legs', question: 'Why do centipedes have so many legs, and do robots need them?' },
  { id: 'ants', label: 'Fire ant tunnels', question: 'How do thousands of ants dig without traffic jams?' },
  { id: 'smarticles', label: 'Robots made of robots', question: 'Can arm-flapping robots team up into one robot?' },
  { id: 'soft', label: 'Legs on soft ground', question: 'Why do legged robots sink, and baby sea turtles don’t?' },
  { id: 'land', label: 'First steps on land', question: 'How did the first animals leave the water?' },
  { id: 'rovers', label: 'Rovers on other planets', question: 'How can a rover avoid getting stuck in sand?' },
]

export type SourceKind = 'paper' | 'robot' | 'github' | 'drive' | 'onedrive' | 'labpc' | 'web'

export interface LabFile {
  id: string
  hub: HubId
  name: string
  kind: SourceKind
  /** Real, public items carry a citation line. */
  cite?: string
}

const paper = (id: string, hub: HubId, name: string, cite: string): LabFile => ({ id, hub, name, kind: 'paper', cite })
const robot = (id: string, hub: HubId, name: string): LabFile => ({ id, hub, name, kind: 'robot' })
const file = (id: string, hub: HubId, name: string, kind: SourceKind): LabFile => ({ id, hub, name, kind })

export const FILES: LabFile[] = [
  // Real papers (titles, venues and years checked against public sources)
  paper('p-sandfish', 'sand', 'Undulatory swimming in sand: subsurface locomotion of the sandfish lizard', 'Maladen et al. · Science · 2009'),
  paper('p-terra', 'soft', 'A terradynamics of legged locomotion on granular media', 'Li, Zhang & Goldman · Science · 2013'),
  paper('p-antjam', 'ants', 'Climbing, falling, and jamming during ant locomotion in confined environments', 'Gravish et al. · PNAS · 2013'),
  paper('p-sidewind', 'dunes', 'Sidewinding with minimal slip: Snake and robot ascent of sandy slopes', 'Marvi et al. · Science · 2014'),
  paper('p-tail', 'land', 'Tail use improves performance on soft substrates in models of early vertebrate land locomotors', 'McInroe et al. · Science · 2016'),
  paper('p-review', 'core', 'A review on locomotion robophysics', 'Aguilar et al. · Rep. Prog. Phys. · 2016'),
  paper('p-clog', 'ants', 'Collective clog control: Optimizing traffic flow in confined biological and robophysical excavation', 'Aguilar et al. · Science · 2018'),
  paper('p-diffract', 'posts', 'Mechanical diffraction reveals the role of passive dynamics in a slithering snake', 'Schiebel et al. · PNAS · 2019'),
  paper('p-smarticle', 'smarticles', 'A robot made of robots: Emergent transport and control of a smarticle ensemble', 'Savoie et al. · Science Robotics · 2019'),
  paper('p-rover', 'rovers', 'Material remodeling on granular terrain yields robustness benefits for a robophysical rover', 'Shrivastava et al. · Science Robotics · 2020'),
  paper('p-blobs', 'smarticles', 'Collective dynamics in entangled worm and robot blobs', 'Ozkan-Aydin et al. · PNAS · 2021'),
  paper('p-multileg', 'legs', 'Multilegged matter transport: A framework for locomotion on noisy landscapes', 'Chong et al. · Science · 2023'),
  paper('p-slip', 'legs', 'Self-propulsion via slipping: Frictional swimming in multilegged locomotors', 'Chong et al. · PNAS · 2023'),
  paper('p-mechint', 'wiggle', 'Mechanical intelligence simplifies control in terrestrial limbless locomotion', 'Wang et al. · Science Robotics · 2023'),
  paper('p-geophase', 'maths', 'Geometric phase predicts locomotion performance in undulating living systems across scales', 'Rieser et al. · PNAS · 2024'),

  // Robots and rigs from public coverage
  robot('r-sandfish', 'sand', 'Sandfish robot'),
  robot('r-snake', 'dunes', 'Modular snake robot (16 joints)'),
  robot('r-trackway', 'posts', 'Post-array trackway'),
  robot('r-limbless', 'wiggle', 'Cable-driven limbless robot'),
  robot('r-centipede', 'legs', 'Multilegged “centipede” robot'),
  robot('r-diggers', 'ants', 'Tunnel-digging robots'),
  robot('r-smarticle', 'smarticles', 'Smarticles'),
  robot('r-blob', 'smarticles', 'Robot blob'),
  robot('r-flipper', 'soft', 'FlipperBot'),
  robot('r-muddy', 'land', 'MuddyBot'),
  robot('r-rover', 'rovers', 'Robophysical rover'),
  robot('r-bed', 'core', 'Tilting sand bed'),

  // Illustrative everyday files (marked as illustrative in the app)
  file('f-rft', 'sand', 'rft/forces.py', 'github'),
  file('f-rft-nb', 'sand', 'rft/glass_beads_coeffs.ipynb', 'github'),
  file('f-xray', 'sand', 'xray/2025-08/sandfish_run03.mp4', 'labpc'),
  file('f-slope', 'dunes', 'trackway/slope_trials_2025-06.csv', 'labpc'),
  file('f-calib', 'dunes', 'Tilting bed calibration', 'drive'),
  file('f-gait', 'dunes', 'snake_robot/gait_table.yaml', 'github'),
  file('f-sw-vid', 'dunes', 'sidewinder/2025-06/trial_14.mp4', 'labpc'),
  file('f-posts', 'posts', 'trackway/posts_run7.csv', 'labpc'),
  file('f-fig3', 'posts', 'analysis/diffraction_fig3.ipynb', 'github'),
  file('f-cable', 'wiggle', 'limbless/cable_ctrl.py', 'github'),
  file('f-rubble', 'wiggle', 'Rubble course notes', 'drive'),
  file('f-modes', 'maths', 'gait/geometric_phase.ipynb', 'github'),
  file('f-reading', 'maths', 'Reading group: geometric mechanics', 'drive'),
  file('f-cfw', 'legs', 'centipede/firmware/main.cpp', 'github'),
  file('f-legs-csv', 'legs', 'centipede/leg_pairs_sweep.csv', 'labpc'),
  file('f-grant', 'legs', 'Grant draft: spatial redundancy', 'onedrive'),
  file('f-flux', 'ants', 'ants/tunnel_flux.py', 'github'),
  file('f-colony', 'ants', 'Fire ant colony care protocol', 'drive'),
  file('f-ant-vid', 'ants', 'ants/2025-09/tunnel_cam2.mp4', 'labpc'),
  file('f-smart-cad', 'smarticles', 'smarticle_v3.step', 'github'),
  file('f-blob-log', 'smarticles', 'blob/light_trials.csv', 'labpc'),
  file('f-cleg', 'soft', 'c_leg_robot/stride_sweep.csv', 'labpc'),
  file('f-turtle', 'soft', 'Hatchling field notes', 'drive'),
  file('f-muddy', 'land', 'muddybot/tail_timing.py', 'github'),
  file('f-mudvid', 'land', 'mudskipper/crutching_clips/', 'labpc'),
  file('f-pedal', 'rovers', 'rover/pedal_phase.py', 'github'),
  file('f-nasa', 'rovers', 'NASA call: results shortlist', 'onedrive'),
  file('f-onboard', 'core', 'Lab onboarding guide', 'drive'),
  file('f-agenda', 'core', 'Group meeting agenda, 3 Oct', 'onedrive'),
  file('f-safety', 'core', 'Animal handling and safety', 'drive'),

  // Public press and spin-outs
  file('w-physworld', 'posts', 'Physics World: snakes diffract like particles', 'web'),
  file('w-gcr', 'legs', 'IEEE Spectrum: Ground Control Robotics', 'web'),
  file('w-sciam', 'ants', 'Scientific American: probing the physics of fire ants', 'web'),
  file('w-wiggly', 'wiggle', 'GT Research: worms inspire wiggly robots', 'web'),
]

export type ChatKind = 'chat' | 'branch' | 'merge'

export interface Chat {
  id: string
  hub: HubId
  title: string
  by: PersonId
  kind?: ChatKind
  /** Parent chats for branches and merges. */
  from?: string[]
  /** Files this chat cites. */
  cites?: string[]
  /** Chats pulled in as context. */
  pulls?: string[]
}

const c = (id: string, hub: HubId, by: PersonId, title: string, extra: Partial<Chat> = {}): Chat => ({ id, hub, by, title, ...extra })

export const HERO_CHAT = 'c-slip'

export const CHATS: Chat[] = [
  // Robophysics (lab-wide)
  c('c-onboard', 'core', 'elena', 'Lab onboarding: where to start', { cites: ['f-onboard', 'p-review'] }),
  c('c-grant', 'core', 'elena', 'Grant renewal: robophysics overview', { cites: ['p-review', 'p-multileg', 'p-mechint'] }),
  c('c-agenda', 'core', 'elena', 'Group meeting agenda, 3 Oct', { cites: ['f-agenda'] }),
  c('c-review', 'core', 'ava', 'Robophysics review: the key ideas', { cites: ['p-review'] }),
  c('c-safety', 'core', 'sam', 'Which rigs need a second person present?', { cites: ['f-safety'] }),

  // Swimming in sand
  c('c-rft', 'sand', 'mei', 'RFT coefficients for the new glass beads', { cites: ['f-rft', 'f-rft-nb'] }),
  c('c-grain', 'sand', 'mei', 'Does the sandfish wave change with grain size?', { cites: ['p-sandfish'] }),
  c('c-amp', 'sand', 'mei', 'Sandfish robot: best amplitude for its wavelength', { cites: ['r-sandfish', 'p-sandfish'] }),
  c('c-xray', 'sand', 'sam', 'Why the X-ray videos blur after 2 seconds', { cites: ['f-xray'] }),
  c('c-wet', 'sand', 'mei', 'Wet sand vs dry sand: does RFT still hold?', { cites: ['f-rft'] }),
  c('c-sandfish101', 'sand', 'ava', 'The 2009 sandfish paper, for new students', { cites: ['p-sandfish'] }),
  c('c-drag', 'sand', 'mei', 'Drag vs depth for the plate intruder', { kind: 'branch', from: ['c-rft'], cites: ['f-rft-nb'] }),

  // Snakes on sand dunes
  c(HERO_CHAT, 'dunes', 'kofi', 'Sidewinder robot keeps slipping on steep sand', { cites: ['p-sidewind', 'f-slope', 'f-calib', 'r-snake'], pulls: ['c-recal'] }),
  c('c-contact', 'dunes', 'noor', 'Contact length vs slope: rattlesnake trials', { cites: ['p-sidewind', 'f-sw-vid'] }),
  c('c-recal', 'dunes', 'noor', 'Tilting bed recalibration, June', { cites: ['f-calib', 'r-bed'] }),
  c('c-turn', 'dunes', 'kofi', 'Can the snake robot turn while sidewinding?', { cites: ['f-gait'] }),
  c('c-gaittable', 'dunes', 'sam', 'Converting the 16-joint gait table', { cites: ['f-gait', 'r-snake'] }),
  c('c-pitch', 'dunes', 'priya', 'Why does pitching start at 18°?', { kind: 'branch', from: [HERO_CHAT], cites: ['f-slope'] }),
  c('c-outreach', 'dunes', 'ava', 'Sidewinding explained for outreach day', { cites: ['p-sidewind'] }),
  c('c-fieldtrip', 'dunes', 'elena', 'Field trip: permits and packing list'),

  // Snakes through obstacles
  c('c-spacing', 'posts', 'kofi', 'Post spacing for the next diffraction runs', { cites: ['r-trackway', 'f-posts'] }),
  c('c-noise', 'posts', 'kofi', 'Is the scattering pattern just noise?', { cites: ['p-diffract', 'f-posts'] }),
  c('c-openloop', 'posts', 'kofi', 'Open-loop model vs real snake: where they differ', { cites: ['p-diffract'] }),
  c('c-plain', 'posts', 'ava', '“Mechanical diffraction” in plain words', { cites: ['p-diffract', 'w-physworld'] }),
  c('c-fig3', 'posts', 'mei', 'Reproducing Figure 3 from the 2019 paper', { cites: ['f-fig3', 'p-diffract'] }),
  c('c-lattice', 'posts', 'kofi', 'Posts in a square or hexagonal lattice?', { kind: 'branch', from: ['c-spacing'] }),

  // Robots that wiggle
  c('c-tension', 'wiggle', 'kofi', 'Cable tension settings for the limbless robot', { cites: ['f-cable', 'r-limbless'] }),
  c('c-compliance', 'wiggle', 'kofi', 'Does more body compliance always help?', { cites: ['p-mechint'] }),
  c('c-rubble', 'wiggle', 'kofi', 'Wiggly robot through the rubble course', { cites: ['f-rubble', 'r-limbless'] }),
  c('c-current', 'wiggle', 'sam', 'Motor current spikes on cable 2', { cites: ['f-cable'] }),
  c('c-rescue', 'wiggle', 'elena', 'Search-and-rescue pitch: what can we claim?', { cites: ['p-mechint', 'w-wiggly'] }),
  c('c-wormnext', 'wiggle', 'kofi', 'Worm-inspired robot: the next obstacle course', { kind: 'merge', from: ['c-rubble', 'c-compliance'] }),

  // The maths of wiggling
  c('c-ourphase', 'maths', 'mei', 'Geometric phase for our own snake data', { cites: ['f-modes', 'p-geophase'] }),
  c('c-twomode', 'maths', 'mei', 'Two-mode fit: nematode vs snake', { cites: ['p-geophase'] }),
  c('c-selfdef', 'maths', 'ava', 'What does “self-deformation space” mean?', { cites: ['p-geophase'] }),
  c('c-height', 'maths', 'priya', 'Height functions for the multilegged gait', { cites: ['f-modes'] }),
  c('c-readgroup', 'maths', 'elena', 'Reading group: geometric mechanics', { cites: ['f-reading'] }),

  // Many legs
  c('c-pairs', 'legs', 'priya', 'How many leg pairs before returns flatten out?', { cites: ['p-multileg', 'f-legs-csv'] }),
  c('c-blueberry', 'legs', 'priya', 'Centipede robot on the blueberry-row mockup', { cites: ['r-centipede', 'w-gcr'] }),
  c('c-lift', 'legs', 'priya', 'Frictional swimming: lifting pattern for 12 legs', { cites: ['p-slip'] }),
  c('c-legfail', 'legs', 'priya', 'If a leg fails, does the robot keep going?', { cites: ['p-multileg'] }),
  c('c-centvid', 'legs', 'priya', 'Our gait vs real centipede video', { cites: ['f-legs-csv'] }),
  c('c-redund', 'legs', 'elena', 'Spatial redundancy, explained for the grant', { cites: ['f-grant', 'p-multileg'] }),
  c('c-battery', 'legs', 'sam', 'Battery life on the 8-segment robot', { cites: ['f-cfw'] }),
  c('c-slopelegs', 'legs', 'priya', 'Do more legs help on loose slopes?', { cites: ['p-multileg', 'f-legs-csv'] }),

  // Fire ant tunnels
  c('c-traffic', 'ants', 'jonah', 'Ant traffic at 5 diggers', { cites: ['p-clog', 'f-flux'] }),
  c('c-colony', 'ants', 'jonah', 'Colony care schedule this month', { cites: ['f-colony'] }),
  c('c-idle', 'ants', 'jonah', 'Idleness rate in the new tunnel setup', { cites: ['p-clog', 'f-ant-vid'] }),
  c('c-4robots', 'ants', 'jonah', 'Reproducing the clog result with 4 robots', { cites: ['r-diggers', 'p-clog'] }),
  c('c-falls', 'ants', 'jonah', 'Tunnel width vs body length for falls', { cites: ['p-antjam'] }),
  c('c-ca', 'ants', 'jonah', 'Cellular automata model: parameters', { cites: ['f-flux'] }),
  c('c-fps', 'ants', 'sam', 'Should we film the falls at 1000 fps?', { cites: ['f-ant-vid'] }),
  c('c-antmerge', 'ants', 'jonah', 'Traffic rules: ants and robots together', { kind: 'merge', from: ['c-traffic', 'c-4robots'] }),

  // Robots made of robots
  c('c-drift', 'smarticles', 'ava', 'Supersmarticle drifting left: why?', { cites: ['p-smarticle', 'r-smarticle'] }),
  c('c-lightblob', 'smarticles', 'ava', 'Light-following robot blob', { cites: ['p-blobs', 'f-blob-log'] }),
  c('c-desic', 'smarticles', 'ava', 'Worm blob drying experiment, explained', { cites: ['p-blobs'] }),
  c('c-servo', 'smarticles', 'sam', 'Smarticle v3 arm servo swap', { cites: ['f-smart-cad'] }),
  c('c-five', 'smarticles', 'ava', 'Five smarticles vs six in the ring', { cites: ['r-smarticle'] }),
  c('c-openhouse', 'smarticles', 'ava', 'Blob robot demo for open house', { kind: 'branch', from: ['c-lightblob'] }),

  // Legs on soft ground
  c('c-cleg', 'soft', 'priya', 'Leg shape for the C-leg robot on poppy seeds', { cites: ['f-cleg', 'p-terra'] }),
  c('c-wrist', 'soft', 'lucas', 'FlipperBot wrist stiffness settings', { cites: ['r-flipper'] }),
  c('c-sumforces', 'soft', 'mei', 'Terradynamics: summing forces on curved legs', { cites: ['p-terra'] }),
  c('c-turtlevids', 'soft', 'lucas', 'Where are the hatchling turtle videos?', { cites: ['f-turtle'] }),
  c('c-stride', 'soft', 'priya', 'Stride frequency sweep results', { cites: ['f-cleg'] }),

  // First steps on land
  c('c-tailtime', 'land', 'mei', 'MuddyBot tail timing on 20° slopes', { cites: ['f-muddy', 'r-muddy'] }),
  c('c-crutch', 'land', 'mei', 'Mudskipper crutching video analysis', { cites: ['f-mudvid', 'p-tail'] }),
  c('c-tetrapod', 'land', 'elena', 'What did early tetrapods’ tails actually do?', { cites: ['p-tail'] }),
  c('c-fossils', 'land', 'ava', 'Outreach: robots and fossils exhibit', { cites: ['p-tail'] }),

  // Rovers on other planets
  c('c-pedal', 'rovers', 'lucas', 'Rear rotator pedaling on the steeper bed', { cites: ['p-rover', 'f-pedal'] }),
  c('c-wheelslip', 'rovers', 'lucas', 'Wheel slip vs pedal phase', { cites: ['f-pedal'] }),
  c('c-stuck', 'rovers', 'lucas', 'Rover stuck at 25°: what changed?', { cites: ['r-rover', 'f-calib'] }),
  c('c-nasa', 'rovers', 'lucas', 'NASA call: which results to include', { cites: ['f-nasa', 'p-rover'] }),
  c('c-regolith', 'rovers', 'lucas', 'Lunar regolith simulant vs our sand', { cites: ['p-rover'] }),
]

/** Who is active where right now (drives the pulsing rings and the Live rail). */
export interface Activity {
  chat: string
  who: PersonId
  doing: 'typing' | 'viewing'
}

export const ACTIVE: Activity[] = [
  { chat: HERO_CHAT, who: 'kofi', doing: 'typing' },
  { chat: 'c-slopelegs', who: 'priya', doing: 'viewing' },
  { chat: 'c-traffic', who: 'jonah', doing: 'typing' },
  { chat: 'c-lightblob', who: 'ava', doing: 'viewing' },
]

export interface FeedItem {
  who: PersonId | 'ai'
  verb: string
  target: string
  hub?: HubId
  when: string
  live?: boolean
}

export const FEED: FeedItem[] = [
  { who: 'kofi', verb: 'is typing in', target: 'Sidewinder robot keeps slipping on steep sand', when: 'now', live: true },
  { who: 'jonah', verb: 'is typing in', target: 'Ant traffic at 5 diggers', when: 'now', live: true },
  { who: 'priya', verb: 'branched', target: 'Why does pitching start at 18°?', when: '4 min' },
  { who: 'ai', verb: 'linked a finding to', target: 'Many legs', when: '9 min' },
  { who: 'ava', verb: 'pulled “Collective dynamics in entangled worm and robot blobs” into', target: 'Light-following robot blob', when: '12 min' },
  { who: 'jonah', verb: 'merged 2 chats into', target: 'Traffic rules: ants and robots together', when: '31 min' },
]

/**
 * Lab memory: chats the AI has found to be about related things, across topics.
 * Drawn as faint lines, they give the brain its web.
 */
export const RELATED: [string, string][] = [
  [HERO_CHAT, 'c-slopelegs'],
  ['c-stuck', 'c-recal'],
  ['c-sumforces', 'c-rft'],
  ['c-regolith', 'c-rft'],
  ['c-wheelslip', 'c-cleg'],
  ['c-twomode', 'c-compliance'],
  ['c-traffic', 'c-five'],
  ['c-desic', 'c-colony'],
  ['c-tailtime', 'c-pitch'],
  ['c-blueberry', 'c-rescue'],
  ['c-lattice', 'c-pairs'],
  ['c-openloop', 'c-compliance'],
  ['c-noise', 'c-ourphase'],
  ['c-legfail', 'c-4robots'],
  ['c-drift', 'c-ca'],
  ['c-turn', 'c-tension'],
  ['c-amp', 'c-twomode'],
  ['c-fossils', 'c-outreach'],
  ['c-sandfish101', 'c-review'],
  ['c-onboard', 'c-selfdef'],
  ['c-grant', 'c-redund'],
  ['c-grant', 'c-nasa'],
  ['c-tetrapod', 'c-crutch'],
  ['c-wrist', 'c-tailtime'],
  ['c-xray', 'c-fps'],
  ['c-current', 'c-battery'],
  ['c-pedal', 'c-contact'],
  ['c-lightblob', 'c-rubble'],
  ['c-safety', 'c-colony'],
  ['c-agenda', 'c-traffic'],
  ['c-agenda', HERO_CHAT],
]
