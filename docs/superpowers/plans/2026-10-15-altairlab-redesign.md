# AltairLab Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild AltairLab (browser Altair practice app) with fixed bugs, a part-by-part spec checker, a sandbox, a better generator, a "Lab notebook / Graphite" UI, and deploy it to GitHub Pages.

**Architecture:** Vite + React 19 single-page app with hash routing. Python (Pyodide 314 + Altair 6.3) runs in a module Web Worker behind a promise client. Curated targets are precomputed by a Node script that runs each solution under Pyodide (`targets.json`). Pure logic (checker, CSV, storage, generator) lives in `src/lib/` with Vitest tests; UI in `src/components/` + `src/pages/` with plain CSS tokens.

**Tech Stack:** React 19, Vite 8, Vitest, CodeMirror 6, vega 6 / vega-lite 6 / vega-embed 7, Pyodide 314.0.7 (CDN in browser, npm in Node), Altair 6.3.0, @fontsource.

**Spec:** `docs/superpowers/specs/2026-10-15-altairlab-redesign-design.md` (read it first). Visual reference: `docs/design/mockup-lab-notebook.html`, option **B "Graphite"** (CSS class `cool2`); layout reference: `docs/design/mockup-layouts.html`, option **B**, with a narrow rail. The original prototype is in git history (`git show e5ae5f2:src/App.jsx`): it holds all dataset and exercise content to migrate.

## Global Constraints

- UI copy in English. No Tailwind. No runtime requests to Google Fonts.
- Pyodide `v314.0.7` from `https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs`; Python packages: `pandas` (Pyodide dist), `altair==6.3.0`, `vega_datasets` (micropip). Altair 5.5.0 does NOT import on Python 3.14; do not use it.
- Altair 6.3 emits Vega-Lite `v6.4.1` schema → npm `vega-lite@^6.4`, `vega@^6`, `vega-embed@^7`.
- Hash routes: `#/ex/<id>`, `#/sandbox/<datasetId>`. Vite `base: './'`.
- Run timeout 10 000 ms; editor debounce 600 ms; CSV caps 5 000 rows / 1 MB.
- localStorage key `altairlab:v1`; every access in try/catch.
- Graphite tokens: paper `#f4f4f2`, grid `#e3e3df` (18 px), sheet `#fcfcfb`, ink `#1c1c1c`, ink2 `#444`, muted `#767676`, faint `#adadaa`, rule `#cacac4`, accent `#e0452b`, ok `#2f7a55`, code kw `#3a5f8a`, str `#8a5a1a`. Fonts: Fraunces (headings, italic labels), Instrument Sans (UI), JetBrains Mono (code/meta).
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Infinite loop / very slow user code → after 10 s Python restarts and the panel says so; the tab never freezes. (Test in Task 8.)
2. Last line is an assignment, `print(...)`, or nothing chart-like → falls back to last chart variable, else a clear "no chart" message; never a stale chart. (Test in Task 3.)
3. Messy CSV: quoted commas, escaped quotes, CRLF, empty cells, ragged rows, header only → parses or reports a clear error, never throws. (Test in Task 5.)
4. localStorage unavailable (throws) or quota exceeded → app works, progress just isn't saved. (Test in Task 6.)
5. User adds extra things the target doesn't ask for (tooltip, extra mark props) or writes `alt.X('a:N')` vs `x='a:N'` → still solved; key order never matters. (Test in Task 4.)

---

### Task 1: Scaffold the new stack

**Files:** Modify `package.json`, `index.html`, `vite.config.js`, `src/main.jsx`; Create `src/styles/tokens.css`, `src/styles/base.css`, `vitest.config.js` (or `test` block in vite config); Replace `src/App.jsx` with a placeholder shell.

