import { FILES, type HubId } from '../lab/content'
import type { PersonId } from '../lab/people'
import { graph } from './world'
import type { SourceRef } from './store'

// The question bank: scripted answers to the kinds of questions a real lab asks.
// Claims about the real papers stay within their public abstracts and press coverage.

export interface BankEntry {
  id: string
  /** Shown as a suggested question. */
  q: string
  /** Title when this question starts a new chat. */
  title: string
  hub: HubId
  /** Any group whose phrases all appear in the question is a hit. */
  keys: string[][]
  text: string
  sources?: SourceRef[]
  files?: { node: string; why: string }[]
  background?: boolean
  suggest?: { chat: string; who: PersonId }
}

export const BANK: BankEntry[] = [
  {
    id: 'onboard', hub: 'core', title: 'Getting started in the lab',
    q: 'I just joined. What does this lab work on, and where should I start?',
    keys: [['just joined'], ['new here'], ['where', 'start'], ['onboard'], ['new member'], ['new student'], ['what does this lab']],
    text: 'Welcome. The lab studies how animals and robots move through sand, mud and clutter, and uses robots as physical models to find the principles behind that movement [1]. The work falls into 11 topics, which you can see as the big nodes on the brain.\n\n**Read first:** the 2016 robophysics review for the big picture [1], then the onboarding guide, which lists every rig and who runs it [2].\n\n**People to talk to:** Kofi for snakes and wiggling robots, Priya for the centipede robots, Jonah for fire ants and Mei for sand swimming.\n\n**A good first chat to open:** Kofi’s “Sidewinder robot keeps slipping on steep sand” [3]. It’s a live problem the lab is working on right now.',
    sources: [{ node: 'p-review', where: 'Abstract' }, { node: 'f-onboard', where: '§2 Rigs and who runs them' }, { chat: 'c-slip', where: '6 prompts' }],
  },
  {
    id: 'find-sidewinder', hub: 'dunes', title: 'Sidewinder trial videos',
    q: 'Where are the high-speed videos of the sidewinder trials?',
    keys: [['where', 'video'], ['where', 'footage'], ['find', 'video'], ['high-speed', 'video']],
    text: 'Found 4 files. Raw video is metadata-only: Cortex reads the name, folder, dates and the README beside it, not the video itself.',
    files: [
      { node: 'f-sw-vid', why: 'Trial 14, the run Kofi cites most. June 2025' },
      { node: 'd-dunes-0', why: 'First run in the same June series' },
      { node: 'd-dunes-1', why: 'Same series, steeper bed' },
      { node: 'f-calib', why: 'The README for these videos says which bed angle each folder used' },
    ],
  },
  {
    id: 'sidewinders', hub: 'dunes', title: 'Sidewinders on sandy slopes',
    q: 'What did the lab learn about sidewinders on sandy slopes?',
    keys: [['sidewind'], ['rattlesnake'], ['snake', 'slope'], ['snake', 'dune']],
    text: 'As the slope gets steeper, sidewinder rattlesnakes keep more of their body in contact with the sand [1]. When the lab’s 16-joint snake robot copied that, it climbed loose slopes close to the steepest angle the sand can hold [1][2].\n\nNoor’s trackway trials with real snakes are in lab memory, if you want the raw contact-length data [3].',
    sources: [{ node: 'p-sidewind', where: 'Abstract' }, { node: 'r-snake', where: 'Robot card' }, { chat: 'c-contact', where: '4 answers' }],
  },
  {
    id: 'ants', hub: 'ants', title: 'How fire ants avoid tunnel jams',
    q: 'How do fire ants dig tunnels without traffic jams?',
    keys: [['ant', 'clog'], ['ant', 'traffic'], ['ant', 'jam'], ['ant', 'tunnel'], ['ant', 'dig']],
    text: 'In narrow tunnels, fire ants dig best when only a few work at once. Many stay idle or turn back, and that uneven workload keeps the tunnel from clogging [1].\n\nThe lab’s digging robots showed the same thing: three robots worked well in a narrow tunnel, but a fourth caused a clog that stopped the work [1][2]. Jonah is measuring the idle rate in the new tunnel setup right now [3].',
    sources: [{ node: 'p-clog', where: 'Abstract' }, { node: 'r-diggers', where: 'Robot card' }, { chat: 'c-idle', where: 'live now' }],
  },
  {
    id: 'sandfish', hub: 'sand', title: 'How the sandfish swims through sand',
    q: 'How does the sandfish lizard swim through sand?',
    keys: [['sandfish'], ['swim', 'sand'], ['lizard']],
    text: 'Once it’s under the surface, the sandfish tucks its legs against its body and swims with a wave that travels from head to tail [1]. It reaches about 10 cm per second, and faster waves mean faster swimming [1].\n\nMei’s notebook fits the same kind of force model to the lab’s newer glass beads [2].',
    sources: [{ node: 'p-sandfish', where: 'Abstract' }, { node: 'f-rft-nb', where: 'cells 4–7' }],
  },
  {
    id: 'diffraction', hub: 'posts', title: 'Why snakes scatter off posts',
    q: 'Why do snakes scatter off a row of posts?',
    keys: [['diffract'], ['post'], ['scatter'], ['snake', 'obstacle']],
    text: 'Snakes moving through a row of posts get turned into a few preferred directions. The pattern looks like waves diffracting through a grating [1].\n\nThey don’t change their body wave to avoid or grab the posts, and a model with no sensing at all reproduces the pattern. So the scattering comes from the body’s mechanics, not from decisions [1]. Kofi is choosing the post spacing for the next runs [2].',
    sources: [{ node: 'p-diffract', where: 'Abstract' }, { chat: 'c-spacing', where: '3 answers' }],
  },
  {
    id: 'legs', hub: 'legs', title: 'Why many legs help on rough ground',
    q: 'Why do more legs help a robot on rough ground?',
    keys: [['leg'], ['centipede'], ['multileg']],
    text: 'Adding leg pairs lets a robot move reliably over rough, unpredictable ground without extra sensors, an idea the lab calls spatial redundancy [1]. A related study shows many-legged robots can even move by deliberately slipping, lifting and lowering their legs in a pattern it calls “frictional swimming” [2].\n\nThe work is the basis of Ground Control Robotics, a start-up building centipede-style robots for farms [3].',
    sources: [{ node: 'p-multileg', where: 'Abstract' }, { node: 'p-slip', where: 'Abstract' }, { node: 'w-gcr', where: 'Article' }],
  },
  {
    id: 'smarticles', hub: 'smarticles', title: 'Robots made of robots',
    q: 'What are smarticles, and how do they team up?',
    keys: [['smarticle'], ['robot made of robots'], ['blob'], ['swarm']],
    text: 'Smarticles are small 3D-printed robots that can only flap two arms. Five in a ring nudge each other and move as one “supersmarticle”, and adding a light sensor lets the group steer [1].\n\nIn the worm-blob work, blackworms tangled into a blob survived drying out for longer, and a mesh of smarticles showed similar group behaviour [2]. Ava is running the light-following trials now [3].',
    sources: [{ node: 'p-smarticle', where: 'Abstract' }, { node: 'p-blobs', where: 'Abstract' }, { chat: 'c-lightblob', where: 'Ava is here now' }],
  },
  {
    id: 'rover', hub: 'rovers', title: 'Getting a rover out of sand traps',
    q: 'How does the rover avoid getting stuck in sand?',
    keys: [['rover'], ['mars'], ['planet'], ['stuck']],
    text: 'The lab’s rover gets itself out of sand traps by mixing paddling, walking and wheel spinning, a gait the team called “rear rotator pedaling” [1]. Lucas is testing it on a steeper bed [2].',
    sources: [{ node: 'p-rover', where: 'Abstract' }, { chat: 'c-pedal', where: '5 answers' }],
  },
  {
    id: 'mudskipper', hub: 'land', title: 'Tails and the first steps on land',
    q: 'How did tails help the first animals move on land?',
    keys: [['mudskipper'], ['tetrapod'], ['tail'], ['first', 'land'], ['muddybot']],
    text: 'Using the tail together with the front limbs would have helped early land animals a lot on sandy slopes [1]. The lab showed this with mudskippers and MuddyBot, a robot with two limbs and a powerful tail [1][2].',
    sources: [{ node: 'p-tail', where: 'Abstract' }, { node: 'r-muddy', where: 'Robot card' }],
  },
  {
    id: 'pivot', hub: 'legs', title: 'Idea: a centipede robot that weeds blueberries',
    q: 'Could a centipede robot weed under blueberry bushes?',
    keys: [['blueberr'], ['weed'], ['farm'], ['crop']],
    text: 'Promising. The lab’s many-legged robots move reliably over bumpy ground without extra sensing [1], and the spin-out Ground Control Robotics is aiming at this kind of specialty-crop work [2].\n\n**Open questions:** how many leg pairs the ground between rows needs, and battery life in the field.\n\nPriya already has a chat on a blueberry-row mockup. Pulling it in would give me her trial data.',
    sources: [{ node: 'p-multileg', where: 'Abstract' }, { node: 'w-gcr', where: 'Article' }],
    suggest: { chat: 'c-blueberry', who: 'priya' },
  },
  {
    id: 'granular', hub: 'soft', title: 'What a granular medium is',
    q: 'What is a granular medium?',
    keys: [['granular'], ['what is sand']],
    background: true,
    text: 'General background, not from the lab’s files: a granular medium is a collection of solid grains, like sand, soil or seeds. Depending on how it’s pushed, it can hold you up like a solid or pour like a liquid. That’s why moving through it is so hard to model.\n\nFrom the lab: the 2013 terradynamics paper shows how to predict the forces on a leg moving through it [1].',
    sources: [{ node: 'p-terra', where: 'Abstract' }],
  },
  {
    id: 'calendar', hub: 'core', title: 'Booking the X-ray rig',
    q: 'Is the X-ray rig free on Thursday?',
    keys: [['free on'], ['calendar'], ['book'], ['available', 'rig']],
    text: 'I can’t see calendars yet, so I can’t tell you if the X-ray rig is free. The onboarding guide says Sam schedules the rigs [1]. Calendar connectors are on Cortex’s roadmap.',
    sources: [{ node: 'f-onboard', where: '§2 Rigs and who runs them' }],
  },
  {
    id: 'who-ants', hub: 'ants', title: 'Who knows the fire ant work',
    q: 'Who in the lab has worked with fire ants?',
    keys: [['who', 'ant']],
    text: 'Jonah runs the fire ant tunnels day to day: 7 chats, and he’s typing in one right now [1]. Sam set up the tunnel cameras [2]. In lab memory, Prof. Ruiz reviewed the clog experiments with Jonah [3].',
    sources: [{ chat: 'c-traffic', where: 'Jonah is typing now' }, { chat: 'c-fps', where: '2 answers' }, { chat: 'c-antmerge', where: 'merge' }],
  },
  {
    id: 'week', hub: 'core', title: 'This week in the lab',
    q: 'What’s new in the lab this week?',
    keys: [['this week'], ['what’s new'], ["what's new"], ['whats new'], ['summar', 'meeting'], ['catch me up']],
    text: 'This week in the lab:\n\n**Snakes:** Kofi is working out why the snake robot slips above 15° [1], and Priya branched to ask why it pitches at 18° [2].\n\n**Ants:** Jonah merged his ant and robot traffic chats [3].\n\n**Smarticles:** Ava pulled the worm-blob paper into her light-following trials [4].',
    sources: [{ chat: 'c-slip', where: 'live' }, { chat: 'c-pitch', where: 'branch' }, { chat: 'c-antmerge', where: 'merge' }, { chat: 'c-lightblob', where: 'pull' }],
  },
  {
    id: 'noor', hub: 'dunes', title: 'How Noor set up the trackway',
    q: 'How did Noor set up and calibrate the sidewinding trackway?',
    keys: [['noor'], ['calibrat'], ['trackway']],
    text: 'Noor built the sidewinding trackway and re-levelled the tilting bed on 14 June 2025 after one leg settled [1]. Her calibration doc gives the steps: level the frame, check the angle at three points, and log the offset before every session [2].\n\nShe graduated in 2025, and her chats are still in the lab’s memory.',
    sources: [{ chat: 'c-recal', where: '3 answers' }, { node: 'f-calib', where: '§2–3' }],
  },
  {
    id: 'phase', hub: 'maths', title: 'Geometric phase, in plain words',
    q: 'Explain geometric phase like I’m new to physics.',
    keys: [['geometric phase'], ['self-deformation'], ['geometric'], ['maths', 'wiggl']],
    text: 'In plain words: every wiggle traces a loop through the shapes a body can make, and the area inside that loop predicts how far the animal moves each cycle [1].\n\nWorms, snakes and sand-swimming lizards all trace nearly circular loops that enclose close to the most area possible. That holds across a hundredfold range of body sizes [1].',
    sources: [{ node: 'p-geophase', where: 'Abstract' }],
  },
  {
    id: 'disagree', hub: 'dunes', title: 'Where chats disagree on the snake robot',
    q: 'Do any chats disagree about why the snake robot slips?',
    keys: [['disagree'], ['conflict'], ['contradict']],
    text: 'Yes, one open disagreement. Kofi’s chat puts the slipping down to too little body contact [1], while Priya’s branch suspects the robot starts to pitch first, at about 18° [2]. Both cite the same slope trials [3], so a run with longer contact would settle it.',
    sources: [{ chat: 'c-slip', where: 'answer 1' }, { chat: 'c-pitch', where: 'branch' }, { node: 'f-slope', where: 'sheet “summary”' }],
  },
  {
    id: 'draft', hub: 'legs', title: 'Draft: spatial redundancy paragraph',
    q: 'Draft a grant paragraph on spatial redundancy, with citations.',
    keys: [['draft'], ['grant'], ['abstract', 'write'], ['paragraph']],
    text: 'Draft, for you to check before using:\n\n“Robots that move through farms, rubble and other unpredictable ground usually rely on dense sensing and careful control. Our work shows another route: adding leg pairs lets a many-legged robot move reliably over noisy terrain with little or no sensing, a property we call spatial redundancy [1]. The same robots can also move by deliberately slipping, which widens the range of surfaces they can cross [2].”\n\nThe grant draft already on OneDrive has a matching section you could merge this into [3].',
    sources: [{ node: 'p-multileg', where: 'Abstract' }, { node: 'p-slip', where: 'Abstract' }, { node: 'f-grant', where: '§4 Approach' }],
  },
  {
    id: 'fig3', hub: 'posts', title: 'Reproducing Figure 3 (snake diffraction)',
    q: 'Which notebook made Figure 3 in the snake diffraction paper?',
    keys: [['figure'], ['reproduce'], ['which notebook'], ['which script']],
    text: 'Figure 3 of the snake diffraction study is rebuilt in analysis/diffraction_fig3.ipynb [1], using the post-array runs in trackway/posts_run7.csv [2]. The notebook’s first cell sets the scattering-angle bins to 10°.',
    sources: [{ node: 'f-fig3', where: 'cells 1–3' }, { node: 'f-posts', where: 'all rows' }],
  },
  {
    id: 'slip-contact', hub: 'dunes', title: 'Longer contact on the snake robot',
    q: 'What should we try next to stop the snake robot slipping?',
    keys: [['slip'], ['longer contact'], ['next', 'snake'], ['stop', 'slipping'], ['pitch']],
    text: 'Try the sidewinder’s strategy on the robot: keep more of the body on the sand as the bed tilts. That’s what let the 2014 robot climb close to the steepest stable slope [1].\n\nKofi’s June runs used the default gait only [2], and Noor’s trials after the recalibration did too [3]. So a sweep of contact length at 14–20° is the missing comparison.',
    sources: [{ node: 'p-sidewind', where: 'Abstract' }, { node: 'f-slope', where: 'sheet “summary”' }, { chat: 'c-recal', where: '3 answers' }],
  },
]

