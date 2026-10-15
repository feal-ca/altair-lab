import { describe, it, expect } from 'vitest'
import { parseCsv, inferColumns, datasetFromCsv } from './csv.js'

describe('parseCsv', () => {
  it('keeps a quoted comma inside one cell', () => {
    const r = parseCsv('a,b\n1,"x,y"\n')
    expect(r.error).toBeUndefined()
    expect(r.headers).toEqual(['a', 'b'])
    expect(r.rows).toEqual([{ a: 1, b: 'x,y' }])
  })

  it('unescapes doubled quotes inside a quoted cell', () => {
    const r = parseCsv('a\n"say ""hi"""\n')
    expect(r.rows).toEqual([{ a: 'say "hi"' }])
  })

  it('accepts CRLF line endings', () => {
    const r = parseCsv('a,b\r\n1,2\r\n3,4\r\n')
    expect(r.headers).toEqual(['a', 'b'])
    expect(r.rows).toEqual([{ a: 1, b: 2 }, { a: 3, b: 4 }])
  })

  it('ignores a trailing newline', () => {
    const r = parseCsv('a\n1\n2\n')
    expect(r.rows).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('reads an empty cell as null', () => {
    const r = parseCsv('a,b\n1,\n,2\n')
    expect(r.rows).toEqual([{ a: 1, b: null }, { a: null, b: 2 }])
  })

  it('fills missing keys with null on a ragged row without throwing', () => {
    const r = parseCsv('a,b,c\n1,2\n')
    expect(r.error).toBeUndefined()
    expect(r.rows).toEqual([{ a: 1, b: 2, c: null }])
  })

  it('reports a header-only file as an error', () => {
    const r = parseCsv('a,b\n')
    expect(typeof r.error).toBe('string')
  })

  it('reports an empty string as an error', () => {
    const r = parseCsv('')
    expect(typeof r.error).toBe('string')
  })

  it('reports more than 5,000 data rows as an error naming the limit', () => {
    const lines = ['a']
    for (let i = 0; i < 5001; i++) lines.push(String(i))
    const r = parseCsv(lines.join('\n'))
    expect(typeof r.error).toBe('string')
    expect(r.error).toContain('5,000')
  })

  it('accepts exactly 5,000 data rows', () => {
    const lines = ['a']
    for (let i = 0; i < 5000; i++) lines.push(String(i))
    const r = parseCsv(lines.join('\n'))
    expect(r.error).toBeUndefined()
    expect(r.rows).toHaveLength(5000)
  })

  it('reports text over 1 MB as an error naming the limit', () => {
    const big = 'a\n' + 'x'.repeat(1024 * 1024)
    const r = parseCsv(big)
    expect(typeof r.error).toBe('string')
    expect(r.error).toContain('1 MB')
  })

  it('reports an unterminated quoted field as an error', () => {
    const r = parseCsv('a\n"oops\n')
    expect(typeof r.error).toBe('string')
  })
})

describe('inferColumns', () => {
  it('marks an all-numeric column Q with min, max and mean', () => {
    const cols = inferColumns(['v'], [{ v: '1' }, { v: '2.5' }, { v: '' }])
    expect(cols).toEqual([{ name: 'v', type: 'Q', min: 1, max: 2.5, mean: 1.75 }])
  })

  it('marks an ISO date column T', () => {
    const cols = inferColumns(['d'], [{ d: '2020-01-01' }])
    expect(cols[0].type).toBe('T')
  })

  it('marks a mixed column N with unique count and first three distinct samples', () => {
    const rows = [{ c: 'a' }, { c: 'b' }, { c: 'a' }, { c: 'c' }, { c: 'd' }, { c: null }]
    const cols = inferColumns(['c'], rows)
    expect(cols).toEqual([{ name: 'c', type: 'N', unique: 4, sample: 'a, b, c' }])
  })

  it('treats a column with no non-empty values as N', () => {
    const cols = inferColumns(['e'], [{ e: null }, { e: '' }])
    expect(cols[0].type).toBe('N')
  })
})

describe('datasetFromCsv', () => {
  const text = 'name,score\nAna,10\nBen,20\n'

  it('builds a DATASETS-shaped object', () => {
    const d = datasetFromCsv('Scores', text)
    expect(d.error).toBeUndefined()
    expect(d.id.startsWith('csv_')).toBe(true)
    expect(d.name).toBe('Scores')
    expect(d.varName).toBe('df')
    expect(d.source).toBe('inline')
    expect(d.description).toBe('Uploaded CSV · 2 rows · 2 columns')
    expect(d.rows).toHaveLength(2)
    expect(d.preview).toEqual(d.rows)
    expect(d.columns.map((c) => c.type)).toEqual(['N', 'Q'])
  })

  it('limits the preview to the first five rows', () => {
    const lines = ['a']
    for (let i = 0; i < 12; i++) lines.push(String(i))
    const d = datasetFromCsv('Long', lines.join('\n'))
    expect(d.rows).toHaveLength(12)
    expect(d.preview).toHaveLength(5)
  })

  it('setupCode reads the CSV text with pandas', () => {
    const d = datasetFromCsv('Scores', text)
    expect(d.setupCode).toContain('pd.read_csv(io.StringIO(')
  })

  it('returns an error for unusable input', () => {
    expect(typeof datasetFromCsv('x', '').error).toBe('string')
  })
})