- [ ] Install: `npm i react@19 react-dom@19 vega@6 vega-lite@6 vega-embed@7 codemirror @codemirror/lang-python @codemirror/autocomplete @codemirror/commands @codemirror/state @codemirror/view @fontsource-variable/fraunces @fontsource/instrument-sans @fontsource/jetbrains-mono` and `npm i -D vite@8 @vitejs/plugin-react@6 vitest jsdom pyodide@314.0.7`. Commit `package-lock.json`.
- [ ] `index.html`: remove every `<script src=cdn...>` (Tailwind, vega, pyodide) and body classes; title `AltairLab · practise Altair in the browser`; keep `<div id="root">` + module script.
- [ ] `src/styles/tokens.css`: define the Graphite tokens above as `--paper`, `--grid`, `--sheet`, `--ink`, `--ink2`, `--muted`, `--faint`, `--rule`, `--accent`, `--ok`, `--kw`, `--str`, plus `--font-head: 'Fraunces Variable', serif; --font-ui: 'Instrument Sans', sans-serif; --font-mono: 'JetBrains Mono', monospace;`.
- [ ] `src/styles/base.css`: reset, `body { background: var(--paper) linear-gradient(var(--grid) 1px, transparent 1px) 0 0/18px 18px, linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0/18px 18px; color: var(--ink); font: 14px/1.45 var(--font-ui); }`, focus-visible outline in accent.
- [ ] `src/main.jsx`: import fontsource packages + both CSS files; render `<App/>` in StrictMode.
- [ ] Verify `npm run build` and `npx vitest run --passWithNoTests` succeed. Commit "Scaffold React 19 / Vite 8 stack, drop Tailwind CDN".

### Task 2: Content modules

**Files:** Create `src/content/datasets.js`, `src/content/exercises.js`, `src/content/altairApi.js`, `src/content/content.test.js`.

**Produces:**
- `DATASETS: Record<id, { id, name, description, varName, setupCode, source: 'inline'|'url', rows?: object[], url?: string, preview: object[], columns: {name, type:'N'|'O'|'Q'|'T', unique?, sample?, min?, max?, mean?}[] }>` — `setupCode` = old `importCode`; inline datasets carry **all** rows (transcribe from the setup code: eu_lollipop 10, smoking_rates 10, catalan_tennis 35, priestley_income 24, phyllum_bullet 18); `preview = rows.slice(0,5)` for inline, old 5-row `rows` for URL datasets.
- `EXERCISES: { id, n, title, level:'Beginner'|'Intermediate'|'Advanced', topic, task, hints: string[], concept: string, docs: string, datasetId, solution }[]` — migrated from old `CURATED_CHALLENGES` (drop `targetSpec`, drop the "N. " prefix from titles, `task` = old `prompt`, `solution` = old `solutionCode`).
- `TOPICS = ['Basics','Transforms & scales','Layering','Advanced']`.
- `ALTAIR_API: {label, apply, detail}[]` = old `ALTAIR_SUGGESTIONS` (`apply` = old `insert`) plus `mark_tick`, `mark_rect`, `transform_bin`, `alt.Tooltip`, `alt.value`, `alt.datum`.

Topic / concept / docs per exercise (base `https://altair-viz.github.io/user_guide/`):

| id | topic | concept (write as given) | docs |
|---|---|---|---|
| nb1-bar-color | Basics | Each encoding channel maps a column to a visual property; the `:N` suffix tells Altair the column is nominal (unordered categories). | encodings/index.html |
| nb1-iphone-tooltip | Basics | Mark properties like `shape` and `filled` style every mark the same way, while the `tooltip` channel adds per-point detail on hover. | marks/point.html |
| nb1-cars-opacity | Basics | Any channel can carry data: here opacity encodes horsepower, so fainter points are less powerful cars. | encodings/channels.html |
| nb1-line-stroke | Basics | Fixed styling passed to `mark_line()` (dash pattern, width, opacity) applies to the whole line, independent of the data. | marks/line.html |
| nb1-stocks-predicate | Transforms & scales | `transform_calculate` derives a new field with a Vega expression; `transform_filter` keeps rows matching a predicate, and predicates combine with `&`, `\|` and `~`. | transform/filter.html |
| nb1-jobs-scale | Transforms & scales | A scale's `domain` lists data values and its `range` the colours they map to; `axis=alt.Axis(format='%')` changes only how ticks are printed. | customization.html |
| nb1-barley-grouped | Transforms & scales | Encoding `column` splits one chart into small multiples, one panel per category, sharing the same axes. | compound_charts.html |
| nb2-pie-labels | Layering | Building charts from a shared base lets layers reuse the same theta and order, so the labels land on their slices. | marks/arc.html |
| nb2-superposition-jobs | Layering | `+` overlays charts; `resolve_scale(color='independent')` gives each layer its own colour scale and legend. | compound_charts.html |
| nb2-lollipop-eu | Layering | A lollipop is two layers on the same encodings: a thin bar for the stick and a point for the head. `sort='-x'` orders categories by the x value, descending. | compound_charts.html |
| nb2-connected-dot | Layering | The `detail` channel groups rows without adding colour, so the line connects the two dots of each country. | encodings/channels.html |
| nb2-regression-cars | Layering | `transform_regression` replaces the data with a fitted curve; `method='poly', order=2` fits a parabola instead of a line. | transform/regression.html |
| nb2-priestley-range | Layering | `x` and `x2` give a bar its start and end, so each bar spans from the minimum to the maximum income. | encodings/channels.html |
| nb2-bump-tennis | Advanced | `transform_window` with `row_number()` ranks rows inside each group (here, each year) after sorting them. | transform/window.html |
| nb2-us-airports-map | Advanced | `mark_geoshape` draws map features from TopoJSON; a projection like `albersUsa` turns longitude/latitude into screen positions. | marks/geoshape.html |
| nb2-parallel-coords | Advanced | `transform_fold` turns several columns into key/value rows, and `transform_joinaggregate` adds each key's min and max so values can be normalised to 0–1. | transform/fold.html |

