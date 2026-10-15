import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadState, saveState, resetState, DEFAULT_STATE } from './storage.js'

const KEY = 'altairlab:v1'

// In-memory stand-in for window.localStorage. Individual methods can be made to throw.
function fakeStorage() {
  const map = new Map()
  const store = {
    failGet: false,
    failSet: false,
    getItem(k) {
      if (store.failGet) throw new Error('SecurityError')
      return map.has(k) ? map.get(k) : null
    },
    setItem(k, v) {
      if (store.failSet) throw new DOMException('quota exceeded', 'QuotaExceededError')
      map.set(k, String(v))
    },
    removeItem(k) {
      map.delete(k)
    },
    raw: map,
  }
  return store
}

const install = (value) =>
  Object.defineProperty(globalThis, 'localStorage', { value, configurable: true, writable: true })

describe('storage', () => {
  let ls
  beforeEach(() => {
    ls = fakeStorage()
    install(ls)
  })
  afterEach(() => {
    delete globalThis.localStorage
  })

  it('round-trips a saved state', () => {
    const state = { ...DEFAULT_STATE, solved: { 'ex-1': true }, railCollapsed: true }
    expect(saveState(state)).toBe(true)
    expect(JSON.parse(ls.raw.get(KEY))).toEqual(state)
    expect(loadState()).toEqual(state)
  })

  it('returns the default state when nothing is stored', () => {
    expect(loadState()).toEqual(DEFAULT_STATE)
  })

  it('returns the default state for corrupt JSON', () => {
    ls.raw.set(KEY, '{not json')
    expect(() => loadState()).not.toThrow()
    expect(loadState()).toEqual(DEFAULT_STATE)
  })

  it('returns the default state for stored JSON that is not an object', () => {
    ls.raw.set(KEY, 'null')
    expect(loadState()).toEqual(DEFAULT_STATE)
    ls.raw.set(KEY, '[1,2]')
    expect(loadState()).toEqual(DEFAULT_STATE)
  })

  it('returns the default state when getItem throws, without throwing', () => {
    ls.failGet = true
    expect(() => loadState()).not.toThrow()
    expect(loadState()).toEqual(DEFAULT_STATE)
  })

  it('returns false from saveState when setItem throws, without throwing', () => {
    ls.failSet = true
    expect(() => saveState(DEFAULT_STATE)).not.toThrow()
    expect(saveState(DEFAULT_STATE)).toBe(false)
  })

  it('returns false from saveState when localStorage is missing entirely', () => {
    delete globalThis.localStorage
    expect(saveState(DEFAULT_STATE)).toBe(false)
    expect(loadState()).toEqual(DEFAULT_STATE)
  })

  it('fills keys missing from stored state with defaults', () => {
    ls.raw.set(KEY, JSON.stringify({ solved: { a: true } }))
    const s = loadState()
    expect(s.solved).toEqual({ a: true })
    expect(s.code).toEqual({})
    expect(s.sandboxCode).toEqual({})
    expect(s.datasets).toEqual({})
    expect(s.generated).toEqual([])
    expect(s.railCollapsed).toBe(false)
  })

  it('does not share default objects between loads', () => {
    loadState().solved.x = true
    expect(loadState().solved).toEqual({})
  })

  it('resetState removes the stored entry and returns a fresh default', () => {
    saveState({ ...DEFAULT_STATE, railCollapsed: true })
    expect(resetState()).toEqual(DEFAULT_STATE)
    expect(ls.raw.has(KEY)).toBe(false)
  })

  it('resetState does not throw when storage is unavailable', () => {
    delete globalThis.localStorage
    expect(() => resetState()).not.toThrow()
  })
})
