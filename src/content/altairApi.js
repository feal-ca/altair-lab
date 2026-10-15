// Editor completion vocabulary, grouped by where it makes sense to offer it.
// src/lib/completions.js decides the context; this file only lists names.
// Plain ESM: importable from Node and from Vite.
//
// Entries are [name, detail] pairs. How a name is inserted depends on its group:
// methods and classes get `()` with the cursor inside, keyword arguments get `=`.

// Members offered after `alt.`
export const ALT_CLASSES = [
  ['Chart', 'Chart(data) — the chart constructor'],
  ['layer', 'layer(a, b, …) — superpose charts (same as a + b)'],
  ['hconcat', 'hconcat(a, b, …) — side by side (same as a | b)'],
  ['vconcat', 'vconcat(a, b, …) — stacked (same as a & b)'],
  ['concat', 'concat(…, columns=n) — wrapped grid of charts'],
  ['repeat', 'repeat(row=[…], column=[…]) — repeated chart template'],
  ['Scale', 'Scale(domain, range, scheme, zero, type, reverse)'],
  ['Axis', 'Axis(title, format, labelAngle, grid, tickCount, values)'],
  ['Legend', 'Legend(title, orient, direction, columns)'],
  ['Bin', 'Bin(maxbins, step, extent)'],
  ['Header', 'Header(title, labelAngle, labelOrient) — facet headers'],
  ['Title', 'Title(text, subtitle, anchor, fontSize)'],
  ['SortField', "SortField('field', order='descending')"],
  ['LookupData', "LookupData(data, key='', fields=[…]) — for transform_lookup"],
  ['FieldOneOfPredicate', "FieldOneOfPredicate(field='', oneOf=[…])"],
  ['FieldRangePredicate', "FieldRangePredicate(field='', range=[lo, hi])"],
  ['FieldEqualPredicate', "FieldEqualPredicate(field='', equal=…)"],
  ['FieldGTPredicate', "FieldGTPredicate(field='', gt=…)"],
  ['FieldLTPredicate', "FieldLTPredicate(field='', lt=…)"],
  ['topo_feature', "topo_feature(url, feature='states') — TopoJSON shapes"],
  ['selection_point', 'selection_point(fields=[…], bind=…) — click selection'],
  ['selection_interval', 'selection_interval(encodings=[…]) — brush selection'],
  ['binding_select', 'binding_select(options=[…], name=…) — dropdown'],
  ['binding_range', 'binding_range(min, max, step) — slider'],
]

// Encoding channel classes, offered after `alt.` and as channel values.
export const CHANNELS = [
  ['X', 'horizontal position'],
  ['Y', 'vertical position'],
  ['X2', 'second x position (ranged bar, rule, area, rect)'],
  ['Y2', 'second y position (ranged bar, rule, area, rect)'],
  ['XOffset', 'offset within an x band (grouped bars)'],
  ['YOffset', 'offset within a y band'],
  ['Color', 'colour (fill and stroke)'],
  ['Fill', 'fill colour'],
  ['Stroke', 'stroke colour'],
  ['Opacity', 'opacity'],
  ['FillOpacity', 'fill opacity'],
  ['Size', 'mark size / area'],
  ['Shape', 'point shape'],
  ['StrokeDash', 'dash pattern'],
  ['StrokeWidth', 'stroke width'],
  ['Text', 'text of mark_text'],
  ['Tooltip', 'tooltip on hover'],
  ['Theta', 'angle (mark_arc)'],
  ['Radius', 'radius (mark_arc)'],
  ['Order', 'stack / line order'],
  ['Detail', 'group without a visual channel'],
  ['Row', 'facet into rows'],
  ['Column', 'facet into columns'],
  ['Facet', 'wrapped facet'],
  ['Latitude', 'latitude (geo)'],
  ['Longitude', 'longitude (geo)'],
]

// Functions offered after `alt.` that are not classes.
export const ALT_FUNCTIONS = [
  ['value', "value('red') — a constant instead of a field"],
  ['condition', 'condition(test, if_true, if_false)'],
  ['datum', 'datum.field — refer to a field in a predicate'],
  ['expr', 'expr(…) — Vega expression'],
]

