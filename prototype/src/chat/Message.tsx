import { Fragment, type ReactNode } from 'react'
import { addToTray, chatTitle, openChat, openManifest, openSource, rate, setBranchFrom, toast } from '../engine/actions'
import { graph } from '../engine/world'
import { useStore, type Msg, type SourceRef } from '../engine/store'
import { PEOPLE } from '../lab/people'
import { AiMark, Avatar } from '../ui/Avatar'
import { Icon, type IconName } from '../ui/Icons'
import { SlipChart } from './SlipChart'

const ICON_FOR: Record<string, IconName> = {
  paper: 'paper', robot: 'robot', github: 'github', drive: 'drive', onedrive: 'onedrive', labpc: 'labpc', web: 'web',
}

export function iconForRef(r: SourceRef): IconName {
  if (r.chat) return 'chat'
  const n = r.node ? graph.byId.get(r.node) : null
  return (n?.source && ICON_FOR[n.source]) || 'file'
}

export function refName(r: SourceRef) {
  if (r.chat) return chatTitle(r.chat)
  return graph.byId.get(r.node ?? '')?.label ?? r.where
}

function refMeta(r: SourceRef) {
  if (r.chat) {
    const n = graph.byId.get(r.chat)
    const p = n?.by ? PEOPLE[n.by] : null
    return `Lab memory · chat by ${p?.name ?? 'the lab'}${p?.presence === 'alumni' ? ' (alumna)' : ''}`
  }
  const n = graph.byId.get(r.node ?? '')
  if (!n) return ''
  if (n.cite) return `Paper · ${n.cite}`
  const where: Record<string, string> = {
    robot: 'Robot · public coverage', github: 'GitHub · robophysics-lab', drive: 'Google Drive', onedrive: 'OneDrive · sync tool',
    labpc: 'Lab PC · imaging rig', web: 'Web clipping',
  }
  return where[n.source ?? 'labpc'] ?? ''
}

const isMono = (r: SourceRef) => {
  const n = r.node ? graph.byId.get(r.node) : null
  return !!n && (n.type === 'data' || n.source === 'github' || n.source === 'labpc') && n.label.includes('/')
}

/** Paragraphs with **bold**, *italic* and [n] citation chips. */
function RichText({ text, onCite }: { text: string; onCite: (n: number) => void }) {
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i}>
          {para.split(/(\[\d+\]|\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) => {
            const cite = part.match(/^\[(\d+)\]$/)
            if (cite) {
              const n = Number(cite[1])
              return (
                <button key={j} type="button" className="cite" onClick={() => onCite(n)} aria-label={`Open source ${n}`}>
                  {n}
                </button>
              )
            }
            if (part.startsWith('**')) return <b key={j}>{part.slice(2, -2)}</b>
            if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={j}>{part.slice(1, -1)}</em>
            return <Fragment key={j}>{part}</Fragment>
          })}
        </p>
      ))}
    </>
  )
}

