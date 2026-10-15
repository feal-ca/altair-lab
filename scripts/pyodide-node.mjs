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
