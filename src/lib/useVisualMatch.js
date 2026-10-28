import { useEffect, useState } from 'react'
import { compareScenes, sceneOf, stableSceneOf } from './visual.js'

// Target scenes are rendered once per spec object.
const targetScenes = new WeakMap()
const targetScene = (spec) => {
  if (!targetScenes.has(spec)) targetScenes.set(spec, stableSceneOf(spec))
  return targetScenes.get(spec)
}

const UNKNOWN = { same: null, difference: null }

// useVisualMatch(userSpec, targetSpec) -> { same, difference } | null.
// Null while comparing or when either spec is missing. `same` is null when the comparison
// can't decide: a spec that can't be rendered, or a target that draws differently each time.
export function useVisualMatch(userSpec, targetSpec) {
  const [match, setMatch] = useState(null)

  useEffect(() => {
    if (!userSpec || !targetSpec) return
    let stop = false
    Promise.all([targetScene(targetSpec), sceneOf(userSpec)])
      .then(([t, m]) => {
        if (!stop) setMatch({ userSpec, ...(t ? compareScenes(t, m) : UNKNOWN) })
      })
      .catch(() => {
        if (!stop) setMatch({ userSpec, ...UNKNOWN })
      })
    return () => {
      stop = true
    }
  }, [userSpec, targetSpec])

  // A result for an older run must not count for the current one.
  return match && match.userSpec === userSpec && userSpec ? { same: match.same, difference: match.difference } : null
}
