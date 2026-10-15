import { TOPICS } from '../content/exercises.js'
import { exerciseLabel } from '../lib/router.js'
import './Rail.css'

export function Rail({ exercises, state, activeId, onNewExercise, onReset }) {
  const groups = [...TOPICS, 'Generated']
  return (
    <nav className="rail" aria-label="Exercises">
      <div className="rail-list">
        {groups.map((topic) => {
          const items = exercises.filter((e) => e.topic === topic)
          if (!items.length) return null
          return (
            <div key={topic}>
              <div className="rail-grp">{topic}</div>
              {items.map((ex) => {
                const done = Boolean(state.solved?.[ex.id])
                const cls = ['rail-it', done && 'done', ex.id === activeId && 'on'].filter(Boolean).join(' ')
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
