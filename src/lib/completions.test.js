import { describe, expect, it } from 'vitest'
import { complete } from './completions.js'

const COLS = [
  { name: 'Horsepower', type: 'Q' },
  { name: 'Origin', type: 'N' },
  { name: 'Population (Millions)', type: 'Q' },
]

// `|` marks the cursor.
function at(src, explicit = false) {
  const pos = src.indexOf('|')
  const doc = src.slice(0, pos) + src.slice(pos + 1)
  const r = complete(doc, pos, COLS, explicit)
  return r && { ...r, labels: r.options.map((o) => o.label), typed: doc.slice(r.from, pos) }
}

describe('complete', () => {
  it('offers chart methods and every mark after `).`', () => {
    const r = at('alt.Chart(df).|')
    expect(r.labels).toEqual(expect.arrayContaining(['encode', 'properties', 'mark_bar', 'mark_square', 'mark_errorbar', 'transform_filter']))
    expect(r.labels).not.toContain('X')
    expect(at('alt.Chart(df).mark_|').typed).toBe('mark_')
  })

  it('offers chart methods on a multi-line chain and on a chart variable', () => {
    expect(at('alt.Chart(df).mark_bar().encode(\n  x="a"\n).|').labels).toContain('properties')
    expect(at('ch1 = alt.Chart(df).mark_line()\nch1.|').labels).toContain('encode')
    expect(at('a = alt.Chart(df)\nb = a.mark_point()\nc = a + b\nc.|').labels).toContain('resolve_scale')
  })

  it('stays quiet after a DataFrame variable or a number', () => {
    expect(at("df = pd.DataFrame({'a': [1]})\ndf.|")).toBeNull()
    expect(at('x = 1.|')).toBeNull()
  })

  it('offers alt members after `alt.`', () => {
    const r = at('alt.|')
    expect(r.labels).toEqual(expect.arrayContaining(['Chart', 'X', 'Color', 'Scale', 'condition', 'value', 'datum', 'layer', 'hconcat']))
    expect(r.options.find((o) => o.label === 'X').snippet).toBe("X('${1}')${2}")
  })

  it('offers channel methods after a channel class', () => {
    const r = at("alt.Chart(df).encode(alt.Y('Month:N').|")
    expect(r.labels).toEqual(expect.arrayContaining(['sort', 'scale', 'axis', 'title']))
    expect(r.labels).not.toContain('encode')
  })

  it('offers columns after alt.datum.', () => {
    expect(at('alt.datum.|').labels).toEqual(['Horsepower', 'Origin'])
  })

  it('offers mark properties inside mark_*(', () => {
    const r = at('alt.Chart(df).mark_point(|')
    expect(r.labels).toEqual(expect.arrayContaining(['shape=', 'filled=', 'size=', 'xOffset=']))
    expect(r.options.find((o) => o.label === 'shape=').snippet).toBe("shape='${1}'${2}")
  })

  it('offers channels inside encode(', () => {
    const r = at('alt.Chart(df).mark_point().encode(\n    |')
    expect(r).toBeNull()
    const typed = at('alt.Chart(df).mark_point().encode(\n    co|')
    expect(typed.labels).toEqual(expect.arrayContaining(['color=', 'alt.Color', 'x=']))
  })

  it('offers channel classes, condition and columns after `color=` in encode', () => {
    const r = at('alt.Chart(df).mark_point().encode(color=|')
    expect(r.labels[0]).toBe('alt.Color')
    expect(r.labels).toEqual(expect.arrayContaining(['alt.condition', 'alt.value', 'Origin']))
    expect(r.options.find((o) => o.label === 'Origin').apply).toBe("'Origin:N'")
  })

  it('offers typed columns and aggregates inside a channel string', () => {
    const r = at("alt.Chart(df).encode(alt.X('Ho|')")
    expect(r.typed).toBe('Ho')
    expect(r.options.find((o) => o.label === 'Horsepower').apply).toBe('Horsepower:Q')
    expect(r.labels).toContain('mean()')
    const enc = at("alt.Chart(df).encode(x='|')")
    expect(enc.labels).toContain('Origin')
  })

  it('completes the field inside an aggregate', () => {
    const r = at("alt.Chart(df).encode(alt.X('mean(Ho|'")
    expect(r.typed).toBe('Ho')
    expect(r.options.find((o) => o.label === 'Horsepower').apply).toBe('Horsepower):Q')
    expect(at("alt.Chart(df).encode(alt.X('mean(Ho|)'").options[0].apply).toBe('Horsepower')
  })

  it('keeps column names with spaces and brackets in one token', () => {
    const r = at("alt.Chart(df).encode(alt.Y('Population (M|')")
    expect(r.typed).toBe('Population (M')
    expect(r.labels).toContain('Population (Millions)')
  })

  it('offers value lists inside known string arguments', () => {
    expect(at("alt.Chart(df).mark_point(shape='|')").labels).toContain('triangle-up')
    expect(at("alt.Color('Origin:N').scale(scheme='|')").labels).toContain('tableau20')
    expect(at("alt.Scale(type='|')").labels).toContain('log')
    expect(at("alt.X('a', type='|')").labels).toContain('quantitative')
    expect(at("c.resolve_scale(color='|')").labels).toEqual(['independent', 'shared'])
    expect(at("alt.Chart(df).mark_bar(color='|')").labels).toContain('steelblue')
  })

  it('offers plain columns for groupby lists and datum expressions', () => {
    const r = at("c.transform_aggregate(m='mean(Horsepower)', groupby=['|'])")
    expect(r.options.find((o) => o.label === 'Origin').apply).toBe('Origin')
    expect(at("c.transform_filter('datum.Ho|')").labels).toContain('Horsepower')
  })

  it('stays quiet in titles, comments and plain code', () => {
    expect(at("c.properties(title='|')")).toBeNull()
    expect(at('# alt.|')).toBeNull()
    expect(at('x = |')).toBeNull()
  })

  it('offers scale, axis and booleans as keyword values', () => {
    expect(at("alt.X('a', scale=|").labels).toEqual(['alt.Scale'])
    expect(at("alt.X('a', title=|")).toBeNull()
    expect(at("alt.X('a', axis=a|").labels).toEqual(['alt.Axis', 'None'])
    expect(at('c.mark_point(filled=T|').labels).toEqual(['True', 'False'])
  })

  it('offers alt names for a bare word at top level', () => {
    expect(at('al|').labels).toContain('alt.Chart')
    expect(at('|')).toBeNull()
  })
})
