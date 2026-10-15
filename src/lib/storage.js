// Progress persistence in localStorage. Plain ESM: no React imports.
// Every storage access is wrapped, so a blocked or full localStorage only means
// progress is not saved; the app keeps working.

const KEY = 'altairlab:v1'

export const DEFAULT_STATE = {
  solved: {},
  code: {},
  sandboxCode: {},
  datasets: {},
  generated: [],
  railCollapsed: false,
}

const freshDefault = () => JSON.parse(JSON.stringify(DEFAULT_STATE))

function getStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

// loadState() -> State. Corrupt, unreadable or non-object data yields the default.
export function loadState() {
  try {
    const storage = getStorage()
    if (!storage) return freshDefault()
    const raw = storage.getItem(KEY)
    if (raw === null) return freshDefault()
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return freshDefault()
    }
    return { ...freshDefault(), ...parsed }
  } catch {
    return freshDefault()
  }
}

// saveState(state) -> boolean. False when the write failed (quota, blocked storage).
export function saveState(state) {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

// resetState() removes the stored progress and returns a fresh default state.
export function resetState() {
  try {
    getStorage()?.removeItem(KEY)
  } catch {
    // Nothing stored or storage blocked: the default state below is still correct.
  }
  return freshDefault()
}