- [ ] Write `content.test.js`: ids unique; every `datasetId` exists in `DATASETS`; every exercise has ≥1 hint, a concept and a docs URL; every inline dataset's `rows.length` equals the row count in its `setupCode` (assert explicit numbers: eu_lollipop 10, smoking_rates 10, catalan_tennis 35, priestley_income 24, phyllum_bullet 18, country_pop 10, iphone_data 14, fruit_pie 5); `preview.length <= 5`.
- [ ] Run `npx vitest run src/content` → FAIL (modules missing). Create the modules. Run → PASS. Commit "Move datasets and exercises into content modules".

### Task 3: Python runner + precomputed targets

**Files:** Create `src/lib/python/runner.py`, `scripts/pyodide-node.mjs`, `scripts/build-targets.mjs`, `scripts/test-runner.mjs`, generated `src/content/targets.json`. Add npm scripts `"targets": "node scripts/build-targets.mjs"`, `"test:py": "node scripts/test-runner.mjs"`.

**Produces:** `runner.py` defines `run_user_code(code: str) -> str` returning JSON of exactly one of `{"spec": {...}}`, `{"noChart": true}`, `{"error": {"type", "message", "line"}}`. `targets.json`: `{ [exerciseId]: vegaLiteSpec }`. `scripts/pyodide-node.mjs` exports `async function bootPython()` → pyodide instance with packages installed and `runner.py` executed.

```python
# src/lib/python/runner.py
import ast, json, traceback
import altair as alt

alt.data_transformers.disable_max_rows()

def _is_chart(v):
    return isinstance(v, alt.TopLevelMixin)

def _err(e, line=None):
    return json.dumps({"error": {"type": type(e).__name__, "message": str(e), "line": line}})

def run_user_code(code):
    try:
        tree = ast.parse(code, "<user>")
    except SyntaxError as e:
        return _err(e, e.lineno)
    ns = {"__name__": "__main__"}
    try:
        result = None
        body = tree.body
        if body and isinstance(body[-1], ast.Expr):
            exec(compile(ast.Module(body=body[:-1], type_ignores=[]), "<user>", "exec"), ns)
            result = eval(compile(ast.Expression(body=body[-1].value), "<user>", "eval"), ns)
        else:
            exec(compile(tree, "<user>", "exec"), ns)
        if not _is_chart(result):
            charts = [v for k, v in ns.items() if not k.startswith("_") and _is_chart(v)]
            result = charts[-1] if charts else None
        if result is None:
            return json.dumps({"noChart": True})
        return json.dumps({"spec": json.loads(result.to_json())})
    except Exception as e:
        frames = traceback.extract_tb(e.__traceback__)
        line = next((f.lineno for f in reversed(frames) if f.filename == "<user>"), None)
        return _err(e, line)
```

```js
// scripts/pyodide-node.mjs
import { loadPyodide } from 'pyodide';
import { readFile } from 'node:fs/promises';
export async function bootPython() {
  const py = await loadPyodide();
  await py.loadPackage(['micropip', 'pandas']);
  await py.pyimport('micropip').install(['altair==6.3.0', 'vega_datasets']);
  await py.runPythonAsync(await readFile(new URL('../src/lib/python/runner.py', import.meta.url), 'utf8'));
  return py;
}
export async function run(py, code) {
  py.globals.set('_code', code);
  return JSON.parse(await py.runPythonAsync('run_user_code(_code)'));
}
```

