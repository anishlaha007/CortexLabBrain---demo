import { FILES } from './content'

// What a citation opens to: the source as it looks where it lives.
// Real papers, robots and press link to public pages. Everyday lab files are illustrative.

export type SourceView =
  | { type: 'paper'; title: string; cite: string; summary: string[]; url: string; highlight: number }
  | { type: 'web'; title: string; outlet: string; summary: string; url: string }
  | { type: 'robot'; name: string; specs: string[]; paper?: string }
  | { type: 'table'; path: string; columns: string[]; rows: string[][]; highlight: number[]; note: string }
  | { type: 'doc'; title: string; owner: string; sections: { h: string; p: string }[]; highlight: number }
  | { type: 'code'; path: string; repo: string; lines: string[]; highlight: [number, number] }
  | { type: 'meta'; path: string; fields: [string, string][] }

const PAPERS: Record<string, { url: string; summary: string[] }> = {
  'p-sandfish': {
    url: 'https://www.arxiv.org/abs/0910.3248',
    summary: [
      'High-speed X-ray imaging shows how the sandfish lizard (Scincus scincus) moves below the surface of sand.',
      'Once buried, it folds its limbs against its body and swims with a large wave that travels from head to tail.',
      'Forward speed reaches about 10 cm per second and rises with wave frequency.',
    ],
  },
  'p-terra': {
    url: 'https://arxiv.org/abs/1303.7065',
    summary: [
      'A force model for legs and bodies of any shape moving through granular media, which the paper calls “terradynamics”.',
      'Forces on small pieces of a leg can simply be added up to predict the force on the whole leg.',
      'The model predicts how a small legged robot moves on granular media with different leg shapes and stride frequencies.',
    ],
  },
  'p-antjam': {
    url: 'https://www.arxiv.org/abs/1305.5860',
    summary: [
      'Fire ants (Solenopsis invicta) build tunnels about one body length wide and move through them at more than 9 body lengths per second.',
      'When the tunnel is suddenly jolted, ants arrest falls by jamming their limbs and antennae against the walls.',
      'Below a critical tunnel width of about 1.3 body lengths, falls were always stopped.',
    ],
  },
  'p-sidewind': {
    url: 'https://ri.cmu.edu/?p=107798',
    summary: [
      'Sidewinder rattlesnakes (Crotalus cerastes) climb sandy slopes that defeat many limbless robots through slipping and pitching.',
      'As the slope gets steeper, the snakes increase the length of their body in contact with the sand.',
      'Giving a snake robot the same strategy let it climb slopes close to the steepest angle the sand can hold.',
    ],
  },
  'p-tail': {
    url: 'https://techxplore.com/news/2016-07-robot-animals-million-years.html',
    summary: [
      'Mudskippers and MuddyBot, a robot with two limbs and a tail, are used as models of the first vertebrates moving onto land.',
      'Coordinating the tail with the limbs greatly improves movement on slopes and sandy ground.',
    ],
  },
  'p-review': {
    url: 'https://www.arxiv.org/abs/1602.04712',
    summary: [
      'A review arguing for “robophysics”: the search for principles of self-generated motion, using robots as physical models.',
      'It sits at the meeting point of robotics, soft matter and dynamical systems.',
    ],
  },
  'p-clog': {
    url: 'https://qbios.gatech.edu/node/351',
    summary: [
      'Fire ants and autonomous robots digging in narrow tunnels, alongside two computer models.',
      'Digging is robustly optimised when some workers stay idle and others retreat, without any central control.',
      'Up to three robots worked well in a narrow tunnel. A fourth caused a clog that stopped all work.',
    ],
  },
  'p-diffract': {
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6421434',
    summary: [
      'A desert snake moving through an array of posts gets reoriented in a pattern reminiscent of wave diffraction.',
      'The snakes didn’t change their body wave to avoid or grab the posts.',
      'An open-loop model with no sensing reproduced the pattern, showing how passive dynamics help limbless animals cross cluttered ground.',
    ],
  },
  'p-smarticle': {
    url: 'https://www.nanowerk.com/news2/robotics/newsid=53630.php',
    summary: [
      '“Smarticles” are 3D-printed robots that can only flap two arms.',
      'Five confined in a ring form a “supersmarticle” that moves by itself.',
      'Adding a light or sound sensor lets the group steer, well enough to get through a maze.',
    ],
  },
  'p-rover': {
    url: 'https://qbios.gatech.edu/node/291',
    summary: [
      'A rover climbs loose slopes by combining paddling, walking and wheel spinning, called “rear rotator pedaling”.',
      'Its behaviour is modelled with terradynamics. A Science Robotics cover article, supported by NASA and the Army Research Office.',
    ],
  },
  'p-blobs': {
    url: 'https://www.newswise.com/articles/collective-worm-and-robot-blobs-protect-individuals-swarm-together',
    summary: [
      'California blackworms tangle into blobs that act together. Larger blobs survive drying out for longer.',
      'Six smarticles with light sensors, pinned in a mesh, showed emergent behaviour similar to the worms.',
    ],
  },
  'p-multileg': {
    url: 'https://chemistry.gatech.edu/news/build-better-crawly-robot-add-legs-lots-legs',
    summary: [
      'Robots inspired by centipedes, each with a different number of legs, tested on difficult ground.',
      'Adding leg pairs makes movement robust over rough terrain without extensive sensing, an idea called spatial redundancy.',
      'Uses include agriculture, space exploration and search and rescue.',
    ],
  },
  'p-slip': {
    url: 'https://arxiv.org/abs/2207.10604',
    summary: [
      'On solid ground, legged robots usually avoid slipping. This work uses slipping on purpose.',
      'Lifting and lowering added legs in a pattern creates “frictional swimming”, moving a meter-scale robot at about half a body length per second.',
    ],
  },
  'p-mechint': {
    url: 'https://arxiv.org/abs/2304.08652',
    summary: [
      'A limbless robot bent left and right by two cables, with adjustable body compliance.',
      'With the right compliance it moves more efficiently and gets through obstacles open-loop, without sensing its surroundings.',
      'The authors call this passive help “mechanical intelligence”.',
    ],
  },
  'p-geophase': {
    url: 'https://arxiv.org/abs/2405.09696v1',
    summary: [
      'A geometric framework for comparing the travelling waves used by limbless animals.',
      'Nematode worms, desert snakes and lizards trace near-circular loops through two body “modes”.',
      'Those loops enclose close to the most area possible, across organisms spanning two decades in body length.',
    ],
  },
}

