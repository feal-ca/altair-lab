import { useState, useEffect, useRef, useCallback } from 'react'
import { loadState, saveState } from './storage.js'

// React state backed by localStorage. Writes are debounced by 300 ms.
// Returns [state, update(fn), saveOk]; saveOk is false if the last write failed.
export function useStoredState() {
  const [state, setState] = useState(loadState)
  const [saveOk, setSaveOk] = useState(true)
  const skipFirst = useRef(true)

  useEffect(() => {
    // Do not write back the state we just loaded.
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }
    const timer = setTimeout(() => setSaveOk(saveState(state)), 300)
    return () => clearTimeout(timer)
  }, [state])

  const update = useCallback((fn) => setState((prev) => fn(prev)), [])

  return [state, update, saveOk]
}
