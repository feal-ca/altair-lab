// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { CheckList } from './CheckList.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const checks = [
  { id: 'a', label: 'mark_bar()', passed: true },
  { id: 'b', label: 'y: sort -x', passed: false },
]
let container, root
const render = (props) => act(() => root.render(<CheckList checks={checks} {...props} />))

beforeEach(() => {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe('CheckList', () => {
  it('shows only the summary while collapsed', async () => {
    await render({ open: false, onToggle: () => {} })
    const head = container.querySelector('button.check-heading')
    expect(head.textContent).toContain('1 of 2 checks')
    expect(head.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('ul')).toBeNull()
  })

  it('lists every check when open', async () => {
    await render({ open: true, onToggle: () => {} })
    expect([...container.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['✓mark_bar() (passed)', '—y: sort -x (not yet)'])
  })

  it('asks to toggle when the summary is clicked', async () => {
    let toggled = 0
    await render({ open: false, onToggle: () => toggled++ })
    await act(() => container.querySelector('button.check-heading').click())
    expect(toggled).toBe(1)
  })

  it('says the chart matches when it is solved visually with checks left over', async () => {
    await render({ open: false, onToggle: () => {}, solved: true })
    expect(container.querySelector('button.check-heading').textContent).toContain('Chart matches · 1 of 2 checks')
  })

  it('says the chart still differs when every check passes but the drawing does not match', async () => {
    const passing = checks.map((c) => ({ ...c, passed: true }))
    await act(() => root.render(<CheckList checks={passing} open={false} onToggle={() => {}} solved={false} differs />))
    expect(container.querySelector('button.check-heading').textContent).toContain('All 2 checks pass · chart still differs')
  })
})
