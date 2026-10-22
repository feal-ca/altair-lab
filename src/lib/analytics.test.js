import { describe, it, expect } from 'vitest'
import { countPath } from './analytics.js'

describe('countPath', () => {
  it('turns the hash route into a path', () => {
    expect(countPath('#/ex/nb1-bar-color')).toBe('/ex/nb1-bar-color')
    expect(countPath('#/sandbox/cars')).toBe('/sandbox/cars')
    expect(countPath('#/sandbox')).toBe('/sandbox')
  })
  it('counts an empty hash as the root', () => {
    expect(countPath('')).toBe('/')
    expect(countPath('#')).toBe('/')
    expect(countPath(undefined)).toBe('/')
  })
  it('drops the seed from generated exercises', () => {
    expect(countPath('#/ex/gen-cars-b-lz3k9q1a')).toBe('/ex/gen-cars-b')
    expect(countPath('#/ex/gen-seattle_weather-i-abc')).toBe('/ex/gen-seattle_weather-i')
  })
  it('groups uploaded CSV sandboxes', () => {
    expect(countPath('#/sandbox/csv_lz3k9q1a')).toBe('/sandbox/csv')
  })
})