const WEB: Record<string, { outlet: string; summary: string; url: string }> = {
  'w-physworld': { outlet: 'Physics World', url: 'https://physicsworld.com/a/slithering-snakes-diffract-like-quantum-particles/', summary: 'Coverage of the 2019 snake diffraction study: snakes moving through posts scatter like particles diffracting.' },
  'w-gcr': { outlet: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/ground-control-robot-insects', summary: 'Ground Control Robotics, an Atlanta start-up co-founded by Prof. Goldman, builds centipede-style robots to work under specialty crops like blueberries.' },
  'w-sciam': { outlet: 'Scientific American', url: 'https://www.scientificamerican.com/blog/cocktail-party-physics/tunnel-vision-probing-the-physics-of-fire-ants', summary: 'A blog post on the physics of fire ants moving through their tunnels.' },
  'w-wiggly': { outlet: 'Georgia Tech Research', url: 'https://research.gatech.edu/feature/wiggly-robots', summary: 'May 2024 feature: worms and snakes wiggle through varied terrain without learning it, and a limbless robot uses “mechanical intelligence” to do the same.' },
}

const ROBOTS: Record<string, { specs: string[]; paper?: string }> = {
  'r-sandfish': { specs: ['Swims through granular media with a body wave', 'Modelled on the sandfish lizard'], paper: 'p-sandfish' },
  'r-snake': { specs: ['16 joints, each turned 90° from the last', 'About 2 inches wide and 37 inches long', 'Built with Carnegie Mellon’s snake robot team', 'Climbed loose slopes up to about 20° once given the sidewinder’s strategy'], paper: 'p-sidewind' },
  'r-trackway': { specs: ['An array of posts set in a sand-like bed', 'Used to measure how snakes scatter'], paper: 'p-diffract' },
  'r-limbless': { specs: ['Bent left and right by two independently controlled cables', 'Adjustable body compliance'], paper: 'p-mechint' },
  'r-centipede': { specs: ['Modular segments with leg pairs', 'Versions with different numbers of legs', 'More legs means robust movement over rough ground'], paper: 'p-multileg' },
  'r-diggers': { specs: ['Autonomous robots digging in a narrow tunnel', 'Three dig well together, a fourth causes a clog'], paper: 'p-clog' },
  'r-smarticle': { specs: ['3D-printed and battery powered', 'Motors, simple sensors and limited computing', 'Can do one thing: flap two arms'], paper: 'p-smarticle' },
  'r-blob': { specs: ['Six smarticles pinned in a mesh', 'Each has two arms and two light sensors'], paper: 'p-blobs' },
  'r-flipper': { specs: ['About 19 cm long and 970 g', 'Two servo-driven flippers with flexible wrists', 'Tested on poppy seeds that behave like sand'] },
  'r-muddy': { specs: ['Two limbs and a powerful tail', 'Driven by electric motors', 'Copies the mudskipper’s “crutching”'], paper: 'p-tail' },
  'r-rover': { specs: ['Modular design from commercially available parts', 'Wheels that can also paddle and walk'], paper: 'p-rover' },
  'r-bed': { specs: ['Large beds of sand that tilt to mimic dunes', 'Watched by high-speed cameras'] },
}

/** Illustrative lab files, written to show how Cortex reads each kind. */
const LAB: Record<string, SourceView> = {
  'f-slope': {
    type: 'table', path: 'trackway/slope_trials_2025-06.csv',
    columns: ['run', 'date', 'bed angle', 'gait', 'slip / cycle', 'pitched'],
    rows: [
      ['31', '9 Jun', '15°', 'default', '1.1 cm', 'no'],
      ['44', '23 Jun', '12°', 'default', '0.6 cm', 'no'],
      ['47', '23 Jun', '14°', 'default', '0.9 cm', 'no'],
      ['48', '23 Jun', '15°', 'default', '1.3 cm', 'no'],
      ['51', '24 Jun', '17°', 'default', '2.6 cm', 'no'],
      ['52', '24 Jun', '18°', 'default', '3.4 cm', 'yes'],
      ['55', '24 Jun', '20°', 'default', '4.9 cm', 'yes'],
    ],
    highlight: [3, 4, 5, 6],
    note: 'Sheet “summary”, 24 runs. Run 31 is before the 14 June re-levelling.',
  },
  'f-calib': {
    type: 'doc', title: 'Tilting bed calibration', owner: 'Noor Haddad · Google Drive',
    sections: [
      { h: '1. Before every session', p: 'Check the bed angle at three points along the frame with the digital level. Log the offset in the session sheet.' },
      { h: '2. Levelling the frame', p: 'Adjust the four feet until all three readings agree within 0.2°. Re-check after loading sand.' },
      { h: '3. Re-levelling, 14 June 2025', p: 'The north leg settled. Runs before 14 June read about 1.5° shallower than the true angle. Compare only runs after this date.' },
    ],
    highlight: 2,
  },
  'f-onboard': {
    type: 'doc', title: 'Lab onboarding guide', owner: 'Prof. Elena Ruiz · Google Drive',
    sections: [
      { h: '1. Welcome', p: 'Start with the robophysics review, then pick a topic and read its two most recent papers.' },
      { h: '2. Rigs and who runs them', p: 'Tilting sand beds and X-ray rig: Sam schedules both. Fire ant colonies: Jonah. Centipede robots: Priya. Snake robot and post trackway: Kofi.' },
      { h: '3. Safety', p: 'Animal handling and the X-ray rig both need a second person present. See the safety doc.' },
    ],
    highlight: 1,
  },
  'f-rft-nb': {
    type: 'code', path: 'rft/glass_beads_coeffs.ipynb', repo: 'GitHub · robophysics-lab/analysis',
    lines: [
      '# Cell 4: fit resistive force coefficients for 3 mm glass beads',
      'import numpy as np',
      'from rft.forces import plate_forces',
      '',
      'angles = np.radians(np.arange(-90, 91, 15))',
      'drag = load_runs("beads_3mm/2025-08/*.csv")',
      'coeffs = fit_generic(angles, drag, depth=0.03)',
      'print(coeffs.round(3))',
    ],
    highlight: [4, 7],
  },
  'f-fig3': {
    type: 'code', path: 'analysis/diffraction_fig3.ipynb', repo: 'GitHub · robophysics-lab/analysis',
    lines: [
      '# Cell 1: rebuild Figure 3 (scattering angles through the post array)',
      'BIN_DEG = 10',
      'runs = read_runs("trackway/posts_run7.csv")',
      'angles = scattering_angles(runs, post_spacing_cm=4.0)',
      'hist, edges = np.histogram(angles, bins=np.arange(-90, 91, BIN_DEG))',
      'plot_scattering(hist, edges, ax=axes[2])',
    ],
    highlight: [1, 4],
  },
  'f-gait': {
    type: 'code', path: 'snake_robot/gait_table.yaml', repo: 'GitHub · robophysics-lab/robots',
    lines: ['gait: sidewind_default', 'joints: 16', 'vertical_wave:', '  amplitude_deg: 30', 'horizontal_wave:', '  amplitude_deg: 45', 'phase_offset_deg: 90', 'contact_segments: 4   # longer contact not tried yet'],
    highlight: [7, 7],
  },
  'f-colony': {
    type: 'doc', title: 'Fire ant colony care protocol', owner: 'Jonah Kim · Google Drive',
    sections: [
      { h: '1. Daily', p: 'Check water tubes and remove debris. Note any unusual activity in the colony log.' },
      { h: '2. Twice a week', p: 'Feed crickets and sugar water. Keep the Fluon barrier fresh on every tray wall.' },
      { h: '3. Handling', p: 'Two people present for any transfer between trays.' },
    ],
    highlight: 2,
  },
}

export function viewFor(id: string, label: string): SourceView {
  if (PAPERS[id]) {
    const f = FILES.find((x) => x.id === id)!
    return { type: 'paper', title: f.name, cite: f.cite ?? '', summary: PAPERS[id].summary, url: PAPERS[id].url, highlight: 1 }
  }
  if (WEB[id]) return { type: 'web', title: label, ...WEB[id] }
  if (ROBOTS[id]) return { type: 'robot', name: label, ...ROBOTS[id] }
  if (LAB[id]) return LAB[id]
  const f = FILES.find((x) => x.id === id)
  if (f?.kind === 'github') {
    return {
      type: 'code', path: f.name, repo: 'GitHub · robophysics-lab',
      lines: [`# ${f.name}`, '# Illustrative file: the real lab’s code is not public.', 'def main():', '    ...'],
      highlight: [0, 1],
    }
  }
  if (f && (f.kind === 'drive' || f.kind === 'onedrive')) {
    return {
      type: 'doc', title: f.name, owner: f.kind === 'drive' ? 'Google Drive' : 'OneDrive (sync tool)',
      sections: [{ h: 'Summary', p: 'An illustrative lab document. Cortex reads its headings and text, and cites the section it used.' }],
      highlight: 0,
    }
  }
  const isVideo = /\.(mp4|mov)$|clips\/$/.test(label)
  return {
    type: 'meta', path: label,
    fields: [
      ['Source', 'Lab PC · imaging rig (sync tool)'],
      ['Kind', isVideo ? 'High-speed video' : 'Data file'],
      ['Read by Cortex', isVideo ? 'Metadata only: name, folder, dates and the README beside it' : 'Column names, types and a summary of each column'],
      ['Synced', '2 min ago'],
    ],
  }
}