export const MARKS = [
  ['arc', 'pie / donut slices (theta, radius)'],
  ['area', 'filled area under a line'],
  ['bar', 'bars (length or x/x2 range)'],
  ['boxplot', 'box plot (composite)'],
  ['circle', 'filled circles'],
  ['errorband', 'error band (composite)'],
  ['errorbar', 'error bars (composite)'],
  ['geoshape', 'map shapes'],
  ['image', 'images'],
  ['line', 'lines'],
  ['point', 'points (shape, filled, size)'],
  ['rect', 'rectangles (heatmaps, x/x2 ranges)'],
  ['rule', 'reference lines'],
  ['square', 'filled squares'],
  ['text', 'text labels (dx, dy, xOffset, align)'],
  ['tick', 'short ticks (thickness, orient)'],
  ['trail', 'line with variable width'],
]

// Chart methods, offered after `chart.` or `).`; marks are added as mark_*.
export const CHART_METHODS = [
  ['encode', 'encode(x=…, y=…, color=…) — map fields to channels'],
  ['properties', "properties(title='', width=…, height=…)"],
  ['transform_filter', 'transform_filter(alt.datum.f > 0) — keep matching rows'],
  ['transform_calculate', "transform_calculate(new='datum.a * 2') — derived field"],
  ['transform_aggregate', "transform_aggregate(m='mean(f)', groupby=[…])"],
  ['transform_joinaggregate', "transform_joinaggregate(total='sum(f)', groupby=[…])"],
  ['transform_window', "transform_window(rank='rank()', sort=[…], groupby=[…])"],
  ['transform_fold', "transform_fold(['a', 'b'], as_=['key', 'value'])"],
  ['transform_lookup', "transform_lookup(lookup='id', from_=alt.LookupData(…))"],
  ['transform_regression', "transform_regression('x', 'y', method='linear')"],
  ['transform_loess', "transform_loess('x', 'y', bandwidth=0.3)"],
  ['transform_bin', "transform_bin('binned', field='f')"],
  ['transform_timeunit', "transform_timeunit(year='year(date)')"],
  ['transform_density', "transform_density('f', as_=['f', 'density'])"],
  ['transform_stack', 'transform_stack(…) — explicit stacking'],
  ['transform_sample', 'transform_sample(n) — random subset of rows'],
  ['resolve_scale', "resolve_scale(color='independent')"],
  ['resolve_axis', "resolve_axis(y='independent')"],
  ['resolve_legend', "resolve_legend(color='independent')"],
  ['configure_view', 'configure_view(strokeWidth=0)'],
  ['configure_axis', 'configure_axis(grid=False, labelFontSize=…)'],
  ['configure_axisX', 'configure_axisX(labelAngle=0)'],
  ['configure_axisY', 'configure_axisY(…)'],
  ['configure_legend', "configure_legend(orient='bottom')"],
  ['configure_title', "configure_title(fontSize=…, anchor='start')"],
  ['configure_mark', 'configure_mark(…) — defaults for every mark'],
  ['configure_range', 'configure_range(category=…) — default palettes'],
  ['facet', "facet(column='f') — small multiples of a layered chart"],
  ['add_params', 'add_params(selection) — attach a selection or parameter'],
  ['interactive', 'interactive() — pan and zoom'],
  ['project', "project('albersUsa') — map projection"],
]

// Methods of a channel object, offered after `alt.X('f').`
export const CHANNEL_METHODS = [
  ['scale', 'scale(domain=…, scheme=…, zero=…)'],
  ['axis', 'axis(title=…, format=…, labelAngle=…) or axis(None)'],
  ['legend', 'legend(title=…, orient=…) or legend(None)'],
  ['sort', "sort('-y') or sort([...]) — order of categories"],
  ['title', "title('…') — axis or legend title"],
  ['bin', 'bin(maxbins=…) or bin=True'],
  ['aggregate', "aggregate('mean')"],
  ['stack', "stack('normalize') or stack(None)"],
  ['timeUnit', "timeUnit('year')"],
  ['type', "type('quantitative')"],
  ['header', 'header(…) — facet header (row / column)'],
  ['format', "format(',.0f') — number / date format (Text, Tooltip)"],
]

