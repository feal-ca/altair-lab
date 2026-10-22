import { useEffect, useRef } from 'react'
import { TOPICS } from '../content/exercises.js'
import { exerciseLabel } from '../lib/router.js'
import './Rail.css'

export const RAIL_MIN = 170
export const RAIL_MAX = 460
export const RAIL_DEFAULT = 230
const clampWidth = (w) => Math.round(Math.min(RAIL_MAX, Math.max(RAIL_MIN, w)))

function ExerciseLink({ ex, state, activeId }) {
  const done = Boolean(state.solved?.[ex.id])
  const cls = ['rail-it', done && 'done', ex.id === activeId && 'on'].filter(Boolean).join(' ')
  return (
    <a
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
}

// Dragging the right edge resizes the rail; arrow keys nudge it, double-click resets it.
// `onResize(width, done)` is called while dragging and once more with done=true.
function ResizeHandle({ width, onResize }) {
  const start = useRef(null)
  const onPointerDown = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, w: width }
    document.body.classList.add('rail-resizing')
  }
  const onPointerMove = (e) => {
    if (start.current) onResize(clampWidth(start.current.w + e.clientX - start.current.x), false)
  }
  const onPointerUp = (e) => {
    if (!start.current) return
    onResize(clampWidth(start.current.w + e.clientX - start.current.x), true)
    start.current = null
    document.body.classList.remove('rail-resizing')
  }
  const onKeyDown = (e) => {
    const step = e.shiftKey ? 48 : 16
    if (e.key === 'ArrowLeft') onResize(clampWidth(width - step), true)
    else if (e.key === 'ArrowRight') onResize(clampWidth(width + step), true)
    else return
    e.preventDefault()
  }
  return (
    <div
      className="rail-resize"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize exercise list"
      aria-valuemin={RAIL_MIN}
      aria-valuemax={RAIL_MAX}
      aria-valuenow={width}
      tabIndex={0}
      title="Drag to resize, double-click to reset"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => onResize(RAIL_DEFAULT, true)}
      onKeyDown={onKeyDown}
    />
  )
}

// Each topic lists its core exercises; a toggle under them shows the extras.
// The topic holding the open exercise always shows it.
export function Rail({ exercises, state, activeId, width, onResize, onToggleTopic, onNewExercise, onReset }) {
  const groups = [...TOPICS, 'Generated']
  const openTopics = state.openTopics ?? {}
  // Bring the open exercise into view when it changes (it may be an extra far down the list).
  const list = useRef(null)
  useEffect(() => {
    list.current?.querySelector('.rail-it.on')?.scrollIntoView?.({ block: 'nearest' })
  }, [activeId])
  return (
    <nav className="rail" aria-label="Exercises">
      <div className="rail-list" ref={list}>
        {groups.map((topic) => {
          const all = exercises.filter((e) => e.topic === topic)
          if (!all.length) return null
          const core = all.filter((e) => e.core !== false)
          const extras = all.filter((e) => e.core === false)
          const pinned = extras.some((e) => e.id === activeId)
          const open = pinned || Boolean(openTopics[topic])
          const solved = all.filter((e) => state.solved?.[e.id]).length
          const number = TOPICS.indexOf(topic) + 1
          return (
            <section key={topic} className="rail-topic">
              <h3 className="rail-grp">
                <span className="rail-grp-n">{number > 0 ? number : 'G'}</span>
                <span className="rail-grp-name">{topic}</span>
                {solved > 0 && <span className="rail-grp-count" title={`${solved} of ${all.length} solved`}>{solved}/{all.length}</span>}
              </h3>
              {core.map((ex) => <ExerciseLink key={ex.id} ex={ex} state={state} activeId={activeId} />)}
              {open && extras.length > 0 && (
                <div className="rail-extras">
                  <div className="rail-extras-label">More practice</div>
                  {extras.map((ex) => <ExerciseLink key={ex.id} ex={ex} state={state} activeId={activeId} />)}
                </div>
              )}
              {extras.length > 0 && !pinned && (
                <button type="button" className="rail-more" aria-expanded={open} onClick={() => onToggleTopic(topic)}>
                  {open ? 'Show fewer' : `${extras.length} more`}
                </button>
              )}
            </section>
          )
        })}
      </div>
      <div className="rail-foot">
        <button type="button" className="rail-new" onClick={onNewExercise}>+ New exercise</button>
        <button type="button" className="rail-reset" onClick={onReset}>Reset progress</button>
      </div>
      <ResizeHandle width={width} onResize={onResize} />
    </nav>
  )
}
