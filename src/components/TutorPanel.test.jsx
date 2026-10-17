// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { TutorPanel } from './TutorPanel.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const exercise = { task: 'Draw mean price by brand.', solution: "alt.Chart(df).mark_bar().encode(x='brand:N', y='mean(price):Q')" }
const run = { code: "alt.Chart(df).mark_bar().encode(x='brand:N', y='price:Q')", checks: [{ id: 'y', label: 'y: mean(price) (Q)', passed: false }], message: null }

const sse = (texts) =>
  texts.map((t) => `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: t }] } }] })}\n\n`).join('')

let container, root, requests, replies

// Stands in for Google's endpoint: records each request and streams the next queued reply.
function stubFetch() {
  requests = []
  replies = []
  globalThis.fetch = async (url, init) => {
    requests.push({ url, body: init.body ? JSON.parse(init.body) : null })
    const { status = 200, body } = replies.shift()
    return new Response(body, { status })
  }
}

const render = (props = {}) =>
  act(() => root.render(<TutorPanel exercise={exercise} getRun={() => run} solved={false} {...props} />))
const button = (text) => [...container.querySelectorAll('button')].find((b) => b.textContent === text)
const flush = () => act(() => new Promise((r) => setTimeout(r, 20)))

beforeEach(() => {
  // jsdom has no modal dialogs; open/close is enough for these tests.
  HTMLDialogElement.prototype.showModal ??= function () { this.open = true }
  HTMLDialogElement.prototype.close ??= function () { this.open = false }
  Element.prototype.scrollIntoView ??= () => {}
  localStorage.clear()
  stubFetch()
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe('TutorPanel', () => {
  it('asks for a key first, then explains once the key checks out', async () => {
    await render()
    await act(() => button('Explain what I missed').click())
    expect(container.querySelector('dialog').open).toBe(true)
    expect(requests).toHaveLength(0)

    const input = container.querySelector('input[type=password]')
    await act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'test-key')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    replies.push({ body: '{"models":[]}' }, { body: sse(['Your `y` channel ', 'is not aggregated.']) })
    await act(() => button('Save and test').click())
    await flush()

    expect(localStorage.getItem('altairlab:gemini-key')).toBe('test-key')
    expect(requests[1].url).toContain(':streamGenerateContent?alt=sse')
    expect(requests[1].body.contents[0].parts[0].text).toContain("y='price:Q'")
    expect(container.querySelector('.tutor-a').textContent).toBe('Your y channel is not aggregated.')
    expect(container.querySelector('.tutor-a code').textContent).toBe('y')
  })

  it('sends a follow-up with the earlier exchange', async () => {
    localStorage.setItem('altairlab:gemini-key', 'test-key')
    replies.push({ body: sse(['Use an aggregate.']) }, { body: sse(['Mean averages the rows.']) })
    await render()
    await act(() => button('Explain what I missed').click())
    await flush()

    const box = container.querySelector('textarea')
    await act(() => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(box, 'Why mean?')
      box.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await act(() => button('Ask').click())
    await flush()

    const turns = requests[1].body.contents
    expect(turns.map((t) => t.role)).toEqual(['user', 'model', 'user'])
    expect(turns[1].parts[0].text).toBe('Use an aggregate.')
    expect(turns[2].parts[0].text).toMatch(/## Student's question\nWhy mean\?$/)
    expect([...container.querySelectorAll('.tutor-q')].map((q) => q.textContent)).toEqual(['Explain what I missed', 'Why mean?'])
  })

  it('shows a rejected key as a message with a way to change it', async () => {
    localStorage.setItem('altairlab:gemini-key', 'old-key')
    replies.push({ status: 400, body: JSON.stringify({ error: { code: 400, message: 'API key not valid.', details: [{ reason: 'API_KEY_INVALID' }] } }) })
    await render()
    await act(() => button('Explain what I missed').click())
    await flush()

    expect(container.querySelector('.tutor-error').textContent).toContain("didn't accept this key")
    expect(button('Change key')).toBeTruthy()
  })

  it('hides the explain button once solved, and the panel when nothing was asked', async () => {
    await render({ solved: true })
    expect(container.querySelector('.tutor')).toBeNull()
  })

  it('clears the conversation', async () => {
    localStorage.setItem('altairlab:gemini-key', 'test-key')
    replies.push({ body: sse(['Hint.']) })
    await render()
    await act(() => button('Explain what I missed').click())
    await flush()
    await act(() => button('Clear').click())
    expect(container.querySelector('.tutor-thread')).toBeNull()
  })
})
