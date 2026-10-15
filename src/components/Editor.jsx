import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightActiveLine,
  drawSelection,
} from '@codemirror/view'
import { EditorState, Prec } from '@codemirror/state'
import { history, historyKeymap, defaultKeymap, indentWithTab } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  snippetCompletion,
  startCompletion,
} from '@codemirror/autocomplete'
import {
  HighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
} from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { complete } from '../lib/completions.js'
import './Editor.css'

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--sheet)', color: 'var(--ink)', height: '100%' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: '1.6' },
  '.cm-content': { caretColor: 'var(--ink)' },
  '.cm-gutters': {
    backgroundColor: 'var(--sheet)',
    color: 'var(--faint)',
    borderRight: '1px solid var(--grid)',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(0,0,0,0.03)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--muted)' },
  '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--ink)' },
  '.cm-tooltip': {
    fontFamily: 'var(--font-mono)',
    border: '1px solid var(--rule)',
    backgroundColor: 'var(--sheet)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--ink)',
    color: 'var(--paper)',
  },
  '.cm-completionDetail': { color: 'var(--muted)', fontStyle: 'normal', marginLeft: '1.2em' },
  '.cm-tooltip-autocomplete ul li[aria-selected] .cm-completionDetail': { color: 'var(--grid)' },
  '.cm-snippetField': { backgroundColor: 'transparent' },
})

// Turns a completions.js option into a CodeMirror completion. Snippets put the cursor
// inside `()` or `''` (Tab jumps past them); `reopen` shows the next list right away,
// e.g. the column names after `alt.X('`.
function toCompletion(o) {
  const info = { label: o.label, detail: o.detail, type: o.type, boost: o.boost }
  const c = o.snippet ? snippetCompletion(o.snippet, info) : { ...info, apply: o.apply }
  if (!o.reopen) return c
  const insert = c.apply
  return {
    ...c,
    apply: (view, completion, from, to) => {
      if (typeof insert === 'function') insert(view, completion, from, to)
      else view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + insert.length } })
      setTimeout(() => startCompletion(view), 0)
    },
  }
}

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: 'var(--kw)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--str)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--accent)' },
  { tag: t.comment, color: 'var(--faint)', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--ink)', fontWeight: '500' },
])

// basicSetup minus the fold gutter, which the redesign does not use.
const setup = [
  lineNumbers(),
  highlightActiveLineGutter(),
  history(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  highlightActiveLine(),
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap, indentWithTab]),
]

export const Editor = forwardRef(function Editor({ value, onChange, onRun, columns }, ref) {
  const host = useRef(null)
  const view = useRef(null)
  const latest = useRef({ onChange, onRun, columns })
  latest.current = { onChange, onRun, columns }

  useEffect(() => {
    const source = (context) => {
      const r = complete(context.state.doc.toString(), context.pos, latest.current.columns, context.explicit)
      if (!r) return null
      return { from: r.from, options: r.options.map(toCompletion), validFor: r.validFor }
    }
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value ?? '',
        extensions: [
          setup,
          python(),
          theme,
          syntaxHighlighting(highlight),
          // Tab stays at normal precedence so an active snippet can use it to jump fields.
          Prec.highest(
            keymap.of([
              {
                key: 'Mod-Enter',
                run: () => {
                  latest.current.onRun?.()
                  return true
                },
              },
            ])
          ),
          autocompletion({ override: [source] }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) latest.current.onChange?.(u.state.doc.toString())
          }),
        ],
      }),
    })
    view.current = v
    return () => v.destroy()
    // The editor is created once; value changes arrive through setValue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the document in sync when the parent swaps the value (e.g. another exercise).
  useEffect(() => {
    const v = view.current
    if (v && value !== undefined && value !== v.state.doc.toString()) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
    }
  }, [value])

  useImperativeHandle(ref, () => ({
    insertAtCursor(text) {
      const v = view.current
      if (!v) return
      const { from, to } = v.state.selection.main
      v.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      })
      v.focus()
    },
    setValue(text) {
      const v = view.current
      if (!v) return
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } })
    },
  }))

  return <div className="editor-host" ref={host} />
})
