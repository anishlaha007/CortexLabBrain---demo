import { PEOPLE, TEAM_ORDER, type Presence } from '../lab/people'
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

export function PeopleRail() {
  return (
    <aside className="rail rail--right" aria-label="People">
      <section className="rail__section">
        <h2 className="eyebrow">People <span className="eyebrow__aside">9 in the lab</span></h2>
        {GROUPS.map((g) => {
          const ids = TEAM_ORDER.filter((id) => g.match.includes(PEOPLE[id].presence))
          return (
            <div key={g.title} className="people-group">
              <h3 className="people-group__title">{g.title}</h3>
              <ul className="people">
                {ids.map((id) => {
                  const p = PEOPLE[id]
                  const live = p.presence === 'live'
                  return (
                    <li key={id} className={`person ${live ? 'is-live' : ''}`} style={{ ['--ring' as string]: p.color }}>
                      <span className="person__av">
                        <Avatar id={id} size={30} />
                        <i className={`presence presence--${p.presence}`} />
                      </span>
                      <span className="person__text">
                        <span className="person__name">{p.name}</span>
                        <span className="person__status" style={live ? { color: 'var(--text-2)' } : undefined}>
                          {p.status}
                        </span>
                      </span>
                      {live && <button type="button" className="person__follow">Follow</button>}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </section>

      <section className="rail__section sources-mini">
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
