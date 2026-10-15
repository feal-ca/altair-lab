import { describe, it, expect } from 'vitest'
import { formatError, resultToOutput, DOWNLOAD_HINT } from './formatResult.js'

describe('formatError', () => {
  it('prefixes line and type, truncating long messages', () => {
    expect(formatError({ type: 'NameError', message: 'x', line: 3 })).toBe('Line 3: NameError: x')
    expect(formatError({ type: 'E', message: 'a'.repeat(500), line: 1 }).length).toBe('Line 1: E: '.length + 400)
  })
  it('adds the download hint for network failures', () => {
    expect(formatError({ type: 'URLError', message: 'boom', line: 2 })).toContain(DOWNLOAD_HINT)
    expect(formatError({ type: 'ValueError', message: 'urlopen failed', line: 2 })).toContain(DOWNLOAD_HINT)
    expect(formatError({ type: 'ValueError', message: 'bad', line: 2 })).not.toContain(DOWNLOAD_HINT)
  })
})

describe('resultToOutput', () => {
  it('maps each result kind', () => {
    expect(resultToOutput({ spec: { a: 1 } })).toEqual({ spec: { a: 1 } })
    expect(resultToOutput({ stale: true })).toEqual({ stale: true })
    expect(resultToOutput({ timeout: true }).message).toMatch(/10 seconds/)
    expect(resultToOutput({ noChart: true }).message).toMatch(/last line/)
  })
})
