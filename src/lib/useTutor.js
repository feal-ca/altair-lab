import { useCallback, useEffect, useRef, useState } from 'react'
import { buildRequest } from './tutor.js'
import { streamGenerate } from './gemini.js'

// One tutor conversation, kept in memory (a new exercise or a reload starts fresh).
// Messages: { role: 'user', text, prompt } | { role: 'model', text, error?, errorKind? }.
export function useTutor() {
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const abort = useRef(null)
  const latest = useRef(messages)
  latest.current = messages

  useEffect(() => () => abort.current?.abort(), [])

  // send(key, text, prompt): `text` is what the learner sees, `prompt` what Gemini gets.
  const send = useCallback(async (key, text, prompt) => {
    const controller = new AbortController()
    abort.current = controller
    setBusy(true)
    const setReply = (reply) =>
      setMessages((ms) => (ms.at(-1)?.pending ? [...ms.slice(0, -1), { ...ms.at(-1), ...reply }] : ms))
    // Read from the ref: an updater function may run later, during render.
    const history = [...latest.current, { role: 'user', text, prompt }]
    setMessages([...history, { role: 'model', text: '', pending: true }])
    try {
      const full = await streamGenerate({
        key,
        body: buildRequest(history),
        signal: controller.signal,
        onText: (t) => setReply({ text: t }),
      })
      setReply({ text: full || 'Gemini sent an empty reply. Try asking again.', pending: false })
    } catch (e) {
      if (e?.name === 'AbortError') return
      setReply({ text: '', error: e.message, errorKind: e.kind, pending: false })
    } finally {
      if (abort.current === controller) {
        abort.current = null
        setBusy(false)
      }
    }
  }, [])

  const clear = useCallback(() => {
    abort.current?.abort()
    abort.current = null
    setBusy(false)
    setMessages([])
  }, [])

  return { messages, busy, send, clear }
}
