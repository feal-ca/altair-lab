import { TOPICS } from '../content/exercises.js'
import { exerciseLabel } from '../lib/router.js'
import './Rail.css'

// Each topic shows its core exercises; the heading expands it to the extras too.
// The topic holding the open exercise is always expanded.
export function Rail({ exercises, state, activeId, onToggleTopic, onNewExercise, onReset }) {
  const groups = [...TOPICS, 'Generated']
  const openTopics = state.openTopics ?? {}
  const activeTopic = exercises.find((e) => e.id === activeId)?.topic
  return (
    <nav className="rail" aria-label="Exercises">
      <div className="rail-list">
        {groups.map((topic) => {
          const all = exercises.filter((e) => e.topic === topic)
          if (!all.length) return null
          const extras = all.filter((e) => e.core === false)
          const pinned = activeTopic === topic && extras.some((e) => e.id === activeId)
          const open = pinned || Boolean(openTopics[topic])
          const items = open ? all : all.filter((e) => e.core !== false)
          const solvedExtras = extras.filter((e) => state.solved?.[e.id]).length
          return (
            <div key={topic}>
              {extras.length ? (
                <button
                  type="button"
                  className="rail-grp rail-grp-btn"
                  aria-expanded={open}
                  disabled={pinned}
                  onClick={() => onToggleTopic(topic)}
                >
                  <span>{topic}</span>
                  <span className="rail-more">
                    {pinned ? '' : open ? 'less' : `+${extras.length}${solvedExtras ? ` · ${solvedExtras}✓` : ''}`}
                  </span>
                </button>
              ) : (
                <div className="rail-grp">{topic}</div>
              )}
              {items.map((ex) => {
                const done = Boolean(state.solved?.[ex.id])
                const cls = ['rail-it', done && 'done', ex.id === activeId && 'on', ex.core === false && 'extra']
                  .filter(Boolean).join(' ')
                return (
                  <a
                    key={ex.id}
                    className={cls}
                    href={`#/ex/${encodeURIComponent(ex.id)}`}
                    aria-current={ex.id === activeId ? 'page' : undefined}
                    title={ex.title}
                  >
                    <span className="n">{exerciseLabel(ex, state)}</span>
                    <span className="t">{ex.title}</span>
                    {done && <span className="tick" aria-label="solved">✓</span>}
                  </a>
                )
              })}
            </div>
          )
        })}
      </div>
      <div className="rail-foot">
        <button type="button" className="rail-new" onClick={onNewExercise}>+ New exercise</button>
        <button type="button" className="rail-reset" onClick={onReset}>Reset progress</button>
      </div>
    </nav>
  )
}
