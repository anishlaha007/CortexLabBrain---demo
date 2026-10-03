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
    keys: [['sidewind', 'video'], ['snake', 'video'], ['where', 'video'], ['where', 'footage'], ['find', 'video'], ['high-speed', 'video']],
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
    keys: [['blueberr'], ['weed'], ['farm'], ['crop'], ['centipede', 'weed'], ['robot', 'weed'], ['robot', 'blueberr'], ['robot', 'farm']],
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
    text: 'Jonah runs the fire ant tunnels day to day: 7 chats, and he’s typing in one right now [1]. Sam set up the tunnel cameras [2]. In lab memory, Elena reviewed the clog experiments with Jonah [3].',
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
    keys: [['noor'], ['calibrat'], ['trackway'], ['noor', 'trackway'], ['noor', 'calibrat'], ['set up', 'trackway']],
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
  // ───────── Swimming in sand ─────────
  {
    id: 'rft', hub: 'sand', title: 'Resistive force theory, explained',
    q: 'What is resistive force theory, and when does it work?',
    keys: [['resistive force'], ['rft']],
    text: 'Resistive force theory (RFT) predicts the force on a body moving through sand by cutting it into small pieces and adding up the force on each one. The 2009 sandfish study used this kind of model to explain how the lizard swims [1], and the 2013 terradynamics paper used it to predict how small legged robots move on granular ground [2].\n\nIt works best for slow movement through dry, loose grains. Mei’s rft/forces.py does the sum for the lab’s rigs [3].',
    sources: [{ node: 'p-sandfish', where: 'Abstract' }, { node: 'p-terra', where: 'Abstract' }, { node: 'f-rft', where: 'forces.py' }],
  },
  {
    id: 'rft-coeff', hub: 'sand', title: 'RFT coefficients for the glass beads',
    q: 'Where are the RFT coefficients for the new glass beads?',
    keys: [['coefficient'], ['glass bead']],
    text: 'Found 3 files. The coefficients are fitted in the notebook and used by the force script.',
    files: [
      { node: 'f-rft-nb', why: 'Fits the coefficients, cells 4–7. Mei, last week' },
      { node: 'f-rft', why: 'Uses them to predict the forces on any body shape' },
      { node: 'd-sand-0', why: 'The X-ray run the fit was checked against' },
    ],
  },
  {
    id: 'xray', hub: 'sand', title: 'Why the X-ray videos blur',
    q: 'Why do the X-ray videos blur after a couple of seconds?',
    keys: [['x-ray'], ['xray'], ['blur']],
    text: 'Sam traced it to the camera heating up: after about 2 seconds of continuous capture the frame rate drops and the image smears [1]. His fix is to record in 1.5-second bursts with a short pause, which is now in the rig notes [1]. The newest run that uses it is sandfish_run03 [2].',
    sources: [{ chat: 'c-xray', where: '3 answers · Sam Whitfield' }, { node: 'f-xray', where: 'run 03' }],
  },
  {
    id: 'wet', hub: 'sand', title: 'RFT on wet sand',
    q: 'Does RFT still work on wet sand?',
    keys: [['wet'], ['wet', 'sand'], ['wet', 'rft']],
    text: 'Not as far as the lab’s files go. Every RFT coefficient here was fitted on dry media [1], and Mei’s chat on wet versus dry sand has no trials logged yet [2].\n\nGeneral background, not from the lab’s files: water makes grains stick together, so wet sand usually resists more than the dry model predicts.',
    sources: [{ node: 'f-rft-nb', where: 'trials list' }, { chat: 'c-wet', where: 'open question' }],
  },
  {
    id: 'sandfish-robot', hub: 'sand', title: 'What the sandfish robot is for',
    q: 'What is the sandfish robot used for?',
    keys: [['sandfish robot'], ['robot', 'sandfish']],
    text: 'It swims under the surface with a body wave, like the lizard, so the lab can change one thing at a time, such as the wave’s size or length, and see what makes swimming fastest [1]. Mei’s chat is looking for the best amplitude for its wavelength [2].',
    sources: [{ node: 'r-sandfish', where: 'Robot card' }, { chat: 'c-amp', where: '4 answers' }],
  },
  {
    id: 'grain', hub: 'sand', title: 'Grain size and the sandfish wave',
    q: 'Does grain size change how the sandfish swims?',
    keys: [['grain size'], ['grain'], ['grain', 'sandfish'], ['grain', 'size']],
    text: 'Mei compared the fine glass beads with the coarser ones in her grain-size chat [1]. In her runs the wave shape stayed about the same, and speed dropped a little in the coarse beads. The fits are in the glass-bead notebook [2].',
    sources: [{ chat: 'c-grain', where: '3 answers · Mei Tanaka' }, { node: 'f-rft-nb', where: 'cells 8–9' }],
  },

  // ───────── Snakes on sand dunes ─────────
  {
    id: 'gait', hub: 'dunes', title: 'The snake robot’s gait settings',
    q: 'What gait settings does the snake robot use?',
    keys: [['gait table'], ['gait', 'setting'], ['gait', 'snake']],
    text: 'The gait lives in snake_robot/gait_table.yaml: one row per joint, 16 in all, with the wave’s size, its timing along the body and how long each part stays on the sand [1]. Sam is converting it to the new controller format [2]. Kofi’s slope trials all used the default settings [3].',
    sources: [{ node: 'f-gait', where: 'gait_table.yaml' }, { chat: 'c-gaittable', where: 'Sam Whitfield · this week' }, { node: 'f-slope', where: 'column “gait”' }],
  },
  {
    id: 'turn', hub: 'dunes', title: 'Turning while sidewinding',
    q: 'Can the snake robot turn while sidewinding?',
    keys: [['turn'], ['turn', 'snake'], ['turn', 'sidewind']],
    text: 'Kofi’s chat on this is still open [1]. The idea he’s testing is to shift the wave a little each cycle so the body pivots without stopping. There are no trial results in the lab’s files yet, so for now it’s a plan, not a finding.',
    sources: [{ chat: 'c-turn', where: '2 answers · Dr. Kofi Mensah' }],
  },
  {
    id: 'noor-rattlesnake', hub: 'dunes', title: 'Noor’s rattlesnake trials',
    q: 'What did Noor find with the rattlesnake trials?',
    keys: [['rattlesnake', 'trial'], ['contact length']],
    text: 'Her trackway trials matched the 2014 paper: on steeper sand, the snakes kept a longer stretch of body in contact [1][2]. Her contact-length table is the closest thing the lab has to the robot comparison Kofi needs [1].',
    sources: [{ chat: 'c-contact', where: '4 answers · Noor Haddad (alumna)' }, { node: 'p-sidewind', where: 'Abstract' }],
  },
  {
    id: 'compare-2014', hub: 'dunes', title: 'Our robot vs the 2014 robot',
    q: 'Is our snake robot worse on slopes than the 2014 robot?',
    keys: [['2014'], ['worse'], ['2014', 'robot', 'worse'], ['2014', 'robot'], ['worse', 'robot']],
    text: 'On paper, yes. The 2014 robot climbed sandy slopes up to about 20° once it used the sidewinder’s longer contact [1]. Kofi’s robot slips above 15° but still runs the default gait [2], so it isn’t a fair comparison yet.',
    sources: [{ node: 'r-snake', where: 'Robot card' }, { node: 'f-slope', where: 'sheet “summary”' }],
  },
  {
    id: 'fieldtrip', hub: 'dunes', title: 'Field trip checklist',
    q: 'What do I need to bring on the field trip?',
    keys: [['field trip'], ['packing'], ['permit']],
    text: 'Elena’s field-trip chat has the list [1]: the collecting permit (Elena carries the original), the portable trackway, two high-speed cameras with spare batteries, and the snake-handling kit. Everyone going needs to have signed the animal handling form first [2].',
    sources: [{ chat: 'c-fieldtrip', where: 'Elena’s list' }, { node: 'f-safety', where: '§4 Field work' }],
  },
  {
    id: 'outreach', hub: 'dunes', title: 'Sidewinding for a school group',
    q: 'Explain sidewinding for a school group.',
    keys: [['school'], ['kids'], ['outreach'], ['explain', 'sidewind']],
    text: 'Try this: “Sidewinder snakes move sideways, lifting parts of their body and putting them down again, so only a few spots touch the sand at a time. On a steep dune they press more of their body into the sand, and that stops them sliding back. Scientists taught a snake robot the same trick, and it could climb too.” [1]\n\nAva’s outreach chat has the props list [2].',
    sources: [{ node: 'p-sidewind', where: 'Abstract' }, { chat: 'c-outreach', where: 'Ava Okonkwo' }],
  },

  // ───────── Snakes through obstacles ─────────
  {
    id: 'plain-diffraction', hub: 'posts', title: '“Mechanical diffraction”, in plain words',
    q: 'What does “mechanical diffraction” mean, in plain words?',
    keys: [['mechanical diffraction'], ['plain words'], ['explain', 'diffraction']],
    text: 'Shine light through a comb and it spreads into a few bright directions. Send snakes through a row of posts and something similar happens: they come out heading in a few preferred directions [1]. It’s “mechanical” because it comes from the body bumping and bending against the posts, not from the snake deciding where to go [1].\n\nPhysics World covered it as snakes that diffract like quantum particles [2].',
    sources: [{ node: 'p-diffract', where: 'Abstract' }, { node: 'w-physworld', where: 'Article' }],
  },
  {
    id: 'spacing', hub: 'posts', title: 'Post spacing for the next runs',
    q: 'What post spacing should the next diffraction runs use?',
    keys: [['spacing'], ['how far apart'], ['post', 'spacing'], ['spacing', 'run']],
    text: 'Kofi’s spacing chat narrows it to two options [1]: one that matches the published row of evenly spaced posts, for comparison [2], and one tighter. The last run’s settings are in posts_run7.csv [3].',
    sources: [{ chat: 'c-spacing', where: '3 answers' }, { node: 'p-diffract', where: 'Methods summary' }, { node: 'f-posts', where: 'header rows' }],
  },
  {
    id: 'noise', hub: 'posts', title: 'Is the scattering pattern real?',
    q: 'Is the scattering pattern real, or just noise?',
    keys: [['noise'], ['real', 'pattern']],
    text: 'Kofi checked this [1]. When he splits posts_run7.csv into two halves, the peaks stay at the same angles in both [2], which noise wouldn’t do. The published pattern was also reproduced by a model with no sensing at all [3].',
    sources: [{ chat: 'c-noise', where: 'Dr. Kofi Mensah' }, { node: 'f-posts', where: 'all rows' }, { node: 'p-diffract', where: 'Abstract' }],
  },

  // ───────── Robots that wiggle ─────────
  {
    id: 'mechint', hub: 'wiggle', title: 'Mechanical intelligence, explained',
    q: 'What is mechanical intelligence?',
    keys: [['mechanical intelligence'], ['compliance'], ['compliant']],
    text: 'It’s the idea that a robot’s body can do part of the thinking. The lab’s cable-driven limbless robot can loosen its body so it gives way when it hits an obstacle, and that lets it slip through clutter with simple control and no extra sensing [1][2].\n\nKofi’s chat asks whether more give always helps. His rubble-course runs say not quite: too loose and it stalls [3].',
    sources: [{ node: 'p-mechint', where: 'Abstract' }, { node: 'r-limbless', where: 'Robot card' }, { chat: 'c-compliance', where: '3 answers' }],
  },
  {
    id: 'rescue', hub: 'wiggle', title: 'Wiggly robots for search and rescue?',
    q: 'Could wiggly robots help in search and rescue?',
    keys: [['rescue'], ['rubble'], ['disaster']],
    text: 'That’s the long-term hope, and Elena has a chat on what the lab can honestly claim [1]. What the published work shows: limbless robots that use their body’s give can cross cluttered courses with simple control [2]. Georgia Tech’s 2024 feature describes the worm-inspired robots behind this [3]. No tests in real rubble have been done here yet.',
    sources: [{ chat: 'c-rescue', where: 'Prof. Elena Ruiz' }, { node: 'p-mechint', where: 'Abstract' }, { node: 'w-wiggly', where: 'Feature' }],
  },
  {
    id: 'tension', hub: 'wiggle', title: 'Best cable tension',
    q: 'Which cable tension worked best on the limbless robot?',
    keys: [['tension'], ['cable']],
    text: 'In Kofi’s tension chat, the middle setting did best in the rubble course: tight enough to push, loose enough to bend around posts [1]. The settings live in limbless/cable_ctrl.py [2]. Sam flagged current spikes on cable 2 after the last change [3].',
    sources: [{ chat: 'c-tension', where: '4 answers' }, { node: 'f-cable', where: 'TENSION_PRESETS' }, { chat: 'c-current', where: 'Sam Whitfield' }],
  },
  {
    id: 'worm', hub: 'wiggle', title: 'The next worm-robot course',
    q: 'What’s next for the worm-inspired robot?',
    keys: [['worm', 'robot'], ['worm-inspired'], ['obstacle course']],
    text: 'Kofi is designing the next obstacle course [1]: denser posts, plus a stretch of loose gravel. It builds on the wiggly-robot work Georgia Tech featured in 2024 [2] and the notes from the last rubble course [3].',
    sources: [{ chat: 'c-wormnext', where: 'Dr. Kofi Mensah' }, { node: 'w-wiggly', where: 'Feature' }, { node: 'f-rubble', where: 'Course 2 notes' }],
  },

  // ───────── The maths of wiggling ─────────
  {
    id: 'twomode', hub: 'maths', title: 'What the two-mode fit tells us',
    q: 'What does the two-mode fit tell us?',
    keys: [['two-mode'], ['two mode'], ['nematode']],
    text: 'Mei’s fit describes each body wave as a mix of just two basic shapes, which turns every wiggle into a loop on a flat chart [1]. The 2024 paper used the same trick to compare animals from tiny worms to snakes, and found their loops enclose close to the most area possible [2].',
    sources: [{ node: 'f-modes', where: 'cells 2–6' }, { node: 'p-geophase', where: 'Abstract' }],
  },
  {
    id: 'phase-notebook', hub: 'maths', title: 'Where the geometric phase code is',
    q: 'Which notebook computes the geometric phase?',
    keys: [['phase', 'notebook'], ['phase', 'code']],
    text: 'Found 3 files.',
    files: [
      { node: 'f-modes', why: 'Fits the two body modes and computes the loop area' },
      { node: 'f-reading', why: 'Reading group notes that walk through the maths' },
      { node: 'd-maths-0', why: 'Snake mode data the notebook loads first' },
    ],
  },
  {
    id: 'readgroup', hub: 'maths', title: 'This month’s reading group',
    q: 'What are we reading in reading group this month?',
    keys: [['reading group'], ['reading list'], ['what should i read']],
    text: 'Geometric mechanics [1]. Elena’s list starts with the 2024 geometric phase paper [2], with the 2016 robophysics review as background [3]. Notes from each session go in the shared reading group doc [1].',
    sources: [{ node: 'f-reading', where: 'October' }, { node: 'p-geophase', where: 'Abstract' }, { node: 'p-review', where: 'Abstract' }],
  },
  {
    id: 'snake-centipede', hub: 'maths', title: 'What snakes and centipedes share',
    q: 'What do snakes and centipedes have in common?',
    keys: [['in common'], ['snake', 'centipede'], ['same wave']],
    text: 'Both move with waves. The 2024 geometric phase work found the same efficient body wave in worms, snakes and sand-swimming lizards [1]. In the lab, Priya’s chat applies the same kind of maths to the many-legged robot’s gait [2].',
    sources: [{ node: 'p-geophase', where: 'Abstract' }, { chat: 'c-height', where: 'Priya Raman' }],
  },

  // ───────── Many legs ─────────
  {
    id: 'pairs', hub: 'legs', title: 'How many leg pairs a robot needs',
    q: 'How many leg pairs does a robot need?',
    keys: [['leg pairs'], ['how many legs'], ['pairs']],
    text: 'Enough that rough ground stops mattering. The 2023 Science paper shows that adding leg pairs makes movement over noisy terrain more reliable [1]. In Priya’s sweep, the gains level off around 6 pairs on the lab’s rough bed [2][3].',
    sources: [{ node: 'p-multileg', where: 'Abstract' }, { chat: 'c-pairs', where: '5 answers' }, { node: 'f-legs-csv', where: 'pairs 2–12' }],
  },
  {
    id: 'legfail', hub: 'legs', title: 'When a leg fails',
    q: 'If a leg fails, does the robot keep going?',
    keys: [['leg', 'fail'], ['broken', 'leg'], ['lose', 'leg']],
    text: 'That’s what spatial redundancy predicts: with enough legs, the robot moves reliably over rough ground without sensing, because no single foot matters much [1]. Priya’s runs with one leg switched off test exactly that, and the robot kept going [2].',
    sources: [{ node: 'p-multileg', where: 'Abstract' }, { chat: 'c-legfail', where: 'Priya Raman' }],
  },
  {
    id: 'lift', hub: 'legs', title: 'Frictional swimming, explained',
    q: 'What is frictional swimming?',
    keys: [['frictional swimming'], ['lifting pattern'], ['swim', 'slip']],
    text: 'A way for many-legged robots to move by slipping on purpose. Instead of planting each foot firmly, the robot lifts and lowers its legs in a travelling pattern and lets them slide, and that alone pushes it forward [1]. Priya is working out the lifting pattern for the 12-leg robot [2].',
    sources: [{ node: 'p-slip', where: 'Abstract' }, { chat: 'c-lift', where: 'Priya Raman' }],
  },
  {
    id: 'battery', hub: 'legs', title: 'Battery life on the centipede robot',
    q: 'How long does the centipede robot’s battery last?',
    keys: [['battery'], ['battery', 'robot'], ['battery', 'centipede']],
    text: 'About 40 minutes of walking on the 8-segment robot, from Sam’s tests [1]. That’s short for a field day, so his chat compares two bigger packs. The firmware logs battery voltage every second if you need your own runs [2].',
    sources: [{ chat: 'c-battery', where: 'Sam Whitfield' }, { node: 'f-cfw', where: 'log_power()' }],
  },
  {
    id: 'gcr', hub: 'legs', title: 'Ground Control Robotics',
    q: 'What is Ground Control Robotics?',
    keys: [['ground control'], ['start-up'], ['startup'], ['spin-out'], ['spinout']],
    text: 'An Atlanta start-up that grew out of the Georgia Tech research behind this demo lab. It builds centipede-style robots for weeding specialty crops [1], based on the 2023 work on robots with many legs [2].',
    sources: [{ node: 'w-gcr', where: 'Article' }, { node: 'p-multileg', where: 'Abstract' }],
  },
  {
    id: 'find-legs', hub: 'legs', title: 'Leg-pair sweep data',
    q: 'Where is the leg-pair sweep data?',
    keys: [['leg', 'sweep'], ['leg', 'data'], ['where', 'leg']],
    text: 'Found 3 files.',
    files: [
      { node: 'f-legs-csv', why: 'The full sweep, 2 to 12 leg pairs. Priya, September' },
      { node: 'f-cfw', why: 'The firmware that logged it' },
      { node: 'd-legs-0', why: 'One raw trial from the sweep' },
    ],
  },
  {
    id: 'ask-legs', hub: 'legs', title: 'Questions for the centipede team',
    q: 'What should I ask about the centipede robots at group meeting?',
    keys: [['ask', 'centipede'], ['ask', 'legs'], ['question', 'centipede']],
    text: 'Three good questions, from the open chats:\n\n1. How many leg pairs does the farm robot really need? The sweep levels off near 6 [1].\n2. Does the robot keep going when a leg fails? [2]\n3. Could frictional swimming help between blueberry rows? [3]',
    sources: [{ chat: 'c-pairs', where: '5 answers' }, { chat: 'c-legfail', where: 'open' }, { chat: 'c-lift', where: 'open' }],
  },

  // ───────── Fire ant tunnels ─────────
  {
    id: 'falls', hub: 'ants', title: 'How ants catch their falls',
    q: 'Why do ants fall in narrow tunnels, and how do they stop?',
    keys: [['ant', 'fall', 'tunnel'], ['ant', 'fall'], ['antenna']],
    text: 'The 2013 study found that ants climbing in tunnels sometimes slip, and catch themselves by bracing their antennae and legs against the walls [1]. How well that works depends on how wide the tunnel is compared with the ant [1]. Jonah’s chat is measuring the same thing in the lab’s new tunnels [2].',
    sources: [{ node: 'p-antjam', where: 'Abstract' }, { chat: 'c-falls', where: 'Jonah Kim' }],
  },
  {
    id: 'robots-ants', hub: 'ants', title: 'What the digging robots taught us',
    q: 'What did the digging robots teach us about ants?',
    keys: [['digging robot'], ['robot', 'ant']],
    text: 'That idleness is useful. Digging robots that all worked equally hard clogged the narrow tunnel; with an uneven workload like the ants’, where a few do most of the digging, the work kept flowing [1][2]. Jonah is reproducing the clog result with 4 robots [3].',
    sources: [{ node: 'p-clog', where: 'Abstract' }, { node: 'r-diggers', where: 'Robot card' }, { chat: 'c-4robots', where: 'Jonah Kim' }],
  },
  {
    id: 'idle', hub: 'ants', title: 'Idle rate in the new tunnels',
    q: 'What is the idle rate in the new tunnels?',
    keys: [['idle'], ['idleness'], ['lazy']],
    text: 'Jonah is measuring it now [1]. In the published clog study, most workers in a narrow tunnel did little digging while a few did most of it [2]. His first tagged clips look similar, but the count isn’t finished [3].',
    sources: [{ chat: 'c-idle', where: 'Jonah Kim · live' }, { node: 'p-clog', where: 'Abstract' }, { node: 'f-ant-vid', where: 'tagged clips' }],
  },
  {
    id: 'colony', hub: 'ants', title: 'Looking after the colonies',
    q: 'How do I look after the ant colonies?',
    keys: [['colony'], ['colonies'], ['feed', 'ant']],
    text: 'The care protocol is on Drive [1]: feed three times a week, keep the escape barrier clean and dry, and log humidity every day. Jonah keeps this month’s schedule in his chat [2]. Fire ants sting, so read the safety doc before your first shift [3].',
    sources: [{ node: 'f-colony', where: '§1–3' }, { chat: 'c-colony', where: 'Jonah Kim' }, { node: 'f-safety', where: '§2 Fire ants' }],
  },
  {
    id: 'next-ants', hub: 'ants', title: 'The next ant experiment',
    q: 'What should the next ant experiment be?',
    keys: [['next', 'ant'], ['ant', 'experiment']],
    text: 'The gap in the open chats is falls [1]. The lab has idle-rate and traffic data, but no fall counts by tunnel width. Filming at 1000 fps is under discussion [2], and the 2013 study gives a method to follow [3].',
    sources: [{ chat: 'c-falls', where: 'open' }, { chat: 'c-fps', where: 'Sam Whitfield' }, { node: 'p-antjam', where: 'Abstract' }],
  },
  {
    id: 'cameras', hub: 'ants', title: 'Filming falls at 1000 fps',
    q: 'Should we film the ant falls at 1000 fps?',
    keys: [['fps'], ['frame rate'], ['camera'], ['film', 'fall', 'fps'], ['fps', 'ant', 'fall'], ['film', 'fps']],
    text: 'Sam thinks yes for falls, which are over in a few milliseconds, but the tunnel cameras only hold about 4 seconds at that rate [1]. His suggestion: trigger on motion, and keep the normal rate the rest of the time [1].',
    sources: [{ chat: 'c-fps', where: '2 answers · Sam Whitfield' }],
  },
  {
    id: 'find-ant-video', hub: 'ants', title: 'Ant tunnel videos',
    q: 'Find the ant tunnel videos from September.',
    keys: [['ant', 'video'], ['where', 'ant', 'video'], ['find', 'ant', 'video'], ['tunnel', 'video'], ['ant', 'clip'], ['ant', 'footage']],
    text: 'Found 4 files. Video is metadata-only: Cortex reads names, folders, dates and the README beside them.',
    files: [
      { node: 'f-ant-vid', why: 'Tunnel cam 2, the one Jonah cites most' },
      { node: 'd-ants-0', why: 'Tunnel cam 1, same week' },
      { node: 'd-ants-2', why: 'Tunnel cam 3, same week' },
      { node: 'f-flux', why: 'The script that turns these videos into traffic counts' },
    ],
  },
  {
    id: 'flux', hub: 'ants', title: 'How tunnel_flux.py counts ants',
    q: 'How does tunnel_flux.py count ants?',
    keys: [['tunnel_flux'], ['flux'], ['tunnel_flux', 'ant'], ['flux', 'count', 'ant']],
    text: 'It tracks each ant in the tunnel camera video and counts how many cross a line near the entrance each minute, going in and coming out [1]. Jonah’s traffic chat uses those counts for the 5-digger runs [2].',
    sources: [{ node: 'f-flux', where: 'count_crossings()' }, { chat: 'c-traffic', where: 'Jonah Kim' }],
  },

  // ───────── Robots made of robots ─────────
  {
    id: 'drift', hub: 'smarticles', title: 'Why the supersmarticle drifts',
    q: 'Why does the supersmarticle drift to the left?',
    keys: [['drift']],
    text: 'Ava’s best guess, in her chat [1]: one arm servo on smarticle 3 runs slightly slow, so the ring gets pushed one way more often. The 2019 paper shows the ring moves toward a smarticle that stops moving, which fits a slow one [2]. Sam’s servo swap should settle it [3].',
    sources: [{ chat: 'c-drift', where: 'Ava Okonkwo' }, { node: 'p-smarticle', where: 'Abstract' }, { chat: 'c-servo', where: 'Sam Whitfield' }],
  },
  {
    id: 'drift-conflict', hub: 'smarticles', title: 'Two views on the drift',
    q: 'Do Ava’s and Sam’s notes disagree about the drift?',
    keys: [['drift', 'disagree'], ['servo']],
    text: 'A little. Ava’s chat blames a slow arm servo [1]. Sam’s swap notes say the servos tested within spec and point to a worn ring base instead [2]. A run with the swapped servo would settle it.',
    sources: [{ chat: 'c-drift', where: 'Ava Okonkwo' }, { chat: 'c-servo', where: 'Sam Whitfield' }],
  },
  {
    id: 'five-six', hub: 'smarticles', title: 'Five smarticles or six?',
    q: 'Should the ring have five smarticles or six?',
    keys: [['five', 'six'], ['how many smarticles']],
    text: 'Five is what the published supersmarticle used [1]. Ava’s chat tries six [2]: so far it drifts less but moves more slowly. The 2021 robot blob meshed six together, which is a different setup [3].',
    sources: [{ node: 'p-smarticle', where: 'Abstract' }, { chat: 'c-five', where: 'Ava Okonkwo' }, { node: 'p-blobs', where: 'Abstract' }],
  },
  {
    id: 'openhouse', hub: 'smarticles', title: 'Open house demo',
    q: 'What should we demo at open house?',
    keys: [['open house'], ['visitor'], ['demo', 'blob']],
    text: 'Ava’s plan is the robot blob following a torch across a table [1]. It’s visual and survives being touched. The outreach chat has a backup, the sidewinding demo with the snake robot [2]. Check the safety doc for which rigs need someone beside them [3].',
    sources: [{ chat: 'c-openhouse', where: 'Ava Okonkwo' }, { chat: 'c-outreach', where: 'Ava Okonkwo' }, { node: 'f-safety', where: '§3 Rigs' }],
  },

  // ───────── Legs on soft ground ─────────
  {
    id: 'turtle', hub: 'soft', title: 'How hatchlings cross sand',
    q: 'How do baby sea turtles crawl on sand without sinking?',
    keys: [['turtle'], ['hatchling'], ['flipperbot']],
    text: 'Hatchlings use flexible wrists, so their flippers push without churning up the sand. The lab built FlipperBot, about 19 cm long with flexible wrists, to test the idea on a bed of poppy seeds [1]. Lucas has the hatchling field notes [2].',
    sources: [{ node: 'r-flipper', where: 'Robot card' }, { node: 'f-turtle', where: 'Hatchling field notes' }],
  },
  {
    id: 'legshape', hub: 'soft', title: 'Leg shape on soft ground',
    q: 'Which leg shape works best on soft sand?',
    keys: [['leg shape'], ['c-leg'], ['curved leg']],
    text: 'The 2013 terradynamics paper showed you can predict how much push a leg of a given shape gets from granular ground, and used that to compare leg shapes on a small robot [1]. Priya’s stride sweep with the C-leg robot is the lab’s newest data [2].',
    sources: [{ node: 'p-terra', where: 'Abstract' }, { node: 'f-cleg', where: 'stride_sweep.csv' }],
  },
  {
    id: 'wrist', hub: 'soft', title: 'FlipperBot wrist settings',
    q: 'What wrist stiffness should FlipperBot use?',
    keys: [['wrist'], ['stiffness'], ['wrist', 'flipperbot'], ['wrist', 'stiff']],
    text: 'Lucas’s chat compares three settings [1]. The flexible wrists crawled furthest on poppy seeds, which is the idea FlipperBot was built to test [2]. The stiffest setting dug in and stalled.',
    sources: [{ chat: 'c-wrist', where: 'Lucas Ferreira' }, { node: 'r-flipper', where: 'Robot card' }],
  },

  // ───────── First steps on land ─────────
  {
    id: 'mudskipper-why', hub: 'land', title: 'Why the lab studies mudskippers',
    q: 'Why does the lab study mudskippers?',
    keys: [['why', 'mudskipper'], ['mudskipper', 'study']],
    text: 'Mudskippers are fish that “crutch” across mud on their fins today, which makes them a living stand-in for the first animals that left the water about 360 million years ago [1]. Studying them alongside MuddyBot shows what fins and a tail can and can’t do on soft slopes [1][2].',
    sources: [{ node: 'p-tail', where: 'Abstract' }, { node: 'r-muddy', where: 'Robot card' }],
  },
  {
    id: 'exhibit', hub: 'land', title: 'Robots and fossils exhibit',
    q: 'Help me plan the robots and fossils exhibit.',
    keys: [['exhibit'], ['fossil'], ['museum']],
    text: 'Ava’s exhibit chat has a draft layout [1]: MuddyBot climbing a sand ramp, a mudskipper video loop, and a panel on what early tetrapods’ tails may have done [2]. The 2016 tail paper is the science behind it [3].',
    sources: [{ chat: 'c-fossils', where: 'Ava Okonkwo' }, { chat: 'c-tetrapod', where: 'Prof. Elena Ruiz' }, { node: 'p-tail', where: 'Abstract' }],
  },

  // ───────── Rovers on other planets ─────────
  {
    id: 'pedal', hub: 'rovers', title: 'Rear rotator pedaling, explained',
    q: 'What is rear rotator pedaling?',
    keys: [['rear rotator'], ['pedaling'], ['pedalling']],
    text: 'A gait for the lab’s rover that mixes paddling, walking and wheel spinning. Moving this way, the rover reshapes the loose sand around it into ground it can climb [1]. Lucas is testing which pedal timing works best on a steeper bed [2].',
    sources: [{ node: 'p-rover', where: 'Abstract' }, { chat: 'c-pedal', where: '5 answers' }],
  },
  {
    id: 'moon', hub: 'rovers', title: 'Would the rover work on the Moon?',
    q: 'Would the rover work on the Moon?',
    keys: [['moon'], ['lunar'], ['regolith'], ['moon', 'rover'], ['lunar', 'rover'], ['work', 'moon']],
    text: 'Nobody here knows yet, and it’s an open question in Lucas’s chat [1]. The pedaling gait works by reshaping loose material [2], which should carry over, but it needs testing on a simulant.\n\nGeneral background, not from the lab’s files: lunar soil is finer and more jagged than beach sand, so the forces could be quite different.',
    sources: [{ chat: 'c-regolith', where: 'Lucas Ferreira' }, { node: 'p-rover', where: 'Abstract' }],
  },
  {
    id: 'nasa', hub: 'rovers', title: 'Results for the NASA call',
    q: 'Which results should go in the NASA call?',
    keys: [['nasa'], ['proposal']],
    text: 'Lucas’s shortlist on OneDrive has three [1]: the rear rotator pedaling result [2], the steeper-bed runs from his pedaling chat [3], and the lunar simulant comparison once it’s done.',
    sources: [{ node: 'f-nasa', where: 'Shortlist' }, { node: 'p-rover', where: 'Abstract' }, { chat: 'c-pedal', where: 'Lucas Ferreira' }],
  },

  // ───────── New ideas that need a teammate’s context ─────────
  {
    id: 'pivot-blob', hub: 'smarticles', title: 'Idea: a robot blob through rubble',
    q: 'New idea: could a robot blob squeeze through rubble?',
    keys: [['blob', 'rubble'], ['new idea'], ['squeeze']],
    text: 'An interesting crossover. Tangled worm blobs and meshed smarticles move as a group and change shape [1], and Kofi’s rubble course is a ready-made test [2].\n\n**Open questions:** can the blob hold together through gaps narrower than itself, and does light steering still work in clutter?\n\nAva’s light-following chat has the blob’s control code and trial data. Pulling it in would help me plan this.',
    sources: [{ node: 'p-blobs', where: 'Abstract' }, { chat: 'c-rubble', where: 'Dr. Kofi Mensah' }],
    suggest: { chat: 'c-lightblob', who: 'ava' },
  },
  {
    id: 'pivot-rft-rover', hub: 'rovers', title: 'Idea: RFT to predict a stuck rover',
    q: 'Could we use RFT to predict when the rover gets stuck?',
    keys: [['rft', 'rover'], ['resistive force', 'rover'], ['predict', 'stuck']],
    text: 'Probably, and it would be new for the lab. RFT already predicts the forces on legs moving through granular ground [1], and the rover gets stuck exactly when those forces stop pushing it forward [2].\n\nMei’s chat has RFT coefficients fitted to the new glass beads. Pulling it in would let me check whether they fit the rover’s bed.',
    sources: [{ node: 'p-terra', where: 'Abstract' }, { chat: 'c-stuck', where: 'Lucas Ferreira' }],
    suggest: { chat: 'c-rft', who: 'mei' },
  },

  // ───────── Robophysics: people, meetings, the lab as a whole ─────────
  {
    id: 'robophysics', hub: 'core', title: 'What robophysics means',
    q: 'What is robophysics?',
    keys: [['robophysics'], ['robots as models']],
    text: 'Robophysics is using robots as physical models to discover how movement works [1]. Instead of only filming animals, you build a robot that moves the same way, then change one thing at a time, like the number of legs or the body wave, to see what really matters [1].',
    sources: [{ node: 'p-review', where: 'Abstract' }],
  },
  {
    id: 'big-results', hub: 'core', title: 'The lab’s main results, one line each',
    q: 'Summarise the lab’s main results for a grant overview.',
    keys: [['main results'], ['overview'], ['biggest results']],
    text: 'The lab’s biggest public results, one line each:\n\n- Sandfish swim through sand with a body wave [1].\n- Sidewinders, and a snake robot, climb dunes by keeping more body on the sand [2].\n- Fire ants avoid tunnel clogs by letting a few workers do most of the digging [3].\n- Many legs let robots cross rough ground without sensing [4].\n- A wiggly robot’s body can do part of the thinking [5].',
    sources: [{ node: 'p-sandfish', where: 'Abstract' }, { node: 'p-sidewind', where: 'Abstract' }, { node: 'p-clog', where: 'Abstract' }, { node: 'p-multileg', where: 'Abstract' }, { node: 'p-mechint', where: 'Abstract' }],
  },
  {
    id: 'open-questions', hub: 'core', title: 'Open questions across the lab',
    q: 'What are the open questions across the lab right now?',
    keys: [['open question'], ['unsolved'], ['unknown']],
    text: 'Five that the lab’s chats leave open:\n\n1. Why does the snake robot slip above 15°: too little contact, or pitching? [1]\n2. Does RFT hold on wet sand? [2]\n3. Will rear rotator pedaling work on lunar simulant? [3]\n4. Five smarticles or six? [4]\n5. How many leg pairs does a farm robot need? [5]',
    sources: [{ chat: 'c-slip', where: 'live' }, { chat: 'c-wet', where: 'open' }, { chat: 'c-regolith', where: 'open' }, { chat: 'c-five', where: 'open' }, { chat: 'c-pairs', where: 'open' }],
  },
  {
    id: 'safety', hub: 'core', title: 'Rigs that need a second person',
    q: 'Which rigs need a second person present?',
    keys: [['second person'], ['safety'], ['alone']],
    text: 'Two do: the X-ray rig, and the tilting bed when it’s set above 25° [1]. Anything with live snakes needs two trained people as well [2]. Sam keeps the sign-off list.',
    sources: [{ chat: 'c-safety', where: 'Sam Whitfield' }, { node: 'f-safety', where: '§1 General' }],
  },
  {
    id: 'meeting-ants', hub: 'ants', title: 'Prep for the ant update',
    q: 'Prep me for Jonah’s ant update at group meeting.',
    keys: [['prep'], ['meeting', 'ant'], ['update', 'ant']],
    text: 'Three things to know before the ant update [1]:\n\n**What’s being tested:** whether keeping one ant in five idle keeps the tunnel flowing [2].\n**Where it stands:** this week’s idle-rate clips are being tagged [3].\n**A good question to ask:** does the 4-robot clog result match the ants? Those chats were just merged [4].',
    sources: [{ node: 'f-agenda', where: 'Item 3' }, { chat: 'c-traffic', where: 'Jonah Kim' }, { chat: 'c-idle', where: 'live' }, { chat: 'c-antmerge', where: 'merge' }],
  },
  {
    id: 'who-snake', hub: 'dunes', title: 'Who knows the snake robot',
    q: 'Who knows the most about the snake robot?',
    keys: [['who', 'snake']],
    text: 'Kofi: most of the snake and wiggling-robot chats, and he’s working on the slipping problem right now [1]. Sam maintains the robot and its gait table [2]. Noor built the sidewinding trackway before she graduated, and her chats still answer questions [3].',
    sources: [{ chat: 'c-slip', where: 'live' }, { chat: 'c-gaittable', where: 'Sam Whitfield' }, { chat: 'c-recal', where: 'Noor Haddad (alumna)' }],
  },
  {
    id: 'who-legs', hub: 'legs', title: 'Who runs the centipede robots',
    q: 'Who should I talk to about the centipede robots?',
    keys: [['who', 'legs'], ['who', 'centipede'], ['talk to', 'centipede']],
    text: 'Priya runs them: the leg-pair sweeps, the lifting pattern and the blueberry-row mockup [1]. Sam handles the batteries and hardware [2]. For how it’s framed in the grant, Elena [3].',
    sources: [{ chat: 'c-pairs', where: 'Priya Raman' }, { chat: 'c-battery', where: 'Sam Whitfield' }, { chat: 'c-redund', where: 'Prof. Elena Ruiz' }],
  },
  {
    id: 'who-sand', hub: 'sand', title: 'Who works on sand swimming',
    q: 'Who works on sand swimming?',
    keys: [['who', 'sand'], ['who', 'sand', 'swim']],
    text: 'Mei, mostly: RFT coefficients, wet versus dry sand, and the sandfish robot’s best amplitude [1][2]. Sam runs the X-ray rig she films with [3].',
    sources: [{ chat: 'c-rft', where: 'Mei Tanaka' }, { chat: 'c-amp', where: 'Mei Tanaka' }, { chat: 'c-xray', where: 'Sam Whitfield' }],
  },
  {
    id: 'alumni', hub: 'core', title: 'What alumni chats still tell us',
    q: 'What do alumni chats still tell us?',
    keys: [['alumni'], ['alumna'], ['graduated'], ['left the lab']],
    text: 'Noor graduated in 2025, and her 41 chats are still in the lab’s memory [1]. They’re why Cortex knows the tilting bed was re-levelled on 14 June [2], which changes how every slope trial since then should be read.',
    sources: [{ chat: 'c-recal', where: 'Noor Haddad (alumna)' }, { node: 'f-calib', where: '14 June entry' }],
  },
  {
    id: 'repo', hub: 'core', title: 'Which repo to clone first',
    q: 'Which repo should I clone first?',
    keys: [['repo'], ['clone'], ['github']],
    text: 'Start with robophysics-lab/analysis. It has the shared tools, like rft/forces.py and the geometric phase notebook [1][2]. robophysics-lab/robots holds the firmware and CAD, which you’ll only need once you run a robot [3].',
    sources: [{ node: 'f-rft', where: 'analysis repo' }, { node: 'f-modes', where: 'analysis repo' }, { node: 'f-cfw', where: 'robots repo' }],
  },
  {
    id: 'newsletter', hub: 'core', title: 'Draft: a newsletter blurb',
    q: 'Write a short blurb about the lab for the department newsletter.',
    keys: [['newsletter'], ['blurb'], ['press release']],
    text: 'Draft, for you to check:\n\n“How does a snake climb a sand dune, or a robot cross a field without getting stuck? The Robophysics Lab builds robots that move like animals, then changes one thing at a time to find out what really matters [1]. Recent work shows that robots with many legs cross rough ground reliably without extra sensors [2], and that fire ants keep their tunnels flowing by letting a few workers do most of the digging [3].”',
    sources: [{ node: 'p-review', where: 'Abstract' }, { node: 'p-multileg', where: 'Abstract' }, { node: 'p-clog', where: 'Abstract' }],
  },
  {
    id: 'explain-chart', hub: 'dunes', title: 'The slip chart, in plain words',
    q: 'Explain the slip chart in plain words.',
    keys: [['chart'], ['explain', 'plot'], ['explain', 'graph'], ['slip', 'chart']],
    text: 'Each dot is one robot run. Along the bottom is how steep the bed was, and up the side is how far the robot slid back each cycle [1]. Below about 15° the dots stay low: it barely slips. Above that they climb fast. Priya’s branch marks where the robot starts to pitch, around 18° [2].',
    sources: [{ node: 'f-slope', where: 'runs after 14 June' }, { chat: 'c-pitch', where: 'Priya Raman' }],
  },
  {
    id: 'friction', hub: 'posts', title: 'Why friction direction matters',
    q: 'Why does friction direction matter for snakes?',
    keys: [['friction']],
    background: true,
    text: 'General background, not from the lab’s files: many snakes’ belly scales slide forward more easily than sideways or backwards, so a body wave pushes them forward instead of slipping in place. That’s called frictional anisotropy.\n\nFrom the lab: the frictional swimming work shows many-legged robots can move by slipping on purpose [1].',
    sources: [{ node: 'p-slip', where: 'Abstract' }],
  },
  {
    id: 'email', hub: 'core', title: 'Reading email',
    q: 'Can you check my email for the reviewer comments?',
    keys: [['email'], ['inbox'], ['slack']],
    text: 'I can’t. Cortex only reads the sources the lab connected: GitHub, Google Drive, OneDrive, the lab PCs, papers and web clippings. If the reviewer comments are saved as a file in one of those, ask again and I’ll find them.',
  },
]

