import { CHATS, type Chat, type HubId } from './content'
import { THREADS } from './threads'

// What each chat asked, prompt by prompt: zooming into a chat on the brain shows this chain.
// Chats with a written conversation use their real prompts. The rest start from their title
// and continue with follow-ups typical of their topic.

const FOLLOW_UPS: Record<HubId, string[]> = {
  core: ['Summarise this for the group meeting', 'Who should I ask about this?', 'Add it to the onboarding guide', 'What did we decide last time?', 'Link this to the grant goals', 'Which rigs are free this week?'],
  sand: ['Compare with the 2009 sandfish results', 'Does grain size change the answer?', 'Plot drag against depth', 'Which X-ray runs show this best?', 'Is this consistent with RFT?', 'What did the notebook fit?'],
  dunes: ['Only use runs after 14 June', 'Compare with the rattlesnake trials', 'Where does the robot start to pitch?', 'What gait settings did we use?', 'Plot slip against bed angle', 'What would longer contact change?'],
  posts: ['Plot the scattering angles', 'Which post spacing works best?', 'Compare with the open-loop model', 'Is the pattern stable across trials?', 'Pull up the 2019 diffraction figure', 'What would sensing change here?'],
  wiggle: ['Which cable tension worked best?', 'Did compliance help in the rubble course?', 'Compare with the 2023 robot', 'Show the motor current logs', 'What can we claim for rescue work?', 'Plan the next obstacle course'],
  maths: ['Fit the two body modes', 'What does the loop area mean here?', 'Compare nematode and snake loops', 'Explain this for a new student', 'Which notebook does the fit?', 'Does this hold for legged gaits?'],
  legs: ['How many leg pairs before it plateaus?', 'Compare 6 and 12 legs', 'What happens if a leg fails?', 'Show the slipping pattern', 'Battery life for a field day?', 'Tie this to the farm robot work'],
  ants: ['How many ants dig at once?', 'What is the idle rate?', 'Compare ants with the digging robots', 'Pull up the 2018 clog figure', 'When do falls get jammed?', 'Plan the next colony experiment'],
  smarticles: ['Why does it drift?', 'Five or six in the ring?', 'Can it follow light?', 'Compare with the worm blobs', 'Which servo should we swap?', 'Plan the open-house demo'],
  soft: ['Which leg shape works on poppy seeds?', 'Sum the forces on a curved leg', 'Compare with the hatchling videos', 'What wrist stiffness works best?', 'Plot the stride sweep', 'Predict sinkage with terradynamics'],
  land: ['How should the tail time with the limbs?', 'Compare mudskipper and MuddyBot', 'What slope angles did we test?', 'Pull up the 2016 tail paper', 'Explain this for the exhibit', 'What did early tetrapods likely do?'],
  rovers: ['When does the rover get stuck?', 'Compare pedaling with plain rolling', 'Which pedal phase works best?', 'Lunar simulant or our sand?', 'What should go in the NASA call?', 'Plot wheel slip against pedal phase'],
}

export interface Prompt {
  text: string
  /** The file or output this prompt's answer leaned on. */
  file?: string
  /** The message it maps to, when the chat has a written conversation. */
  msg?: string
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export function promptsFor(chat: Chat): Prompt[] {
  const thread = THREADS[chat.id]
  if (thread) {
    return thread.flatMap((m, i) => {
      if (m.who === 'ai' || m.kind) return []
      const answer = thread[i + 1]
      const src = answer?.sources?.[0]
      return [{ text: m.text, msg: m.id, file: src?.node ?? src?.chat }]
    })
  }
  const pool = FOLLOW_UPS[chat.hub]
  const h = hash(chat.id)
  const extra = 1 + (h % 3)
  const cites = chat.cites ?? []
  const out: Prompt[] = [{ text: chat.title, file: cites[0] }]
  for (let i = 0; i < extra; i++) {
    out.push({ text: pool[(h + i * 7) % pool.length], file: cites.length ? cites[(i + 1) % cites.length] : undefined })
  }
  return out
}

export const PROMPTS: Record<string, Prompt[]> = Object.fromEntries(CHATS.map((c) => [c.id, promptsFor(c)]))
