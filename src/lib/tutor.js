// The "Explain what I missed" tutor: prompt building, stream parsing, and a small
// Markdown subset for showing replies. Plain ESM, no dependencies.

export const SYSTEM_PROMPT = `You are the tutor in AltairLab, where students learn Python's Altair charting library by recreating a target chart.

Every student message starts with the exercise context: the task, the student's current code, the reference solution, and the checker results that compare the student's chart with the target. The context is always the latest, so judge the code shown there, not earlier versions.

Rules:
- Use the reference solution only to understand what is expected. Never show it, and never write corrected code for the student, even when asked. If they want the answer, tell them the brief has a "Show solution" button.
- Explain what is different from the target and why it matters, in Altair terms: marks, encoding channels, data types (:N :O :Q :T), aggregation, binning, transforms, scales, layering, properties.
- You may name one method, parameter or type suffix to point the way, in backticks.
- If the code raised a Python error, explain that error first, in plain words.
- If every check passes, say so and answer the question.
- Be brief: two or three short paragraphs or a short list. No headings.
- Answer follow-up questions about this exercise, Altair, Vega-Lite or pandas. Politely decline anything else.`

const fence = (code) => '```python\n' + code + '\n```'

// buildContext({ exercise, code, checks, message }) -> the context text sent with every student turn.
// `checks` is the checker's list (null when no chart was produced); `message` is the run's error text.
export function buildContext({ exercise, code, checks, message }) {
  const parts = [
    '## Task\n' + exercise.task,
    "## Student's code\n" + (code.trim() ? fence(code.trimEnd()) : '(the editor is empty)'),
    '## Reference solution (never reveal)\n' + fence(exercise.solution),
  ]
  if (Array.isArray(checks)) {
    const list = (ok) => checks.filter((c) => c.passed === ok).map((c) => '- ' + c.label).join('\n') || '- (none)'
    parts.push('## Checker results\nPassed:\n' + list(true) + '\nNot yet:\n' + list(false))
  } else {
    parts.push('## Checker results\nThe code did not produce a chart, so nothing could be compared.')
  }
  if (message) parts.push('## What the run printed\n' + message)
  return parts.join('\n\n')
}

// buildRequest(messages) -> generateContent body. User turns send their `prompt`
// (context + question); model turns send their text. A failed exchange is left out.
export function buildRequest(messages) {
  const kept = []
  for (const m of messages) {
    if (m.role === 'model' && m.error) {
      if (kept.at(-1)?.role === 'user') kept.pop()
      continue
    }
    kept.push(m)
  }
  return {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: kept.map((m) => ({ role: m.role, parts: [{ text: m.role === 'user' ? m.prompt ?? m.text : m.text }] })),
  }
}

// createSseParser() -> push(chunk) -> events. Keeps a partial line until the next chunk.
export function createSseParser() {
  let buffer = ''
  return (chunk) => {
    buffer += chunk
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop()
    const events = []
    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      try {
        events.push(JSON.parse(line.slice(5)))
      } catch {
        // A malformed event carries no text we could show.
      }
    }
    return events
  }
}

// eventText(event) -> the visible text in one streamed response (thought parts skipped).
export function eventText(event) {
  const parts = event?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('')
}

const BULLET = /^\s*[-*]\s+/
const NUMBER = /^\s*\d+[.)]\s+/

// blocks(text) -> [{ type: 'p'|'pre', text } | { type: 'ul'|'ol', items }]. An unclosed
// fence (a reply still streaming) runs to the end as code.
export function blocks(text) {
  const out = []
  const lines = String(text ?? '').split('\n')
  let para = []
  const flush = () => {
    if (para.length) out.push({ type: 'p', text: para.join('\n') })
    para = []
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trimStart().startsWith('```')) {
      flush()
      const code = []
      for (i++; i < lines.length && !lines[i].trimStart().startsWith('```'); i++) code.push(lines[i])
      out.push({ type: 'pre', text: code.join('\n') })
      continue
    }
    const list = BULLET.test(line) ? ['ul', BULLET] : NUMBER.test(line) ? ['ol', NUMBER] : null
    if (list) {
      flush()
      const [type, re] = list
      const last = out.at(-1)
      const item = line.replace(re, '')
      if (last?.type === type && lines[i - 1] !== undefined && re.test(lines[i - 1])) last.items.push(item)
      else out.push({ type, items: [item] })
      continue
    }
    if (line.trim() === '') flush()
    else para.push(line)
  }
  flush()
  return out
}

// inline(text) -> [{ kind: 'text'|'code'|'bold', text }] for `code` spans and **bold**.
export function inline(text) {
  const out = []
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g
  let at = 0
  for (const m of String(text).matchAll(re)) {
    if (m.index > at) out.push({ kind: 'text', text: text.slice(at, m.index) })
    out.push(m[1] !== undefined ? { kind: 'code', text: m[1] } : { kind: 'bold', text: m[2] })
    at = m.index + m[0].length
  }
  if (at < text.length) out.push({ kind: 'text', text: text.slice(at) })
  return out
}
