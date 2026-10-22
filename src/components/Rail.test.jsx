// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Rail, RAIL_MAX } from './Rail.jsx'
import { EXERCISES } from '../content/exercises.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let container, root, calls
const render = (props = {}) =>
  act(() => root.render(
    <Rail
      exercises={EXERCISES}
      state={{ solved: {}, ...props.state }}
      activeId={props.activeId ?? EXERCISES[0].id}
      width={props.width ?? 230}
      onResize={(...a) => calls.resize.push(a)}
      onToggleTopic={(t) => calls.toggle.push(t)}
      onNewExercise={() => {}}
      onReset={() => {}}
    />
  ))
const topic = (name) => [...container.querySelectorAll('.rail-topic')].find((s) => s.querySelector('.rail-grp-name').textContent === name)
const labels = (section) => [...section.querySelectorAll('.rail-it .n')].map((n) => n.textContent)

beforeEach(() => {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  calls = { resize: [], toggle: [] }
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe('Rail', () => {
  it('shows core exercises with a toggle for the extras', async () => {
    await render()
    const marks = topic('Marks & channels')
    expect(labels(marks)).toEqual(['2.1', '2.2', '2.3', '2.4'])
    const more = marks.querySelector('.rail-more')
    expect(more.textContent).toBe('6 more')
    act(() => more.click())
    expect(calls.toggle).toEqual(['Marks & channels'])
  })

  it('lists extras after the core ones when a topic is open', async () => {
    await render({ state: { openTopics: { 'Marks & channels': true } } })
    const marks = topic('Marks & channels')
    expect(labels(marks)).toEqual(['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10'])
    expect(marks.querySelector('.rail-more').textContent).toBe('Show fewer')
  })

  it('keeps the topic of an open extra expanded, without a toggle', async () => {
    const extra = EXERCISES.find((e) => e.core === false && e.topic === 'Interaction')
    await render({ activeId: extra.id })
    const section = topic('Interaction')
    expect(section.querySelector('.rail-it.on .t').textContent).toBe(extra.title)
    expect(section.querySelector('.rail-more')).toBeNull()
  })

  it('counts solved exercises per topic', async () => {
    await render({ state: { solved: { 'bk-wide-fold': true } } })
    expect(topic('Data & types').querySelector('.rail-grp-count').textContent).toBe('1/3')
    expect(topic('Maps').querySelector('.rail-grp-count')).toBeNull()
  })

  it('resizes with the keyboard and resets on double-click, within bounds', async () => {
    await render({ width: RAIL_MAX - 4 })
    const handle = container.querySelector('.rail-resize')
    act(() => handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })))
    act(() => handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })))
    act(() => handle.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })))
    expect(calls.resize).toEqual([[RAIL_MAX, true], [RAIL_MAX - 20, true], [230, true]])
  })

  it('follows a pointer drag and saves the width when it ends', async () => {
    Element.prototype.setPointerCapture ??= () => {}
    await render({ width: 230 })
    const handle = container.querySelector('.rail-resize')
    const fire = (type, clientX) => act(() => handle.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX })))
    fire('pointerdown', 100)
    expect(document.body.classList.contains('rail-resizing')).toBe(true)
    fire('pointermove', 160)
    fire('pointermove', 1000)
    fire('pointerup', 140)
    expect(calls.resize).toEqual([[290, false], [RAIL_MAX, false], [270, true]])
    expect(document.body.classList.contains('rail-resizing')).toBe(false)
  })
})
