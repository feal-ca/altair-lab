// Part-by-part comparison of two Vega-Lite specs (learner vs target).
// Plain ESM, no dependencies.

const DROP = ['$schema', 'config', 'data', 'datasets', 'autosize', 'usermeta']
const CONCATS = ['hconcat', 'vconcat', 'concat']
const ENC_KEYS = ['field', 'type', 'aggregate', 'timeUnit', 'bin', 'value', 'sort', 'stack', 'title', 'scale']
// Keys that together identify "what the channel encodes" (one check).
const IDENT_KEYS = ['field', 'type', 'aggregate', 'timeUnit', 'bin', 'value']
// Options checked one by one: [id suffix, path into the normalised channel, label word].
const OPTIONS = [
  ['sort', ['sort'], 'sort'],
  ['scale', ['scale'], 'scale'],
  ['axis-format', ['axis', 'format'], 'axis format'],
  ['legend-title', ['legend', 'title'], 'legend title'],
  ['title', ['title'], 'title'],
  ['stack', ['stack'], 'stack'],
]

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

export function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']'
  if (isObj(v)) {
    return '{' + Object.keys(v).filter((k) => v[k] !== undefined).sort()
      .map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}'
  }
  return JSON.stringify(v === undefined ? null : v)
}

const getPath = (o, path) => path.reduce((a, k) => (isObj(a) ? a[k] : undefined), o)

function pickChannel(ch) {
  if (Array.isArray(ch)) return ch.map(pickChannel)
  if (!isObj(ch)) return ch
  const out = {}
  for (const k of ENC_KEYS) if (ch[k] !== undefined) out[k] = ch[k]
  if (isObj(ch.axis) && ch.axis.format !== undefined) out.axis = { format: ch.axis.format }
  if (isObj(ch.legend) && ch.legend.title !== undefined) out.legend = { title: ch.legend.title }
  return out
}

function pickEncoding(enc) {
  const out = {}
  if (!isObj(enc)) return out
  for (const ch of Object.keys(enc)) if (enc[ch] !== undefined) out[ch] = pickChannel(enc[ch])
  return out
}

const asMark = (m) => (typeof m === 'string' ? { type: m } : isObj(m) ? { ...m } : {})
const asTransforms = (t) => (Array.isArray(t) ? t : [])

// Views of a (sub)spec; `inherit` carries mark/encoding/transform from enclosing layers.
function collectViews(spec, inherit) {
  if (!isObj(spec)) return []
  const mark = spec.mark !== undefined ? asMark(spec.mark) : inherit.mark
  const encoding = { ...inherit.encoding, ...pickEncoding(spec.encoding) }
  const transform = [...inherit.transform, ...asTransforms(spec.transform)]
  const next = { mark, encoding, transform }
  if (Array.isArray(spec.layer)) return spec.layer.flatMap((l) => collectViews(l, next))
  // Panels that are themselves layered are flattened into the view list.
  for (const c of CONCATS) if (Array.isArray(spec[c])) return spec[c].flatMap((p) => collectViews(p, next))
  if (isObj(spec.facet) || (spec.facet && spec.spec)) return collectViews(spec.spec, next)
  return [next]
}

export function normalize(spec) {
  if (!isObj(spec)) return { layout: 'single', views: [] }
  const s = { ...spec }
  for (const k of DROP) delete s[k]
  let layout = 'single'
  if (Array.isArray(s.layer)) layout = 'layer'
  else if (s.facet !== undefined && s.spec !== undefined) layout = 'facet'
  else layout = CONCATS.find((c) => Array.isArray(s[c])) || 'single'
  const views = collectViews(s, { mark: {}, encoding: {}, transform: [] })
  const out = { layout, views }
  const title = isObj(s.title) ? s.title.text : s.title
  if (title !== undefined) out.title = title
  if (s.width !== undefined) out.width = s.width
  if (s.height !== undefined) out.height = s.height
  if (isObj(s.resolve)) out.resolve = s.resolve
  return out
}

const py = (v) => (v === true ? 'True' : v === false ? 'False' : v === null ? 'None'
  : typeof v === 'string' ? `'${v}'` : isObj(v) || Array.isArray(v) ? JSON.stringify(v) : String(v))

const short = (s, n = 48) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
const text = (v) => (typeof v === 'string' ? v : JSON.stringify(v))

function markLabel(mark) {
  const { type, ...props } = mark
  const args = Object.keys(props).map((k) => `${k}=${py(props[k])}`).join(', ')
  return `mark_${type ?? '?'}(${args})`
}

