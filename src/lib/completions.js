// Context-aware Altair completions for the editor. Pure: takes the document text,
// the cursor position and the dataset columns, returns what to offer.
//
// Options carry either `apply` (plain text) or `snippet` (a CodeMirror snippet
// template: `${1}` is where the cursor lands, `${2}` where Tab jumps next).
// `reopen` asks the editor to open the list again after inserting, so that
// `alt.X('` is followed straight away by the column names.
import {
  AGGREGATES, ALT_CLASSES, ALT_FUNCTIONS, CHANNEL_KEYS, CHANNEL_METHODS, CHANNELS,
  CHART_METHODS, KWARGS, MARKS, STRING_VALUES,
} from '../content/altairApi.js'

const IDENT = /^[A-Za-z_]\w*$/
const WORD_VALID = /^\w*$/
const STRING_VALID = /^[\w ]*$/

const CHANNEL_CLASS = new Set(CHANNELS.map(([n]) => 'alt.' + n))
const CHANNEL_METHOD = new Set(CHANNEL_METHODS.map(([n]) => n))
const CHART_CALLEE = new Set(['', 'alt.Chart', 'alt.layer', 'alt.hconcat', 'alt.vconcat', 'alt.concat', 'alt.repeat',
  'encode', 'properties', 'interactive', 'add_params', 'project', 'facet'])
const BOOL_KW = new Set(['filled', 'zero', 'reverse', 'grid', 'labels', 'ticks', 'point', 'clip', 'nice', 'line', 'domain', 'tooltip', 'clamp', 'labelOverlap'])
const COLUMN_KW = new Set(['field', 'lookup', 'key'])
const COLUMN_LIST_KW = new Set(['groupby', 'fields'])
const COLUMN_POSITIONAL = new Set(['transform_fold', 'transform_regression', 'transform_loess', 'transform_density',
  'transform_quantile', 'alt.SortField'])

const isChartCallee = (c) => CHART_CALLEE.has(c) || /^(mark_|transform_|configure_|resolve_)/.test(c)
const isChannelCallee = (c) => CHANNEL_CLASS.has(c) || CHANNEL_METHOD.has(c)
const kwKey = (c) => (c.startsWith('mark_') ? 'mark' : CHANNEL_CLASS.has(c) ? 'channel' : c)

// Walks the text tracking strings, comments and open brackets.
function scan(text) {
  const stack = []
  let str = null
  let lastClose = null
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (str) {
      if (c === '\\') i++
      else if (str.triple && text.startsWith(str.q.repeat(3), i)) { str = null; i += 2 }
      else if (!str.triple && c === str.q) str = null
      else if (!str.triple && c === '\n') str = null
      continue
    }
    if (c === '#') {
      const nl = text.indexOf('\n', i)
      if (nl < 0) return { stack, str: null, comment: true, lastClose }
      i = nl
    } else if (c === '"' || c === "'") {
      const triple = text.startsWith(c.repeat(3), i)
      str = { q: c, start: i + (triple ? 3 : 1), triple }
      if (triple) i += 2
    } else if ('([{'.includes(c)) {
      stack.push({ ch: c, pos: i })
    } else if (')]}'.includes(c)) {
      const o = stack.pop()
      if (o) lastClose = { open: o.pos, close: i }
    }
  }
  return { stack, str, comment: false, lastClose }
}

// Name of the function whose `(` is at `open`: `alt.X`, or the method name (`mark_bar`).
function calleeAt(text, open) {
  const m = /((?:[A-Za-z_]\w*\s*\.\s*)*[A-Za-z_]\w*)\s*$/.exec(text.slice(Math.max(0, open - 200), open))
  if (!m) return ''
  const chain = m[1].replace(/\s+/g, '')
  return chain.startsWith('alt.') ? chain : chain.split('.').pop()
}

// `kw=` right before `end` (not `==`, `<=`, …).
function kwBefore(text, end) {
  const m = /(?:^|[^=<>!\w])([A-Za-z_]\w*)\s*=\s*$/.exec(text.slice(Math.max(0, end - 80), end))
  return m ? m[1] : null
}

