import { focusNode, openChat } from '../engine/actions'
import { useStore } from '../engine/store'
import { ACTIVE, CHATS, HUBS } from '../lab/content'
import { PEOPLE } from '../lab/people'
import { AiMark, Avatar } from '../ui/Avatar'

const chatByTitle = new Map(CHATS.map((c) => [c.title, c.id]))

export function LiveRail() {
  const feed = useStore((s) => s.feed)
  return (
    <aside className="rail rail--left" aria-label="Live in the lab">
      <section className="rail__section" data-tour="live">
        <h2 className="eyebrow">Live in the lab</h2>
        <ul className="feed">
          {feed.map((f) => {
            const id = f.chat ?? chatByTitle.get(f.target)
            const colour = f.who === 'ai' ? undefined : PEOPLE[f.who].color
            const name = f.who === 'ai' ? 'Lab AI' : f.who === 'you' ? 'You' : PEOPLE[f.who].short
            return (
              <li key={f.id} className={`feed__item ${f.live ? 'is-live' : ''} ${f.when === 'now' && !f.live ? 'is-new' : ''}`}>
                <span className="feed__who" style={{ ['--ring' as string]: colour }}>
                  {f.who === 'ai' ? <AiMark size={26} /> : <Avatar id={f.who} size={26} />}
                  {f.live && <i className="bubble" aria-hidden="true" />}
                </span>
                <p className="feed__text">
                  <b>{name}</b> {f.verb}{' '}
                  {id ? (
                    <button type="button" className="link" onClick={() => openChat(id)}>{f.target}</button>
                  ) : (
                    <span className="feed__target">{f.target}</span>
                  )}
                  {f.live && <span className="typing-dots" style={{ color: colour }} aria-label="typing"><i /><i /><i /></span>}
                </p>
                <span className="feed__when">{f.when}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rail__section">
        <h2 className="eyebrow">Research topics</h2>
        <ul className="topics">
          {HUBS.filter((h) => h.id !== 'core').map((h) => {
            const chats = CHATS.filter((c) => c.hub === h.id)
            const here = ACTIVE.filter((a) => chats.some((c) => c.id === a.chat))
            return (
              <li key={h.id}>
                <button type="button" className="topic" onClick={() => focusNode(h.id, 1.9)} title={h.question}>
                  <span className="topic__name">{h.label}</span>
                  <span className="topic__here">
                    {here.map((a) => (
                      <i key={a.who} style={{ background: PEOPLE[a.who].color }} title={`${PEOPLE[a.who].short} is here`} />
                    ))}
                  </span>
                  <span className="topic__count">{chats.length}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </aside>
  )
}
