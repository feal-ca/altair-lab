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
} from '@codemirror/autocomplete'
import {
  HighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
} from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
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
})

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
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap]),
]

export const Editor = forwardRef(function Editor({ value, onChange, onRun, completions }, ref) {
  const host = useRef(null)
  const view = useRef(null)
  const latest = useRef({ onChange, onRun, completions })
  latest.current = { onChange, onRun, completions }

  useEffect(() => {
    const source = (context) => {
      const word = context.matchBefore(/[\w.]+/)
      if (!word || (word.from === word.to && !context.explicit)) return null
      // A column completion applies `'name:T'` with its own quotes, so swallow a quote
      // typed before the word and an auto-closed one right after the cursor.
      const doc = context.state.doc
      const quoteBefore = /['"]/.test(doc.sliceString(Math.max(0, word.from - 1), word.from))
      const quoteAfter = /['"]/.test(doc.sliceString(word.to, word.to + 1))
      return {
        from: word.from,
        options: (latest.current.completions || []).map((c) => {
          const quoted = typeof c.apply === 'string' && /^'.*'$/.test(c.apply)
          if (!quoted || !quoteBefore) return { label: c.label, apply: c.apply, detail: c.detail }
          return {
            label: c.label,
            detail: c.detail,
            apply: (view, _completion, from, to) => {
              const f = from - 1
              const t = quoteAfter ? to + 1 : to
              view.dispatch({
                changes: { from: f, to: t, insert: c.apply },
                selection: { anchor: f + c.apply.length },
              })
            },
          }
        }),
        validFor: /^[\w.]*$/,
      }
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
          Prec.highest(
            keymap.of([
            indentWithTab,
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
