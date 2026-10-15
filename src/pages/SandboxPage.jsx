import { useEffect, useRef, useState } from 'react'
import { DATASETS } from '../content/datasets.js'
import { IDLE_MESSAGE, useLiveRun } from '../lib/useLiveRun.js'
import { navigate } from '../lib/router.js'
import { Expander } from '../components/Expander.jsx'
import { DataPanel } from '../components/DataPanel.jsx'
import { Editor } from '../components/Editor.jsx'
import { ChartCard } from '../components/ChartCard.jsx'
import { CsvForm } from '../components/CsvForm.jsx'
import '../components/Brief.css'
import '../components/Rail.css'
import './ExercisePage.css'
import '../components/Dialog.css'

const starterFor = (ds) => ds.setupCode + '\nalt.Chart(' + ds.varName + ').mark_point()\n'

function DatasetRail({ datasets, activeId, onAdd }) {
  const user = Object.values(datasets.user)
  const link = (d) => (
    <a
      key={d.id}
      className={'rail-it' + (d.id === activeId ? ' on' : '')}
      href={`#/sandbox/${encodeURIComponent(d.id)}`}
      aria-current={d.id === activeId ? 'page' : undefined}
      title={d.name}
    >
      <span className="t">{d.name}</span>
    </a>
  )
  return (
    <nav className="rail" aria-label="Datasets">
      <div className="rail-list">
        <div className="rail-grp">Built-in</div>
        {Object.values(datasets.builtin).map(link)}
        {user.length > 0 && <div className="rail-grp">Your CSVs</div>}
        {user.map(link)}
      </div>
      <div className="rail-foot">
        <button type="button" className="rail-new" onClick={onAdd}>+ Add CSV</button>
      </div>
    </nav>
  )
}

// Keyed by dataset id in App, so local state starts fresh per dataset.
export function SandboxPage({ dataset, state, update }) {
  const id = dataset.id
  const editor = useRef(null)
  const dialog = useRef(null)
  const [csvOpen, setCsvOpen] = useState(false)
  const starter = starterFor(dataset)
  const stored = state.sandboxCode?.[id]
  const { code, out, onChange, runNow, reset, columns } = useLiveRun({
    initialCode: typeof stored === 'string' ? stored : starter,
    starter,
    dataset,
    onCodeChange: (next) =>
      update((s) => ({ ...s, sandboxCode: { ...(s.sandboxCode ?? {}), [id]: next } })),
  })

  useEffect(() => {
    const dlg = dialog.current
    if (!dlg) return
    if (csvOpen && !dlg.open) dlg.showModal()
    else if (!csvOpen && dlg.open) dlg.close()
  }, [csvOpen])

  return (
    <>
      <DatasetRail
        datasets={{ builtin: DATASETS, user: state.datasets ?? {} }}
        activeId={id}
        onAdd={() => setCsvOpen(true)}
      />
      <section className="pane work">
        <header className="brief">
          <div className="meta">Sandbox</div>
          <h1>{dataset.name}</h1>
          <p className="task">{dataset.description}</p>
          <Expander title="Data">
            <DataPanel dataset={dataset} onInsert={(text) => editor.current?.insertAtCursor(text)} />
          </Expander>
        </header>
        <div className="editor-bar">
          <span className="hint">Ctrl+Enter runs</span>
          <button type="button" onClick={() => reset(editor)}>Reset</button>
          <button type="button" className="primary" onClick={runNow}>Run</button>
        </div>
        <div className="editor-wrap">
          <Editor ref={editor} value={code} onChange={onChange} onRun={runNow} columns={columns} />
        </div>
      </section>
      <section className="pane out">
        <ChartCard title="Output" spec={out.spec} message={out.message} placeholder={IDLE_MESSAGE} />
      </section>
      <dialog ref={dialog} className="dlg" onClose={() => setCsvOpen(false)} aria-label="Add a CSV">
        {csvOpen && (
          <CsvForm
            update={update}
            onCancel={() => setCsvOpen(false)}
            onAdded={(d) => {
              setCsvOpen(false)
              navigate(`#/sandbox/${encodeURIComponent(d.id)}`)
            }}
          />
        )}
      </dialog>
    </>
  )
}