- [ ] `scripts/test-runner.mjs` (Review Focus 2): boot, then assert with `node:assert`:
  - `'import altair as alt\nimport pandas as pd\ndf = pd.DataFrame({"a":["x"],"b":[1]})\nalt.Chart(df).mark_bar().encode(x="a:N", y="b:Q")'` → has `spec.mark` = `{type:'bar'}` or `'bar'`.
  - same but last line `c = alt.Chart(df).mark_bar()` → `spec` present (fallback).
  - `'import altair as alt\nx = 1'` → `{noChart:true}`.
  - `'print("hi")'` → `{noChart:true}`.
  - `'1/0'` → `error.type === 'ZeroDivisionError'`, `error.line === 1`.
  - `'alt.Chart(\n'` → `error.type === 'SyntaxError'`.
  - `'import altair as alt\nalt.Chart("u.csv").mark_bar().encode(x="nope_type:Z")'` → `error` (no crash).
- [ ] Run `npm run test:py` → FAIL (files missing), create files, → PASS.
- [ ] `scripts/build-targets.mjs`: import `EXERCISES` from `../src/content/exercises.js`, run each `solution`; if any result lacks `spec`, print id + error and `process.exit(1)`; write `src/content/targets.json` (2-space JSON). Run `npm run targets` → 16 targets written. Commit "Add Python runner and precomputed targets".

### Task 4: Checker

**Files:** Create `src/lib/checker.js`, `src/lib/checker.test.js`.

**Produces:** `normalize(spec) → { layout: 'single'|'layer'|'hconcat'|'vconcat'|'concat'|'facet', views: {mark:{type,...}, encoding:{[ch]:{...}}, transform:object[]}[], title?: string, width?: number, height?: number }` and `check(userSpec, targetSpec) → { checks: {id: string, label: string, passed: boolean}[], solved: boolean }`. `check(null, t)` returns all target checks failed.

Rules (from spec): drop `$schema, config, data, datasets, autosize, usermeta`; `layer` → views (merge top-level `mark/encoding/transform` into each layer, layer keys win; recurse into nested layers); `hconcat/vconcat/concat` → views per panel; `{facet, spec}` → layout `facet`, views from `spec`; marks as objects; title as text (`typeof t === 'object' ? t.text : t`). Encoding keys kept: `field, type, aggregate, timeUnit, bin, value, sort, stack, title, scale, axis.format, legend.title`. Deep equality via `canon(v)` = JSON with sorted keys.

Checks, in order: `structure` ("2 layers" / "single view" / "2 panels side by side"); per view i: `mark-i` (label like `layer 1: mark_point(size=50, filled=True)`, passes if type and every target mark prop deep-equal); per channel: `enc-i-ch` (label `y: country (N)` or `x: sum(yield) (Q)` or `color: value steelblue`), and for each set option `opt-i-ch-key` (labels: `y: sort -x`, `color: scale`, `y: axis format %`, `color: legend title "Gender"`, `x: title "Income"`, `theta: stack`); per target transform `tr-i-k` (label = first key + short value, e.g. `filter: (datum.job === 'Welder')`, truncated to 48 chars; passes if user view i contains a canon-equal transform); `title`, `width`, `height` when set. For single-view targets omit the "layer 1:" prefix.

- [ ] Write tests first (fixtures: hand-written specs shaped like Altair output, plus `targets.json` entries):
  - every target in `targets.json` checked against itself → `solved: true` (loop over all 16).
  - lollipop target vs same spec with `sort` removed from layer 2's `y` → not solved, exactly the `opt-1-y-sort` check fails.
  - Review Focus 5: target `{mark:'bar', encoding:{x:{field:'a',type:'nominal'}}}` vs user `{mark:{type:'bar',tooltip:true}, encoding:{x:{type:'nominal',field:'a'}, tooltip:{field:'b',type:'quantitative'}}}` → solved.
  - layer count mismatch → `structure` fails, no exception when user has fewer views.
  - top-level shared encoding: user `{encoding:{x:{field:'a',type:'nominal'}}, layer:[{mark:'bar'},{mark:'point'}]}` vs target with `x` inside each layer → solved.
  - transform with different key order → passes.
  - `check(null, target)` → every check `passed:false`, `solved:false`.
- [ ] Run → FAIL; implement; run → PASS. Commit "Add part-by-part Vega-Lite checker".

### Task 5: CSV parsing and column inference

**Files:** Create `src/lib/csv.js`, `src/lib/csv.test.js`.

