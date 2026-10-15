import './CheckList.css'

export function CheckList({ checks = [], solved }) {
  const passed = checks.filter((c) => c.passed).length
  return (
    <section className="check-list">
      <h3 className={solved ? 'check-heading solved' : 'check-heading'}>
        {solved ? 'Solved' : `${passed} of ${checks.length} checks`}
      </h3>
      <ul>
        {checks.map((c) => (
          <li key={c.id} className={c.passed ? 'ok' : 'no'}>
            <span className="mark" aria-hidden="true">{c.passed ? '✓' : '—'}</span>
            <span>{c.label}</span>
            <span className="sr-only">{c.passed ? ' (passed)' : ' (not yet)'}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