const STOP = new Set(['the', 'and', 'what', 'with', 'that', 'this', 'from', 'have', 'does', 'about', 'which', 'where', 'when', 'into', 'there', 'their', 'your', 'our', 'lab', 'labs', 'how', 'why', 'who', 'any', 'can', 'for', 'are', 'was', 'were', 'did', 'next'])

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'")

/** A key matches at the start of a word, so “ant” finds “ants” but not “want”. */
const hasKey = (q: string, key: string) => {
  const k = norm(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-z0-9])${k}`).test(q)
}

/** The best scripted answer. Asked inside a chat, answers from that chat’s topic win close calls. */
export function matchBank(question: string, hub?: HubId | null): BankEntry | null {
  const q = norm(question).trim()
  let best: BankEntry | null = null
  let bestScore = 0
  for (const e of BANK) {
    let score = 0
    for (const group of e.keys) {
      if (group.every((k) => hasKey(q, k))) score = Math.max(score, group.length + group.join('').length / 100)
    }
    if (score && hub && e.hub === hub) score += 0.5
    if (norm(e.q).replace(/[?.!]+$/, '') === q.replace(/[?.!]+$/, '')) score = 99
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

/** Suggested questions for a topic, for the “Try asking” chips. Skips anything already asked. */
export function suggestionsFor(hub: HubId | null, n = 3, asked: string[] = []) {
  const done = new Set(asked.map((a) => matchBank(a)?.id))
  const own = BANK.filter((e) => e.hub === hub && !done.has(e.id))
  const general = BANK.filter((e) => ['onboard', 'week', 'pivot', 'open-questions', 'granular', 'robophysics'].includes(e.id) && !done.has(e.id))
  const pool = [...own, ...general.filter((g) => !own.includes(g))]
  return pool.slice(0, n)
}

export function fileLabel(id: string) {
  return graph.byId.get(id)?.label ?? FILES.find((f) => f.id === id)?.name ?? id
}