**Produces:** `parseCsv(text) → { headers: string[], rows: object[] } | { error: string }`; `inferColumns(headers, rows) → column[]` (type Q if every non-empty value is numeric, T if every non-empty value matches `/^\d{4}-\d{2}-\d{2}/`, else N; Q gets min/max/mean (2 decimals), others unique + sample of first 3 distinct); `datasetFromCsv(name, text) → dataset | {error}` building a `DATASETS`-shaped object with `id: 'csv_' + Date.now().toString(36)`, `varName: 'df'`, `source:'inline'`, `setupCode = "import io\nimport altair as alt\nimport pandas as pd\n\ndf = pd.read_csv(io.StringIO(" + JSON.stringify(text) + "))\n"`, preview first 5 rows. Limits: text > 1 MB or > 5 000 data rows → `{error}` with the limit in the message. Numeric cells become numbers, empty cells `null`.

- [ ] Tests (Review Focus 3): quoted comma `a,"b,c"`; escaped quote `"say ""hi"""`; CRLF line endings; trailing newline; empty cell → `null`; ragged row (fewer cells) → missing keys `null`, no throw; header only → `{error}`; empty string → `{error}`; 5 001 rows → `{error}` mentioning 5,000; inference: `['1','2.5','']` → Q with min 1 max 2.5; `['2020-01-01']` → T; mixed → N; `datasetFromCsv` setupCode contains `pd.read_csv(io.StringIO(`.
- [ ] FAIL → implement (character state machine, no regex split) → PASS. Commit "Add CSV parser with type inference".

### Task 6: Storage

**Files:** Create `src/lib/storage.js`, `src/lib/storage.test.js`.

**Produces:** `loadState() → State`, `saveState(state) → boolean` (false if write failed), `DEFAULT_STATE = { solved: {}, code: {}, sandboxCode: {}, datasets: {}, generated: [], railCollapsed: false }`, `resetState()`. Key `altairlab:v1`. `loadState` merges stored JSON over `DEFAULT_STATE`; corrupt JSON → default. Also `useStoredState()` hook in `src/lib/useStoredState.js`: returns `[state, update(fn), saveOk]`, saves on change (debounced 300 ms).

- [ ] Tests (Review Focus 4) with a fake `localStorage` on `globalThis`: round trip; corrupt JSON → default; `getItem` throws → default, no throw; `setItem` throws (quota) → `saveState` returns false, no throw; missing keys filled from default.
- [ ] FAIL → implement → PASS. Commit "Add localStorage persistence".

### Task 7: Exercise generator

**Files:** Create `src/lib/generator.js`, `src/lib/generator.test.js`, `scripts/test-generated.mjs` (npm script `test:gen`).

**Produces:** `columnRoles(dataset) → { cat: col[], quant: col[], time: col[] }` (cat = N/O with `unique` 2..12; quant = Q; time = T, plus O columns whose name matches `/year|date|month/i`); `TEMPLATES` (array of `{ id, level, needs: {cat?:n, quant?:n, time?:n}, build(ds, pick) → { title, task, hints, chart } }`); `generateExercise(dataset, level, seed = Date.now()) → exercise | null` returning an `EXERCISES`-shaped object with `id: 'gen-' + dataset.id + '-' + level[0].toLowerCase() + '-' + seed.toString(36)`, `topic: 'Generated'`, `concept` from the template, `docs` from the template, `solution = dataset.setupCode + '\n' + chart`. Use a seeded PRNG (mulberry32) for template/column choice so the same seed gives the same exercise. No target here: the UI computes it by running `solution` (Task 10).

