import { useEffect, useState } from 'react'
import { CHATS, FILES, HERO_CHAT, HUBS } from '../lab/content'
import { PEOPLE, type PersonId } from '../lab/people'
import { AiMark, Avatar } from '../ui/Avatar'
import { Icon, type IconName } from '../ui/Icons'
import { SlipChart } from './SlipChart'

interface Props {
  chatId: string
  onClose: () => void
  onOpenChat: (id: string) => void
}

interface Source {
  n: number
  icon: IconName
  name: string
  where: string
  meta: string
  mono?: boolean
  memory?: boolean
}

const SOURCES_1: Source[] = [
  { n: 1, icon: 'paper', name: 'Sidewinding with minimal slip: Snake and robot ascent of sandy slopes', where: 'Abstract', meta: 'Paper · Marvi et al. · Science 2014' },
  { n: 2, icon: 'labpc', name: 'trackway/slope_trials_2025-06.csv', where: 'sheet “summary”', meta: 'Lab PC · imaging rig · Kofi Mensah · 2 days ago', mono: true },
  { n: 3, icon: 'drive', name: 'Tilting bed calibration', where: '§3 Re-levelling', meta: 'Google Drive · Noor Haddad · 14 Jun 2025' },
]

const SOURCES_2: Source[] = [
  { n: 4, icon: 'chat', name: 'Tilting bed recalibration, June', where: '3 answers', meta: 'Lab memory · chat by Noor Haddad (alumna) · 16 Jun 2025', memory: true },
]

const DRAFT = 'Can you plot slip vs slope only for runs after 14 June, and mark where the robot starts to pitch'

/** Kofi's draft appears letter by letter, like watching a teammate in Google Docs. */
function useLiveDraft(text: string) {
  const [n, setN] = useState(18)
  useEffect(() => {
    let i = 18
    let hold = 0
    const t = window.setInterval(() => {
      if (i >= text.length) {
        hold++
        if (hold > 26) {
          i = 18
          hold = 0
        }
      } else {
        i += Math.random() < 0.15 ? 0 : 1
      }
      setN(i)
    }, 85)
    return () => window.clearInterval(t)
  }, [text])
  return text.slice(0, n)
}

export function ChatPanel({ chatId, onClose, onOpenChat }: Props) {
  const chat = CHATS.find((c) => c.id === chatId)!
  const hub = HUBS.find((h) => h.id === chat.hub)!
  const owner = PEOPLE[chat.by]
  const isHero = chatId === HERO_CHAT

  return (
    <aside className="chat" aria-label={`Chat: ${chat.title}`}>
      <header className="chat__head">
        <div className="chat__crumbs">
          <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Back to the whole lab">
            <Icon name="arrowLeft" size={15} />
          </button>
          <span className="crumb">{hub.label}</span>
          <span className="crumb-sep">/</span>
          <span className={`kind kind--${chat.kind ?? 'chat'}`}>{(chat.kind ?? 'chat').toUpperCase()}</span>
          <div className="chat__actions">
            <button type="button" className="icon-btn icon-btn--sm" aria-label="Branch from this chat"><Icon name="branch" size={15} /></button>
            <button type="button" className="icon-btn icon-btn--sm" aria-label="Export as markdown"><Icon name="export" size={15} /></button>
            <button type="button" className="icon-btn icon-btn--sm" aria-label="More"><Icon name="more" size={15} /></button>
          </div>
        </div>
        <h1 className="chat__title">{chat.title}</h1>
        <div className="chat__meta">
          <Avatar id={chat.by} size={20} />
          <span>Started by <b>{owner.name}</b> · 2 days ago · {isHero ? 6 : 3} prompts</span>
          {isHero && (
            <span className="viewers">
              <Viewer id="kofi" label="typing" />
              <Viewer id="priya" label="viewing" />
              <Viewer id="you" label="you" />
            </span>
          )}
        </div>
      </header>

      {isHero ? <HeroThread onOpenChat={onOpenChat} /> : <OtherChat chatId={chatId} />}

      <footer className="chat__foot">
        {isHero && (
          <div className="suggest" role="note">
            <Avatar id="priya" size={24} />
            <p>
              <b>Priya</b> was also working on this: <button type="button" className="link" onClick={() => onOpenChat('c-slopelegs')}>Do more legs help on loose slopes?</button>
            </p>
            <button type="button" className="btn btn--sm">Pull it in</button>
            <button type="button" className="btn btn--ghost btn--sm">Not now</button>
          </div>
        )}

        <div className="tray" aria-label="Context for the next question">
          <div className="tray__head">
            <span className="eyebrow">Context for the next question</span>
            <span className="tray__budget">
              <span className="budget"><i style={{ width: isHero ? '41%' : '18%' }} /></span>
              {isHero ? '9.8k' : '4.3k'} of 24k
            </span>
          </div>
          <div className="tray__chips">
            <span className="ctx ctx--locked"><Icon name="chat" size={12} />This chat</span>
            {isHero && (
              <>
                <span className="ctx"><Icon name="paper" size={12} /><span className="ctx__label">Sidewinding with minimal slip</span><button type="button" aria-label="Remove"><Icon name="close" size={11} /></button></span>
                <span className="ctx"><i className="ctx__dot" style={{ background: PEOPLE.noor.color }} /><span className="ctx__label">Tilting bed recalibration</span><button type="button" aria-label="Remove"><Icon name="close" size={11} /></button></span>
                <span className="ctx"><Icon name="labpc" size={12} /><span className="ctx__label mono">slope_trials_2025-06.csv</span><button type="button" aria-label="Remove"><Icon name="close" size={11} /></button></span>
              </>
            )}
            <span className="ctx ctx--drop"><Icon name="plus" size={12} />Drag anything from the brain</span>
          </div>
        </div>

        <div className="composer">
          {isHero && (
            <div className="composer__note">
              <Avatar id="kofi" size={18} />
              <span><b>Kofi is working in this chat.</b> Your question will start a branch, so you won’t interrupt him.</span>
            </div>
          )}
          <div className="composer__row">
            <textarea rows={1} placeholder={isHero ? 'Ask in a branch…' : 'Ask the Lab AI about this chat…'} aria-label="Your question" />
            <button type="button" className="btn btn--primary">
              {isHero ? <><Icon name="branch" size={14} /> Branch &amp; ask</> : <><Icon name="send" size={14} /> Ask</>}
            </button>
          </div>
          <div className="composer__filters">
            <span className="filter">Sources: all 6</span>
            <span className="filter">Type: any</span>
            <span className="filter">Date: any</span>
          </div>
        </div>
      </footer>
    </aside>
  )
}