// Keyword arguments by callee. `str` marks string-valued ones (inserted as k='').
const MARK_KW = [
  ['color', 'colour of the mark', 'str'],
  ['fill', 'fill colour', 'str'],
  ['stroke', 'stroke colour', 'str'],
  ['opacity', '0..1'],
  ['fillOpacity', '0..1'],
  ['strokeOpacity', '0..1'],
  ['size', 'area of points / width of ticks'],
  ['shape', "'circle', 'square', 'triangle-up', …", 'str'],
  ['filled', 'True fills point marks'],
  ['strokeWidth', 'line / outline width'],
  ['strokeDash', 'dash pattern, e.g. [4, 2]'],
  ['point', 'True adds points on a line'],
  ['interpolate', "'monotone', 'step', 'basis', …", 'str'],
  ['orient', "'horizontal' or 'vertical'", 'str'],
  ['thickness', 'tick thickness'],
  ['width', 'bar / rect width'],
  ['height', 'rect height'],
  ['cornerRadius', 'rounded bar corners'],
  ['innerRadius', 'donut hole (mark_arc)'],
  ['outerRadius', 'outer radius (mark_arc)'],
  ['radius', 'text distance from centre (pie labels)'],
  ['align', "'left', 'center', 'right'", 'str'],
  ['baseline', "'top', 'middle', 'bottom'", 'str'],
  ['dx', 'text x offset in pixels'],
  ['dy', 'text y offset in pixels'],
  ['xOffset', 'x offset in pixels'],
  ['yOffset', 'y offset in pixels'],
  ['fontSize', 'text size'],
  ['fontWeight', "'bold' or 'normal'", 'str'],
  ['angle', 'text rotation'],
  ['text', 'fixed text', 'str'],
  ['tooltip', 'True shows all fields on hover'],
  ['clip', 'True clips marks to the plot area'],
  ['binSpacing', 'gap between histogram bars'],
  ['extent', "errorbar/boxplot: 'stdev', 'ci', 'min-max'", 'str'],
  ['line', 'True draws a line on an area'],
  ['strokeCap', "'round', 'butt', 'square'", 'str'],
]

const CHANNEL_KW = [
  ['title', 'axis / legend title', 'str'],
  ['type', "'quantitative', 'nominal', 'ordinal', 'temporal'", 'str'],
  ['sort', "'-y', 'ascending', or a list of values"],
  ['scale', 'alt.Scale(…)'],
  ['axis', 'alt.Axis(…) or None'],
  ['legend', 'alt.Legend(…) or None'],
  ['bin', 'True or alt.Bin(maxbins=…)'],
  ['aggregate', "'mean', 'sum', 'count', …", 'str'],
  ['stack', "'normalize', 'center', None"],
  ['timeUnit', "'year', 'month', …", 'str'],
  ['field', 'field name', 'str'],
  ['format', "number / date format (Text, Tooltip)", 'str'],
  ['header', 'alt.Header(…) — facet header'],
  ['condition', 'conditional value'],
]

const SCALE_KW = [
  ['domain', 'input range, e.g. [0, 100] or a list of categories'],
  ['range', 'output values, e.g. a list of colours'],
  ['scheme', "'category10', 'tableau20', 'blues', …", 'str'],
  ['zero', 'False lets a quantitative axis start away from 0'],
  ['type', "'linear', 'log', 'sqrt', 'symlog', …", 'str'],
  ['reverse', 'True flips the scale'],
  ['nice', 'round the domain ends'],
  ['padding', 'padding (band / point scales)'],
  ['domainMid', 'midpoint of a diverging scale'],
  ['clamp', 'clamp values to the range'],
]

const AXIS_KW = [
  ['title', 'axis title (None hides it)', 'str'],
  ['format', "',.0f', '.0%', '%Y', …", 'str'],
  ['labelAngle', 'label rotation in degrees'],
  ['grid', 'False hides grid lines'],
  ['tickCount', 'approximate number of ticks'],
  ['values', 'explicit tick values'],
  ['labels', 'False hides labels'],
  ['ticks', 'False hides ticks'],
  ['domain', 'False hides the axis line'],
  ['orient', "'left', 'right', 'top', 'bottom'", 'str'],
  ['labelFontSize', 'label size'],
  ['titleFontSize', 'title size'],
  ['labelOverlap', 'hide overlapping labels'],
  ['labelExpr', 'Vega expression for labels', 'str'],
  ['offset', 'distance from the plot'],
]

const LEGEND_KW = [
  ['title', 'legend title', 'str'],
  ['orient', "'right', 'left', 'top', 'bottom', 'none'", 'str'],
  ['direction', "'vertical' or 'horizontal'", 'str'],
  ['columns', 'number of columns'],
  ['symbolType', "'circle', 'square', …", 'str'],
  ['symbolSize', 'symbol area'],
  ['labelFontSize', 'label size'],
  ['values', 'explicit entries'],
]

const BIN_KW = [
  ['maxbins', 'maximum number of bins'],
  ['step', 'exact bin width'],
  ['extent', '[min, max] of the binned range'],
  ['nice', 'round bin boundaries'],
]

