import { useEffect, useRef, useState } from 'react'
import { clearKey, loadKey, saveKey, testKey } from '../lib/gemini.js'
import './Dialog.css'

const STUDIO = 'https://aistudio.google.com/apikey'

// Asks for the learner's Gemini key, checks it with Google, and stores it in this browser.
// onSaved(key) runs after a key passed the check.
export function KeyDialog({ open, onClose, onSaved }) {
  const ref = useRef(null)
  const [key, setKey] = useState('')
  const [had, setHad] = useState(false)
  const [error, setError] = useState(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (open && !dlg.open) {
      const stored = loadKey()
      setKey(stored)
      setHad(Boolean(stored))
      setError(null)
      setTesting(false)
      dlg.showModal()
    } else if (!open && dlg.open) {
      dlg.close()
    }
  }, [open])

  const submit = async (e) => {
    e.preventDefault()
    const k = key.trim()
    if (!k) {
      setError('Paste a key first.')
      return
    }
    setTesting(true)
    setError(null)
    try {
      await testKey(k)
    } catch (err) {
      setTesting(false)
      setError(err.message)
      return
    }
    setTesting(false)
    if (!saveKey(k)) {
      setError("This browser won't let the app store the key, so it would be lost right away.")
      return
    }
    onSaved?.(k)
    onClose()
  }

  const forget = () => {
    clearKey()
    setKey('')
    setHad(false)
  }

  return (
    <dialog ref={ref} className="dlg" onClose={onClose} aria-label="Gemini key">
      {open && (
        <form className="dlg-form" onSubmit={submit}>
          <h2>Connect Gemini</h2>
          <p className="dlg-text">
            The tutor uses your own free Gemini key. It stays in this browser and is only sent to Google.
          </p>
          <ol className="dlg-steps">
            <li>
              Open <a href={STUDIO} target="_blank" rel="noreferrer">Google AI Studio</a> and sign in with a Google account.
            </li>
            <li>Click <b>Create API key</b>, then copy the key and paste it here.</li>
          </ol>
          <label>
            Gemini API key
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste your key"
            />
          </label>
          <p className="dlg-note">
            On Google's free tier, Google may use what you send to improve its products. Your code and the exercise are sent; nothing else.
          </p>
          {error && <p className="dlg-error" role="alert">{error}</p>}
          <div className="dlg-actions">
            {had && <button type="button" className="dlg-left" onClick={forget}>Forget key</button>}
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={testing}>{testing ? 'Checking…' : 'Save and test'}</button>
          </div>
        </form>
      )}
    </dialog>
  )
}
