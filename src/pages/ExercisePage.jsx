import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DATASETS } from '../content/datasets.js'
import { ALTAIR_API } from '../content/altairApi.js'
import targets from '../content/targets.json'
import { check } from '../lib/checker.js'
import { python } from '../lib/python/index.js'
import { allExercises, exerciseLabel, navigate, resolveDataset } from '../lib/router.js'
import { resultToOutput } from '../lib/formatResult.js'
import { Brief } from '../components/Brief.jsx'
import { Editor } from '../components/Editor.jsx'
import { ChartCard } from '../components/ChartCard.jsx'
import { CheckList } from '../components/CheckList.jsx'
import './ExercisePage.css'

const DEBOUNCE_MS = 600
const IDLE_MESSAGE = 'Write an `alt.Chart(...)` in the editor and your chart appears here.'

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
  const [code, setCode] = useState(typeof stored === 'string' ? stored : starter)
  const [out, setOut] = useState({ message: IDLE_MESSAGE })
  const isGenerated = exercise.n == null
  const [target, setTarget] = useState(() => (isGenerated ? null : { spec: targets[id] ?? null }))

  const seq = useRef(0)
  const cancelled = useRef(false)
  const targetPromise = useRef(Promise.resolve())
  const timer = useRef(null)

  // Generated exercises have no precomputed target: run the solution once.
  useEffect(() => {
    cancelled.current = false
    if (isGenerated) {
      const p = runSolution(exercise.solution, () => cancelled.current).then((o) => {
        if (!cancelled.current) setTarget(o)
      })
      targetPromise.current = p
    }
    return () => {
      cancelled.current = true
      clearTimeout(timer.current)
    }
  }, [exercise, isGenerated])

  const execute = useCallback(async (src) => {
    const mine = ++seq.current
    if (!/alt\./.test(src)) {
      setOut({ message: IDLE_MESSAGE })
      return
    }
    await targetPromise.current
    if (mine !== seq.current || cancelled.current) return
    const result = resultToOutput(await python.run(src))
    if (result.stale || mine !== seq.current || cancelled.current) return
    setOut(result)
  }, [])

  // Run whatever is saved when the page opens.
  useEffect(() => {
    execute(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (next) => {
    setCode(next)
    update((s) => ({ ...s, code: { ...(s.code ?? {}), [id]: next } }))
    clearTimeout(timer.current)
    timer.current = setTimeout(() => execute(next), DEBOUNCE_MS)
  }

  const runNow = () => {
    clearTimeout(timer.current)
    execute(code)
  }

  const reset = () => {
    if (code === starter || window.confirm('Reset the editor to the starter code?')) {
      editor.current?.setValue(starter)
    }
  }

  const completions = useMemo(
    () => [
      ...ALTAIR_API,
      ...(dataset?.columns ?? []).map((c) => ({
        label: c.name,
        apply: `'${c.name}:${c.type}'`,
        detail: c.type,
      })),
    ],
    [dataset]
  )

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
          <button type="button" onClick={reset}>Reset</button>
          <button type="button" className="primary" onClick={runNow}>Run</button>
        </div>
        <div className="editor-wrap">
          <Editor ref={editor} value={code} onChange={onChange} onRun={runNow} completions={completions} />
        </div>
      </section>
      <section className="pane out">
        <ChartCard title="Target" spec={target?.spec} message={targetMessage} />
        <ChartCard title="Yours" spec={out.spec} message={out.message} />
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
