import { writeFile } from 'node:fs/promises';
import { EXERCISES } from '../src/content/exercises.js';
import { bootPython, run } from './pyodide-node.mjs';

const py = await bootPython();
const targets = {};
let failed = false;
for (const ex of EXERCISES) {
  const r = await run(py, ex.solution);
  if (!r.spec) {
    console.error(`FAIL ${ex.id}:`, JSON.stringify(r));
    failed = true;
  } else {
    targets[ex.id] = r.spec;
  }
}
if (failed) process.exit(1);
await writeFile(new URL('../src/content/targets.json', import.meta.url), JSON.stringify(targets, null, 2) + '\n');
console.log(`wrote ${Object.keys(targets).length} targets`);
