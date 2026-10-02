import type { Msg } from '../engine/store'
import { HERO_CHAT } from './content'

// Hand-written conversations. Everything else starts from its memory card.

export const THREADS: Record<string, Msg[]> = {
  [HERO_CHAT]: [
    {
      id: 'h1', who: 'kofi', time: 'Tue 13:41', earlier: true,
      text: 'Summarise our snake robot slope trials from last week.',
    },
    {
      id: 'h2', who: 'ai', time: 'Tue 13:41', earlier: true,
      text: 'You ran 24 trials on the tilting bed between 6° and 20°, all on the default gait [1]. Slip stays under 1 cm per cycle up to about 14°, then climbs quickly [1].',
      sources: [{ node: 'f-slope', where: 'sheet “summary”' }],
      readFrom: ['Lab PC'],
    },
    {
      id: 'h3', who: 'kofi', time: 'Tue 13:52', earlier: true,
      text: 'Is that worse than the robot did in the 2014 study?',
    },
    {
      id: 'h4', who: 'ai', time: 'Tue 13:52', earlier: true,
      text: 'It’s in line with it. In the 2014 study, limbless robots slipped and pitched on sandy slopes until the snake robot copied the sidewinder’s strategy of keeping more body on the sand [1].',
      sources: [{ node: 'p-sidewind', where: 'Abstract' }],
      readFrom: ['Papers'],
    },
    {
      id: 'h5', who: 'kofi', time: 'Tue 14:02',
      text: 'Our snake robot keeps slipping once the bed tilts past about 15°. What has the lab already learned about sidewinders on slopes?',
    },
    {
      id: 'h6', who: 'ai', time: 'Tue 14:02',
      text: 'Sidewinder rattlesnakes don’t change their wave as the slope gets steeper. Instead they press *more of their body* against the sand [1]. When the lab’s snake robot copied that strategy, it climbed loose slopes close to the steepest angle the sand can hold [1].\n\nYour runs from last week slip sharply above 15° on the default gait [2]. Noor re-levelled the tilting bed on 14 June, so only compare against runs after that date [3].',
      sources: [
        { node: 'p-sidewind', where: 'Abstract' },
        { node: 'f-slope', where: 'sheet “summary”' },
        { node: 'f-calib', where: '§3 Re-levelling' },
      ],
      readFrom: ['Papers', 'Lab PC', 'Drive', 'GitHub', 'Lab memory'],
      chart: 'slip',
      branchMark: { chat: 'c-pitch', who: 'priya' },
    },
    {
      id: 'h7', who: 'kofi', time: 'Tue 14:05',
      text: 'Did anyone test the robot with the longer body contact after the recalibration?',
    },
    {
      id: 'h8', who: 'ai', time: 'Tue 14:05',
      text: 'Not yet. Noor ran six robot trials after the recalibration, all on the default gait [1]. None used the sidewinder’s longer contact, so that comparison is still open.',
      sources: [{ chat: 'c-recal', where: '3 answers · Noor Haddad (alumna) · 16 Jun 2025' }],
      readFrom: ['Lab memory'],
      memoryNote: 'From lab memory. Noor graduated in 2025, and her 41 chats still answer questions.',
    },
  ],
}

/** Someone typing live in a chat, shown Google Docs style. */
export const LIVE_DRAFTS: Record<string, string> = {
  [HERO_CHAT]: 'Can you plot slip vs slope only for runs after 14 June, and mark where the robot starts to pitch',
  'c-traffic': 'What happens to the dig rate if we keep one ant in five idle at the tunnel mouth',
}

/** What a chat's context tray holds when you first open it. */
export const DEFAULT_TRAY: Record<string, { ref: string; kind: 'chat' | 'node'; label: string; tokens: number; by?: import('./people').PersonId }[]> = {
  [HERO_CHAT]: [
    { ref: 'p-sidewind', kind: 'node', label: 'Sidewinding with minimal slip', tokens: 1.8 },
    { ref: 'c-recal', kind: 'chat', label: 'Tilting bed recalibration, June', tokens: 2.6, by: 'noor' },
    { ref: 'f-slope', kind: 'node', label: 'slope_trials_2025-06.csv', tokens: 1.4 },
  ],
}

/** The related chat Cortex suggests pulling in. */
export const SUGGESTIONS: Record<string, { chat: string; who: import('./people').PersonId }> = {
  [HERO_CHAT]: { chat: 'c-slopelegs', who: 'priya' },
  'c-pairs': { chat: 'c-blueberry', who: 'priya' },
  'c-traffic': { chat: 'c-five', who: 'ava' },
  'c-rft': { chat: 'c-regolith', who: 'lucas' },
}
