import { chatTitle, follow } from '../engine/actions'
import { useStore, type LiveActivity } from '../engine/store'
import { PEOPLE, TEAM_ORDER, type PersonId, type Presence } from '../lab/people'
import { Avatar } from '../ui/Avatar'
import { Icon, type IconName } from '../ui/Icons'

const GROUPS: { title: string; match: Presence[] }[] = [
  { title: 'Live now', match: ['live'] },
  { title: 'Away', match: ['away'] },
  { title: 'Offline and alumni', match: ['offline', 'alumni'] },
]

const SOURCES: { icon: IconName; name: string; count: string }[] = [
  { icon: 'github', name: 'GitHub', count: '2 repos' },
  { icon: 'drive', name: 'Google Drive', count: '1 folder' },
  { icon: 'onedrive', name: 'OneDrive', count: 'sync tool' },
  { icon: 'labpc', name: 'Lab PCs', count: '2 machines' },
  { icon: 'paper', name: 'Papers', count: '15' },
  { icon: 'web', name: 'Web clippings', count: '4' },
]

function statusOf(id: PersonId, act: LiveActivity | undefined) {
  if (act) return `${act.doing === 'typing' ? 'Typing in' : 'In'} “${chatTitle(act.chat)}”`
  return PEOPLE[id].status
}

export function PeopleRail() {
  const drag = useStore((s) => s.drag)
  const following = useStore((s) => s.following)
  const presence = useStore((s) => s.presence)
  const active = useStore((s) => s.active)
  const youName = useStore((s) => s.setup.youName)
  return (
    <aside className="rail rail--right" aria-label="People" data-dropzone="new-chat">
      {drag && (
        <div className={`newchat-drop ${drag.over === 'new-chat' ? 'is-over' : ''}`} aria-hidden="true">
          <span className="newchat-drop__icon"><Icon name="plus" size={20} /></span>
          <b>Drop to start a new chat</b>
          <span>with “{drag.label}” as its first context</span>
        </div>
      )}
      <section className="rail__section" data-tour="people">
        <h2 className="eyebrow">People <span className="eyebrow__aside">9 in the lab</span></h2>
        {GROUPS.map((g) => {
          const ids: PersonId[] = TEAM_ORDER.filter((id) => g.match.includes(presence[id]))
          if (g.title === 'Live now') ids.unshift('you')
          return (
            <div key={g.title} className="people-group">
              <h3 className="people-group__title">{g.title}</h3>
              <ul className="people">
                {ids.map((id) => {
                  const p = PEOPLE[id]
                  const live = presence[id] === 'live'
                  const act = live ? active.find((a) => a.who === id) : undefined
                  const isFollowed = following === id
                  return (
                    <li key={id} className={`person ${live ? 'is-live' : ''} ${isFollowed ? 'is-followed' : ''}`} style={{ ['--ring' as string]: p.color }}>
                      <span className="person__av">
                        <Avatar id={id} size={30} />
                        <i className={`presence presence--${presence[id]}`} />
                      </span>
                      <span className="person__text">
                        <span className="person__name">{id === 'you' ? (youName ? `${youName} (you)` : 'You (guest)') : p.name}</span>
                        <span className="person__status" style={live ? { color: 'var(--text-2)' } : undefined}>{statusOf(id, act)}</span>
                      </span>
                      {live && id !== 'you' && (
                        <button type="button" className="person__follow" onClick={() => follow(isFollowed ? null : id)} aria-pressed={isFollowed}>
                          {isFollowed ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </section>

      <section className="rail__section sources-mini" data-tour="sources">
        <h2 className="eyebrow">Reading from <span className="eyebrow__aside">synced 2 min ago</span></h2>
        <ul className="sources-mini__list">
          {SOURCES.map((s) => (
            <li key={s.name}>
              <Icon name={s.icon} size={14} />
              <span>{s.name}</span>
              <span className="sources-mini__count">{s.count}</span>
            </li>
          ))}
        </ul>
        <p className="sources-mini__total"><b>5,240</b> files · read-only · nothing leaves the lab’s server</p>
      </section>
    </aside>
  )
}
