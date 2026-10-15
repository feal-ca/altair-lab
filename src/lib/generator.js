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
const agg = (op, c) => pyStr(`${op}(${c.name}):Q`);
const datum = (c) => (/^[A-Za-z_]\w*$/.test(c.name) ? `alt.datum.${c.name}` : `alt.datum[${pyStr(c.name)}]`);
// A readable threshold near the column mean (2 significant digits).
const threshold = (c) => Number(Number(c.mean ?? ((c.min + c.max) / 2)).toPrecision(2));

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
  {
    id: 'tick-strip', level: 'Beginner', needs: { cat: 1, quant: 1 },
    concept: 'A strip plot draws every single value as a tick, so the spread inside each category stays visible.',
    docs: DOCS + 'marks/tick.html',
    build(ds, pick) {
      const c = pick('cat'), v = pick('quant');
      if (!c || !v) return null;
      return {
        title: `Every ${v.name} by ${c.name} (Strip Plot)`,
        task: `Using \`${ds.varName}\`, draw ticks with thickness 2: ${q(v)} on X, ${q(c)} on Y, coloured by ${q(c)}.`,
        hints: [
          'Start with `alt.Chart(...)` and call `.mark_tick(thickness=2)`.',
          `Encode the channels: \`.encode(x=${f(v)}, y=${f(c)}, color=${f(c)})\`.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_tick(thickness=2).encode(x=${f(v)}, y=${f(c)}, color=${f(c)})`,
      };
    },
  },
  {
    id: 'donut', level: 'Beginner', needs: { cat: 1, quant: 1 },
    concept: 'mark_arc maps a quantity to the angle (theta); an inner radius turns the pie into a donut.',
    docs: DOCS + 'marks/arc.html',
    build(ds, pick) {
      const c = pick('cat'), v = pick('quant');
      if (!c || !v) return null;
      return {
        title: `Share of ${v.name} by ${c.name} (Donut)`,
        task: `Using \`${ds.varName}\`, draw a donut chart (inner radius 50) whose slices are the sum of ${q(v)} per ${q(c)}, coloured by ${q(c)}.`,
        hints: [
          'Start with `alt.Chart(...)` and call `.mark_arc(innerRadius=50)`.',
          `Encode the channels: \`.encode(theta=${agg('sum', v)}, color=${f(c)})\`.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_arc(innerRadius=50).encode(theta=${agg('sum', v)}, color=${f(c)})`,
      };
    },
  },
  {
    id: 'area-time', level: 'Beginner', needs: { quant: 1, time: 1 },
    concept: 'An area mark fills the space under a line, which stresses the amount rather than only the trend.',
    docs: DOCS + 'marks/area.html',
    build(ds, pick) {
      const t = pick('time'), v = pick('quant');
      if (!t || !v) return null;
      return {
        title: `Total ${v.name} over ${t.name} (Area)`,
        task: `Using \`${ds.varName}\`, draw an area chart with opacity 0.7: ${q(t)} on X and the sum of ${q(v)} on Y.`,
        hints: [
          'Start with `alt.Chart(...)` and call `.mark_area(opacity=0.7)`.',
          `Encode the channels: \`.encode(x=${f(t)}, y=${agg('sum', v)})\`.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_area(opacity=0.7).encode(x=${f(t)}, y=${agg('sum', v)})`,
      };
    },
  },
  {
    id: 'scatter-shape', level: 'Intermediate', needs: { cat: 1, quant: 2 },
    concept: 'Encoding a category twice, with colour and shape, keeps the groups apart even in grayscale.',
    docs: DOCS + 'marks/point.html',
    build(ds, pick) {
      const v = pick('quant'), v2 = pick('quant', [v]), c = pick('cat');
      if (!v || !v2 || !c) return null;
      return {
        title: `${v2.name} vs ${v.name}, Shaped by ${c.name}`,
        task: `Using \`${ds.varName}\`, draw filled points of size 80 with ${q(v)} on X and ${q(v2)} on Y. Encode ${q(c)} with both colour and shape.`,
        hints: [
          'Use `.mark_point(filled=True, size=80)`.',
          `Encode \`x=${f(v)}, y=${f(v2)}, color=${f(c)}, shape=${f(c)}\`.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_point(filled=True, size=80).encode(x=${f(v)}, y=${f(v2)}, color=${f(c)}, shape=${f(c)})`,
      };
    },
  },
  {
    id: 'heatmap', level: 'Intermediate', needs: { cat: 2, quant: 1 },
    concept: 'A heatmap crosses two categories on X and Y and shows a value through the colour of each cell.',
    docs: DOCS + 'marks/rect.html',
    build(ds, pick) {
      const c = pick('cat'), c2 = pick('cat', [c]), v = pick('quant');
      if (!c || !c2 || !v) return null;
      return {
        title: `Mean ${v.name} by ${c.name} and ${c2.name} (Heatmap)`,
        task: `Using \`${ds.varName}\`, draw a heatmap with ${q(c)} on X, ${q(c2)} on Y, and cells coloured by the mean of ${q(v)} with the \`viridis\` scheme.`,
        hints: [
          'Use `.mark_rect()`.',
          `Encode \`x=${f(c)}, y=${f(c2)}\`.`,
          `Colour with \`alt.Color(${agg('mean', v)}, scale=alt.Scale(scheme='viridis'))\`.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_rect().encode(x=${f(c)}, y=${f(c2)}, color=alt.Color(${agg('mean', v)}, scale=alt.Scale(scheme='viridis')))`,
      };
    },
  },
  {
    id: 'bar-condition', level: 'Intermediate', needs: { cat: 1, quant: 1 },
    concept: 'alt.condition colours each mark by a test; aggregating first with transform_aggregate gives the test a named field to compare.',
    docs: DOCS + 'transform/aggregate.html',
    build(ds, pick) {
      const c = pick('cat'), v = pick('quant');
      if (!c || !v) return null;
      const thr = threshold(v);
      return {
        title: `${c.name} with Mean ${v.name} above ${thr}`,
        task: `Using \`${ds.varName}\`, compute \`avg\` = mean of ${q(v)} per ${q(c)} with transform_aggregate, then draw bars of ${q(c)} (X) by avg:Q (Y). Bars with avg above ${thr} are crimson, the rest light gray.`,
        hints: [
          `Aggregate with \`.transform_aggregate(avg=${pyStr('mean(' + v.name + ')')}, groupby=[${pyStr(c.name)}])\`.`,
          `Encode \`x=${f(c)}, y='avg:Q'\`.`,
          `Colour with \`alt.condition(alt.datum.avg > ${thr}, alt.value('crimson'), alt.value('lightgray'))\`.`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_bar().encode(x=${f(c)}, y='avg:Q', color=alt.condition(alt.datum.avg > ${thr}, alt.value('crimson'), alt.value('lightgray'))).transform_aggregate(avg=${pyStr('mean(' + v.name + ')')}, groupby=[${pyStr(c.name)}])`,
      };
    },
  },
  {
    id: 'boxplot', level: 'Intermediate', needs: { cat: 1, quant: 1 },
    concept: 'mark_boxplot is a composite mark: from raw values it draws median, quartiles and whiskers per category.',
    docs: DOCS + 'marks/boxplot.html',
    build(ds, pick) {
      const c = pick('cat'), v = pick('quant');
      if (!c || !v) return null;
      return {
        title: `Distribution of ${v.name} by ${c.name} (Box Plot)`,
        task: `Using \`${ds.varName}\`, draw box plots whose whiskers reach the min and max: ${q(c)} on X, ${q(v)} on Y, coloured by ${q(c)}.`,
        hints: [
          "Use `.mark_boxplot(extent='min-max')`.",
          `Encode \`x=${f(c)}, y=${f(v)}, color=${f(c)}\` (raw values, no aggregate).`,
        ],
        chart: `alt.Chart(${ds.varName}).mark_boxplot(extent='min-max').encode(x=${f(c)}, y=${f(v)}, color=${f(c)})`,
      };
    },
  },
  {
    id: 'hconcat-bar-hist', level: 'Advanced', needs: { cat: 1, quant: 1 },
    concept: 'Side-by-side views (|) answer two questions at once: the level per category and the overall distribution.',
    docs: DOCS + 'compound_charts.html#hconcat',
    build(ds, pick) {
      const c = pick('cat'), v = pick('quant');
      if (!c || !v) return null;
      return {
        title: `Mean ${v.name} by ${c.name} | Histogram`,
        task: `Using \`${ds.varName}\`, put two charts side by side. \`bars\`: ${q(c)} on X and the mean of ${q(v)} on Y, coloured by ${q(c)}. \`hist\`: ${q(v)} binned (at most 20 bins) on X and count():Q on Y. End with \`bars | hist\`.`,
        hints: [
          `\`bars = alt.Chart(${ds.varName}).mark_bar().encode(x=${f(c)}, y=${agg('mean', v)}, color=${f(c)})\``,
          `\`hist = alt.Chart(${ds.varName}).mark_bar().encode(x=alt.X(${f(v)}, bin=alt.Bin(maxbins=20)), y='count():Q')\``,
          'Combine with `bars | hist` (same as `alt.hconcat(bars, hist)`).',
        ],
        chart: `bars = alt.Chart(${ds.varName}).mark_bar().encode(x=${f(c)}, y=${agg('mean', v)}, color=${f(c)})\nhist = alt.Chart(${ds.varName}).mark_bar().encode(x=alt.X(${f(v)}, bin=alt.Bin(maxbins=20)), y='count():Q')\nbars | hist`,
      };
    },
  },
  {
    id: 'vconcat-line-bar', level: 'Advanced', needs: { cat: 1, quant: 1, time: 1 },
    concept: 'Stacked views (&) pair a trend over time with a ranking, linked by the same colour per category.',
    docs: DOCS + 'compound_charts.html#vconcat',
    build(ds, pick) {
      const t = pick('time'), c = pick('cat', [t]), v = pick('quant');
      if (!t || !c || !v) return null;
      return {
        title: `${v.name} over ${t.name} & Ranked by ${c.name}`,
        task: `Using \`${ds.varName}\`, stack two charts. \`lines\`: ${q(t)} on X, mean of ${q(v)} on Y, one line per ${q(c)} (colour). \`bars\`: mean of ${q(v)} on X, ${q(c)} on Y sorted by descending X, coloured by ${q(c)}. End with \`lines & bars\`.`,
        hints: [
          `\`lines = alt.Chart(${ds.varName}).mark_line().encode(x=${f(t)}, y=${agg('mean', v)}, color=${f(c)})\``,
          `\`bars = alt.Chart(${ds.varName}).mark_bar().encode(x=${agg('mean', v)}, y=alt.Y(${f(c)}, sort='-x'), color=${f(c)})\``,
          'Combine with `lines & bars` (same as `alt.vconcat(lines, bars)`).',
        ],
        chart: `lines = alt.Chart(${ds.varName}).mark_line().encode(x=${f(t)}, y=${agg('mean', v)}, color=${f(c)})\nbars = alt.Chart(${ds.varName}).mark_bar().encode(x=${agg('mean', v)}, y=alt.Y(${f(c)}, sort='-x'), color=${f(c)})\nlines & bars`,
      };
    },
  },
  {
    id: 'range-text', level: 'Advanced', needs: { cat: 1, quant: 1 },
    concept: 'A Priestley-style range chart: x and x2 make each bar span min to max, and two text layers with opposite offsets label the ends.',
    docs: DOCS + 'marks/text.html',
    build(ds, pick) {
      const c = pick('cat'), v = pick('quant');
      if (!c || !v) return null;
      const lo = agg('min', v), hi = agg('max', v);
      return {
        title: `Range of ${v.name} per ${c.name} with End Labels`,
        task: `Using \`${ds.varName}\`, draw one bar per ${q(c)} (Y, also colour) spanning from the min to the max of ${q(v)} (x and x2). Label both ends with text layers: the min with xOffset=-20 and the max with xOffset=20. Store them as \`ranges\`, \`lo\` and \`hi\` and end with \`ranges + lo + hi\`.`,
        hints: [
          `\`ranges = alt.Chart(${ds.varName}).mark_bar().encode(x=${lo}, x2=${pyStr('max(' + v.name + ')')}, y=${f(c)}, color=${f(c)})\``,
          `\`lo = alt.Chart(${ds.varName}).mark_text(xOffset=-20).encode(x=${lo}, y=${f(c)}, text=${lo})\``,
          '`hi` is the same with `max` and `xOffset=20`; then `ranges + lo + hi`.',
        ],
        chart: `ranges = alt.Chart(${ds.varName}).mark_bar().encode(x=${lo}, x2=${pyStr('max(' + v.name + ')')}, y=${f(c)}, color=${f(c)})\nlo = alt.Chart(${ds.varName}).mark_text(xOffset=-20).encode(x=${lo}, y=${f(c)}, text=${lo})\nhi = alt.Chart(${ds.varName}).mark_text(xOffset=20).encode(x=${hi}, y=${f(c)}, text=${hi})\nranges + lo + hi`,
      };
    },
  },
  {
    id: 'errorbar-mean', level: 'Advanced', needs: { cat: 1, quant: 1 },
    concept: 'mark_errorbar aggregates raw values itself (mean ± stdev); a point layer marks the mean on top.',
    docs: DOCS + 'marks/errorbar.html',
    build(ds, pick) {
      const c = pick('cat'), v = pick('quant');
      if (!c || !v) return null;
      return {
        title: `Mean ${v.name} ± Std Dev by ${c.name}`,
        task: `Using \`${ds.varName}\`, layer \`bars\`: mark_errorbar(extent='stdev') of ${q(v)} on X per ${q(c)} on Y, and \`points\`: black filled points at the mean of ${q(v)}, with an X scale that does not start at zero. End with \`bars + points\`.`,
        hints: [
          `\`bars = alt.Chart(${ds.varName}).mark_errorbar(extent='stdev').encode(x=${f(v)}, y=${f(c)})\``,
          `\`points = alt.Chart(${ds.varName}).mark_point(filled=True, color='black').encode(x=alt.X(${agg('mean', v)}, scale=alt.Scale(zero=False)), y=${f(c)})\``,
          'Combine with `bars + points`.',
        ],
        chart: `bars = alt.Chart(${ds.varName}).mark_errorbar(extent='stdev').encode(x=${f(v)}, y=${f(c)})\npoints = alt.Chart(${ds.varName}).mark_point(filled=True, color='black').encode(x=alt.X(${agg('mean', v)}, scale=alt.Scale(zero=False)), y=${f(c)})\nbars + points`,
      };
    },
  },
  {
    id: 'dual-axis', level: 'Advanced', needs: { quant: 2, time: 1 },
    concept: 'Two layers with independent Y scales (resolve_scale) put two measures with different units on one time axis.',
    docs: DOCS + 'scale_resolve.html',
    build(ds, pick) {
      const t = pick('time'), v = pick('quant'), v2 = pick('quant', [v]);
      if (!t || !v || !v2) return null;
      return {
        title: `${v.name} and ${v2.name} over ${t.name} (Dual Axis)`,
        task: `Using \`${ds.varName}\`, make \`base\` with ${q(t)} on X. Layer \`bars\` (light steel blue) with the mean of ${q(v)} on Y and \`line\` (crimson) with the mean of ${q(v2)} on Y, then give each its own Y scale.`,
        hints: [
          `\`base = alt.Chart(${ds.varName}).encode(x=${f(t)})\``,
          `\`bars = base.mark_bar(color='lightsteelblue').encode(y=${agg('mean', v)})\`; \`line = base.mark_line(color='crimson').encode(y=${agg('mean', v2)})\``,
          "End with `(bars + line).resolve_scale(y='independent')`.",
        ],
        chart: `base = alt.Chart(${ds.varName}).encode(x=${f(t)})\nbars = base.mark_bar(color='lightsteelblue').encode(y=${agg('mean', v)})\nline = base.mark_line(color='crimson').encode(y=${agg('mean', v2)})\n(bars + line).resolve_scale(y='independent')`,
      };
    },
  },
  {
    id: 'scatter-condition', level: 'Advanced', needs: { cat: 1, quant: 2 },
    concept: 'Shape carries the category while alt.condition recolours points by a threshold; constant condition values add no legend.',
    docs: DOCS + 'interactions/conditions.html',
    build(ds, pick) {
      const v = pick('quant'), v2 = pick('quant', [v]), c = pick('cat');
      if (!v || !v2 || !c) return null;
      const thr = threshold(v2);
      return {
        title: `${v2.name} above ${thr} Highlighted, Shaped by ${c.name}`,
        task: `Using \`${ds.varName}\`, draw filled points with a black stroke and size 100: ${q(v)} on X, ${q(v2)} on Y, shape by ${q(c)}. Points whose ${q(v2)} is above ${thr} are red, the rest blue.`,
        hints: [
          "Use `.mark_point(filled=True, stroke='black', size=100)`.",
          `Encode \`x=${f(v)}, y=${f(v2)}, shape=${f(c)}\`.`,
          `\`color=alt.condition(${datum(v2)} > ${thr}, alt.value('red'), alt.value('blue'))\``,
        ],
        chart: `alt.Chart(${ds.varName}).mark_point(filled=True, stroke='black', size=100).encode(x=${f(v)}, y=${f(v2)}, shape=${f(c)}, color=alt.condition(${datum(v2)} > ${thr}, alt.value('red'), alt.value('blue')))`,
      };
    },
  },
  {
    id: 'heatmap-text', level: 'Advanced', needs: { cat: 2 },
    concept: 'Layering text over rect cells gives a heatmap that shows exact counts as well as colour.',
    docs: DOCS + 'compound_charts.html#layered-charts',
    build(ds, pick) {
      const c = pick('cat'), c2 = pick('cat', [c]);
      if (!c || !c2) return null;
      return {
        title: `Rows per ${c.name} × ${c2.name} (Labelled Heatmap)`,
        task: `Using \`${ds.varName}\`, make \`base\` with ${q(c)} on X and ${q(c2)} on Y. Layer \`heat\`: rect cells coloured by count():Q, and \`labels\`: text showing count():Q. End with \`heat + labels\`.`,
        hints: [
          `\`base = alt.Chart(${ds.varName}).encode(x=${f(c)}, y=${f(c2)})\``,
          "`heat = base.mark_rect().encode(color='count():Q')` and `labels = base.mark_text().encode(text='count():Q')`",
          'Combine with `heat + labels`.',
        ],
        chart: `base = alt.Chart(${ds.varName}).encode(x=${f(c)}, y=${f(c2)})\nheat = base.mark_rect().encode(color='count():Q')\nlabels = base.mark_text().encode(text='count():Q')\nheat + labels`,
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