const TYPE_ABBR = { nominal: 'N', ordinal: 'O', quantitative: 'Q', temporal: 'T', geojson: 'G' }

function channelLabel(ch, def) {
  if (Array.isArray(def)) return `${ch}: ${def.map((d) => (isObj(d) && d.field) || '?').join(', ')}`
  if (!isObj(def)) return `${ch}: ${text(def)}`
  if (def.value !== undefined) return `${ch}: value ${text(def.value)}`
  let what = def.field !== undefined ? def.field : ''
  if (def.timeUnit !== undefined) what = `${isObj(def.timeUnit) ? def.timeUnit.unit ?? 'timeUnit' : def.timeUnit}(${what})`
  if (def.bin) what = `bin(${what})`
  if (def.aggregate !== undefined) what = `${def.aggregate}(${what})`
  const t = TYPE_ABBR[def.type]
  return `${ch}: ${what}${t ? ` (${t})` : ''}`
}

function optionLabel(ch, word, value) {
  if (word === 'sort') return `${ch}: sort${typeof value === 'string' ? ' ' + value : ''}`
  if (word === 'scale' || word === 'stack') return `${ch}: ${word}`
  if (value === null) return `${ch}: no ${word}`
  return `${ch}: ${word} ${word === 'axis format' ? text(value) : JSON.stringify(text(value))}`
}

function structureLabel(t) {
  const n = t.views.length
  switch (t.layout) {
    case 'layer': return `${n} layer${n === 1 ? '' : 's'}`
    case 'hconcat': return `${n} panels side by side`
    case 'vconcat': return `${n} panels stacked`
    case 'concat': return `${n} panels`
    case 'facet': return 'faceted'
    default: return 'single view'
  }
}

function identOf(def) {
  if (Array.isArray(def)) return def
  if (!isObj(def)) return def
  const o = {}
  for (const k of IDENT_KEYS) if (def[k] !== undefined) o[k] = def[k]
  return o
}

export function check(userSpec, targetSpec) {
  const t = normalize(targetSpec)
  const u = normalize(userSpec)
  const checks = []
  const add = (id, label, passed) => checks.push({ id, label, passed: Boolean(passed) })

  add('structure', structureLabel(t), u.layout === t.layout && u.views.length === t.views.length)

  const word = t.layout === 'layer' || t.layout === 'facet' ? 'layer' : 'panel'
  t.views.forEach((tv, i) => {
    const uv = u.views[i] // may be undefined
    const prefix = t.views.length > 1 ? `${word} ${i + 1}: ` : ''
    const { type, ...props } = tv.mark

    add(`mark-${i}`, prefix + markLabel(tv.mark),
      uv && uv.mark.type === type && Object.keys(props).every((k) => canon(uv.mark[k]) === canon(props[k])))

    for (const [ch, def] of Object.entries(tv.encoding)) {
      const ud = uv ? uv.encoding[ch] : undefined
      add(`enc-${i}-${ch}`, prefix + channelLabel(ch, def), ud !== undefined && canon(identOf(ud)) === canon(identOf(def)))
      if (!isObj(def)) continue
      for (const [key, path, w] of OPTIONS) {
        const tval = getPath(def, path)
        if (tval === undefined) continue
        add(`opt-${i}-${ch}-${key}`, prefix + optionLabel(ch, w, tval), canon(getPath(ud, path)) === canon(tval) && getPath(ud, path) !== undefined)
      }
    }

    tv.transform.forEach((tr, k) => {
      const keys = isObj(tr) ? Object.keys(tr) : []
      const key = keys.find((k) => !['groupby', 'as', 'sort', 'frame'].includes(k)) ?? keys[0]
      const label = key === undefined ? text(tr) : `${key}: ${text(tr[key])}`
      add(`tr-${i}-${k}`, prefix + short(label), uv && uv.transform.some((x) => canon(x) === canon(tr)))
    })
  })

  for (const key of ['title', 'width', 'height']) {
    if (t[key] === undefined) continue
    add(key, `${key}: ${text(t[key])}`, u[key] !== undefined && canon(u[key]) === canon(t[key]))
  }

  for (const [kind, byChannel] of Object.entries(t.resolve || {})) {
    if (!isObj(byChannel)) continue
    for (const [ch, value] of Object.entries(byChannel)) {
      add(`resolve-${kind}-${ch}`, `resolve: ${ch} ${kind} ${text(value)}`,
        canon(getPath(u.resolve, [kind, ch])) === canon(value) && getPath(u.resolve, [kind, ch]) !== undefined)
    }
  }

  return { checks, solved: checks.every((c) => c.passed) }
}