const PROPERTIES_KW = [
  ['title', 'chart title', 'str'],
  ['width', 'width in pixels'],
  ['height', 'height in pixels'],
  ['background', 'background colour', 'str'],
  ['padding', 'padding in pixels'],
]

const ENCODE_KW = [
  ...CHANNELS.map(([n, d]) => [n.charAt(0).toLowerCase() + n.slice(1), d]),
  ['xOffset', 'offset within an x band'],
  ['strokeDash', 'dash pattern'],
  ['strokeWidth', 'stroke width'],
  ['fillOpacity', 'fill opacity'],
]

const RESOLVE_KW = ['x', 'y', 'color', 'size', 'shape', 'opacity', 'theta', 'strokeDash']
  .map((n) => [n, "'independent' or 'shared'", 'str'])

export const KWARGS = {
  mark: MARK_KW,
  encode: ENCODE_KW,
  channel: CHANNEL_KW,
  'alt.Scale': SCALE_KW,
  scale: SCALE_KW,
  'alt.Axis': AXIS_KW,
  axis: AXIS_KW,
  'alt.Legend': LEGEND_KW,
  legend: LEGEND_KW,
  'alt.Bin': BIN_KW,
  bin: BIN_KW,
  properties: PROPERTIES_KW,
  'alt.Chart': [['data', 'DataFrame or URL'], ...PROPERTIES_KW],
  'alt.Header': [['title', 'header title', 'str'], ['labelAngle', 'label rotation'], ['labelOrient', "'top', 'bottom', …", 'str']],
  'alt.Title': [['text', 'title text', 'str'], ['subtitle', 'subtitle', 'str'], ['anchor', "'start', 'middle', 'end'", 'str'], ['fontSize', 'size']],
  'alt.SortField': [['field', 'field', 'str'], ['order', "'ascending' or 'descending'", 'str']],
  'alt.LookupData': [['data', 'secondary data'], ['key', 'key field', 'str'], ['fields', 'fields to copy']],
  'alt.FieldOneOfPredicate': [['field', 'field', 'str'], ['oneOf', 'list of accepted values']],
  'alt.FieldRangePredicate': [['field', 'field', 'str'], ['range', '[lo, hi]']],
  'alt.FieldEqualPredicate': [['field', 'field', 'str'], ['equal', 'value']],
  'alt.FieldGTPredicate': [['field', 'field', 'str'], ['gt', 'value']],
  'alt.FieldLTPredicate': [['field', 'field', 'str'], ['lt', 'value']],
  'alt.concat': [['columns', 'charts per row']],
  'alt.topo_feature': [['feature', "'states', 'counties', …", 'str']],
  'alt.selection_point': [['fields', 'fields to select on'], ['value', 'initial value'], ['bind', 'binding (dropdown, …)'], ['name', 'name', 'str']],
  'alt.selection_interval': [['encodings', "['x'] or ['x', 'y']"], ['name', 'name', 'str']],
  'alt.binding_select': [['options', 'values'], ['name', 'label', 'str']],
  'alt.binding_range': [['min', 'min'], ['max', 'max'], ['step', 'step'], ['name', 'label', 'str']],
  transform_aggregate: [['groupby', 'fields to group by']],
  transform_joinaggregate: [['groupby', 'fields to group by']],
  transform_window: [['groupby', 'fields to group by'], ['sort', '[alt.SortField(…)]'], ['frame', '[None, 0] — cumulative']],
  transform_fold: [['as_', "['key', 'value']"]],
  transform_regression: [['method', "'linear', 'poly', 'log', 'exp', 'pow', 'quad'", 'str'], ['order', 'polynomial order'], ['groupby', 'one fit per group'], ['extent', '[min, max]'], ['as_', 'output field names']],
  transform_loess: [['bandwidth', '0..1'], ['groupby', 'one fit per group'], ['as_', 'output field names']],
  transform_lookup: [['lookup', 'key field in this data', 'str'], ['from_', 'alt.LookupData(…)'], ['as_', 'output name']],
  transform_bin: [['field', 'field to bin', 'str'], ['bin', 'True or alt.Bin(…)']],
  transform_density: [['as_', "['value', 'density']"], ['groupby', 'one curve per group'], ['extent', '[min, max]']],
  resolve_scale: RESOLVE_KW,
  resolve_axis: RESOLVE_KW,
  resolve_legend: RESOLVE_KW,
  configure_view: [['strokeWidth', '0 removes the frame'], ['stroke', 'frame colour', 'str'], ['fill', 'plot background', 'str'], ['continuousWidth', 'default width'], ['continuousHeight', 'default height']],
  configure_axis: AXIS_KW,
  configure_axisX: AXIS_KW,
  configure_axisY: AXIS_KW,
  configure_legend: LEGEND_KW,
  configure_title: [['fontSize', 'size'], ['anchor', "'start', 'middle', 'end'", 'str'], ['color', 'colour', 'str'], ['font', 'font', 'str']],
  configure_mark: MARK_KW,
  facet: [['row', 'field', 'str'], ['column', 'field', 'str'], ['columns', 'panels per row']],
}

