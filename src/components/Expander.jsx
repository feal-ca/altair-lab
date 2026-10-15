import { useState } from 'react'
import './Expander.css'

export function Expander({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={open ? 'expander open' : 'expander'}>
      <button type="button" className="expander-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
        {title}
      </button>
      {open && <div className="expander-body">{children}</div>}
    </section>
  )
}
