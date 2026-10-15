// Rendering copy of a spec that stretches to its container's width.
// Vega-Lite only supports width 'container' on single and layered views, so
// concatenated or faceted charts, and charts with their own width, are left as is.
const FACETS = ['row', 'column', 'facet']

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const faceted = (s) => isObj(s.encoding) && FACETS.some((k) => s.encoding[k] !== undefined)

function fits(spec) {
  if (!isObj(spec) || spec.width !== undefined || faceted(spec)) return false
  if (Array.isArray(spec.layer)) return spec.layer.every((l) => isObj(l) && l.width === undefined && (l.mark !== undefined || fits(l)) && !faceted(l))
  return spec.mark !== undefined
}

export function fitWidth(spec) {
  if (!fits(spec)) return spec
  return { ...spec, width: 'container', autosize: { type: 'fit-x', contains: 'padding' } }
}
