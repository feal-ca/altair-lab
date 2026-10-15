// Turns a runner result into the text shown to the learner. Plain ESM.

export const NO_CHART_MESSAGE = 'The last line should be a chart, e.g. `chart` or `ch1 + ch2`.'
export const TIMEOUT_MESSAGE = 'Your code ran for more than 10 seconds, so Python was restarted.'
export const DOWNLOAD_HINT =
  "vega_datasets can't download data in the browser; use the `.url` form, e.g. `data.cars.url`."

const looksLikeDownload = ({ type, message }) =>
  /^(URLError|OSError|ConnectionError)$/.test(String(type ?? '')) ||
  /urlopen|network|fetch/i.test(String(message ?? ''))

export function formatError(error) {
  const e = error && typeof error === 'object' ? error : { message: String(error ?? '') }
  const message = String(e.message ?? '').slice(0, 400)
  const where = e.line != null ? `Line ${e.line}: ` : ''
  const text = `${where}${e.type ? e.type + ': ' : ''}${message}`
  return looksLikeDownload(e) ? `${text}\n${DOWNLOAD_HINT}` : text
}

// resultToOutput(result) -> { spec } | { message } | { stale: true }
export function resultToOutput(result) {
  if (!result || result.stale) return { stale: true }
  if (result.spec) return { spec: result.spec }
  if (result.error) return { message: formatError(result.error) }
  if (result.timeout) return { message: TIMEOUT_MESSAGE }
  if (result.noChart) return { message: NO_CHART_MESSAGE }
  return { message: 'Python returned nothing.' }
}
