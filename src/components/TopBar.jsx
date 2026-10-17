import { useEffect, useState } from 'react'
import { DATASETS } from '../content/datasets.js'
import { PythonStatus } from './PythonStatus.jsx'
import { KeyDialog } from './KeyDialog.jsx'
import './TopBar.css'

const NARROW = '(max-width: 899px)'

function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW).matches)
  useEffect(() => {
    const mq = window.matchMedia(NARROW)
    const on = () => setNarrow(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return narrow
}

export function TopBar({ route, railCollapsed, drawerOpen, onToggleRail, saveOk }) {
  // On phones the button opens a drawer; elsewhere it collapses the rail.
  const narrow = useNarrow()
  const listShown = narrow ? Boolean(drawerOpen) : !railCollapsed
  const [keyOpen, setKeyOpen] = useState(false)
  const sandboxHref = `#/sandbox/${route.name === 'sandbox' && route.id ? route.id : Object.keys(DATASETS)[0]}`
  return (
    <header className="topbar">
      {(
        <button
          type="button"
          className="rail-toggle"
          onClick={onToggleRail}
          aria-label={listShown ? 'Hide exercise list' : 'Show exercise list'}
          aria-pressed={listShown}
          title={listShown ? 'Hide exercise list' : 'Show exercise list'}
        >
          ☰
        </button>
      )}
      <a className="logo" href="#/">Altair<i>Lab</i></a>
      <nav>
        <a href="#/" className={route.name === 'ex' ? 'on' : ''}>Exercises</a>
        <a href={sandboxHref} className={route.name === 'sandbox' ? 'on' : ''}>Sandbox</a>
      </nav>
      {!saveOk && <span className="save-warn" title="Progress could not be saved in this browser">not saved</span>}
      <button type="button" className="key-btn" onClick={() => setKeyOpen(true)} title="Set the Gemini key the tutor uses">
        AI key
      </button>
      <PythonStatus />
      <KeyDialog open={keyOpen} onClose={() => setKeyOpen(false)} />
    </header>
  )
}
