import './DataPanel.css'

const TYPE_NAMES = { N: 'nominal', O: 'ordinal', Q: 'quantitative', T: 'temporal' }

function stat(c) {
  if (c.type === 'Q' && c.min !== undefined) return `${c.min} to ${c.max}`
  if (c.unique !== undefined) return `${c.unique} unique`
  return ''
}

export function DataPanel({ dataset, onInsert }) {
  const columns = Array.isArray(dataset?.columns) ? dataset.columns : []
  const preview = (Array.isArray(dataset?.preview) ? dataset.preview : dataset?.rows ?? []).slice(0, 5)
  const heads = columns.map((c) => c.name)
  return (
    <div className="data-panel">
      <p className="data-note">Click a column to insert it into the editor.</p>
      <div className="data-cols">
        {columns.map((c) => (
          <button
            key={c.name}
            type="button"
            className="data-col"
            title={`${TYPE_NAMES[c.type] ?? c.type}${c.sample ? ' · ' + c.sample : ''}`}
            onClick={() => onInsert(`'${c.name}:${c.type}'`)}
          >
            <span className="nm">{c.name}</span>
            <span className="ty">{c.type}</span>
            <span className="st">{stat(c)}</span>
          </button>
        ))}
      </div>
      {preview.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>{heads.map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  {heads.map((h) => <td key={h}>{String(row?.[h] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
