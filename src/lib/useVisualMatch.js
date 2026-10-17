import { useEffect, useState } from 'react'
import { compareScenes, sceneOf } from './visual.js'

// Target scenes are rendered once per spec object.
const targetScenes = new WeakMap()
const targetScene = (spec) => {
  if (!targetScenes.has(spec)) targetScenes.set(spec, sceneOf(spec))
  return targetScenes.get(spec)
}

// useVisualMatch(userSpec, targetSpec) -> { same, difference } | null.
// Null while comparing, when either spec is missing, or when a spec can't be rendered.
export function useVisualMatch(userSpec, targetSpec) {
  const [match, setMatch] = useState(null)

  useEffect(() => {
    if (!userSpec || !targetSpec) return
    let stop = false
    Promise.all([targetScene(targetSpec), sceneOf(userSpec)])
      .then(([t, m]) => {
        if (!stop) setMatch({ userSpec, ...compareScenes(t, m) })
      })
      .catch(() => {
        if (!stop) setMatch(null)
      })
    return () => {
      stop = true
    }
  }, [userSpec, targetSpec])

  // A result for an older run must not count for the current one.
  return match && match.userSpec === userSpec && userSpec ? { same: match.same, difference: match.difference } : null
}
