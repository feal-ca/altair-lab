import { useEffect, useRef, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { baseConfig } from '../lib/vegaTheme.js'
import { fitWidth } from '../lib/fitWidth.js'
import './ChartCard.css'

// vega-embed hands config to Vega-Lite as a compile option, and Vega-Lite merges
// spec.config over it (compile.ts: mergeConfig(opt.config, inputSpec.config)),
// so the Altair spec's own config wins and baseConfig fills the gaps.
// fitWidth stretches single and layered charts to the card; it only touches the
// rendering copy, so the checker still sees the spec Altair produced.
export function ChartCard({ title, spec, message, placeholder, matched = false }) {
  const el = useRef(null)
  const [embedError, setEmbedError] = useState(null)

  useEffect(() => {
    setEmbedError(null)
    if (message || !spec || !el.current) return undefined
    let cancelled = false
    let view = null
    vegaEmbed(el.current, fitWidth(spec), { actions: false, renderer: 'svg', config: baseConfig })
      .then((result) => {
        if (cancelled) result.view.finalize()
        else view = result.view
      })
      .catch((err) => {
        if (!cancelled) setEmbedError(String(err?.message ?? err))
      })
    return () => {
      cancelled = true
      if (view) view.finalize()
    }
  }, [spec, message])

  const shown = message ?? embedError
  const empty = !shown && !spec && placeholder
  return (
    <section className={matched ? 'chart-card matched' : 'chart-card'}>
      {title && (
        <h3 className="chart-card-title">
          {title}
          {matched && <span className="chart-card-match"> ✓ matches</span>}
        </h3>
      )}
      {shown && <div className="chart-card-msg">{shown}</div>}
      {empty && <div className="chart-card-empty">{placeholder}</div>}
      <div className="chart-card-body" ref={el} hidden={Boolean(shown || empty)} />
    </section>
  )
}
