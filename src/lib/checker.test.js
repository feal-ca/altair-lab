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

  it('checks alt.condition as part of the channel', () => {
    const t = { mark: 'point', encoding: { color: { condition: { test: '(datum.Cylinders === 4)', value: 'red' }, value: 'blue' } } }
    const r = check(clone(t), t)
    expect(r.solved).toBe(true)
    expect(r.checks.find((c) => c.id === 'enc-0-color').label).toBe("color: if (datum.Cylinders === 4) → 'red', else 'blue'")
    const plainBlue = { mark: 'point', encoding: { color: { value: 'blue' } } }
    expect(failed(check(plainBlue, t))).toEqual(['enc-0-color'])
    const flipped = { mark: 'point', encoding: { color: { condition: { test: '(datum.Cylinders === 4)', value: 'blue' }, value: 'red' } } }
    expect(check(flipped, t).solved).toBe(false)
  })

  it('accepts alt.condition where the target used alt.when', () => {
    const t = targets['exam-cars-condition']
    const u = clone(t)
    // alt.condition writes the condition object; alt.when writes a one-item list.
    expect(Array.isArray(t.encoding.color.condition)).toBe(true)
    u.encoding.color.condition = u.encoding.color.condition[0]
    expect(failed(check(u, t))).toEqual([])
  })

  it('matches selections by definition, not by name', () => {
    const t = targets['bk-point-highlight']
    const name = t.params[0].name
    const u = JSON.parse(JSON.stringify(t).replaceAll(name, 'my_selection'))
    const r = check(u, t)
    expect(failed(r)).toEqual([])
    expect(r.interactionOk).toBe(true)
  })

  it('renames parameters used inside expressions', () => {
    const t = targets['bk-threshold-slider']
    const name = t.params[0].name
    expect(JSON.stringify(t.encoding.color)).toContain(name)
    const u = JSON.parse(JSON.stringify(t).replaceAll(name, 'cut'))
    expect(check(u, t).solved).toBe(true)
  })

  it('a chart without the selection fails the param check and interactionOk', () => {
    const t = targets['bk-brush-x']
    const u = clone(t)
    delete u.params
    const r = check(u, t)
    expect(failed(r)).toContain('param-0')
    expect(r.interactionOk).toBe(false)
    expect(r.checks.find((c) => c.id === 'param-0').label).toBe("selection_interval(encodings=[\"x\"])")
  })

  it('labels widget-bound parameters by their widget', () => {
    const r = check(clone(targets['bk-slider-filter']), targets['bk-slider-filter'])
    expect(r.checks.find((c) => c.id === 'param-0').label).toBe('param(value=1960), bound to a slider 1960–2005')
    const z = check(clone(targets['bk-interactive-zoom']), targets['bk-interactive-zoom'])
    expect(z.checks.find((c) => c.id === 'param-0').label).toMatch(/^zoom & pan/)
  })

  it("treats on='mouseover' like on='pointerover'", () => {
    const t = targets['bk-hover-rule']
    const u = JSON.parse(JSON.stringify(t).replaceAll('"pointerover"', '"mouseover"'))
    expect(JSON.stringify(u)).toContain('mouseover')
    expect(check(u, t).solved).toBe(true)
  })

  it('checks repeat fields, projections and configure_* calls', () => {
    const rep = targets['bk-repeat-matrix']
    const u1 = clone(rep)
    u1.repeat.row = ['Cylinders', 'Horsepower']
    expect(failed(check(u1, rep))).toEqual(['repeat'])

    const map = targets['bk-choropleth']
    const u2 = clone(map)
    delete u2.projection
    expect(failed(check(u2, map))).toEqual(['proj-0'])

    const cfg = targets['bk-legend-config']
    const u3 = clone(cfg)
    delete u3.config.legend.orient
    expect(failed(check(u3, cfg))).toEqual(['config-legend-orient'])
  })

  it('checks each axis and legend option', () => {
    const t = targets['bk-axis-style']
    const u = clone(t)
    delete u.encoding.x.axis.labelAngle
    expect(failed(check(u, t))).toEqual(['opt-0-x-axis-labelAngle'])
  })
})
