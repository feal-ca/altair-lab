import { useState } from 'react'
import { datasetFromCsv } from '../lib/csv.js'
import './Dialog.css'

// Adds a user CSV to state.datasets. Parsing problems show inline; nothing throws.
export function CsvForm({ update, onAdded, onCancel }) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState(null)

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setText(await file.text())
      if (!name.trim()) setName(file.name.replace(/\.[^.]*$/, ''))
      setError(null)
    } catch {
      setError('Could not read that file.')
    }
  }

  const submit = (e) => {
    e.preventDefault()
    const result = datasetFromCsv(name.trim() || 'My dataset', text)
    if (result.error) {
      setError(result.error)
      return
    }
    update((s) => ({ ...s, datasets: { ...(s.datasets ?? {}), [result.id]: result } }))
    onAdded(result)
  }

  return (
    <form className="dlg-form" onSubmit={submit}>
      <h2>Add a CSV</h2>
      <label>
        Name
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="My dataset" />
      </label>
      <label>
        CSV file
        <input type="file" accept=".csv,text/csv,text/plain" onChange={onFile} />
      </label>
      <label>
        Or paste CSV text
        <textarea
          value={text}
          rows={7}
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
          placeholder={'city,population\n"Paris, FR",2.1'}
        />
      </label>
      <p className="dlg-note">Up to 5 000 rows and 250 KB. The first row must hold the column names.</p>
      {error && <p className="dlg-error" role="alert">{error}</p>}
      <div className="dlg-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Add dataset</button>
      </div>
    </form>
  )
}