function Viewer({ id, label }: { id: PersonId; label: string }) {
  const p = PEOPLE[id]
  return (
    <span className="viewer" title={`${p.name} · ${label}`} style={{ ['--ring' as string]: p.color }}>
      <Avatar id={id} size={22} ring={id !== 'you'} />
      {label === 'typing' && <i className="viewer__typing" />}
    </span>
  )
}

function Cite({ n }: { n: number }) {
  return <button type="button" className="cite" aria-label={`Source ${n}`}>{n}</button>
}

function SourceList({ items }: { items: Source[] }) {
  return (
    <ol className="sources">
      {items.map((s) => (
        <li key={s.n} className={`source ${s.memory ? 'source--memory' : ''}`}>
          <span className="source__n">{s.n}</span>
          <Icon name={s.icon} size={14} className="source__icon" />
          <span className="source__body">
            <span className={`source__name ${s.mono ? 'mono' : ''}`}>{s.name}</span>
            <span className="source__meta">{s.where} · {s.meta}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

function AnswerFoot({ files, sources }: { files: string; sources: number }) {
  return (
    <div className="answer__foot">
      <span>Searched {files} files across {sources} sources</span>
      <span className="dot-sep">·</span>
      <button type="button" className="link link--quiet"><Icon name="eye" size={13} /> What did the AI see?</button>
      <span className="answer__rate">
        <button type="button" className="icon-btn icon-btn--xs" aria-label="Useful"><Icon name="thumbUp" size={13} /></button>
        <button type="button" className="icon-btn icon-btn--xs" aria-label="Not useful"><Icon name="thumbDown" size={13} /></button>
      </span>
    </div>
  )
}

function HeroThread({ onOpenChat }: { onOpenChat: (id: string) => void }) {
  const draft = useLiveDraft(DRAFT)
  return (
    <div className="chat__body">
      <div className="thread">
        <p className="thread__earlier">8 earlier messages · <button type="button" className="link link--quiet">show</button></p>

        <article className="msg msg--human" style={{ ['--who' as string]: PEOPLE.kofi.color }}>
          <span className="port" aria-hidden="true" />
          <div className="msg__head"><Avatar id="kofi" size={22} /><b>Kofi Mensah</b><span className="msg__time">Tue 14:02</span></div>
          <p className="msg__text">Our snake robot keeps slipping once the bed tilts past about 15°. What has the lab already learned about sidewinders on slopes?</p>
        </article>

        <article className="msg msg--ai">
          <span className="port port--ai" aria-hidden="true" />
          <div className="msg__head"><AiMark size={22} /><b>Lab AI</b><span className="msg__time">Tue 14:02</span></div>
          <div className="read-from" aria-label="Where this answer came from">
            <span>Read from</span>
            <span className="read-from__src"><Icon name="paper" size={12} />Papers</span>
            <span className="read-from__src"><Icon name="labpc" size={12} />Lab PC</span>
            <span className="read-from__src"><Icon name="drive" size={12} />Drive</span>
            <span className="read-from__src"><Icon name="github" size={12} />GitHub</span>
            <span className="read-from__src"><Icon name="chat" size={12} />Lab memory</span>
          </div>
          <div className="msg__text">
            <p>Sidewinder rattlesnakes don’t change their wave as the slope gets steeper. Instead they press <em>more of their body</em> against the sand <Cite n={1} />. When the lab’s snake robot copied that strategy, it climbed loose slopes close to the steepest angle the sand can hold <Cite n={1} />.</p>
            <p>Your runs from last week slip sharply above 15° on the default gait <Cite n={2} />. Noor re-levelled the tilting bed on 14 June, so only compare against runs after that date <Cite n={3} />.</p>
          </div>
          <SlipChart />
          <SourceList items={SOURCES_1} />
          <AnswerFoot files="5,240" sources={6} />
          <button type="button" className="branch-mark" onClick={() => onOpenChat('c-pitch')} style={{ ['--who' as string]: PEOPLE.priya.color }}>
            <Icon name="branch" size={13} />
            <span><b>Priya</b> branched from this answer: <u>Why does pitching start at 18°?</u></span>
          </button>
        </article>

        <article className="msg msg--human" style={{ ['--who' as string]: PEOPLE.kofi.color }}>
          <span className="port" aria-hidden="true" />
          <div className="msg__head"><Avatar id="kofi" size={22} /><b>Kofi Mensah</b><span className="msg__time">Tue 14:05</span></div>
          <p className="msg__text">Did anyone test the robot with the longer body contact after the recalibration?</p>
        </article>

        <article className="msg msg--ai">
          <span className="port port--ai" aria-hidden="true" />
          <div className="msg__head"><AiMark size={22} /><b>Lab AI</b><span className="msg__time">Tue 14:05</span></div>
          <div className="msg__text">
            <p>Not yet. Noor ran six robot trials after the recalibration, all on the default gait <Cite n={4} />. None used the sidewinder’s longer contact, so that comparison is still open.</p>
          </div>
          <SourceList items={SOURCES_2} />
          <p className="memory-note"><Icon name="sparkle" size={13} /> From lab memory. Noor graduated in 2025, and her 41 chats still answer questions.</p>
          <AnswerFoot files="5,240" sources={6} />
        </article>

        <div className="live-draft" style={{ ['--who' as string]: PEOPLE.kofi.color }} aria-live="off">
          <span className="port port--live" aria-hidden="true" />
          <div className="msg__head"><Avatar id="kofi" size={22} /><b>Kofi</b><span className="live-draft__label">is typing</span></div>
          <p className="live-draft__text">
            {draft}
            <span className="caret"><span className="caret__flag">Kofi</span></span>
          </p>
        </div>
      </div>
    </div>
  )
}

function OtherChat({ chatId }: { chatId: string }) {
  const chat = CHATS.find((c) => c.id === chatId)!
  const owner = PEOPLE[chat.by]
  const cited = (chat.cites ?? []).map((id) => FILES.find((f) => f.id === id)).filter(Boolean)
  return (
    <div className="chat__body">
      <div className="thread">
        <article className="msg msg--ai">
          <span className="port port--ai" aria-hidden="true" />
          <div className="msg__head"><AiMark size={22} /><b>Memory card</b><span className="msg__time">rolling summary</span></div>
          <div className="msg__text">
            <p>{owner.short}’s chat in <b>{HUBS.find((h) => h.id === chat.hub)!.label}</b>. {cited.length ? `It draws on ${cited.length} source${cited.length > 1 ? 's' : ''} from the lab.` : 'It hasn’t cited any files yet.'}</p>
          </div>
          {cited.length > 0 && (
            <ol className="sources">
              {cited.map((f, i) => (
                <li key={f!.id} className="source">
                  <span className="source__n">{i + 1}</span>
                  <Icon name={f!.kind === 'web' ? 'web' : f!.kind} size={14} className="source__icon" />
                  <span className="source__body">
                    <span className={`source__name ${f!.kind === 'github' || f!.kind === 'labpc' ? 'mono' : ''}`}>{f!.name}</span>
                    <span className="source__meta">{f!.cite ?? 'Illustrative lab file'}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="memory-note"><Icon name="sparkle" size={13} /> The style frame shows one full conversation. Every chat gets its own in step 4.</p>
        </article>
      </div>
    </div>
  )
}
