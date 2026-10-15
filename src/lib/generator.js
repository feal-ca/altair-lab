// Role-aware exercise generator. Plain Node ESM: no Vite-only features.
const DOCS = 'https://altair-viz.github.io/user_guide/';
const TIME_NAME = /year|date|month/i;

export const pyStr = (s) => JSON.stringify(s);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function columnRoles(dataset) {
  const cols = dataset.columns || [];
  return {
    cat: cols.filter((c) => (c.type === 'N' || c.type === 'O') && c.unique >= 2 && c.unique <= 12),
    quant: cols.filter((c) => c.type === 'Q'),
    time: cols.filter((c) => c.type === 'T' || (c.type === 'O' && TIME_NAME.test(c.name))),
  };
}

const f = (c) => pyStr(c.name + ':' + c.type);
const q = (c) => '`' + c.name + '`';

export const TEMPLATES = [
  {
    id: 'bar-mean', level: 'Beginner', needs: { cat: 1, quant: 1 },
    concept: 'Aggregation turns many rows into one summary value per category, here the mean.',
    docs: DOCS + 'encodings/index.html#aggregation',
    build(ds, pick) {
      const c = pick('cat'), v = pick('quant');
      if (!c || !v) return null;
      return {
        title: `Mean ${v.name} by ${c.name}`,
        task: `Using \`${ds.varName}\`, draw a bar chart with ${q(c)} on X and the mean of ${q(v)} on Y.`,
        hints: [
          'Start with `alt.Chart(...)` and call `.mark_bar()`.',
          `Encode the channels: \`.encode(x=${f(c)}, y=${pyStr('mean(' + v.name + '):Q')})\`.`,
          'Put the aggregate inside the field string, as `mean(field):Q`.',
        ],
        chart: `alt.Chart(${ds.varName}).mark_bar().encode(x=${f(c)}, y=${pyStr('mean(' + v.name + '):Q')})`,
      };
    },
  },
  {
    id: 'scatter', level: 'Beginner', needs: { cat: 1, quant: 2 },
    concept: 'A scatter plot maps two quantitative fields to position and a category to colour.',
    docs: DOCS + 'marks/point.html',
    build(ds, pick) {
      const v = pick('quant'), v2 = pick('quant', [v]), c = pick('cat');
      if (!v || !v2 || !c) return null;
      return {
        title: `${v2.name} vs ${v.name} by ${c.name}`,
        task: `Using \`${ds.varName}\`, draw a scatter plot of filled circles with ${q(v)} on X, ${q(v2)} on Y, and colour by ${q(c)}.`,
        hints: [
          'Start with `alt.Chart(...)` and call `.mark_circle()`.',
          `Encode the channels: \`.encode(x=${f(v)}, y=${f(v2)}, color=${f(c)})\`.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_circle().encode(x=${f(v)}, y=${f(v2)}, color=${f(c)})`,
      };
    },
  },
  {
    id: 'line-time', level: 'Beginner', needs: { quant: 1, time: 1 },
    concept: 'Aggregating over a temporal axis gives a trend line of one summary value per time step.',
    docs: DOCS + 'marks/line.html',
    build(ds, pick) {
      const t = pick('time'), v = pick('quant');
      if (!t || !v) return null;
      return {
        title: `Mean ${v.name} over ${t.name}`,
        task: `Using \`${ds.varName}\`, draw a line chart with ${q(t)} on X and the mean of ${q(v)} on Y.`,
        hints: [
          'Start with `alt.Chart(...)` and call `.mark_line()`.',
          `Encode the channels: \`.encode(x=${f(t)}, y=${pyStr('mean(' + v.name + '):Q')})\`.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_line().encode(x=${f(t)}, y=${pyStr('mean(' + v.name + '):Q')})`,
      };
    },
  },
  {
    id: 'bar-sorted', level: 'Intermediate', needs: { cat: 1, quant: 1 },
    concept: 'Colour schemes and sort orders are set through scale and sort options on a channel.',
    docs: DOCS + 'encodings/channels.html',
    build(ds, pick) {
      const c = pick('cat'), v = pick('quant');
      if (!c || !v) return null;
      return {
        title: `${c.name} Ranked by Mean ${v.name}`,
        task: `Using \`${ds.varName}\`, draw a horizontal bar chart with the mean of ${q(v)} on X and ${q(c)} on Y, sorted by descending X. Colour the bars by ${q(c)} with the \`set2\` scheme and hide the legend.`,
        hints: [
          'Start with `alt.Chart(...)` and call `.mark_bar()`.',
          `Use \`alt.Y(${f(c)}, sort='-x')\` for the sorted axis and \`x=${pyStr('mean(' + v.name + '):Q')}\`.`,
          `Colour with \`alt.Color(${f(c)}, scale=alt.Scale(scheme='set2'), legend=None)\`.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_bar().encode(x=${pyStr('mean(' + v.name + '):Q')}, y=alt.Y(${f(c)}, sort='-x'), color=alt.Color(${f(c)}, scale=alt.Scale(scheme='set2'), legend=None))`,
      };
    },
  },
  {
    id: 'histogram', level: 'Intermediate', needs: { quant: 1 },
    concept: 'Binning groups a quantitative field into intervals so counts per interval can be drawn as bars.',
    docs: DOCS + 'encodings/index.html#binning',
    build(ds, pick) {
      const v = pick('quant');
      if (!v) return null;
      return {
        title: `Distribution of ${v.name}`,
        task: `Using \`${ds.varName}\`, draw a histogram of ${q(v)}: bins on X (at most 20 bins) and the count of rows on Y.`,
        hints: [
          'Start with `alt.Chart(...)` and call `.mark_bar()`.',
          `Bin the X field with \`alt.X(${f(v)}, bin=alt.Bin(maxbins=20))\`.`,
          "Use `y='count():Q'` for the bar heights.",
        ],
        chart: `alt.Chart(${ds.varName}).mark_bar().encode(x=alt.X(${f(v)}, bin=alt.Bin(maxbins=20)), y='count():Q')`,
      };
    },
  },
  {
    id: 'line-color-title', level: 'Intermediate', needs: { cat: 1, quant: 1, time: 1 },
    concept: 'Colour splits one line into a line per category, and properties add a chart title.',
    docs: DOCS + 'marks/line.html',
    build(ds, pick) {
      const t = pick('time'), c = pick('cat', [t]), v = pick('quant');
      if (!t || !c || !v) return null;
      const title = `Mean ${v.name} over time by ${c.name}`;
      return {
        title: `Mean ${v.name} over ${t.name} by ${c.name}`,
        task: `Using \`${ds.varName}\`, draw a line chart with point markers, ${q(t)} on X, the mean of ${q(v)} on Y, and one line per ${q(c)} (colour). Give the chart the title "${title}".`,
        hints: [
          'Start with `alt.Chart(...)` and call `.mark_line(point=True)`.',
          `Encode the channels: \`.encode(x=${f(t)}, y=${pyStr('mean(' + v.name + '):Q')}, color=${f(c)})\`.`,
          `Add the title with \`.properties(title=${pyStr(title)})\`.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_line(point=True).encode(x=${f(t)}, y=${pyStr('mean(' + v.name + '):Q')}, color=${f(c)}).properties(title=${pyStr(title)})`,
      };
    },
  },
  {
    id: 'bar-mean-rule', level: 'Advanced', needs: { cat: 1, quant: 1 },
    concept: 'Layering with `+` draws several charts in one view, here bars plus a rule at the overall mean.',
    docs: DOCS + 'compound_charts.html',
    build(ds, pick) {
      const c = pick('cat'), v = pick('quant');
      if (!c || !v) return null;
      const m = pyStr('mean(' + v.name + '):Q');
      return {
        title: `Mean ${v.name} by ${c.name} with Overall Mean`,
        task: `Using \`${ds.varName}\`, layer two charts. The first is a bar chart with ${q(c)} on X and the mean of ${q(v)} on Y. The second is a crimson rule (stroke width 2) at the overall mean of ${q(v)} on Y. Store them as \`bars\` and \`rule\` and end with \`bars + rule\`.`,
        hints: [
          `Build \`bars = alt.Chart(${ds.varName}).mark_bar().encode(x=${f(c)}, y=${m})\`.`,
          `Build \`rule\` with \`.mark_rule(color='crimson', strokeWidth=2)\` and only \`y=${m}\`.`,
          'Combine the layers with `bars + rule`.',
        ],
        chart: `bars = alt.Chart(${ds.varName}).mark_bar().encode(x=${f(c)}, y=${m})\nrule = alt.Chart(${ds.varName}).mark_rule(color='crimson', strokeWidth=2).encode(y=${m})\nbars + rule`,
      };
    },
  },
  {
    id: 'scatter-regression', level: 'Advanced', needs: { quant: 2 },
    concept: 'A regression transform fits a line to the data, and layering draws it over the points.',
    docs: DOCS + 'transform/regression.html',
    build(ds, pick) {
      const v = pick('quant'), v2 = pick('quant', [v]);
      if (!v || !v2) return null;
      return {
        title: `${v2.name} vs ${v.name} with Regression Line`,
        task: `Using \`${ds.varName}\`, draw circles (opacity 0.6) with ${q(v)} on X and ${q(v2)} on Y, then layer a crimson regression line of ${q(v2)} on ${q(v)}. Store the points as \`points\` and the line as \`line\`, and end with \`points + line\`.`,
        hints: [
          `Build \`points = alt.Chart(${ds.varName}).mark_circle(opacity=0.6).encode(x=${f(v)}, y=${f(v2)})\`.`,
          `Fit the line with \`points.transform_regression(${pyStr(v.name)}, ${pyStr(v2.name)}).mark_line(color='crimson')\`.`,
          'Combine the layers with `points + line`.',
        ],
        chart: `points = alt.Chart(${ds.varName}).mark_circle(opacity=0.6).encode(x=${f(v)}, y=${f(v2)})\nline = points.transform_regression(${pyStr(v.name)}, ${pyStr(v2.name)}).mark_line(color='crimson')\npoints + line`,
      };
    },
  },
  {
    id: 'facet', level: 'Advanced', needs: { cat: 1, quant: 2 },
    concept: 'Faceting splits a chart into small multiples, one panel per category.',
    docs: DOCS + 'encodings/channels.html',
    build(ds, pick) {
      const v = pick('quant'), v2 = pick('quant', [v]), c = pick('cat');
      if (!v || !v2 || !c) return null;
      return {
        title: `${v2.name} vs ${v.name} Faceted by ${c.name}`,
        task: `Using \`${ds.varName}\`, draw a point chart with ${q(v)} on X and ${q(v2)} on Y, coloured by ${q(c)}, with one column of panels per ${q(c)}.`,
        hints: [
          'Start with `alt.Chart(...)` and call `.mark_point()`.',
          `Encode the channels: \`.encode(x=${f(v)}, y=${f(v2)}, color=${f(c)})\`.`,
          `Add \`column=${f(c)}\` to the encode call to facet.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_point().encode(x=${f(v)}, y=${f(v2)}, color=${f(c)}, column=${f(c)})`,
      };
    },
  },
];

function meets(needs, roles) {
  return Object.entries(needs).every(([k, n]) => roles[k].length >= n);
}

export function generateExercise(dataset, level, seed = Date.now()) {
  const roles = columnRoles(dataset);
  const rand = mulberry32(seed);
  const candidates = TEMPLATES.filter((t) => t.level === level && meets(t.needs, roles));
  // Seeded shuffle so a template that cannot be filled falls through to the next one.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  for (const tpl of candidates) {
    const pick = (role, exclude = []) => {
      const pool = roles[role].filter((c) => !exclude.includes(c));
      return pool.length ? pool[Math.floor(rand() * pool.length)] : null;
    };
    const out = tpl.build(dataset, pick);
    if (!out) continue;
    return {
      id: 'gen-' + dataset.id + '-' + level[0].toLowerCase() + '-' + seed.toString(36),
      n: null,
      title: out.title,
      level,
      topic: 'Generated',
      task: out.task,
      hints: out.hints,
      concept: tpl.concept,
      docs: tpl.docs,
      datasetId: dataset.id,
      solution: dataset.setupCode + '\n' + out.chart,
      templateId: tpl.id,
    };
  }
  return null;
}
