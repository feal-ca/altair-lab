import './CheckList.css'

// Collapsed by default: the summary line toggles the list. `solved` can come from the
// visual match while some checks still fail (the chart looks right, the code differs).
export function CheckList({ checks = [], solved, open, onToggle }) {
  const passed = checks.filter((c) => c.passed).length
  const all = passed === checks.length
  const summary = all
    ? `All ${checks.length} checks pass`
    : solved
      ? `Chart matches · ${passed} of ${checks.length} checks`
      : `${passed} of ${checks.length} checks`
  return (
    <section className="check-list">
      <button
        type="button"
        className={solved ? 'check-heading solved' : 'check-heading'}
        aria-expanded={open ? 'true' : 'false'}
        onClick={onToggle}
      >
        <span className="caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
        {summary}
      </button>
      {open && (
        <ul>
          {checks.map((c) => (
            <li key={c.id} className={c.passed ? 'ok' : 'no'}>
              <span className="mark" aria-hidden="true">{c.passed ? '✓' : '—'}</span>
              <span>{c.label}</span>
              <span className="sr-only">{c.passed ? ' (passed)' : ' (not yet)'}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
