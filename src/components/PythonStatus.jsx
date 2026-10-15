import { useEffect, useState } from 'react'
import { python } from '../lib/python/index.js'
import './PythonStatus.css'

export function PythonStatus() {
  const [status, setStatus] = useState({ phase: 'loading', step: 'Starting Python' })
  useEffect(() => python.subscribe(setStatus), [])

  if (status.phase === 'ready') {
    return <div className="py-status ok">● Python ready</div>
  }
  if (status.phase === 'error') {
    return (
      <div className="py-status err" role="status">
        Python failed{status.error ? `: ${String(status.error).slice(0, 80)}` : ''}
        <button type="button" onClick={() => python.retry()}>Retry</button>
      </div>
    )
  }
  return <div className="py-status" role="status">○ {status.step || 'Loading Python'}…</div>
}
