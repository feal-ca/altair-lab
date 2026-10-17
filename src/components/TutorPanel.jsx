import { useEffect, useRef, useState } from 'react'
import { buildContext, blocks, inline } from '../lib/tutor.js'
import { loadKey } from '../lib/gemini.js'
import { useTutor } from '../lib/useTutor.js'
import { KeyDialog } from './KeyDialog.jsx'
import './TutorPanel.css'

const EXPLAIN = 'Explain what I missed'

function Inline({ text }) {
  return inline(text).map((s, i) =>
    s.kind === 'code' ? <code key={i}>{s.text}</code> : s.kind === 'bold' ? <b key={i}>{s.text}</b> : s.text
  )
}

function Reply({ text }) {
  return blocks(text).map((b, i) => {
    if (b.type === 'pre') return <pre key={i}>{b.text}</pre>
    if (b.type === 'p') return <p key={i}><Inline text={b.text} /></p>
    const List = b.type
    return <List key={i}>{b.items.map((t, j) => <li key={j}><Inline text={t} /></li>)}</List>
  })
}

// The tutor under the check list. getRun() returns { code, checks, message } for the
// learner's latest run, read at send time so every turn carries the current code.
export function TutorPanel({ exercise, getRun, solved }) {
  const { messages, busy, send, clear } = useTutor()
  const [question, setQuestion] = useState('')
  const [keyOpen, setKeyOpen] = useState(false)
  const waiting = useRef(null)
  const end = useRef(null)

  useEffect(() => {
    if (messages.length) end.current?.scrollIntoView({ block: 'nearest' })
  }, [messages.length])

  // Runs `action(key)` now, or after the learner has entered a key.
  const withKey = (action) => {
    const key = loadKey()
    if (key) return action(key)
    waiting.current = action
    setKeyOpen(true)
  }

  const explain = () =>
    withKey((key) =>
      send(key, EXPLAIN, buildContext({ exercise, ...getRun() }) + "\n\nExplain what I'm missing compared with the target chart.")
    )

  const ask = (e) => {
    e.preventDefault()
    const q = question.trim()
    if (!q || busy) return
    withKey((key) => {
      setQuestion('')
      send(key, q, buildContext({ exercise, ...getRun() }) + "\n\n## Student's question\n" + q)
    })
  }

  if (solved && messages.length === 0) return null

  return (
    <section className="tutor" aria-label="Tutor">
      <div className="tutor-bar">
        {!solved && (
          <button type="button" className="tutor-explain" onClick={explain} disabled={busy}>
            {EXPLAIN}
          </button>
        )}
        {messages.length > 0 && (
          <button type="button" className="tutor-clear" onClick={clear}>Clear</button>
        )}
      </div>
      {messages.length > 0 && (
        <div className="tutor-thread" aria-live="polite">
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <p key={i} className="tutor-q">{m.text}</p>
            ) : m.error ? (
              <div key={i} className="tutor-a tutor-error" role="alert">
                <p>{m.error}</p>
                {m.errorKind === 'key' && (
                  <button type="button" className="link" onClick={() => setKeyOpen(true)}>Change key</button>
                )}
              </div>
            ) : (
              <div key={i} className="tutor-a">
                {m.text ? <Reply text={m.text} /> : <p className="tutor-wait">Thinking…</p>}
              </div>
            )
          )}
          <form className="tutor-ask" onSubmit={ask}>
            <textarea
              value={question}
              rows={2}
              placeholder="Ask a follow-up question"
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) ask(e)
              }}
            />
            <button type="submit" disabled={busy || !question.trim()}>Ask</button>
          </form>
          <div ref={end} />
        </div>
      )}
      <KeyDialog
        open={keyOpen}
        onClose={() => {
          setKeyOpen(false)
          waiting.current = null
        }}
        onSaved={(key) => {
          const action = waiting.current
          waiting.current = null
          action?.(key)
        }}
      />
    </section>
  )
}
