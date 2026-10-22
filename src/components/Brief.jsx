import { useState } from 'react'
import { Expander } from './Expander.jsx'
import { DataPanel } from './DataPanel.jsx'
import './Brief.css'

export function Brief({ exercise, label, dataset, onInsert, onLoadSolution }) {
  const hints = Array.isArray(exercise.hints) ? exercise.hints : []
  const [shown, setShown] = useState(0)
  const [showSolution, setShowSolution] = useState(false)

  const loadSolution = () => {
    if (window.confirm('Replace the code in the editor with the solution?')) {
      onLoadSolution(exercise.solution)
    }
  }

  return (
    <header className="brief">
      <div className="meta">№ {label}{exercise.core === false ? ' · extra' : ''} · {exercise.level} · {exercise.topic}</div>
      <h1>{exercise.title}</h1>
      <p className="task">{exercise.task}</p>

      <Expander title="Hints">
        {hints.slice(0, shown).map((h, i) => (
          <p className="hint" key={i}><span className="hn">{i + 1}.</span> {h}</p>
        ))}
        {shown < hints.length ? (
          <button type="button" className="link" onClick={() => setShown(shown + 1)}>
            {shown === 0 ? 'Show a hint' : 'Show next hint'} ({shown}/{hints.length})
          </button>
        ) : !showSolution ? (
          <button type="button" className="link" onClick={() => setShowSolution(true)}>Show solution</button>
        ) : (
          <>
            <pre>{exercise.solution}</pre>
            <button type="button" className="link" onClick={loadSolution}>Load into editor</button>
          </>
        )}
      </Expander>

      {dataset && (
        <Expander title="Data">
          <DataPanel dataset={dataset} onInsert={onInsert} />
        </Expander>
      )}

      <Expander title="Concept">
        <p>{exercise.concept}</p>
        {exercise.docs && (
          <a className="docs" href={exercise.docs} target="_blank" rel="noopener noreferrer">Altair docs ↗</a>
        )}
      </Expander>
    </header>
  )
}
