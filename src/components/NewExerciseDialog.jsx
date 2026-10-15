import { useEffect, useRef, useState } from 'react'
import { DATASETS } from '../content/datasets.js'
import { generateExercise } from '../lib/generator.js'
import { navigate } from '../lib/router.js'
import { CsvForm } from './CsvForm.jsx'
import './Dialog.css'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const UPLOAD = '__upload__'
const NO_MATCH = "This dataset doesn't have the columns that level needs. Try another level or dataset."

export function NewExerciseDialog({ open, onClose, state, update }) {
  const ref = useRef(null)
  const firstId = Object.keys(DATASETS)[0]
  const [datasetId, setDatasetId] = useState(firstId)
  const [level, setLevel] = useState('Beginner')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (open && !dlg.open) {
      setMessage(null)
      setDatasetId(firstId)
      dlg.showModal()
    } else if (!open && dlg.open) {
      dlg.close()
    }
  }, [open, firstId])

  const userDatasets = Object.values(state.datasets ?? {})
  const all = { ...DATASETS, ...(state.datasets ?? {}) }

  const generate = (e) => {
    e.preventDefault()
    const dataset = all[datasetId]
    const ex = dataset ? generateExercise(dataset, level) : null
    if (!ex) {
      setMessage(NO_MATCH)
      return
    }
    update((s) => ({ ...s, generated: [...(Array.isArray(s.generated) ? s.generated : []), ex] }))
    onClose()
    navigate(`#/ex/${encodeURIComponent(ex.id)}`)
  }

  const uploading = datasetId === UPLOAD

  return (
    <dialog ref={ref} className="dlg" onClose={onClose} aria-label="New exercise">
      {open && (uploading ? (
        <CsvForm
          update={update}
          onCancel={() => setDatasetId(firstId)}
          onAdded={(d) => {
            setDatasetId(d.id)
            setMessage(null)
          }}
        />
      ) : (
        <form className="dlg-form" onSubmit={generate}>
          <h2>New exercise</h2>
          <label>
            Dataset
            <select
              value={datasetId}
              onChange={(e) => {
                setDatasetId(e.target.value)
                setMessage(null)
              }}
            >
              {Object.values(DATASETS).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              {userDatasets.map((d) => <option key={d.id} value={d.id}>{d.name} (CSV)</option>)}
              <option value={UPLOAD}>Upload a CSV…</option>
            </select>
          </label>
          <fieldset>
            <legend>Level</legend>
            {LEVELS.map((l) => (
              <label key={l} className="radio">
                <input
                  type="radio"
                  name="level"
                  value={l}
                  checked={level === l}
                  onChange={() => {
                    setLevel(l)
                    setMessage(null)
                  }}
                />
                {l}
              </label>
            ))}
          </fieldset>
          {message && <p className="dlg-error" role="alert">{message}</p>}
          <div className="dlg-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary">Generate</button>
          </div>
        </form>
      ))}
    </dialog>
  )
}
