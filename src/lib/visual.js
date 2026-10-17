// Visual comparison of two Vega-Lite specs: render both off-screen with Vega and
// compare what gets drawn (marks, text, colours, tooltips), not how the spec is written.
// Plain ESM: runs in the browser and in Node.
import { View, parse } from 'vega'
import { compile } from 'vega-lite'

// Item properties that change what the learner sees (or gets on hover).
const NUM = ['x', 'y', 'x2', 'y2', 'xc', 'yc', 'width', 'height', 'opacity', 'fillOpacity', 'strokeOpacity',
  'strokeWidth', 'size', 'angle', 'fontSize', 'radius', 'innerRadius', 'startAngle', 'endAngle', 'cornerRadius',
  'limit', 'dx', 'dy']
const RAW = ['fill', 'stroke', 'shape', 'text', 'font', 'fontWeight', 'fontStyle', 'align', 'baseline', 'path',
  'strokeDash', 'interpolate', 'tooltip']

const quiet = {
  level() { return this },
  error() { return this },
  warn() { return this },
  info() { return this },
  debug() { return this },
}

const round = (v) => Math.round(v * 100) / 100

function canonItem(item) {
  const o = {}
  for (const k of NUM) if (typeof item[k] === 'number') o[k] = round(item[k])
  for (const k of RAW) if (item[k] !== undefined && item[k] !== null) o[k] = item[k]
  return o
}

// Flattens the scene graph into { role, marktype, axis, props, key } records.
// `axis` ('X' | 'Y') is inherited from the enclosing axis group.
function walk(node, axis, out) {
  for (const item of node?.items ?? []) {
    const props = canonItem(item)
    const rec = { role: node.role, marktype: node.marktype, axis, props }
    rec.key = JSON.stringify([rec.role, rec.marktype, axis ?? null, props])
    out.push(rec)
    if (node.marktype === 'group') {
      const here = node.role === 'axis' ? (/^(top|bottom)$/.test(item.orient) ? 'X' : 'Y') : axis
      for (const child of item.items ?? []) walk(child, here, out)
    }
  }
}

// sceneOf(vegaLiteSpec) -> { width, height, items }. Throws if the spec can't be compiled.
export async function sceneOf(spec) {
  const view = new View(parse(compile(spec, { logger: quiet }).spec), { renderer: 'none', logger: quiet })
  try {
    await view.runAsync()
    const items = []
    walk(view.scenegraph().root, undefined, items)
    return { width: round(view.width()), height: round(view.height()), items }
  } finally {
    view.finalize()
  }
}

const sortedKeys = (items) => items.map((i) => i.key).sort()
const sameList = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

const MARK_NAMES = { rect: 'bar', symbol: 'point', line: 'line point', area: 'area point', rule: 'rule', text: 'text mark', arc: 'arc', trail: 'trail point', shape: 'shape', image: 'image' }
const PROP_WORDS = { fill: 'colours', stroke: 'colours', opacity: 'opacity', fillOpacity: 'fill opacity', strokeOpacity: 'stroke opacity',
  size: 'size', shape: 'shape', strokeWidth: 'stroke width', strokeDash: 'dash pattern', width: 'width', height: 'height',
  text: 'text', tooltip: 'tooltips', angle: 'angle', fontSize: 'font size', cornerRadius: 'corner radius', interpolate: 'interpolation' }
// The order properties are reported in: the most noticeable first.
const MARK_PROPS = ['fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity', 'size', 'shape', 'strokeWidth', 'strokeDash',
  'width', 'height', 'cornerRadius', 'text', 'fontSize', 'angle', 'interpolate', 'tooltip']
const ROLE_ORDER = ['title-text', 'title-subtitle', 'mark', 'legend-title', 'legend-label', 'legend-symbol', 'axis-title', 'axis-label']

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const cap = (s) => s[0].toUpperCase() + s.slice(1)
const show = (v) => (v === undefined ? 'default' : typeof v === 'string' ? v : JSON.stringify(v))
const quoted = (texts) => texts.map((t) => `"${show(t)}"`).join(', ')
const texts = (items) => items.map((i) => i.props.text)

// Items in reading order: top to bottom, then left to right.
const reading = (items) => [...items].sort((a, b) => (a.props.y ?? 0) - (b.props.y ?? 0) || (a.props.x ?? 0) - (b.props.x ?? 0))