// Innermost call context: the callee of the enclosing `(`, or of the call around an
// enclosing `[` together with the keyword the list belongs to.
function enclosing(text, stack) {
  const top = stack[stack.length - 1]
  if (!top) return null
  if (top.ch === '(') return { callee: calleeAt(text, top.pos), listKw: null }
  if (top.ch === '[') {
    const parent = stack[stack.length - 2]
    return {
      callee: parent && parent.ch === '(' ? calleeAt(text, parent.pos) : null,
      listKw: kwBefore(text, top.pos),
    }
  }
  return null
}

// ---- option builders -------------------------------------------------------

const method = ([name, detail], boost = 0) => (
  name === 'interactive'
    ? { label: name, apply: 'interactive()', detail, type: 'method', boost }
    : { label: name, snippet: `${name}(\${1})\${2}`, detail, type: 'method', boost })

const channelClass = (prefix) => ([name, detail], boost = 0) => ({
  label: prefix + name, snippet: `${prefix}${name}('\${1}')\${2}`, detail, type: 'class', reopen: true, boost,
})

function altMember(prefix) {
  return [
    ...ALT_CLASSES.map(([name, detail]) => ({
      label: prefix + name, snippet: `${prefix}${name}(\${1})\${2}`, detail, type: 'class',
      boost: name === 'Chart' ? 3 : 0,
    })),
    ...CHANNELS.map((c) => channelClass(prefix)(c, 1)),
    ...ALT_FUNCTIONS.map(([name, detail]) => (name === 'datum'
      ? { label: prefix + name, apply: prefix + 'datum.', detail, type: 'variable', reopen: true }
      : { label: prefix + name, snippet: `${prefix}${name}(\${1})\${2}`, detail, type: 'function' })),
  ]
}

const CHART_OPTIONS = [
  ...CHART_METHODS.map((m) => method(m, m[0] === 'encode' ? 3 : m[0] === 'properties' ? 2 : 0)),
  ...MARKS.map(([n, d]) => method(['mark_' + n, d], 1)),
]
const CHANNEL_OPTIONS = CHANNEL_METHODS.map((m) => method(m))

function kwarg([name, detail, kind], callee) {
  const base = { label: name + '=', detail, type: 'property' }
  if (kind === 'str') {
    const reopen = Boolean(stringValues(name, callee)) || COLUMN_KW.has(name)
    return { ...base, snippet: `${name}='\${1}'\${2}`, reopen }
  }
  const obj = { scale: 'Scale', axis: 'Axis', legend: 'Legend', header: 'Header', from_: 'LookupData' }[name]
  if (obj && callee !== 'configure_axis') return { ...base, snippet: `${name}=alt.${obj}(\${1})\${2}`, reopen: true }
  if (COLUMN_LIST_KW.has(name)) return { ...base, snippet: `${name}=['\${1}']\${2}`, reopen: true }
  if (callee === 'encode' && CHANNEL_KEYS.has(name)) return { ...base, apply: name + '=', reopen: true }
  return { ...base, apply: name + '=' }
}

const quoted = (values, detail) => values.map((v) => ({ label: `'${v}'`, apply: `'${v}'`, detail, type: 'constant' }))
const plain = (values, detail) => values.map((v) => ({ label: v, apply: v, detail, type: 'constant' }))

function stringValues(kw, callee) {
  if (kw === 'type') return callee === 'channel' || CHANNEL_CLASS.has(callee) ? STRING_VALUES['channel.type'] : STRING_VALUES['scale.type']
  if (callee && /^resolve_/.test(callee)) return STRING_VALUES.independent
  return STRING_VALUES[kw] ?? null
}

function columnOptions(columns, { typed = false, quote = false, closeAgg = false } = {}) {
  return columns.map((c) => {
    let text = typed ? `${c.name}:${c.type}` : c.name
    if (closeAgg) text = `${c.name}):Q`
    if (quote) text = `'${text}'`
    return { label: c.name, apply: text, detail: c.type, type: 'variable', boost: 2 }
  })
}

// ---- contexts --------------------------------------------------------------

