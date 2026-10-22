import { useSyncExternalStore, useMemo } from 'react'
import { EXERCISES } from '../content/exercises.js'

const DEFAULT_ROUTE = () => ({ name: 'ex', id: EXERCISES[0].id })

const decode = (s) => {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

// parseHash('#/ex/nb1-bar-color') -> { name: 'ex', id }
// parseHash('#/sandbox/cars')     -> { name: 'sandbox', id: 'cars' }
// Empty or unrecognised hashes give the first exercise. An unknown exercise id is
// passed through: generated exercises live in state, so the page decides the fallback.
export function parseHash(hash) {
  const parts = String(hash ?? '')
    .replace(/^#/, '')
    .split('/')
    .filter(Boolean)
  const [head, id] = parts
  if (head === 'ex' && id) return { name: 'ex', id: decode(id) }
  if (head === 'sandbox') return id ? { name: 'sandbox', id: decode(id) } : { name: 'sandbox' }
  return DEFAULT_ROUTE()
}

export function navigate(hash) {
  location.hash = hash
}

function subscribe(cb) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => location.hash, () => '')
  return useMemo(() => parseHash(hash), [hash])
}

// Generated exercises (state.generated) follow the curated ones.
export function allExercises(state) {
  const gen = Array.isArray(state?.generated) ? state.generated : []
  return [...EXERCISES, ...gen]
}

// Number shown for an exercise: n for curated ones, G1, G2... for generated ones.
// Curated exercises are numbered inside their topic ("3.2"); generated ones G1, G2, ….
export function exerciseLabel(ex, state) {
  if (ex.label != null) return ex.label
  if (ex.n != null) return String(ex.n)
  const gen = Array.isArray(state?.generated) ? state.generated : []
  return 'G' + (gen.findIndex((g) => g.id === ex.id) + 1)
}

export function resolveDataset(datasets, state, id) {
  return datasets[id] ?? state?.datasets?.[id] ?? null
}
