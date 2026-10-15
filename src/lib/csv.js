// CSV parsing and column inference for user-uploaded data.
// Plain ESM: no DOM or React imports, so Node tests can load it directly.

const MAX_BYTES = 1024 * 1024
const MAX_ROWS = 5000
const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/
const TEMPORAL = /^\d{4}-\d{2}-\d{2}/

// Splits CSV text into rows of raw string cells with a character state machine.
// Handles quoted fields, doubled quotes, CRLF/LF/CR endings and blank lines.
function splitRows(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let lineHasContent = false

  const endField = () => {
    row.push(field)
    field = ''
  }
  const endRow = () => {
    endField()
    if (lineHasContent) rows.push(row)
    row = []
    lineHasContent = false
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"' && field === '') {
      inQuotes = true
      lineHasContent = true
    } else if (ch === ',') {
      endField()
      lineHasContent = true
    } else if (ch === '\r') {
      if (text[i + 1] === '\n') i++
      endRow()
    } else if (ch === '\n') {
      endRow()
    } else {
      field += ch
      lineHasContent = true
    }
  }

  if (inQuotes) return { error: 'A quoted field is never closed. Check for a missing " in the CSV.' }
  if (lineHasContent) endRow()
  return { rows }
}

// Numeric-looking cells become numbers, empty cells become null, the rest stay strings.
function convertCell(raw) {
  if (raw.trim() === '') return null
  if (NUMERIC.test(raw.trim())) return Number(raw.trim())
  return raw
}

// parseCsv(text) -> { headers, rows } | { error }
export function parseCsv(text) {
  if (new TextEncoder().encode(text).length > MAX_BYTES) {
    return { error: 'The file is over 1 MB. Upload a smaller CSV.' }
  }
  const split = splitRows(text)
  if (split.error) return { error: split.error }
  if (split.rows.length === 0) return { error: 'The file is empty.' }

  const headers = split.rows[0].map((h) => h.trim())
  const body = split.rows.slice(1)
  if (body.length === 0) return { error: 'The file has a header row but no data rows.' }
  if (body.length > MAX_ROWS) {
    return { error: 'The file has more than 5,000 data rows. Upload a smaller CSV.' }
  }

  const rows = body.map((cells) => {
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = i < cells.length ? convertCell(cells[i]) : null
    })
    return obj
  })
  return { headers, rows }
}

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === ''

// inferColumns(headers, rows) -> column[]
// Q: every non-empty value is numeric (min, max, mean to 2 decimals).
// T: every non-empty value starts with YYYY-MM-DD.
// N: anything else (unique count and first three distinct values as sample).
export function inferColumns(headers, rows) {
  return headers.map((name) => {
    const values = rows.map((r) => r[name]).filter((v) => !isEmpty(v)).map((v) => String(v).trim())

    if (values.length === 0) return { name, type: 'N', unique: 0, sample: '' }

    if (values.every((v) => NUMERIC.test(v))) {
      const nums = values.map(Number)
      const sum = nums.reduce((a, b) => a + b, 0)
      const round2 = (x) => Math.round(x * 100) / 100
      return {
        name,
        type: 'Q',
        min: round2(Math.min(...nums)),
        max: round2(Math.max(...nums)),
        mean: round2(sum / nums.length),
      }
    }

    const distinct = [...new Set(values)]
    const type = values.every((v) => TEMPORAL.test(v)) ? 'T' : 'N'
    return {
      name,
      type,
      unique: distinct.length,
      sample: distinct.slice(0, 3).join(', '),
    }
  })
}

// datasetFromCsv(name, text) -> dataset | { error }, shaped like the entries in DATASETS.
export function datasetFromCsv(name, text) {
  const parsed = parseCsv(text)
  if (parsed.error) return { error: parsed.error }

  const { headers, rows } = parsed
  return {
    id: 'csv_' + Date.now().toString(36),
    name,
    description: `Uploaded CSV · ${rows.length} rows · ${headers.length} columns`,
    varName: 'df',
    source: 'inline',
    setupCode:
      'import io\nimport altair as alt\nimport pandas as pd\n\n' +
      'df = pd.read_csv(io.StringIO(' + JSON.stringify(text) + '))\n',
    columns: inferColumns(headers, rows),
    rows,
    preview: rows.slice(0, 5),
  }
}