function inString(doc, pos, text, sc, columns) {
  const content = text.slice(sc.str.start)
  const datum = /datum\.(\w*)$/.exec(content)
  if (datum) {
    return {
      from: pos - datum[1].length,
      options: columnOptions(columns.filter((c) => IDENT.test(c.name))),
      validFor: WORD_VALID,
    }
  }

  const quoteAt = sc.str.start - (sc.str.triple ? 3 : 1)
  const before = text.slice(0, quoteAt)
  const ctx = enclosing(before, sc.stack) ?? { callee: null, listKw: null }
  const kw = ctx.listKw ?? kwBefore(text, quoteAt)
  const key = ctx.callee ? kwKey(ctx.callee) : null

  // Field strings: 'Horsepower:Q', 'mean(Horsepower):Q'.
  const typedField = (kw && CHANNEL_KEYS.has(kw) && (key === 'encode' || ctx.listKw === kw)) || (!kw && key === 'channel')
  const plainField = (kw && (COLUMN_KW.has(kw) || COLUMN_LIST_KW.has(kw)))
    || (!kw && COLUMN_POSITIONAL.has(ctx.callee))

  if (kw && !typedField && ctx.listKw !== 'sort') {
    const values = stringValues(kw, key)
    if (values) return { from: sc.str.start, options: plain(values, kw), validFor: STRING_VALID }
  }
  if (!kw && ctx.callee === 'project') {
    return { from: sc.str.start, options: plain(STRING_VALUES.projection, 'projection'), validFor: STRING_VALID }
  }
  if (!typedField && !plainField) return null

  const agg = /^(\w+)\(([^)]*)$/.exec(content)
  if (typedField && agg && AGGREGATES.some(([a]) => a === agg[1])) {
    const closed = doc[pos] === ')'
    return {
      from: pos - agg[2].length,
      options: columnOptions(columns, { closeAgg: !closed }),
      validFor: STRING_VALID,
    }
  }
  const options = columnOptions(columns, { typed: typedField })
  if (typedField) {
    for (const [a, detail] of AGGREGATES) {
      options.push(a === 'count()'
        ? { label: 'count()', apply: 'count():Q', detail, type: 'function' }
        : { label: a + '()', apply: a + '(', detail, type: 'function', reopen: true })
    }
  }
  return { from: sc.str.start, options, validFor: STRING_VALID }
}