/** Trim a streaming slice so a half-written [3] or **bold never shows. */
function cleanSlice(text: string) {
  let t = text.replace(/\[\d*$/, '')
  if ((t.match(/\*\*/g) ?? []).length % 2) t = t.replace(/\*\*(?![\s\S]*\*\*)/, '')
  if ((t.replace(/\*\*/g, '').match(/\*/g) ?? []).length % 2) t = t.replace(/\*(?![\s\S]*\*)/, '')
  return t
}

interface Props {
  msg: Msg
  chatId: string
  index: number
}

export function Message({ msg, chatId, index }: Props) {
  const rating = useStore((s) => s.ratings[msg.id])
  const person = msg.who === 'ai' ? null : PEOPLE[msg.who]

  if (msg.kind === 'note' || msg.kind === 'merge') {
    const tone = msg.who === 'ai' ? undefined : PEOPLE[msg.who].color
    return (
      <div className={`note note--${msg.noteIcon ?? 'pull'} ${msg.kind === 'merge' ? 'note--merge' : ''}`} style={{ ['--who' as string]: tone }}>
        <span className="port port--note" aria-hidden="true" />
        <Icon name={msg.noteIcon ?? 'pull'} size={14} />
        <span className="note__text">
          <RichText text={msg.text} onCite={() => {}} />
        </span>
        <span className="note__time">{msg.time}</span>
        {msg.kind === 'merge' && msg.sources?.length ? (
          <span className="note__refs">
            {msg.sources.map((s, i) => (
              <button key={i} type="button" className="note__ref" onClick={() => openSource(s, chatId)}>
                <Icon name={iconForRef(s)} size={12} /> {refName(s)}
              </button>
            ))}
          </span>
        ) : null}
      </div>
    )
  }

  if (person) {
    return (
      <article className="msg msg--human" style={{ ['--who' as string]: person.id === 'you' ? 'var(--text)' : person.color }}>
        <button type="button" className="port" aria-label="Branch from this question" title="Branch from here" onClick={() => setBranchFrom(chatId, `${person.short}’s question`)} />
        <div className="msg__head"><Avatar id={person.id} size={22} /><b>{person.id === 'you' ? 'You' : person.name}</b><span className="msg__time">{msg.time}</span></div>
        <p className="msg__text">{msg.text}</p>
      </article>
    )
  }

  const phase = msg.phase ?? 'done'
  const text = phase === 'done' ? msg.text : cleanSlice(msg.text.slice(0, msg.shown ?? 0))
  const onCite = (n: number) => {
    const s = msg.sources?.[n - 1]
    if (s) openSource(s, chatId)
  }

  return (
    <article className={`msg msg--ai ${phase !== 'done' ? 'is-streaming' : ''}`} data-tour={index === 0 ? 'answer' : undefined}>
      <button type="button" className="port port--ai" aria-label="Branch from this answer" title="Branch from here" onClick={() => setBranchFrom(chatId, 'this answer')} />
      <div className="msg__head"><AiMark size={22} /><b>Lab AI</b><span className="msg__time">{msg.time}</span>{msg.background && <span className="badge-bg">General background</span>}</div>

      {phase === 'searching' ? (
        <div className="searching" aria-live="polite">
          <span className="searching__label">Searching the lab</span>
          {(msg.readFrom?.length ? msg.readFrom : ['Papers', 'GitHub', 'Drive', 'Lab PC', 'Lab memory']).map((r, i) => (
            <span key={r} className="searching__src" style={{ animationDelay: `${i * 170}ms` }}>
              <Icon name="check" size={11} /> {r}
            </span>
          ))}
        </div>
      ) : (
        <>
          {msg.readFrom?.length ? (
            <div className="read-from" aria-label="Where this answer came from">
              <span>Read from</span>
              {msg.readFrom.map((r) => (
                <span key={r} className="read-from__src">{r}</span>
              ))}
            </div>
          ) : null}
          <div className={`msg__text ${msg.notFound ? 'is-notfound' : ''}`}>
            <RichText text={text} onCite={onCite} />
            {phase === 'writing' && <span className="stream-caret" aria-hidden="true" />}
          </div>
        </>
      )}

      {phase === 'done' && (
        <>
          {msg.chart === 'slip' && <SlipChart />}
          {msg.files?.length ? (
            <ol className="sources sources--files">
              {msg.files.map((f, i) => {
                const ref = { node: f.node, where: f.why }
                return (
                  <li key={f.node}>
                    <button type="button" className="source" onClick={() => openSource(ref, chatId)}>
                      <span className="source__n">{i + 1}</span>
                      <Icon name={iconForRef(ref)} size={14} className="source__icon" />
                      <span className="source__body">
                        <span className={`source__name ${isMono(ref) ? 'mono' : ''}`}>{refName(ref)}</span>
                        <span className="source__meta">{f.why} · {refMeta(ref)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          ) : null}
          {msg.sources?.length ? (
            <ol className="sources">
              {msg.sources.map((s, i) => (
                <li key={i}>
                  <button type="button" className={`source ${s.chat ? 'source--memory' : ''}`} onClick={() => openSource(s, chatId)}>
                    <span className="source__n">{i + 1}</span>
                    <Icon name={iconForRef(s)} size={14} className="source__icon" />
                    <span className="source__body">
                      <span className={`source__name ${isMono(s) ? 'mono' : ''}`}>{refName(s)}</span>
                      <span className="source__meta">{s.where} · {refMeta(s)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          ) : null}
          {msg.memoryNote && <p className="memory-note"><Icon name="sparkle" size={13} /> {msg.memoryNote}</p>}
          {msg.suggest && <InlineSuggest chatId={chatId} chat={msg.suggest.chat} who={msg.suggest.who} />}
          <div className="answer__foot">
            <span>Searched 5,240 files across 6 sources</span>
            <span className="dot-sep">·</span>
            <button type="button" className="link link--quiet" onClick={() => openManifest(chatId, msg.id)} data-tour={index === 0 ? 'manifest' : undefined}>
              <Icon name="eye" size={13} /> What did the AI see?
            </button>
            <span className="answer__rate">
              <button type="button" className={`icon-btn icon-btn--xs ${rating === 'up' ? 'is-on' : ''}`} aria-pressed={rating === 'up'} aria-label="Useful" onClick={() => rate(msg.id, 'up')}><Icon name="thumbUp" size={13} /></button>
              <button type="button" className={`icon-btn icon-btn--xs ${rating === 'down' ? 'is-on' : ''}`} aria-pressed={rating === 'down'} aria-label="Not useful" onClick={() => rate(msg.id, 'down')}><Icon name="thumbDown" size={13} /></button>
            </span>
          </div>
          {msg.branchMark && (
            <button type="button" className="branch-mark" onClick={() => openChat(msg.branchMark!.chat)} style={{ ['--who' as string]: PEOPLE[msg.branchMark.who].color }}>
              <Icon name="branch" size={13} />
              <span><b>{PEOPLE[msg.branchMark.who].short}</b> branched from this answer: <u>{chatTitle(msg.branchMark.chat)}</u></span>
            </button>
          )}
        </>
      )}
    </article>
  )
}

function InlineSuggest({ chatId, chat, who }: { chatId: string; chat: string; who: keyof typeof PEOPLE }) {
  const inTray = useStore((s) => (s.tray[chatId] ?? []).some((t) => t.ref === chat))
  const p = PEOPLE[who]
  return (
    <div className="inline-suggest" style={{ ['--who' as string]: p.color }}>
      <Avatar id={who} size={20} />
      <span><b>{p.short}</b> has a related chat: <button type="button" className="link" onClick={() => openChat(chat)}>{chatTitle(chat)}</button></span>
      {inTray ? (
        <span className="inline-suggest__done"><Icon name="check" size={12} /> In context</span>
      ) : (
        <button type="button" className="btn btn--sm" onClick={() => { if (addToTray(chatId, chat)) toast(`${p.short}’s chat is now in this chat’s context.`, { who }) }}>
          Pull it in
        </button>
      )}
    </div>
  )
}

export function Rich({ text }: { text: string }): ReactNode {
  return <RichText text={text} onCite={() => {}} />
}
