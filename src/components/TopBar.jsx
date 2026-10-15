import { DATASETS } from '../content/datasets.js'
import { PythonStatus } from './PythonStatus.jsx'
import './TopBar.css'

export function TopBar({ route, railCollapsed, onToggleRail, saveOk }) {
  const sandboxHref = `#/sandbox/${route.name === 'sandbox' && route.id ? route.id : Object.keys(DATASETS)[0]}`
  return (
    <header className="topbar">
      {route.name === 'ex' && (
        <button
          type="button"
          className="rail-toggle"
          onClick={onToggleRail}
          aria-label={railCollapsed ? 'Show exercise list' : 'Hide exercise list'}
          aria-pressed={!railCollapsed}
          title={railCollapsed ? 'Show exercise list' : 'Hide exercise list'}
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
      <PythonStatus />
    </header>
  )
}