// Values offered inside a string for a given keyword argument.
const COLORS = ['black', 'gray', 'lightgray', 'white', 'red', 'crimson', 'orange', 'gold', 'yellow', 'green', 'teal', 'steelblue', 'blue', 'navy', 'purple', 'pink', 'brown']
const ALIGN = ['left', 'center', 'right']
export const STRING_VALUES = {
  scheme: ['category10', 'category20', 'tableau10', 'tableau20', 'set1', 'set2', 'set3', 'pastel1', 'pastel2', 'dark2', 'accent', 'paired',
    'blues', 'greens', 'greys', 'oranges', 'purples', 'reds', 'viridis', 'magma', 'inferno', 'plasma', 'turbo', 'goldred',
    'blueorange', 'redblue', 'redyellowgreen', 'spectral', 'browns', 'teals'],
  shape: ['circle', 'square', 'cross', 'diamond', 'triangle-up', 'triangle-down', 'triangle-left', 'triangle-right', 'triangle', 'stroke', 'arrow', 'wedge'],
  symbolType: ['circle', 'square', 'cross', 'diamond', 'triangle-up', 'triangle-down', 'stroke'],
  interpolate: ['linear', 'monotone', 'step', 'step-after', 'step-before', 'basis', 'cardinal', 'natural'],
  align: ALIGN,
  anchor: ['start', 'middle', 'end'],
  baseline: ['top', 'middle', 'bottom', 'alphabetic'],
  orient: ['left', 'right', 'top', 'bottom', 'horizontal', 'vertical', 'none'],
  direction: ['vertical', 'horizontal'],
  labelOrient: ['top', 'bottom', 'left', 'right'],
  fontWeight: ['bold', 'normal'],
  strokeCap: ['round', 'butt', 'square'],
  extent: ['stdev', 'stderr', 'ci', 'iqr', 'min-max'],
  method: ['linear', 'poly', 'log', 'exp', 'pow', 'quad'],
  order: ['ascending', 'descending'],
  stack: ['zero', 'normalize', 'center'],
  aggregate: ['count', 'sum', 'mean', 'average', 'median', 'min', 'max', 'stdev', 'variance', 'distinct', 'q1', 'q3'],
  timeUnit: ['year', 'quarter', 'month', 'yearmonth', 'date', 'day', 'hours', 'monthdate'],
  format: [',.0f', ',.2f', '.0%', '.1%', '$,.0f', '.2s', '%Y', '%b %Y', '%d %b'],
  color: COLORS,
  fill: COLORS,
  stroke: COLORS,
  background: COLORS,
  feature: ['states', 'counties', 'countries', 'land'],
  projection: ['albersUsa', 'mercator', 'equalEarth', 'naturalEarth1', 'orthographic', 'equirectangular'],
  independent: ['independent', 'shared'],
}
STRING_VALUES['scale.type'] = ['linear', 'log', 'sqrt', 'pow', 'symlog', 'time', 'utc', 'ordinal', 'band', 'point']
STRING_VALUES['channel.type'] = ['quantitative', 'nominal', 'ordinal', 'temporal']
STRING_VALUES.sort = ['ascending', 'descending', 'x', '-x', 'y', '-y', 'color', '-color']

// Aggregate functions offered at the start of a field string: 'mean(…)'.
export const AGGREGATES = [
  ['count()', 'number of rows'],
  ['sum', 'sum'],
  ['mean', 'average'],
  ['median', 'median'],
  ['min', 'minimum'],
  ['max', 'maximum'],
  ['stdev', 'standard deviation'],
  ['distinct', 'number of distinct values'],
]

// Encoding channel names (lowercase), used to spot channel contexts.
export const CHANNEL_KEYS = new Set(ENCODE_KW.map(([n]) => n))
