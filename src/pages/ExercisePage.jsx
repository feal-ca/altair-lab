import { useEffect, useMemo, useRef, useState } from 'react'
import { DATASETS } from '../content/datasets.js'
import targets from '../content/targets.json'
import { check } from '../lib/checker.js'
import { python } from '../lib/python/index.js'
import { allExercises, exerciseLabel, navigate, resolveDataset } from '../lib/router.js'
import { resultToOutput } from '../lib/formatResult.js'
import { IDLE_MESSAGE, useLiveRun } from '../lib/useLiveRun.js'
import { Brief } from '../components/Brief.jsx'
import { Editor } from '../components/Editor.jsx'
import { ChartCard } from '../components/ChartCard.jsx'
import { CheckList } from '../components/CheckList.jsx'
import './ExercisePage.css'

// Runs one solution to completion; a newer run elsewhere makes the client report
// `stale`, so retry until we get a real answer (or the page is gone).
async function runSolution(code, isCancelled) {
  for (let i = 0; i < 5; i++) {
    const out = resultToOutput(await python.run(code))
    if (!out.stale || isCancelled()) return out
  }
  return { message: 'Could not compute the target chart.' }
}

// Keyed by exercise id in App, so every piece of local state starts fresh per exercise.
export function ExercisePage({ exercise, state, update }) {
  const id = exercise.id
  const editor = useRef(null)
  const dataset = resolveDataset(DATASETS, state, exercise.datasetId)
  const starter = dataset ? dataset.setupCode + '\n' : ''
  const stored = state.code?.[id]
  const isGenerated = exercise.n == null
  const [target, setTarget] = useState(() => (isGenerated ? null : { spec: targets[id] ?? null }))

  const targetPromise = useRef(Promise.resolve())

  // Generated exercises have no precomputed target: run the solution once.
  useEffect(() => {
    let stop = false
    if (isGenerated) {
      targetPromise.current = runSolution(exercise.solution, () => stop).then((o) => {
        if (!stop) setTarget(o)
      })
    }
    return () => {
      stop = true
    }
  }, [exercise, isGenerated])

  // Declared after the target effect above: effects run in order, so the hook's
  // first run already waits on targetPromise.
  const { code, out, onChange, runNow, reset, completions } = useLiveRun({
    initialCode: typeof stored === 'string' ? stored : starter,
    starter,
    dataset,
    onCodeChange: (next) => update((s) => ({ ...s, code: { ...(s.code ?? {}), [id]: next } })),
    beforeRun: () => targetPromise.current,
  })

  const result = useMemo(
    () => (out.spec && target?.spec ? check(out.spec, target.spec) : null),
    [out.spec, target]
  )
  const solved = Boolean(result?.solved)

  useEffect(() => {
    if (solved && !state.solved?.[id]) {
      update((s) => ({ ...s, solved: { ...(s.solved ?? {}), [id]: true } }))
    }
  }, [solved, id, state.solved, update])

  const list = allExercises(state)
  const next = list[list.findIndex((e) => e.id === id) + 1]

  const targetMessage = !target
    ? 'Computing the target chart…'
    : target.message ?? (target.spec ? null : 'No target chart is available for this exercise.')

  return (
    <>
      <section className="pane work">
        <Brief
          exercise={exercise}
          label={exerciseLabel(exercise, state)}
          dataset={dataset}
          onInsert={(text) => editor.current?.insertAtCursor(text)}
          onLoadSolution={(text) => editor.current?.setValue(text)}
        />
        <div className="editor-bar">
          <span className="hint">Ctrl+Enter runs</span>
          <button type="button" onClick={() => reset(editor)}>Reset</button>
          <button type="button" className="primary" onClick={runNow}>Run</button>
        </div>
        <div className="editor-wrap">
          <Editor ref={editor} value={code} onChange={onChange} onRun={runNow} completions={completions} />
        </div>
      </section>
      <section className="pane out">
        <ChartCard title="Target" spec={target?.spec} message={targetMessage} />
        <ChartCard title="Yours" spec={out.spec} message={out.message} placeholder={IDLE_MESSAGE} />
        {result && !target?.message && <CheckList checks={result.checks} solved={solved} />}
        {solved && next && (
          <button type="button" className="next" onClick={() => navigate(`#/ex/${encodeURIComponent(next.id)}`)}>
            Next →
          </button>
        )}
      </section>
    </>
  )
}
