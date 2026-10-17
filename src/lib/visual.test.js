import { describe, it, expect } from 'vitest'
import { sceneOf, compareScenes } from './visual.js'
import targets from '../content/targets.json'

const values = [
  { brand: 'A', price: 3, kind: 'x' },
  { brand: 'B', price: 7, kind: 'y' },
  { brand: 'C', price: 5, kind: 'x' },
]
const bar = (extra = {}) => ({
  data: { values },
  mark: 'bar',
  encoding: { x: { field: 'brand', type: 'nominal' }, y: { field: 'price', type: 'quantitative' } },
  ...extra,
})
const compare = async (target, mine) => compareScenes(await sceneOf(target), await sceneOf(mine))

describe('compareScenes', () => {
  it('treats two specs that draw the same chart as the same', async () => {
    const redundant = bar()
    redundant.encoding = {
      x: { field: 'brand', type: 'nominal', title: 'brand' },
      y: { field: 'price', type: 'quantitative', scale: { zero: true } },
    }
    expect(await compare(bar(), redundant)).toEqual({ same: true, difference: null })
  })

  it('ignores the order of the data rows', async () => {
    expect((await compare(bar(), bar({ data: { values: [...values].reverse() } }))).same).toBe(true)
  })

  it('names a uniform mark property that differs', async () => {
    const point = (opacity) => ({ ...bar(), mark: { type: 'point', filled: true, ...(opacity ? { opacity } : {}) } })
    expect(await compare(point(1), point())).toEqual({ same: false, difference: 'Point opacity: yours 0.7, target 1.' })
  })

  it('counts missing marks', async () => {
    const two = bar({ data: { values: values.slice(0, 2) } })
    expect((await compare(bar(), two)).difference).toBe('The target has 3 bars; yours has 2.')
  })

  it('reports colours that differ', async () => {
    const coloured = (scheme) => bar({ encoding: { ...bar().encoding, color: { field: 'kind', type: 'nominal', scale: { scheme } } } })
    expect((await compare(coloured('set2'), coloured('category10'))).difference).toBe('Bar colours differ from the target.')
  })

  it('reports a title that differs', async () => {
    expect((await compare(bar({ title: 'Prices' }), bar({ title: 'Price' }))).difference).toBe('Title: yours "Price", target "Prices".')
    expect((await compare(bar({ title: 'Prices' }), bar())).difference).toBe('The target has the title "Prices"; yours has none.')
  })

  it('reports axis labels in a different order', async () => {
    const sorted = bar()
    sorted.encoding = { ...bar().encoding, x: { field: 'brand', type: 'nominal', sort: '-y' } }
    expect((await compare(sorted, bar())).difference).toBe('X axis labels are in a different order: the target starts with B, C, A.')
  })

  it('reports an axis title that differs', async () => {
    const titled = bar()
    titled.encoding = { ...bar().encoding, y: { field: 'price', type: 'quantitative', title: 'Price (€)' } }
    expect((await compare(titled, bar())).difference).toBe('Y axis title: yours "price", target "Price (€)".')
  })

  it('counts tooltips as part of the chart', async () => {
    const tip = bar()
    tip.encoding = { ...bar().encoding, tooltip: { field: 'kind', type: 'nominal' } }
    expect((await compare(tip, bar())).difference).toBe('Bar tooltips differ from the target.')
  })

  it('reports a different chart size first', async () => {
    expect((await compare(bar({ width: 400 }), bar({ width: 300, title: 'x' }))).difference).toBe('Chart size: yours 300×300, target 400×300.')
  })
})

describe('curated targets', () => {
  it('all render, and each matches itself', async () => {
    for (const [id, spec] of Object.entries(targets)) {
      if (!spec) continue
      const scene = await sceneOf(spec)
      expect(scene.items.length, id).toBeGreaterThan(0)
      expect(compareScenes(scene, await sceneOf(structuredClone(spec))).same, id).toBe(true)
    }
  })
})
