import assert from 'node:assert/strict';
import { bootPython, run } from './pyodide-node.mjs';

const py = await bootPython();
const HEAD = 'import altair as alt\nimport pandas as pd\ndf = pd.DataFrame({"a":["x"],"b":[1]})\n';

const cases = [
  ['chart as last expression', HEAD + 'alt.Chart(df).mark_bar().encode(x="a:N", y="b:Q")', (r) => {
    assert.ok(r.spec);
    const m = r.spec.mark;
    assert.equal(typeof m === 'string' ? m : m.type, 'bar');
  }],
  ['assignment falls back to last chart variable', HEAD + 'c = alt.Chart(df).mark_bar()', (r) => assert.ok(r.spec)],
  ['no chart (assignment)', 'import altair as alt\nx = 1', (r) => assert.deepEqual(r, { noChart: true })],
  ['no chart (print)', 'print("hi")', (r) => assert.deepEqual(r, { noChart: true })],
  ['runtime error with line', '1/0', (r) => {
    assert.equal(r.error.type, 'ZeroDivisionError');
    assert.equal(r.error.line, 1);
  }],
  ['syntax error', 'alt.Chart(\n', (r) => assert.equal(r.error.type, 'SyntaxError')],
  ['bad encoding type does not crash', 'import altair as alt\nalt.Chart("u.csv").mark_bar().encode(x="nope_type:Z")', (r) => assert.ok(r.error)],
];

for (const [name, code, check] of cases) {
  check(await run(py, code));
  console.log(`ok - ${name}`);
}
