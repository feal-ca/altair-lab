// Gemini REST client used by the tutor, plus the learner's API key in localStorage.
// Plain ESM: the browser calls Google directly with the learner's own key.
import { createSseParser, eventText } from './tutor.js'

export const MODEL = 'gemini-3.8-flash'
const API = 'https://generativelanguage.googleapis.com/v1beta'
const KEY = 'altairlab:gemini-key'

// kind: 'key' | 'quota' | 'server' | 'network' | 'blocked' | 'other'
export class GeminiError extends Error {
  constructor(kind, message) {
    super(message)
    this.kind = kind
  }
}

const MESSAGES = {
  key: "Gemini didn't accept this key. Check it under AI key in the top bar.",
  quota: "You've reached the free Gemini limit for now. Wait a minute and try again.",
  server: 'Gemini is having trouble right now. Try again in a moment.',
  network: "Couldn't reach Gemini. Check your internet connection.",
  blocked: "Gemini declined to answer this one. Try rephrasing your question.",
}

async function errorFrom(res) {
  let error = {}
  try {
    error = (await res.json()).error ?? {}
  } catch {
    // Not JSON: fall back to the status code alone.
  }
  const reasons = (error.details ?? []).map((d) => d.reason)
  if (reasons.includes('API_KEY_INVALID') || res.status === 401 || res.status === 403) {
    return new GeminiError('key', MESSAGES.key)
  }
  if (res.status === 429) return new GeminiError('quota', MESSAGES.quota)
  if (res.status >= 500) return new GeminiError('server', MESSAGES.server)
  return new GeminiError('other', `Gemini returned an error (${res.status})${error.message ? ': ' + error.message : '.'}`)
}

async function send(fetchImpl, url, init) {
  try {
    return await fetchImpl(url, init)
  } catch (e) {
    if (e?.name === 'AbortError') throw e
    throw new GeminiError('network', MESSAGES.network)
  }
}

// streamGenerate({ key, body, signal, onText }) -> full reply text.
// onText receives the reply so far after every chunk.
export async function streamGenerate({ key, body, signal, onText, fetchImpl = globalThis.fetch }) {
  const res = await send(fetchImpl, `${API}/models/${MODEL}:streamGenerateContent?alt=sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) throw await errorFrom(res)

  const push = createSseParser()
  const decoder = new TextDecoder()
  const reader = res.body.getReader()
  let text = ''
  let blocked = false
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    for (const event of push(decoder.decode(value, { stream: true }))) {
      if (event.promptFeedback?.blockReason) blocked = true
      const piece = eventText(event)
      if (piece) {
        text += piece
        onText?.(text)
      }
    }
  }
  if (!text && blocked) throw new GeminiError('blocked', MESSAGES.blocked)
  return text
}

// testKey(key) -> true, or throws a GeminiError. Lists one model, which costs no tokens.
export async function testKey(key, fetchImpl = globalThis.fetch) {
  const res = await send(fetchImpl, `${API}/models?pageSize=1`, { headers: { 'x-goog-api-key': key } })
  if (!res.ok) throw await errorFrom(res)
  return true
}

// The key lives under its own localStorage entry, so resetting progress keeps it.
export function loadKey() {
  try {
    return globalThis.localStorage?.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveKey(key) {
  try {
    globalThis.localStorage?.setItem(KEY, key.trim())
    return true
  } catch {
    return false
  }
}

export function clearKey() {
  try {
    globalThis.localStorage?.removeItem(KEY)
  } catch {
    // Storage blocked: nothing was saved, so nothing to forget.
  }
}
