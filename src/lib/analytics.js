// Pageview counting with GoatCounter (no cookies, so no consent banner).
// Dashboard: https://georgiou.goatcounter.com
const GOATCOUNTER_CODE = 'georgiou'

// The app routes on the hash, which GoatCounter ignores by default, so the
// counted path is built from it: '#/ex/nb1-bar-color' -> '/ex/nb1-bar-color'.
// Generated exercises and uploaded CSVs carry a per-user seed or timestamp;
// it is dropped so they group into one row per dataset and level.
export function countPath(hash) {
  const path = '/' + String(hash ?? '').replace(/^#\/?/, '')
  return path
    .replace(/^\/ex\/(gen-.+-[a-z])-[0-9a-z]+$/, '/ex/$1')
    .replace(/^\/sandbox\/csv_[0-9a-z]+$/, '/sandbox/csv')
}

export function initAnalytics() {
  window.goatcounter = { path: () => countPath(location.hash) }
  window.addEventListener('hashchange', () => {
    window.goatcounter.count?.({ path: countPath(location.hash) })
  })
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://gc.zgo.at/count.js'
  script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`
  document.head.appendChild(script)
}
