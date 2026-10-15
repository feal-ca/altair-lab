import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs';
import runnerSrc from './runner.py?raw';

let pyodide = null;
let ready = false;
const queue = [];

const status = (phase, extra = {}) => self.postMessage({ type: 'status', phase, ...extra });

async function runOne({ id, code }) {
  let result;
  try {
    pyodide.globals.set('_code', code);
    result = JSON.parse(await pyodide.runPythonAsync('run_user_code(_code)'));
  } catch (e) {
    result = { error: { type: 'WorkerError', message: String(e?.message ?? e), line: null } };
  }
  self.postMessage({ type: 'result', id, result });
}

self.onmessage = (e) => {
  const m = e.data;
  if (m.type !== 'run') return;
  if (ready) runOne(m);
  else queue.splice(0, queue.length, m); // before ready only the newest run matters
};

(async () => {
  try {
    status('loading', { step: 'Starting Python' });
    pyodide = await loadPyodide();
    pyodide.setStdout({ batched: () => {} });
    pyodide.setStderr({ batched: () => {} });
    status('loading', { step: 'Loading pandas' });
    await pyodide.loadPackage(['micropip', 'pandas']);
    status('loading', { step: 'Installing Altair' });
    await pyodide.pyimport('micropip').install(['altair==6.3.0', 'vega_datasets']);
    await pyodide.runPythonAsync(runnerSrc);
    ready = true;
    status('ready');
    // The queue holds at most the newest run; the client already marked older ones stale.
    for (const m of queue.splice(0)) await runOne(m);
  } catch (err) {
    status('error', { error: String(err?.message ?? err) });
  }
})();
