import { useEffect, useRef, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { baseConfig } from '../lib/vegaTheme.js'
import './ChartCard.css'

// vega-embed hands config to Vega-Lite as a compile option, and Vega-Lite merges
// spec.config over it (compile.ts: mergeConfig(opt.config, inputSpec.config)),
// so the Altair spec's own config wins and baseConfig fills the gaps.
export function ChartCard({ title, spec, message }) {
  const el = useRef(null)
  const [embedError, setEmbedError] = useState(null)

  useEffect(() => {
    if (message || !spec || !el.current) return undefined
    let cancelled = false
    let view = null
    setEmbedError(null)
    vegaEmbed(el.current, spec, { actions: false, renderer: 'svg', config: baseConfig })
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
  return (
    <section className="chart-card">
      {title && <h3 className="chart-card-title">{title}</h3>}
      {shown ? (
        <div className="chart-card-msg">{shown}</div>
      ) : (
        <div className="chart-card-body" ref={el} />
      )}
    </section>
  )
}
