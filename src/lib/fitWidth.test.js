import { describe, expect, it } from 'vitest'
import targets from '../content/targets.json'
import { fitWidth } from './fitWidth.js'

const stretched = (s) => fitWidth(s).width === 'container'

describe('fitWidth', () => {
  it('stretches single and layered views without a width', () => {
    expect(stretched(targets['nb1-bar-color'])).toBe(true)
    expect(stretched(targets['mv-dual-axis'])).toBe(true)
    expect(fitWidth(targets['nb1-bar-color']).autosize).toEqual({ type: 'fit-x', contains: 'padding' })
  })

  it('leaves concatenated, faceted and fixed-width charts alone', () => {
    expect(fitWidth(targets['mv-hconcat-weather'])).toBe(targets['mv-hconcat-weather'])
    expect(fitWidth(targets['mv-vconcat-stocks'])).toBe(targets['mv-vconcat-stocks'])
    expect(stretched(targets['nb1-barley-grouped'])).toBe(false)
    expect(stretched(targets['exam-slope-parliament'])).toBe(false)
  })

  it('does not mutate the spec it is given', () => {
    const spec = { mark: 'bar', encoding: {} }
    fitWidth(spec)
    expect(spec).toEqual({ mark: 'bar', encoding: {} })
  })

  it('ignores missing specs', () => {
    expect(fitWidth(null)).toBe(null)
    expect(fitWidth(undefined)).toBe(undefined)
  })
})
