import { describe, it, expect } from 'vitest'
import { buildContext, buildRequest, createSseParser, eventText, blocks, inline, SYSTEM_PROMPT } from './tutor.js'

const exercise = {
  task: 'Draw a bar chart of mean price by brand.',
  solution: "alt.Chart(df).mark_bar().encode(x='brand:N', y='mean(price):Q')",
}
const checks = [
  { id: 'mark-0', label: 'mark_bar()', passed: true },
  { id: 'enc-0-y', label: 'y: mean(price) (Q)', passed: false },
]

describe('buildContext', () => {
  it('includes the task, the code, the solution and each check by result', () => {
    const text = buildContext({ exercise, code: "alt.Chart(df).mark_bar().encode(x='brand:N', y='price:Q')", checks })
    expect(text).toContain(exercise.task)
    expect(text).toContain("y='price:Q'")
    expect(text).toContain(exercise.solution)
    expect(text).toMatch(/Passed:\n- mark_bar\(\)/)
    expect(text).toMatch(/Not yet:\n- y: mean\(price\) \(Q\)/)
  })

  it('reports the Python error when the code produced no chart', () => {
    const text = buildContext({ exercise, code: 'alt.Chart(df).mark_bar(', checks: null, message: 'Line 1: SyntaxError: unexpected EOF' })
    expect(text).toContain('Line 1: SyntaxError: unexpected EOF')
    expect(text).not.toContain('Passed:')
  })

  it('says when the editor is empty', () => {
    expect(buildContext({ exercise, code: '  ', checks: null })).toContain('(the editor is empty)')
  })
})

describe('buildRequest', () => {
  it('sends the system prompt and maps user prompts and model replies to turns', () => {
    const body = buildRequest([
      { role: 'user', text: 'Explain what I missed', prompt: 'CONTEXT 1' },
      { role: 'model', text: 'Your y channel is not aggregated.' },
      { role: 'user', text: 'Why mean?', prompt: 'CONTEXT 2\nWhy mean?' },
    ])
    expect(body.systemInstruction.parts[0].text).toBe(SYSTEM_PROMPT)
    expect(body.contents).toEqual([
      { role: 'user', parts: [{ text: 'CONTEXT 1' }] },
      { role: 'model', parts: [{ text: 'Your y channel is not aggregated.' }] },
      { role: 'user', parts: [{ text: 'CONTEXT 2\nWhy mean?' }] },
    ])
  })

  it('drops a failed exchange so turns keep alternating', () => {
    const body = buildRequest([
      { role: 'user', text: 'Explain', prompt: 'A' },
      { role: 'model', text: '', error: 'quota' },
      { role: 'user', text: 'Explain', prompt: 'B' },
    ])
    expect(body.contents.map((c) => c.parts[0].text)).toEqual(['B'])
  })
})

describe('createSseParser', () => {
  const event = (text) => `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] })}\r\n\r\n`

  it('returns complete events and keeps a partial line for the next chunk', () => {
    const push = createSseParser()
    const whole = event('Hello ') + event('there')
    const cut = whole.length - 10
    expect(push(whole.slice(0, cut)).map(eventText)).toEqual(['Hello '])
    expect(push(whole.slice(cut)).map(eventText)).toEqual(['there'])
  })

  it('ignores lines that are not data lines', () => {
    expect(createSseParser()(': keep-alive\n\n')).toEqual([])
  })
})

describe('eventText', () => {
  it('skips thought parts', () => {
    const ev = { candidates: [{ content: { parts: [{ text: 'thinking…', thought: true }, { text: 'Answer' }] } }] }
    expect(eventText(ev)).toBe('Answer')
  })

  it('returns an empty string for events without text', () => {
    expect(eventText({ usageMetadata: {} })).toBe('')
  })
})

describe('blocks', () => {
  it('splits paragraphs, bullet lists and fenced code', () => {
    const text = 'First line\nstill first.\n\n- one\n- two\n\n```python\nx = 1\n```\nLast.'
    expect(blocks(text)).toEqual([
      { type: 'p', text: 'First line\nstill first.' },
      { type: 'ul', items: ['one', 'two'] },
      { type: 'pre', text: 'x = 1' },
      { type: 'p', text: 'Last.' },
    ])
  })

  it('shows an unclosed fence (still streaming) as code', () => {
    expect(blocks('See:\n```\nalt.Chart(')).toEqual([
      { type: 'p', text: 'See:' },
      { type: 'pre', text: 'alt.Chart(' },
    ])
  })

  it('reads numbered items as a list', () => {
    expect(blocks('1. a\n2. b')).toEqual([{ type: 'ol', items: ['a', 'b'] }])
  })
})

describe('inline', () => {
  it('marks code spans and bold text', () => {
    expect(inline('Use `mean()` on **y** here')).toEqual([
      { kind: 'text', text: 'Use ' },
      { kind: 'code', text: 'mean()' },
      { kind: 'text', text: ' on ' },
      { kind: 'bold', text: 'y' },
      { kind: 'text', text: ' here' },
    ])
  })
})
