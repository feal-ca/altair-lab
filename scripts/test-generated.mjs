import { DATASETS } from '../src/content/datasets.js';
import { generateExercise } from '../src/lib/generator.js';
import { bootPython, run } from './pyodide-node.mjs';

const py = await bootPython();
let ok = 0, skipped = 0;
const failures = [];
for (const ds of Object.values(DATASETS)) {
  for (const level of ['Beginner', 'Intermediate', 'Advanced']) {
    for (let seed = 1; seed <= 3; seed++) {
      const ex = generateExercise(ds, level, seed);
      if (!ex) { skipped++; continue; }
      const r = await run(py, ex.solution);
      if (r.error || r.noChart || !r.spec) {
        failures.push(`${ex.id} [${ex.templateId}]: ${r.error ? r.error.type + ': ' + r.error.message : 'no chart'}`);
      } else ok++;
    }
  }
}
console.log(`generated OK: ${ok}, skipped (null): ${skipped}, failed: ${failures.length}`);
for (const f of failures) console.log('FAIL ' + f);
process.exit(failures.length ? 1 : 0);