// Is `name` (a variable before a dot) a chart, a channel, or something else?
function classifyVariable(text, name) {
  if (name === 'alt') return 'alt'
  const re = new RegExp(`^[ \\t]*${name}\\s*=(?!=)([^]{0,200})`, 'gm')
  let rhs = null
  for (let m; (m = re.exec(text));) rhs = m[1]
  if (rhs === null) return null
  rhs = rhs.replace(/\s+/g, ' ').trim()
  if (/^\(?\s?alt ?\. ?(Chart|layer|hconcat|vconcat|concat|repeat)\b/.test(rhs)) return 'chart'
  if (/^alt ?\. ?([A-Z]\w*) ?\(/.test(rhs) && CHANNEL_CLASS.has('alt.' + /^alt ?\. ?([A-Z]\w*)/.exec(rhs)[1])) return 'channel'
  if (/^\(?\s?[A-Za-z_]\w* ?[+|&]/.test(rhs)) return 'chart'
  if (/^[A-Za-z_]\w* ?\. ?(mark_|encode|transform_|properties|configure_|resolve_)/.test(rhs)) return 'chart'
  return null
}

function afterDot(text, dot, from) {
  const head = text.slice(0, dot).replace(/\s+$/, '')
  const done = (options) => (options ? { from, options, validFor: WORD_VALID } : null)
  if (/\balt\s*\.\s*datum$/.test(head)) return 'datum'
  if (/(?:^|[^\w.])alt$/.test(head)) return done(altMember(''))
  if (head.endsWith(')')) {
    const { lastClose } = scan(head)
    if (!lastClose) return null
    const callee = calleeAt(head, lastClose.open)
    if (isChannelCallee(callee)) return done(CHANNEL_OPTIONS)
    if (isChartCallee(callee)) return done(CHART_OPTIONS)
    return null
  }
  const id = /(?:^|[^\w.])([A-Za-z_]\w*)$/.exec(head)
  if (!id) return null
  const kind = classifyVariable(text, id[1])
  if (kind === 'chart') return done(CHART_OPTIONS)
  if (kind === 'channel') return done(CHANNEL_OPTIONS)
  return null
}

// Values after `kw=` (outside a string).
function kwValue(kw, key, columns) {
  if (key === 'encode' && CHANNEL_KEYS.has(kw)) {
    const cls = CHANNELS.find(([n]) => n.toLowerCase() === kw.toLowerCase())
    return [
      ...(cls ? [channelClass('alt.')(cls, 3)] : []),
      { label: 'alt.condition', snippet: 'alt.condition(${1})${2}', detail: 'condition(test, if_true, if_false)', type: 'function' },
      { label: 'alt.value', snippet: 'alt.value(${1})${2}', detail: 'a constant value', type: 'function' },
      ...columnOptions(columns, { typed: true, quote: true }),
    ]
  }
  if (kw === 'scale') return [{ label: 'alt.Scale', snippet: 'alt.Scale(${1})${2}', detail: 'scale options', type: 'class', reopen: true }]
  if (kw === 'axis' || kw === 'legend') {
    const cls = kw === 'axis' ? 'Axis' : 'Legend'
    return [
      { label: 'alt.' + cls, snippet: `alt.${cls}(\${1})\${2}`, detail: kw + ' options', type: 'class', reopen: true },
      { label: 'None', apply: 'None', detail: 'hide the ' + kw, type: 'constant' },
    ]
  }
  if (kw === 'bin') return [...plain(['True'], 'default bins'), { label: 'alt.Bin', snippet: 'alt.Bin(${1})${2}', detail: 'bin options', type: 'class', reopen: true }]
  if (kw === 'stack') return [...plain(['None'], 'no stacking'), ...quoted(STRING_VALUES.stack, 'stack')]
  if (BOOL_KW.has(kw)) return plain(['True', 'False'], kw)
  const values = stringValues(kw, key)
  if (values) return quoted(values, kw)
  if (kw === 'sort') return quoted(STRING_VALUES.sort, 'sort')
  return null
}

function inCall(text, ctx, columns) {
  const key = kwKey(ctx.callee ?? '')
  if (ctx.listKw) {
    if (CHANNEL_KEYS.has(ctx.listKw)) return kwValue(ctx.listKw, 'encode', columns)
    return null
  }
  const kws = KWARGS[key]
  const generic = altMember('alt.')
  if (key === 'encode') return [...kws.map((k) => kwarg(k, key)), ...CHANNELS.map((c) => channelClass('alt.')(c))]
  if (key === 'channel') return [...columnOptions(columns, { typed: true, quote: true }), ...kws.map((k) => kwarg(k, key))]
  if (kws) return [...kws.map((k) => ({ ...kwarg(k, key), boost: 1 })), ...(key === 'mark' ? [] : generic)]
  return generic
}

export function complete(doc, pos, columns = [], explicit = false) {
  const text = doc.slice(0, pos)
  const sc = scan(text)
  if (sc.comment) return null
  if (sc.str) return inString(doc, pos, text, sc, columns)

  const word = (/[A-Za-z_]\w*$/.exec(text) || [''])[0]
  const from = pos - word.length
  const prev = text[from - 1]

  if (prev === '.') {
    const r = afterDot(text, from - 1, from)
    if (r === 'datum') {
      const options = columnOptions(columns.filter((c) => IDENT.test(c.name)))
      return { from, options, validFor: WORD_VALID }
    }
    return r
  }
  if (/\d$/.test(text.slice(0, from))) return null

  const ctx = enclosing(text, sc.stack)
  const kw = ctx ? kwBefore(text, from) : null
  if (ctx && kw) {
    const options = kwValue(kw, kwKey(ctx.listKw ? 'encode' : ctx.callee ?? ''), columns)
    if (!options) return null
    if (!word && !explicit && prev !== '=' && !/=\s$/.test(text.slice(0, from))) return null
    return { from, options, validFor: WORD_VALID }
  }

  if (!word && !explicit) {
    // Typing `(` after a known call opens its keyword arguments.
    if (!(prev === '(' && ctx && KWARGS[kwKey(ctx.callee ?? '')])) return null
  }
  const options = ctx ? inCall(text, ctx, columns) : altMember('alt.')
  return options ? { from, options, validFor: WORD_VALID } : null
}