function describeMarks(word, t, m) {
  if (t.length !== m.length) {
    return m.length === 0
      ? `The target has ${plural(t.length, word)}; yours has none.`
      : `The target has ${plural(t.length, word)}; yours has ${m.length}.`
  }
  for (const p of MARK_PROPS) {
    const tv = t.map((i) => JSON.stringify(i.props[p])).sort()
    const mv = m.map((i) => JSON.stringify(i.props[p])).sort()
    if (sameList(tv, mv)) continue
    const tu = [...new Set(tv)], mu = [...new Set(mv)]
    const words = PROP_WORDS[p] ?? p
    if (tu.length === 1 && mu.length === 1 && p !== 'tooltip' && words !== 'colours') {
      const parse1 = (s) => (s === undefined ? undefined : JSON.parse(s))
      return `${cap(word)} ${words}: yours ${show(parse1(mu[0]))}, target ${show(parse1(tu[0]))}.`
    }
    return `${cap(word)} ${words} differ from the target.`
  }
  // Only positions differ: a later group (often the axis labels) usually says why.
  return null
}

function describeTexts(label, t, m) {
  const tt = texts(reading(t)), mt = texts(reading(m))
  if (t.length === 1 && m.length === 1 && tt[0] !== mt[0]) return `${label}: yours "${show(mt[0])}", target "${show(tt[0])}".`
  if (m.length === 0) return `The target has ${label.toLowerCase()} ${quoted(tt)}; yours has none.`
  if (t.length === 0) return `Yours has ${label.toLowerCase()} ${quoted(mt)}; the target has none.`
  if (sameList([...tt].map(show).sort(), [...mt].map(show).sort())) {
    return sameList(tt.map(show), mt.map(show))
      ? `${label} are in different places than in the target.`
      : `${label} are in a different order: the target starts with ${tt.slice(0, 3).map(show).join(', ')}.`
  }
  return `${label} differ: the target shows ${tt.slice(0, 3).map(show).join(', ')}${tt.length > 3 ? ', …' : ''}.`
}

function describe(role, axis, marktype, t, m) {
  const ax = axis ? `${axis} axis ` : 'Axis '
  switch (role) {
    case 'mark': return describeMarks(MARK_NAMES[marktype] ?? 'mark', t, m)
    case 'title-text': {
      const [tt] = texts(t), [mt] = texts(m)
      if (mt === undefined) return `The target has the title "${show(tt)}"; yours has none.`
      if (tt === undefined) return `Yours has the title "${show(mt)}"; the target has none.`
      return `Title: yours "${show(mt)}", target "${show(tt)}".`
    }
    case 'title-subtitle': return describeTexts('Subtitle', t, m)
    case 'axis-title': return describeTexts(ax.trimEnd() === 'Axis' ? 'Axis title' : `${ax}title`, t, m)
    case 'axis-label': return describeTexts(`${ax}labels`, t, m)
    case 'legend-title': return describeTexts('Legend title', t, m)
    case 'legend-label': return describeTexts('Legend labels', t, m)
    case 'legend-symbol': return 'Legend symbols differ from the target.'
    case 'axis-grid': return 'Grid lines differ from the target.'
    case 'axis-tick':
    case 'axis-domain': return `${ax}lines or ticks differ from the target.`
    default: return 'Something in the chart still differs from the target.'
  }
}

// compareScenes(target, mine) -> { same, difference }: one sentence naming the most
// noticeable visible difference, or null when both draw the same chart.
export function compareScenes(target, mine) {
  const sized = target.width === mine.width && target.height === mine.height
  if (sized && sameList(sortedKeys(target.items), sortedKeys(mine.items))) return { same: true, difference: null }

  const groups = new Map()
  const add = (side, i) => {
    const g = `${i.role}|${i.marktype}|${i.axis ?? ''}`
    if (!groups.has(g)) groups.set(g, { role: i.role, marktype: i.marktype, axis: i.axis, target: [], mine: [] })
    groups.get(g)[side].push(i)
  }
  target.items.forEach((i) => add('target', i))
  mine.items.forEach((i) => add('mine', i))
  const rank = (role) => (ROLE_ORDER.includes(role) ? ROLE_ORDER.indexOf(role) : ROLE_ORDER.length)
  const ordered = [...groups.values()].sort((a, b) => rank(a.role) - rank(b.role))
  const differ = (difference) => ({ same: false, difference })

  // Missing or extra marks first: they also change the size of a chart with discrete axes.
  for (const g of ordered) {
    if (g.role === 'mark' && g.target.length !== g.mine.length) return differ(describe(g.role, g.axis, g.marktype, g.target, g.mine))
  }
  if (!sized) return differ(`Chart size: yours ${mine.width}×${mine.height}, target ${target.width}×${target.height}.`)

  let moved = null
  for (const g of ordered) {
    if (sameList(sortedKeys(g.target), sortedKeys(g.mine))) continue
    const text = describe(g.role, g.axis, g.marktype, g.target, g.mine)
    if (text) return differ(text)
    moved ??= `${cap(MARK_NAMES[g.marktype] ?? 'mark')}s are in different positions than in the target.`
  }
  return differ(moved ?? 'Something in the chart still differs from the target.')
}
