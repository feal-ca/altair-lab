// Part-by-part comparison of two Vega-Lite specs (learner vs target).
// Plain ESM, no dependencies.

const DROP = ['$schema', 'config', 'data', 'datasets', 'autosize', 'usermeta']
const CONCATS = ['hconcat', 'vconcat', 'concat']
const ENC_KEYS = ['field', 'type', 'aggregate', 'timeUnit', 'bin', 'value', 'condition', 'sort', 'stack', 'title', 'scale']
// Keys that together identify "what the channel encodes" (one check).
// `condition` is part of the identity: alt.condition(test, a, b) encodes test → a, else b.
const IDENT_KEYS = ['field', 'type', 'aggregate', 'timeUnit', 'bin', 'value', 'condition']
// Options checked one by one: [id suffix, path into the normalised channel, label word].
const OPTIONS = [
  ['sort', ['sort'], 'sort'],
  ['scale', ['scale'], 'scale'],
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

// Selections and parameters are named by Altair (param_7b0e…, a content hash) or by the
// learner (name='Year'). Two specs that declare the same parameters should compare equal,
// so every name is replaced by one derived from what the parameter does.
const paramKey = (p) => canon({ ...p, name: undefined, views: undefined })

function collectParams(v, out) {
  if (Array.isArray(v)) v.forEach((x) => collectParams(x, out))
  else if (isObj(v)) {
    for (const [k, x] of Object.entries(v)) {
      if (k === 'params' && Array.isArray(x)) x.forEach((p) => isObj(p) && typeof p.name === 'string' && out.push(p))
      collectParams(x, out)
    }
  }
  return out
}

const EXPR_KEYS = ['test', 'filter', 'calculate', 'expr']

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function renameParams(spec) {
  const params = collectParams(spec, [])
  const names = [...new Set(params.map((p) => p.name))]
  if (names.length === 0) return spec
  const keyOfName = new Map()
  for (const p of params) if (!keyOfName.has(p.name)) keyOfName.set(p.name, paramKey(p))
  // Sorting by definition makes the new names independent of declaration order.
  const order = [...names].sort((a, b) => (keyOfName.get(a) < keyOfName.get(b) ? -1 : keyOfName.get(a) > keyOfName.get(b) ? 1 : 0))
  const rename = new Map(order.map((n, i) => [n, `param${i + 1}`]))
  const inExpr = names.map((n) => [new RegExp(`(?<![\\w$])${escapeRe(n)}(?![\\w$])`, 'g'), rename.get(n)])
  // A name is replaced where it is a reference ({param: name}, the param's own name) and,
  // as an identifier, inside expression strings; labels such as a widget's name are left alone.
  const walk = (v, key) => {
    if (typeof v === 'string') {
      if ((key === 'param' || key === 'name') && rename.has(v)) return rename.get(v)
      if (EXPR_KEYS.includes(key)) return inExpr.reduce((acc, [re, to]) => acc.replace(re, to), v)
      return v
    }
    if (Array.isArray(v)) return v.map((x) => walk(x, key))
    if (isObj(v)) {
      const o = {}
      for (const [k, x] of Object.entries(v)) if (k !== 'views') o[k] = walk(x, k)
      return o
    }
    return v
  }
  return walk(spec)
}

function pickChannel(ch) {
  if (Array.isArray(ch)) return ch.map(pickChannel)
  if (!isObj(ch)) return ch
  const out = {}
  for (const k of ENC_KEYS) if (ch[k] !== undefined) out[k] = ch[k]
  // alt.when(...).then(...).otherwise(...) writes a one-item list where alt.condition writes the item.
  if (Array.isArray(out.condition) && out.condition.length === 1) out.condition = out.condition[0]
  // Axis and legend options are checked one by one; None (no axis / legend) is kept as null.
  for (const k of ['axis', 'legend']) if (isObj(ch[k]) || ch[k] === null) out[k] = ch[k]
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
  const encoding = { ...inherit.encoding }
  for (const [ch, def] of Object.entries(pickEncoding(spec.encoding))) {
    // Key-level merge: a layer's x:{title} adds to the parent's x:{field,type}.
    encoding[ch] = isObj(def) && isObj(encoding[ch]) ? { ...encoding[ch], ...def } : def
  }
  const transform = [...inherit.transform, ...asTransforms(spec.transform)]
  const projection = isObj(spec.projection) ? spec.projection : inherit.projection
  const next = { mark, encoding, transform, projection }
  if (Array.isArray(spec.layer)) return spec.layer.flatMap((l) => collectViews(l, next))
  if (isObj(spec.repeat) && isObj(spec.spec)) return collectViews(spec.spec, next)
  // Panels that are themselves layered are flattened into the view list.
  for (const c of CONCATS) if (Array.isArray(spec[c])) return spec[c].flatMap((p) => collectViews(p, next))
  if (isObj(spec.facet) || (spec.facet && spec.spec)) return collectViews(spec.spec, next)
  return [next]
}

// Config sections Altair always writes; anything else came from a configure_* call.
const DEFAULT_CONFIG = ['view']

export function normalize(spec) {
  if (!isObj(spec)) return { layout: 'single', views: [], params: [] }
  const config = isObj(spec.config) ? spec.config : {}
  const dropped = { ...spec }
  for (const k of DROP) delete dropped[k]
  const s = renameParams(dropped)
  let layout = 'single'
  if (Array.isArray(s.layer)) layout = 'layer'
  else if (isObj(s.repeat) && s.spec !== undefined) layout = 'repeat'
  else if (s.facet !== undefined && s.spec !== undefined) layout = 'facet'
  else layout = CONCATS.find((c) => Array.isArray(s[c])) || 'single'
  const views = collectViews(s, { mark: {}, encoding: {}, transform: [], projection: undefined })
  const out = { layout, views }
  const title = isObj(s.title) ? s.title.text : s.title
  if (title !== undefined) out.title = title
  if (s.width !== undefined) out.width = s.width
  if (s.height !== undefined) out.height = s.height
  if (isObj(s.resolve)) out.resolve = s.resolve
  if (layout === 'repeat') out.repeat = s.repeat
  if (layout === 'facet') out.facet = s.facet
  out.params = collectParams(s, []).map((p) => {
    const { name, views, ...def } = p
    // Pointer events replaced mouse events in current Altair; both behave the same.
    if (isObj(def.select) && typeof def.select.on === 'string') {
      def.select = { ...def.select, on: def.select.on.replace(/\bmouse(over|out|move|down|up)\b/g, 'pointer$1') }
    }
    // .interactive() spells out the default encodings of a scale-bound interval.
    if (def.bind === 'scales' && isObj(def.select) && canon(def.select.encodings) === canon(['x', 'y'])) {
      const { encodings, ...rest } = def.select
      def.select = rest
    }
    return def
  })
  const configured = Object.entries(config).filter(([k, v]) => !DEFAULT_CONFIG.includes(k) && isObj(v))
  if (configured.length) out.config = Object.fromEntries(configured)
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

function conditionLabel(ch, def) {
  const conds = Array.isArray(def.condition) ? def.condition : [def.condition]
  const what = (d) => (d.value !== undefined ? py(d.value) : d.field !== undefined ? d.field : '?')
  const parts = conds.map((c) => (isObj(c) ? `if ${c.test ?? (c.param !== undefined ? 'selected' : '…')} → ${what(c)}` : '?'))
  const otherwise = def.value !== undefined || def.field !== undefined ? `, else ${what(def)}` : ''
  return short(`${ch}: ${parts.join(', ')}${otherwise}`, 72)
}

function channelLabel(ch, def) {
  if (Array.isArray(def)) return `${ch}: ${def.map((d) => (isObj(d) && d.field) || '?').join(', ')}`
  if (!isObj(def)) return `${ch}: ${text(def)}`
  if (def.condition !== undefined) return conditionLabel(ch, def)
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
  return `${ch}: ${word} ${typeof value === 'string' ? JSON.stringify(value) : text(value)}`
}

function structureLabel(t) {
  const n = t.views.length
  switch (t.layout) {
    case 'layer': return `${n} layer${n === 1 ? '' : 's'}`
    case 'hconcat': return `${n} panels side by side`
    case 'vconcat': return `${n} panels stacked`
    case 'concat': return `${n} panels`
    case 'facet': return 'faceted'
    case 'repeat': return `repeated (${n} layer${n === 1 ? '' : 's'} per cell)`
    default: return 'single view'
  }
}

const INPUTS = { range: 'a slider', select: 'a dropdown', radio: 'radio buttons', checkbox: 'a checkbox' }

function paramLabel(p) {
  const sel = isObj(p.select) ? p.select : null
  if (sel && p.bind === 'scales') return 'zoom & pan (.interactive() or bind="scales")'
  const args = []
  if (sel) for (const k of ['encodings', 'fields', 'on', 'nearest', 'clear']) if (sel[k] !== undefined) args.push(`${k}=${py(sel[k])}`)
  if (p.value !== undefined) args.push(`value=${py(p.value)}`)
  const call = sel ? `selection_${sel.type === 'interval' ? 'interval' : 'point'}` : 'param'
  let bound = ''
  if (p.bind === 'legend') bound = ', bound to the legend'
  else if (isObj(p.bind)) {
    const { input, name, ...rest } = p.bind
    const extra = input === 'range' ? ` ${rest.min ?? '?'}–${rest.max ?? '?'}` : ''
    bound = `, bound to ${INPUTS[input] ?? 'a widget'}${extra}`
  }
  return short(`${call}(${args.join(', ')})${bound}`, 80)
}

function identOf(def) {
  if (Array.isArray(def)) return def.map(identOf)
  if (!isObj(def)) return def
  const o = {}
  for (const k of IDENT_KEYS) if (def[k] !== undefined) o[k] = def[k]
  return o
}

// Array channels (tooltip lists): every target item must appear in the user's
// list by identity, in any order; extra items or extra item keys are fine.
function sameIdent(ud, def) {
  if (Array.isArray(def)) {
    if (!Array.isArray(ud)) return false
    const have = new Set(identOf(ud).map(canon))
    return identOf(def).every((d) => have.has(canon(d)))
  }
  return canon(identOf(ud)) === canon(identOf(def))
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
      add(`enc-${i}-${ch}`, prefix + channelLabel(ch, def), ud !== undefined && sameIdent(ud, def))
      if (!isObj(def)) continue
      for (const [key, path, w] of OPTIONS) {
        const tval = getPath(def, path)
        if (tval === undefined) continue
        add(`opt-${i}-${ch}-${key}`, prefix + optionLabel(ch, w, tval), canon(getPath(ud, path)) === canon(tval) && getPath(ud, path) !== undefined)
      }
      for (const part of ['axis', 'legend']) {
        const tv = def[part]
        if (tv === null) {
          add(`opt-${i}-${ch}-${part}`, prefix + `${ch}: no ${part}`, isObj(ud) && ud[part] === null)
          continue
        }
        if (!isObj(tv)) continue
        for (const [k, v] of Object.entries(tv)) {
          const uv = getPath(ud, [part, k])
          add(`opt-${i}-${ch}-${part}-${k}`, prefix + optionLabel(ch, `${part} ${k}`, v), uv !== undefined && canon(uv) === canon(v))
        }
      }
    }

    if (tv.projection !== undefined) {
      const ptype = tv.projection.type ?? 'projection'
      add(`proj-${i}`, prefix + `project('${ptype}')`, uv && canon(uv.projection) === canon(tv.projection))
    }

    tv.transform.forEach((tr, k) => {
      const keys = isObj(tr) ? Object.keys(tr) : []
      const key = keys.find((k) => !['groupby', 'as', 'sort', 'frame'].includes(k)) ?? keys[0]
      const bySelection = key === 'filter' && isObj(tr.filter) && tr.filter.param !== undefined
      const label = bySelection ? 'filter: keep the selected rows' : key === undefined ? text(tr) : `${key}: ${text(tr[key])}`
      add(`tr-${i}-${k}`, prefix + short(label), uv && uv.transform.some((x) => canon(x) === canon(tr)))
    })
  })

  // Parameters are matched as a multiset by what they do, ignoring their names.
  const unused = u.params.map(canon)
  t.params.forEach((p, k) => {
    const at = unused.indexOf(canon(p))
    if (at >= 0) unused.splice(at, 1)
    add(`param-${k}`, paramLabel(p), at >= 0)
  })

  if (t.repeat !== undefined) {
    const parts = Object.entries(t.repeat).map(([k, v]) => `${k} ${text(v)}`).join(', ')
    add('repeat', short(`repeat: ${parts}`, 80), canon(u.repeat) === canon(t.repeat))
  }
  if (t.facet !== undefined) {
    const label = t.facet.field !== undefined ? channelLabel('facet', t.facet)
      : `facet: ${Object.entries(t.facet).map(([k, d]) => channelLabel(k, d)).join(', ')}`
    const same = t.facet.field !== undefined ? isObj(u.facet) && sameIdent(u.facet, t.facet)
      : isObj(u.facet) && Object.entries(t.facet).every(([k, d]) => u.facet[k] !== undefined && sameIdent(u.facet[k], d))
    add('facet', short(label, 80), same)
  }

  for (const [section, props] of Object.entries(t.config || {})) {
    for (const [k, v] of Object.entries(props)) {
      const uv = getPath(u.config, [section, k])
      add(`config-${section}-${k}`, `configure_${section}: ${k}=${py(v)}`, uv !== undefined && canon(uv) === canon(v))
    }
  }

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

  // A chart can look like the target before anyone interacts with it, so a visual match
  // only counts when the interactive parts are there too.
  const interactionOk = checks.filter((c) => c.id.startsWith('param-')).every((c) => c.passed)
  return { checks, solved: checks.every((c) => c.passed), interactionOk }
}
