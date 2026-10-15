import { describe, it, expect } from 'vitest'
import { parseHash } from './router.js'
import { EXERCISES } from '../content/exercises.js'

const first = { name: 'ex', id: EXERCISES[0].id }

describe('parseHash', () => {
  it('parses an exercise route', () => {
    expect(parseHash('#/ex/nb1-bar-color')).toEqual({ name: 'ex', id: 'nb1-bar-color' })
  })
  it('parses a sandbox route', () => {
    expect(parseHash('#/sandbox/cars')).toEqual({ name: 'sandbox', id: 'cars' })
    expect(parseHash('#/sandbox')).toEqual({ name: 'sandbox' })
  })
  it('defaults to the first exercise for empty or unknown hashes', () => {
    expect(parseHash('')).toEqual(first)
    expect(parseHash('#')).toEqual(first)
    expect(parseHash(undefined)).toEqual(first)
    expect(parseHash('#/nope/1')).toEqual(first)
    expect(parseHash('#/ex')).toEqual(first)
  })
  it('passes unknown exercise ids through for the page to resolve', () => {
    expect(parseHash('#/ex/gen-cars-b-1x')).toEqual({ name: 'ex', id: 'gen-cars-b-1x' })
  })
  it('decodes escapes and survives malformed ones', () => {
    expect(parseHash('#/ex/a%20b').id).toBe('a b')
    expect(parseHash('#/ex/%E0%A4%A').id).toBe('%E0%A4%A')
  })
})
