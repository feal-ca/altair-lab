import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { streamGenerate, testKey, loadKey, saveKey, clearKey, GeminiError, MODEL } from './gemini.js'

const sse = (texts) =>
  texts.map((t) => `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: t }] } }] })}\r\n\r\n`).join('')

// A fetch stand-in that records the call and answers with a streamed body.
function fakeFetch(status, body) {
  const calls = []
  const fn = async (url, init) => {
    calls.push({ url, init })
    const bytes = new TextEncoder().encode(body)
    const stream = new ReadableStream({
      start(c) {
        // Two chunks, split mid-event, like a real network read.
        c.enqueue(bytes.slice(0, 20))
        c.enqueue(bytes.slice(20))
        c.close()
      },
    })
    return new Response(stream, { status })
  }
  fn.calls = calls
  return fn
}

const errorBody = (code, status, message, reason) =>
  JSON.stringify({ error: { code, status, message, details: reason ? [{ reason }] : [] } })

describe('streamGenerate', () => {
  it('posts to the streaming endpoint with the key in a header', async () => {
    const fetchImpl = fakeFetch(200, sse(['Hi']))
    await streamGenerate({ key: 'k-123', body: { contents: [] }, fetchImpl })
    const { url, init } = fetchImpl.calls[0]
    expect(url).toBe(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`)
    expect(init.method).toBe('POST')
    expect(init.headers['x-goog-api-key']).toBe('k-123')
    expect(url).not.toContain('k-123')
  })

  it('reports text as it arrives and resolves with the whole reply', async () => {
    const seen = []
    const full = await streamGenerate({
      key: 'k',
      body: {},
      fetchImpl: fakeFetch(200, sse(['Your ', 'y channel ', 'needs mean.'])),
      onText: (t) => seen.push(t),
    })
    expect(full).toBe('Your y channel needs mean.')
    expect(seen.at(-1)).toBe(full)
  })

  it('turns a rejected key into a key error', async () => {
    const fetchImpl = fakeFetch(400, errorBody(400, 'INVALID_ARGUMENT', 'API key not valid.', 'API_KEY_INVALID'))
    const err = await streamGenerate({ key: 'bad', body: {}, fetchImpl }).catch((e) => e)
    expect(err).toBeInstanceOf(GeminiError)
    expect(err.kind).toBe('key')
  })

  it('turns 429 into a quota error', async () => {
    const fetchImpl = fakeFetch(429, errorBody(429, 'RESOURCE_EXHAUSTED', 'Quota exceeded'))
    expect((await streamGenerate({ key: 'k', body: {}, fetchImpl }).catch((e) => e)).kind).toBe('quota')
  })

  it('turns a failed request into a network error', async () => {
    const fetchImpl = async () => {
      throw new TypeError('Failed to fetch')
    }
    expect((await streamGenerate({ key: 'k', body: {}, fetchImpl }).catch((e) => e)).kind).toBe('network')
  })

  it('reports a blocked prompt instead of an empty reply', async () => {
    const body = `data: ${JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } })}\r\n\r\n`
    const err = await streamGenerate({ key: 'k', body: {}, fetchImpl: fakeFetch(200, body) }).catch((e) => e)
    expect(err.kind).toBe('blocked')
  })
})

describe('testKey', () => {
  it('accepts a key the models endpoint answers for', async () => {
    const fetchImpl = fakeFetch(200, '{"models":[]}')
    await expect(testKey('good', fetchImpl)).resolves.toBe(true)
    expect(fetchImpl.calls[0].init.headers['x-goog-api-key']).toBe('good')
  })

  it('throws a key error for a rejected key', async () => {
    const fetchImpl = fakeFetch(400, errorBody(400, 'INVALID_ARGUMENT', 'API key not valid.', 'API_KEY_INVALID'))
    expect((await testKey('bad', fetchImpl).catch((e) => e)).kind).toBe('key')
  })
})

describe('key storage', () => {
  beforeEach(() => {
    const map = new Map()
    globalThis.localStorage = {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
      map,
    }
  })
  afterEach(() => {
    delete globalThis.localStorage
  })

  it('saves, loads and forgets the key apart from progress', () => {
    expect(loadKey()).toBe('')
    saveKey('  abc  ')
    expect(loadKey()).toBe('abc')
    expect(globalThis.localStorage.map.has('altairlab:v1')).toBe(false)
    clearKey()
    expect(loadKey()).toBe('')
  })

  it('returns an empty key when storage is blocked', () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error('SecurityError')
      },
    }
    expect(loadKey()).toBe('')
  })
})
