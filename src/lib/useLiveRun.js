import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { python } from './python/index.js'
import { resultToOutput } from './formatResult.js'

export const DEBOUNCE_MS = 600
export const IDLE_MESSAGE = 'Write some Altair code; the chart shows up here.'
export const PYTHON_DOWN_MESSAGE = "Python isn't running. Press Retry in the top bar."

// The run pipeline shared by the exercise and sandbox pages: editor text, debounced
// auto-run, seq-guarded execution, re-run after a Python restart, completion columns.
//
// Options:
//   initialCode   starting editor text
//   starter       text the Reset button restores
//   dataset       dataset whose columns feed the completions
//   onCodeChange  called with every edit (the page persists it)
//   beforeRun     optional async function awaited before each run
export function useLiveRun({ initialCode, starter, dataset, onCodeChange, beforeRun }) {
  const [code, setCode] = useState(initialCode)
  const [out, setOut] = useState({})
  const [phase, setPhase] = useState('loading')

  const seq = useRef(0)
  const timer = useRef(null)
  const gone = useRef(false)
  const codeRef = useRef(code)
  const needsRerun = useRef(false)
  const beforeRunRef = useRef(beforeRun)
  beforeRunRef.current = beforeRun

  // `auto` runs (debounce, mount, Python coming back) skip code with no `alt.` in it;
  // the Run button and Ctrl/Cmd+Enter always run.
  const execute = useCallback(async (src, auto) => {
    const mine = ++seq.current
    needsRerun.current = false
    if (auto && !/alt\./.test(src)) {
      setOut({})
      return
    }
    if (beforeRunRef.current) {
      await beforeRunRef.current()
      if (mine !== seq.current || gone.current) return
    }
    const result = resultToOutput(await python.run(src))
    if (mine !== seq.current || gone.current) return
    if (result.stale) {
      // Cancelled by a Python restart, not by a newer run: redo it once Python is back.
      needsRerun.current = true
      return
    }
    setOut(result)
  }, [])

  useEffect(() => {
    gone.current = false
    execute(codeRef.current, true)
    let prev = null
    const unsubscribe = python.subscribe((status) => {
      setPhase(status.phase)
      if (status.phase === 'ready' && prev !== null && prev !== 'ready' && needsRerun.current) {
        execute(codeRef.current, true)
      }
      prev = status.phase
    })
    return () => {
      gone.current = true
      clearTimeout(timer.current)
      unsubscribe()
    }
  }, [execute])

  const onChange = (next) => {
    codeRef.current = next
    setCode(next)
    onCodeChange?.(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => execute(next, true), DEBOUNCE_MS)
  }

  const runNow = () => {
    clearTimeout(timer.current)
    execute(codeRef.current, false)
  }

  const reset = (editorRef) => {
    if (code === starter || window.confirm('Reset the editor to the starter code?')) {
      editorRef.current?.setValue(starter)
    }
  }

  const columns = useMemo(() => dataset?.columns ?? [], [dataset])

  const shown = phase === 'error' ? { message: PYTHON_DOWN_MESSAGE } : out
  return { code, out: shown, onChange, runNow, reset, columns }
}
