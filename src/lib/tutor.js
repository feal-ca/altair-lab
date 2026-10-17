// The "Explain what I missed" tutor: prompt building, stream parsing, and a small
// Markdown subset for showing replies. Plain ESM, no dependencies.

export const SYSTEM_PROMPT = `You are the tutor in AltairLab, where students learn Python's Altair charting library by recreating a target chart. Your job is to help them find the fix themselves, not to fix it for them.

Every student message starts with the exercise context: the task, the student's current code, the reference solution, the checker results, and (when there is one) the most visible difference between the two rendered charts. The context is always the latest, so judge the code shown there, not earlier versions. The rendered charts decide whether the exercise is solved; a failed check whose effect is invisible does not matter.

Rules:
- Address one thing per reply: the most important difference, or the Python error if there is one. Do not list the other differences, even if you see them; the student can ask again.
- Never write code: not the solution, not a corrected line, not a method call with its arguments. You may name one Altair method, parameter or type suffix in backticks, such as \`sort\` or \`:Q\`, but never its value.
- Say where to look and what to think about, then end with one short question that leads them to the fix.
- Keep it to two to four sentences. No headings, no lists.
- If they ask for more help on the same point, give one more step of detail, still without code or values. If they ask for the answer, point them to the "Show solution" button in the brief.
- General questions about concepts ("what does :N mean?") can be answered fully, with a tiny example that is not from this exercise.
- If the charts already match, say so briefly.
- Politely decline anything unrelated to this exercise, Altair, Vega-Lite or pandas.`

const fence = (code) => '```python\n' + code + '\n```'

// buildContext({ exercise, code, checks, message }) -> the context text sent with every student turn.
// `checks` is the checker's list (null when no chart was produced); `message` is the run's error text;
// `difference` is the visual comparison's one-line finding.
export function buildContext({ exercise, code, checks, message, difference }) {
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
  if (difference) parts.push('## Visible difference\n' + difference)
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