Templates (`v` = varName, `c`/`c2` = cat cols, `q`/`q2` = quant, `t` = time; field shorthand `'name:T'` with the column's type letter):

| id | level | chart code |
|---|---|---|
| bar-mean | Beginner | `alt.Chart(v).mark_bar().encode(x='c:N', y='mean(q):Q')` |
| scatter | Beginner | `alt.Chart(v).mark_circle().encode(x='q:Q', y='q2:Q', color='c:N')` |
| line-time | Beginner | `alt.Chart(v).mark_line().encode(x='t:T', y='mean(q):Q')` |
| bar-sorted | Intermediate | `alt.Chart(v).mark_bar().encode(x='mean(q):Q', y=alt.Y('c:N', sort='-x'), color=alt.Color('c:N', scale=alt.Scale(scheme='set2'), legend=None))` |
| histogram | Intermediate | `alt.Chart(v).mark_bar().encode(x=alt.X('q:Q', bin=alt.Bin(maxbins=20)), y='count():Q')` |
| line-color-title | Intermediate | `alt.Chart(v).mark_line(point=True).encode(x='t:T', y='mean(q):Q', color='c:N').properties(title='Mean q over time by c')` |
| bar-mean-rule | Advanced | `bars = alt.Chart(v).mark_bar().encode(x='c:N', y='mean(q):Q')\nrule = alt.Chart(v).mark_rule(color='crimson', strokeWidth=2).encode(y='mean(q):Q')\nbars + rule` |
| scatter-regression | Advanced | `points = alt.Chart(v).mark_circle(opacity=0.6).encode(x='q:Q', y='q2:Q')\nline = points.transform_regression('q', 'q2').mark_line(color='crimson')\npoints + line` |
| facet | Advanced | `alt.Chart(v).mark_point().encode(x='q:Q', y='q2:Q', color='c:N', column='c:N')` |

Task text is written per template in plain English naming every channel, e.g. bar-mean: ``Using `v`, draw a bar chart with `c` on X and the mean of `q` on Y.``; hints: first names the mark method, second gives the `.encode(...)` call, optional third for transforms/properties. Column names in code must be quoted with Python-safe escaping (use a helper `pyStr(s)` = `JSON.stringify(s)`), since CSV headers can contain spaces or quotes. Titles: e.g. `Mean Horsepower by Origin`. Each template also carries `concept` (one sentence on its main idea: aggregation, binning, colour schemes, layering, regression or faceting) and `docs` (the matching user_guide URL from the Task 2 table, e.g. `transform/regression.html`, `encodings/index.html#binning`, `compound_charts.html`).

- [ ] Unit tests: `columnRoles` on `DATASETS.cars` gives cat `Origin`, `Cylinders`, quant includes `Horsepower`, time `Year`; same seed → identical exercise; airports dataset (cat `iata` has 3 376 unique) never uses `iata` as cat; a dataset with only N columns → `generateExercise` returns `null` for every level; every template's `needs` is respected.
- [ ] `scripts/test-generated.mjs`: for every built-in dataset × level × seeds 1..3, generate and run `solution` with `bootPython`/`run` from Task 3; fail on any `error`. (Skip datasets where generation returns null.) Run `npm run test:gen` → PASS.
- [ ] Commit "Add role-aware exercise generator".

### Task 8: Python worker + client

**Files:** Create `src/lib/python/worker.js`, `src/lib/python/client.js`, `src/lib/python/client.test.js`.

**Produces:** `createPython({ createWorker = () => new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }), timeoutMs = 10000 } = {}) → { run(code): Promise<Result>, subscribe(cb: (status) => void): () => void, retry(): void }` where `Result = {spec} | {noChart:true} | {error:{type,message,line}} | {timeout:true} | {stale:true}` and `status = { phase: 'loading'|'ready'|'error', step?: string, error?: string }`. One shared instance exported as `python` from `src/lib/python/index.js` (created lazily on first import, so StrictMode cannot double-load).

Protocol: main → worker `{type:'run', id, code}`; worker → main `{type:'status', phase, step?, error?}` and `{type:'result', id, result}`. `worker.js`: `import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs'`, `import runnerSrc from './runner.py?raw'`; post status steps "Starting Python", "Loading pandas", "Installing Altair", then `ready`; on failure `phase:'error'` with message. Queue runs received before ready. Client: each `run` gets an incrementing id; only the latest pending run resolves with its result, earlier pending ones resolve `{stale:true}`; if no result within `timeoutMs` → `worker.terminate()`, create a new worker, resolve `{timeout:true}`.

- [ ] Tests with a fake worker class (`postMessage` records messages, test calls `onmessage` manually), using `vi.useFakeTimers()`:
  - result with matching id resolves `run`.
  - two quick runs → first resolves `{stale:true}`, second gets its result.
  - Review Focus 1: no reply for 10 000 ms → resolves `{timeout:true}`, old worker `terminate` called, factory called a second time.
  - status messages reach subscribers; unsubscribe stops them.
- [ ] FAIL → implement → PASS. Commit "Run Python in a restartable Web Worker".

### Task 9: Editor and chart components

**Files:** Create `src/components/Editor.jsx`, `src/components/ChartCard.jsx`, `src/components/CheckList.jsx`, `src/lib/vegaTheme.js`, CSS files alongside (`Editor.css`, `ChartCard.css`, `CheckList.css`).

**Produces:**
- `<Editor value onChange onRun completions ref />`; ref exposes `insertAtCursor(text)` (replaces selection, focuses) and `setValue(text)`. CodeMirror: `basicSetup` minus fold gutter, `python()`, `keymap.of([indentWithTab, { key: 'Mod-Enter', run: () => { onRun(); return true; } }])`, `autocompletion({ override: [source] })` where `source` completes the word before the cursor (`/[\w.]+/`) against `completions` (`{label, apply, detail}`) and replaces the typed prefix. Theme via `EditorView.theme` using CSS vars (sheet background, `--font-mono`, gutter faint, keywords `--kw`, strings `--str`, numbers `--accent`). Debounce lives in the page, not here.
- `vegaTheme.js`: `export const baseConfig = { font: 'Instrument Sans', axis: { labelFont: 'JetBrains Mono', labelColor: '#444', titleColor: '#1c1c1c', domainColor: '#adadaa', tickColor: '#adadaa', gridColor: '#e3e3df' }, legend: { labelColor: '#444', titleColor: '#1c1c1c' }, title: { font: 'Fraunces Variable', color: '#1c1c1c', fontWeight: 600 }, view: { stroke: '#e3e3df' } }`.
- `<ChartCard title spec message />`: `vegaEmbed(el, spec, { actions: false, renderer: 'svg', config: baseConfig })`; keep the returned view and call `view.finalize()` on spec change/unmount; render `message` (string or node) instead of a chart when given; catch embed errors and show them as the message. Confirm in vega-embed docs that spec `config` overrides `opts.config`; if not, deep-merge `{...baseConfig, ...spec.config}` yourself and pass it.
- `<CheckList checks solved />`: heading `N of M checks`, rows with accent ✓ for passed and faint — for failed; when `solved`, heading "Solved" in Fraunces with accent.
- [ ] Verify visually in Task 10. Commit "Add editor, chart card and check list components".

### Task 10: App shell and Exercises page

**Files:** Rewrite `src/App.jsx`; Create `src/lib/router.js`, `src/components/TopBar.jsx`, `src/components/PythonStatus.jsx`, `src/components/Rail.jsx`, `src/components/Brief.jsx`, `src/components/Expander.jsx`, `src/components/DataPanel.jsx`, `src/pages/ExercisePage.jsx`, CSS per component, `src/lib/router.test.js`.

**Produces:** `useRoute() → { name: 'ex'|'sandbox', id?: string }` from `location.hash` (`''` → `{name:'ex', id: EXERCISES[0].id}`), `navigate(hash)`. `allExercises(state) = [...EXERCISES, ...state.generated]`.

- [ ] Router test: `#/ex/nb1-bar-color`, `#/sandbox/cars`, empty hash, unknown → default.
- [ ] TopBar per mockup: wordmark `Altair<i>Lab</i>` (Fraunces, "Lab" italic in accent), nav links Exercises / Sandbox (active underlined in accent), `PythonStatus` right (mono, ok colour when ready, step text while loading, error + Retry button calling `python.retry()`).
- [ ] Rail (170 px, collapsible via a button in the top bar; state in `railCollapsed`): groups by `TOPICS` + "Generated", italic Fraunces group labels, mono numbers, ✓ in accent for solved, active row inverted (ink bg, paper text). Footer: "+ New exercise" (opens dialog from Task 11) and a small "Reset progress" (confirm, then `resetState()`).
- [ ] Brief: meta line `№ n · level · topic` (mono, muted), Fraunces title, task text, three `Expander`s: Hints (reveal one at a time; after last: "Show solution" → `<pre>` + "Load into editor" with `confirm()`), Data (`DataPanel`: column cards, click → `editor.insertAtCursor("'" + name + ":" + type + "'")`, then `head(5)` table from `preview`), Concept (text + "Altair docs ↗" link, `target=_blank rel=noopener`).
- [ ] ExercisePage wiring: code = `state.code[id] ?? dataset.setupCode + '\n'`; on change save to state and debounce 600 ms → `python.run(code)`; skip run if code has no `alt.`; result handling: `spec` → yours chart; `error` → message `Line {line}: {type}: {message}` (message truncated to 400 chars); `noChart` → "The last line should be a chart, e.g. `chart` or `ch1 + ch2`."; `timeout` → "Your code ran for more than 10 seconds, so Python was restarted."; `stale` → ignore. Target: `targets[id]` for curated; for generated, run `solution` once Python is ready and cache in component state. `check(userSpec, target)` → CheckList; on first `solved` set `state.solved[id] = true` and show "Next →" (next exercise in list order). Reset button restores starter code.
- [ ] Layout CSS grid `170px minmax(0,1.25fr) minmax(0,1fr)` (rail collapsed → `0`), full viewport height under the top bar, panes scroll independently.
- [ ] Manual check with `npm run dev` and headless Chromium screenshot (`chromium-browser --headless=new --screenshot=… --window-size=1440,900 http://localhost:5173/#/ex/nb2-lollipop-eu`): compare against the Graphite mockup; solve exercise 1 by loading the solution → "Solved". Commit "Build exercise workspace".

### Task 11: Sandbox and New exercise dialog

**Files:** Create `src/pages/SandboxPage.jsx`, `src/components/NewExerciseDialog.jsx`, `src/components/CsvForm.jsx`, CSS.

- [ ] SandboxPage (`#/sandbox/<datasetId>`, default first dataset): rail lists built-in datasets then `state.datasets` (user CSVs) and a "+ Add CSV" row opening `CsvForm` in a `<dialog>`; brief area shows dataset name + description + Data expander; editor (code in `state.sandboxCode[datasetId]`, starter `setupCode + "\nalt.Chart(" + varName + ").mark_point()\n"`); single ChartCard titled "Output"; no checks.
- [ ] CsvForm: name input, textarea, file input (`file.text()`), "Add dataset" → `datasetFromCsv`; show `error` inline; on success store in `state.datasets` and call `onAdded(dataset)`.
- [ ] NewExerciseDialog (native `<dialog>`): dataset select (built-in + user CSVs + "Upload a CSV…" which swaps in `CsvForm`), level radio group, "Generate" → `generateExercise`; `null` → inline message "This dataset doesn't have the columns that level needs. Try another level or dataset."; success → push to `state.generated`, navigate to `#/ex/<id>`.
- [ ] Manual check: add a CSV with a quoted comma, generate a Beginner exercise on it, solve via "Load into editor". Commit "Add sandbox, CSV upload and exercise generator UI".

### Task 12: Small screens, polish, full verification

**Files:** CSS files; `README.md`.

- [ ] Below 900 px: rail becomes an off-canvas drawer toggled from the top bar; panes stack (brief + editor, then output); editor min-height 240 px; no horizontal page scroll at 375 px.
- [ ] Empty/edge states: "Yours" placeholder "Write some Altair code; the chart shows up here." (italic Fraunces, muted); storage failure notice (one line under top bar) when `saveOk` is false.
- [ ] README: what AltairLab is, `npm ci`, `npm run dev`, `npm test` (`vitest run`), `npm run test:py`, `npm run test:gen`, `npm run targets` (when to rerun: after editing an exercise solution), deploy note. Run the humanizer skill on the README prose (user's global CLAUDE.md requires it).
- [ ] Run everything: `npx vitest run`, `npm run test:py`, `npm run test:gen`, `npm run build`. Screenshots at 1440×900 and 390×844 of an exercise, sandbox and the dialog; fix anything off. Commit "Responsive layout, empty states, README".

### Task 13: Deploy to GitHub Pages

**Files:** Modify `.github/workflows/deploy.yml`.

- [ ] Workflow: Node 22, `cache: 'npm'`, `npm ci`, `npx vitest run`, `npm run build`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` (`./dist`), `actions/deploy-pages@v4`. (No Pyodide scripts in CI.)
- [ ] `gh repo create feal-ca/altair-lab --public --source . --remote origin --description "Practise Python Altair in the browser"`; `gh api -X POST repos/feal-ca/altair-lab/pages -f build_type=workflow`; `git push -u origin main`.
- [ ] `gh run watch` until the deploy succeeds; open `https://feal-ca.github.io/altair-lab/#/ex/nb1-bar-color` in headless Chromium (allow ~20 s for Pyodide), load the solution and confirm "Solved". Report the URL to the user.

---

## Self-review notes

- Spec coverage: screens (T10–T12), visual system (T1, T9, T10), worker (T8), runner (T3), targets (T3), checker (T4), generator (T7), CSV (T5), persistence (T6), routing (T10), error handling (T3, T8, T10, T12), testing (T2–T8, T12), deployment (T13). Bug list from spec is covered by T1 (Tailwind/CDN, deps), T2 (truncated rows), T3/T8 (runner, worker, StrictMode), T4 (checker), T9 (cursor insert, Tab), T13 (workflow lockfile).
- Names used across tasks: `DATASETS`, `EXERCISES`, `TOPICS`, `ALTAIR_API`, `targets.json`, `run_user_code`, `bootPython`/`run`, `check`/`normalize`, `parseCsv`/`inferColumns`/`datasetFromCsv`, `loadState`/`saveState`/`resetState`/`useStoredState`, `columnRoles`/`generateExercise`, `createPython`/`python`, `baseConfig`, `useRoute`/`navigate`.