const STOP = new Set(['the', 'and', 'what', 'with', 'that', 'this', 'from', 'have', 'does', 'about', 'which', 'where', 'when', 'into', 'there', 'their', 'your', 'our', 'lab', 'labs', 'how', 'why', 'who', 'any', 'can', 'for', 'are', 'was', 'were', 'did', 'next'])

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'")

/** A key matches at the start of a word, so “ant” finds “ants” but not “want”. */
const hasKey = (q: string, key: string) => {
  const k = norm(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-z0-9])${k}`).test(q)
}

export function matchBank(question: string): BankEntry | null {
  const q = norm(question)
  let best: BankEntry | null = null
  let bestScore = 0
  for (const e of BANK) {
    let score = 0
    for (const group of e.keys) {
      if (group.every((k) => hasKey(q, k))) score = Math.max(score, group.length + group.join('').length / 100)
    }
    if (norm(e.q) === q) score = 99
    if (score > bestScore) {
      best = e
      bestScore = score
    }
  }
  return bestScore > 0 ? best : null
}

/** “Not found”: honest, plus the three files that came closest (SPEC ASK-2). */
export function notFound(question: string) {
  const words = norm(question).split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP.has(w))
  const scored = graph.nodes
    .filter((n) => n.type === 'file' || n.type === 'data')
    .map((n) => {
      const label = norm(n.label)
      const hits = words.filter((w) => label.includes(w.slice(0, Math.max(4, w.length - 2))))
      return { n, hits }
    })
    .filter((x) => x.hits.length)
    .sort((a, b) => b.hits.length - a.hits.length)
    .slice(0, 3)
  const fallback = ['f-onboard', 'p-review', 'f-agenda']
  const files = scored.length
    ? scored.map((x) => ({ node: x.n.id, why: `Mentions “${x.hits[0]}”` }))
    : fallback.map((id) => ({ node: id, why: 'A good place to look across the lab' }))
  return {
    text: 'I couldn’t find this in the lab’s files. These came closest:',
    files,
  }
}

/** Suggested questions for a topic, for the “Try asking” chips. */
export function suggestionsFor(hub: HubId | null, n = 3) {
  const own = BANK.filter((e) => e.hub === hub)
  const general = BANK.filter((e) => ['onboard', 'week', 'pivot', 'granular'].includes(e.id))
  const pool = [...own, ...general.filter((g) => !own.includes(g))]
  return pool.slice(0, n)
}

export function fileLabel(id: string) {
  return graph.byId.get(id)?.label ?? FILES.find((f) => f.id === id)?.name ?? id
}
