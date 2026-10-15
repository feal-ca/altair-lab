import { describe, it, expect } from 'vitest'
import targets from '../content/targets.json'
import { check, normalize } from './checker.js'

const clone = (x) => JSON.parse(JSON.stringify(x))
const failed = (r) => r.checks.filter((c) => !c.passed).map((c) => c.id)

describe('checker', () => {
  it.each(Object.keys(targets))('target %s solves itself', (id) => {
    const r = check(clone(targets[id]), targets[id])
    expect(failed(r)).toEqual([])
    expect(r.solved).toBe(true)
    expect(r.checks.length).toBeGreaterThan(1)
  })

  it('lollipop without sort on layer 2 y fails exactly opt-1-y-sort', () => {
    const t = targets['nb2-lollipop-eu']
    const u = clone(t)
    delete u.layer[1].encoding.y.sort
    const r = check(u, t)
    expect(r.solved).toBe(false)
    expect(failed(r)).toEqual(['opt-1-y-sort'])
    expect(r.checks.find((c) => c.id === 'opt-1-y-sort').label).toMatch(/^layer 2: y: sort/)
  })

  it('tolerates extras, string marks and key order (Review Focus 5)', () => {
    const t = { mark: 'bar', encoding: { x: { field: 'a', type: 'nominal' } } }
    const u = { mark: { type: 'bar', tooltip: true }, encoding: { x: { type: 'nominal', field: 'a' }, tooltip: { field: 'b', type: 'quantitative' } } }
    expect(check(u, t).solved).toBe(true)
  })

  it('layer count mismatch fails structure without throwing', () => {
    const t = targets['nb2-connected-dot']
    const u = { layer: [clone(t.layer[0])] }
    const r = check(u, t)
    expect(r.checks[0]).toMatchObject({ id: 'structure', passed: false })
    expect(r.solved).toBe(false)
  })

  it('top-level shared encoding is merged into layers', () => {
    const u = { encoding: { x: { field: 'a', type: 'nominal' } }, layer: [{ mark: 'bar' }, { mark: 'point' }] }
    const t = { layer: [{ mark: 'bar', encoding: { x: { field: 'a', type: 'nominal' } } }, { mark: 'point', encoding: { x: { field: 'a', type: 'nominal' } } }] }
    expect(check(u, t).solved).toBe(true)
  })

  it('transform key order does not matter', () => {
    const t = { mark: 'bar', transform: [{ calculate: 'x', as: 'y' }] }
    const u = { mark: 'bar', transform: [{ as: 'y', calculate: 'x' }] }
    expect(check(u, t).solved).toBe(true)
    expect(check({ mark: 'bar', transform: [{ calculate: 'z', as: 'y' }] }, t).solved).toBe(false)
  })

  it('check(null, target) fails every check', () => {
    const r = check(null, targets['nb2-bump-tennis'])
    expect(r.solved).toBe(false)
    expect(r.checks.length).toBeGreaterThan(0)
    expect(r.checks.every((c) => !c.passed)).toBe(true)
  })

  it('never throws on odd input', () => {
    const t = targets['nb2-lollipop-eu']
    for (const u of [undefined, 5, 'x', [], {}, { layer: 'no' }, { layer: [null, 3] }, { mark: 5, encoding: 'x' }]) {
      expect(() => check(u, t)).not.toThrow()
      expect(check(u, t).solved).toBe(false)
    }
  })

  it('resolve is checked per leaf', () => {
    const t = targets['nb2-superposition-jobs']
    const u = clone(t)
    delete u.resolve
    const r = check(u, t)
    expect(failed(r)).toEqual(['resolve-scale-color'])
    expect(r.checks.find((c) => c.id === 'resolve-scale-color').label).toBe('resolve: color scale independent')
  })

  it('omits layer prefix for single views and uses 0-based ids', () => {
    const r = check(clone(targets['nb1-jobs-scale']), targets['nb1-jobs-scale'])
    expect(r.checks.some((c) => /^(layer|panel) /.test(c.label))).toBe(false)
    expect(r.checks.some((c) => c.id === 'mark-0')).toBe(true)
  })

  it('normalize handles concat, facet and nested layers', () => {
    const h = normalize({ hconcat: [{ mark: 'bar' }, { layer: [{ mark: 'point' }, { mark: 'line' }] }] })
    expect(h.layout).toBe('hconcat')
    expect(h.views.map((v) => v.mark.type)).toEqual(['bar', 'point', 'line'])
    const f = normalize({ facet: { field: 'a' }, spec: { mark: 'bar' } })
    expect(f.layout).toBe('facet')
    expect(f.views).toHaveLength(1)
    expect(normalize({ mark: 'bar', title: { text: 'T' } }).title).toBe('T')
  })

  it('layer encoding merges per key with the parent channel', () => {
    const t = { layer: [{ mark: 'bar', encoding: { x: { field: 'a', type: 'nominal', title: 'B' } } }] }
    const u = { encoding: { x: { field: 'a', type: 'nominal' } }, layer: [{ mark: 'bar', encoding: { x: { title: 'B' } } }] }
    expect(check(u, t).solved).toBe(true)
  })

  it('array channels match by identity, any order, ignoring extra item keys', () => {
    const t = { mark: 'bar', encoding: { tooltip: [{ field: 'year' }, { field: 'rank', type: 'quantitative' }] } }
    const u = { mark: 'bar', encoding: { tooltip: [{ field: 'rank', type: 'quantitative', format: '.1f' }, { field: 'year', title: 'Year' }, { field: 'x' }] } }
    expect(check(u, t).solved).toBe(true)
    const bad = { mark: 'bar', encoding: { tooltip: [{ field: 'year' }] } }
    expect(check(bad, t).solved).toBe(false)
  })
})
