// Exercises adapted from "Data Visualization with Vega-Altair 5" (Pere-Pau Vázquez, UPC 2024).
// Same shape as the course exercises in exercises.js, which numbers and orders both lists.
// Solutions use the current API: alt.when(...).then(...).otherwise(...) for conditions,
// selection_point / selection_interval / param for interaction, on='pointerover' for hover.
// Plain ESM: importable from Node and from Vite.

const DOCS = 'https://altair-viz.github.io/user_guide/';

const WIDE = `import altair as alt
import pandas as pd

wide_form = pd.DataFrame({
    'Date': ['2007-10-01', '2007-11-01', '2007-12-01'],
    'AAPL': [189.95, 182.22, 198.08],
    'AMZN': [89.15, 90.56, 92.64],
    'GOOG': [707.00, 693.00, 691.48]
})
`;

const MOBILE = `import altair as alt
import pandas as pd

source = pd.DataFrame({
    'mobile system': ['iOS', 'Android', 'Tizen', 'Other'],
    'percentage': [60, 35, 4, 1]
})
`;

const COUNTRIES = `import altair as alt
import pandas as pd

Country_data = pd.DataFrame({
    'Country': ['Germany', 'France', 'Italy', 'Spain', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Czech Republic', 'Greece'],
    'Population (Millions)': [83.155, 67.657, 59.236, 47.399, 37.840, 19.202, 17.475, 11.555, 10.702, 10.679]
})
`;

const url = (name, expr) => `import altair as alt
import pandas as pd
from vega_datasets import data

${name} = ${expr}
`;

const CARS = url('cars', 'data.cars.url');
const STOCKS = url('df', 'data.stocks.url');
const IOWA = url('df', 'data.iowa_electricity.url');
const SEATTLE = url('df', 'data.seattle_weather.url');
const GAPMINDER = url('df', 'data.gapminder.url');

const CLUSTERS = `clusters = pd.DataFrame({
    'id': [0, 1, 2, 3, 4, 5],
    'region': ['South Asia', 'Europe & Central Asia', 'Sub-Saharan Africa',
             'America', 'East Asia & Pacific', 'Middle East & North Africa']
})
`;

export const BOOK_EXERCISES = [
  // ── Data & types ────────────────────────────────────────────────────────
  {
    id: 'bk-wide-fold',
    title: 'Wide to Long with transform_fold',
    level: 'Beginner',
    topic: 'Data & types',
    task: 'wide_form has one column per company (AAPL, AMZN, GOOG). Fold those three columns into long form named company and price, then draw one line per company: Date:T on X, price:Q on Y, colour by company:N.',
    hints: [
      'Start with alt.Chart(wide_form).transform_fold([...], as_=[...]).',
      'The three column names go in the list; as_=["company", "price"] names the key and the value.',
      'Then .mark_line().encode(x="Date:T", y="price:Q", color="company:N").'
    ],
    concept: 'Altair works best with long-form data (one row per observation). `transform_fold` turns wide columns into key/value rows inside the chart; `pandas.melt` does the same before plotting.',
    docs: DOCS + 'data.html#long-form-vs-wide-form-data',
    datasetId: 'stocks_wide',
    solution: `${WIDE}
alt.Chart(wide_form).transform_fold(
    ['AAPL', 'AMZN', 'GOOG'],
    as_=['company', 'price']
).mark_line().encode(
    x='Date:T',
    y='price:Q',
    color='company:N'
)`
  },
  {
    id: 'bk-wide-layers',
    title: 'Wide Form the Hard Way: One Layer per Column',
    level: 'Beginner',
    topic: 'Data & types',
    task: 'Without folding, plot wide_form as three layered lines, one per column: AAPL in red, AMZN in blue and GOOG in green (constant colours with alt.value). Every layer has Date:T on X.',
    hints: [
      'ch1 = alt.Chart(wide_form).mark_line().encode(x="Date:T", y="AAPL:Q", color=alt.value("red"))',
      'ch2 and ch3 are the same with AMZN / "blue" and GOOG / "green".',
      'Combine them with ch1 + ch2 + ch3.'
    ],
    concept: 'Wide data needs one layer per column, gets no legend (constant colours) and joins every field name into the Y title. Compare it with the folded version: long form is shorter and labels itself.',
    docs: DOCS + 'data.html#long-form-vs-wide-form-data',
    datasetId: 'stocks_wide',
    solution: `${WIDE}
ch1 = alt.Chart(wide_form).mark_line().encode(
    x='Date:T',
    y='AAPL:Q',
    color=alt.value('red')
)
ch2 = alt.Chart(wide_form).mark_line().encode(
    x='Date:T',
    y='AMZN:Q',
    color=alt.value('blue')
)
ch3 = alt.Chart(wide_form).mark_line().encode(
    x='Date:T',
    y='GOOG:Q',
    color=alt.value('green')
)

ch1 + ch2 + ch3`
  },
  {
    id: 'bk-types-explicit',
    title: 'Declaring Data Types Explicitly',
    level: 'Beginner',
    topic: 'Data & types',
    task: 'cars is a URL, so Altair cannot infer types. Scatter Acceleration (quantitative) on X against Miles_per_Gallon (quantitative) on Y, colour by Cylinders as ordinal and shape by Origin as nominal. Write the types with the type= keyword instead of the :Q shorthand.',
    hints: [
      'alt.X("Acceleration", type="quantitative") is the long form of "Acceleration:Q".',
      'Colour: alt.Color("Cylinders", type="ordinal"); shape: alt.Shape("Origin", type="nominal").',
      'Use .mark_point().'
    ],
    concept: 'The four types are quantitative (Q), ordinal (O), nominal (N) and temporal (T). Ordinal gets an ordered sequential palette; nominal gets distinct hues and shapes. URL data always needs explicit types.',
    docs: DOCS + 'encodings/index.html#encoding-data-types',
    datasetId: 'cars',
    solution: `${CARS}
alt.Chart(cars).mark_point().encode(
    alt.X('Acceleration', type='quantitative'),
    alt.Y('Miles_per_Gallon', type='quantitative'),
    alt.Color('Cylinders', type='ordinal'),
    alt.Shape('Origin', type='nominal')
)`
  },

  // ── Marks & channels ────────────────────────────────────────────────────
  {
    id: 'bk-donut-order',
    title: 'Donut Chart Sorted Clockwise',
    level: 'Beginner',
    topic: 'Marks & channels',
    task: 'Draw a donut (mark_arc with innerRadius=80) of source: percentage:Q on theta, colour by mobile system:N with the dark2 scheme, and slices ordered by percentage descending so the largest starts at 12 o\'clock.',
    hints: [
      'alt.Chart(source).mark_arc(innerRadius=80)',
      'theta=alt.Theta("percentage:Q") and order=alt.Order("percentage:Q", sort="descending")',
      'color=alt.Color("mobile system:N", scale=alt.Scale(scheme="dark2"))'
    ],
    concept: 'Pie and donut slices should start at 12 o\'clock and run clockwise from largest to smallest; the `order` channel sets that sequence. `innerRadius` turns a pie into a donut.',
    docs: DOCS + 'marks/arc.html',
    datasetId: 'mobile_os',
    solution: `${MOBILE}
alt.Chart(source).mark_arc(innerRadius=80).encode(
    theta=alt.Theta('percentage:Q'),
    order=alt.Order('percentage:Q', sort='descending'),
    color=alt.Color('mobile system:N', scale=alt.Scale(scheme='dark2'))
)`
  },
  {
    id: 'bk-detail-iowa',
    title: 'Grouping Lines with detail',
    level: 'Beginner',
    topic: 'Marks & channels',
    task: 'Plot Iowa net generation over time (year:T on X, net_generation:Q on Y) as one line per energy source, all in the same default colour: group the rows by source:N without colouring them.',
    hints: [
      'Without any grouping the three sources join into one zig-zag line.',
      'The detail channel groups rows but maps them to no visual property.',
      'encode(x="year:T", y="net_generation:Q", detail="source:N")'
    ],
    concept: '`detail` splits marks into groups (one line per value) without adding colour, shape or a legend. Use it when another cue, such as a label, will tell the groups apart.',
    docs: DOCS + 'encodings/channels.html#detail',
    datasetId: 'iowa_electricity',
    solution: `${IOWA}
alt.Chart(df).mark_line().encode(
    alt.X('year:T'),
    alt.Y('net_generation:Q'),
    detail='source:N'
)`
  },
  {
    id: 'bk-strokedash-barley',
    title: 'Slope Chart with Dashed Lines per Site',
    level: 'Beginner',
    topic: 'Marks & channels',
    task: 'Draw a slope chart of the total barley yield per site between the two years: year:O on X, sum(yield):Q on Y, and a different dash pattern per site:N. Set the width to 300.',
    hints: [
      'alt.Chart(source).mark_line()',
      'encode(alt.X("year:O"), alt.Y("sum(yield):Q"), strokeDash="site:N")',
      'Finish with .properties(width=300).'
    ],
    concept: 'strokeDash is a channel like colour: mapping a field to it gives each group its own dash pattern and a legend. A line chart with only two X positions is a slope chart.',
    docs: DOCS + 'encodings/channel_options.html#strokedash',
    datasetId: 'barley',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.barley()

alt.Chart(source).mark_line().encode(
    alt.X('year:O'),
    alt.Y('sum(yield):Q'),
    strokeDash='site:N'
).properties(width=300)`
  },
  {
    id: 'bk-stroke-bars',
    title: 'Dashed Bar Outlines Coloured by Data',
    level: 'Beginner',
    topic: 'Marks & channels',
    task: 'Draw horizontal bars of Country_data (Population (Millions):Q on X, Country:N on Y) filled pink with a dashed outline (strokeWidth=3, strokeDash=[4, 4]). The outline colour comes from the data: encode stroke by Country:N. Title "Population".',
    hints: [
      'Constant styling goes in mark_bar(color="pink", strokeWidth=3, strokeDash=[4, 4]).',
      'Data-driven outline: stroke=alt.Stroke("Country:N") inside encode (alt.Color("Country:N") also works for stroke=).',
      'X is the population, Y the country; add .properties(title="Population").'
    ],
    concept: 'Every mark property can be a constant (in mark_*) or a channel (in encode). stroke takes precedence over color for the outline; a constant fill can hide a colour encoding, so keep fill and colour from fighting.',
    docs: DOCS + 'encodings/channels.html#mark-property',
    datasetId: 'country_pop',
    solution: `${COUNTRIES}
alt.Chart(Country_data).mark_bar(color='pink', strokeWidth=3, strokeDash=[4, 4]).encode(
    alt.X('Population (Millions):Q'),
    alt.Y('Country:N'),
    stroke=alt.Stroke('Country:N')
).properties(title='Population')`
  },
  {
    id: 'bk-boxplot-minmax',
    title: 'Box Plot with Min-Max Whiskers',
    level: 'Beginner',
    topic: 'Marks & channels',
    task: 'Box plot of Miles_per_Gallon:Q on X (scale without zero) per Origin:N on Y, with whiskers that span the full minimum to maximum instead of Tukey\'s 1.5 IQR.',
    hints: [
      'mark_boxplot takes an extent argument.',
      'mark_boxplot(extent="min-max")',
      'alt.X("Miles_per_Gallon:Q", scale=alt.Scale(zero=False)), alt.Y("Origin:N")'
    ],
    concept: 'By default box plot whiskers reach the furthest point within 1.5 × IQR of the box, and points beyond are drawn as outliers. `extent="min-max"` stretches the whiskers to the full range, so no outliers are drawn.',
    docs: DOCS + 'marks/boxplot.html',
    datasetId: 'cars',
    solution: `${CARS}
alt.Chart(cars).mark_boxplot(extent='min-max').encode(
    alt.X('Miles_per_Gallon:Q', scale=alt.Scale(zero=False)),
    alt.Y('Origin:N')
)`
  },
  {
    id: 'bk-text-values',
    title: 'Values as Text Marks',
    level: 'Beginner',
    topic: 'Marks & channels',
    task: 'Instead of bars, show each country\'s population as a text mark: Country:N on X, Population (Millions):Q on Y, and the population itself as the text. Title "Population".',
    hints: [
      'mark_text() draws one string per row.',
      'The text channel picks what is written: text="Population (Millions):Q".',
      'Add .properties(title="Population").'
    ],
    concept: 'mark_text is a mark like any other: X and Y place it, the text channel decides what it says. Layered over bars it becomes a value label.',
    docs: DOCS + 'marks/text.html',
    datasetId: 'country_pop',
    solution: `${COUNTRIES}
alt.Chart(Country_data).mark_text().encode(
    alt.X('Country:N'),
    alt.Y('Population (Millions):Q'),
    text='Population (Millions):Q'
).properties(title='Population')`
  },

  // ── Encoding options ────────────────────────────────────────────────────
  {
    id: 'bk-hist-stacked',
    title: 'Stacked Histogram',
    level: 'Beginner',
    topic: 'Encoding options',
    task: 'Histogram of car Acceleration: bin Acceleration:Q on X, count the records on Y, and stack the bars by Origin:N (colour).',
    hints: [
      'Binning is an encoding option: alt.X("Acceleration:Q", bin=True).',
      'Y is "count():Q".',
      'Colour by Origin:N stacks the counts automatically.'
    ],
    concept: 'Encodings can transform data on the fly: `bin=True` groups a quantitative field into ranges and `count()` aggregates the rows in each. A colour on bars stacks them by default.',
    docs: DOCS + 'encodings/index.html#binning-and-aggregation',
    datasetId: 'cars',
    solution: `${CARS}
alt.Chart(cars).mark_bar().encode(
    x=alt.X('Acceleration:Q', bin=True),
    y='count():Q',
    color='Origin:N'
)`
  },
  {
    id: 'bk-timeunit-stocks',
    title: 'Yearly Average with timeUnit',
    level: 'Beginner',
    topic: 'Encoding options',
    task: 'Plot the yearly average price per stock: date:T on X with timeUnit year, average(price):Q on Y, colour by symbol:N.',
    hints: [
      'alt.X("date:T", timeUnit="year") (or the shorthand "year(date):T").',
      'Y aggregates: "average(price):Q".',
      'mark_line() with color="symbol:N".'
    ],
    concept: '`timeUnit` discretises dates (year, yearmonth, month, day, hours…) so an aggregate on the other axis summarises each period. Aggregating across years with `month` mixes years together, which is not always meaningful.',
    docs: DOCS + 'transform/timeunit.html',
    datasetId: 'stocks',
    solution: `${STOCKS}
alt.Chart(df).mark_line().encode(
    alt.X('date:T', timeUnit='year'),
    alt.Y('average(price):Q'),
    alt.Color('symbol:N')
)`
  },
  {
    id: 'bk-ci-band',
    title: 'Mean Line with a Confidence Band',
    level: 'Intermediate',
    topic: 'Encoding options',
    task: 'Layer a translucent area (opacity 0.5) from ci0(price) to ci1(price) under a line of average(price), both per year (date:T with timeUnit year, titled "Year") and coloured by symbol:N. Give the Y axis the title "Price" (empty titles on the band), and make the legend titled "Stock" with opaque symbols.',
    hints: [
      'Band: mark_area(opacity=0.5) with alt.Y("ci0(price):Q").title("") and alt.Y2("ci1(price):Q").title("").',
      'In the band, alt.Color("symbol:N", legend=alt.Legend(title="Stock", symbolOpacity=1.0)) keeps the legend readable.',
      'Line: mark_line() with alt.Y("average(price):Q").title("Price"); combine as chArea + chLine.'
    ],
    concept: 'y and y2 give an area a lower and upper edge, so ci0/ci1 (the 95% confidence interval of the mean) draws a band. A translucent mark also makes its legend symbols translucent; `symbolOpacity` fixes that.',
    docs: DOCS + 'encodings/channels.html#position',
    datasetId: 'stocks',
    solution: `${STOCKS}
chArea = alt.Chart(df).mark_area(opacity=0.5).encode(
    alt.X('date:T', timeUnit='year').title('Year'),
    alt.Y('ci0(price):Q').title(''),
    alt.Y2('ci1(price):Q').title(''),
    alt.Color('symbol:N', legend=alt.Legend(title='Stock', symbolOpacity=1.0))
)
chLine = alt.Chart(df).mark_line().encode(
    alt.X('date:T', timeUnit='year').title('Year'),
    alt.Y('average(price):Q').title('Price'),
    alt.Color('symbol:N')
)

chArea + chLine`
  },
  {
    id: 'bk-stack-false',
    title: 'Overlapping Areas without Stacking',
    level: 'Beginner',
    topic: 'Encoding options',
    task: 'Draw Iowa net generation as areas per source (year:T on X, net_generation:Q on Y, colour source:N) that overlap instead of stacking, with opacity 0.6 so the hidden ones and the grid stay visible.',
    hints: [
      'Areas stack by default; the stack option on Y changes that.',
      'alt.Y("net_generation:Q", stack=False)',
      'mark_area(opacity=0.6)'
    ],
    concept: 'Stacked areas show totals but make each layer hard to compare; `stack=False` puts every area on the same baseline. Transparency keeps overlapped areas and grid lines readable.',
    docs: DOCS + 'encodings/channel_options.html#x-and-y',
    datasetId: 'iowa_electricity',
    solution: `${IOWA}
alt.Chart(df).mark_area(opacity=0.6).encode(
    alt.X('year:T'),
    alt.Y('net_generation:Q', stack=False),
    alt.Color('source:N')
)`
  },
  {
    id: 'bk-errorband',
    title: 'Error Band of Monthly Temperatures',
    level: 'Intermediate',
    topic: 'Encoding options',
    task: 'Show the 95% confidence interval of the average maximum temperature per month in Seattle as an error band with borders: month(date):T on X, average(temp_max):Q on Y with a scale that does not start at zero, Y title "Average maximum temperature".',
    hints: [
      'mark_errorband(extent="ci", borders=True)',
      'alt.X("month(date):T")',
      'alt.Y("average(temp_max):Q", scale=alt.Scale(zero=False), title="Average maximum temperature")'
    ],
    concept: 'mark_errorband is a composite mark: it computes the interval itself (ci, stderr, stdev or iqr) and draws a continuous band, the line-chart counterpart of error bars.',
    docs: DOCS + 'marks/errorband.html',
    datasetId: 'seattle_weather',
    solution: `${SEATTLE}
alt.Chart(df).mark_errorband(extent='ci', borders=True).encode(
    alt.X('month(date):T'),
    alt.Y(
        'average(temp_max):Q',
        scale=alt.Scale(zero=False),
        title='Average maximum temperature'
    )
)`
  },

  // ── Chart types ─────────────────────────────────────────────────────────
  {
    id: 'bk-streamgraph',
    title: 'Streamgraph of US Employment',
    level: 'Intermediate',
    topic: 'Chart types',
    task: 'Fold six sectors of df (construction, manufacturing, retail_trade, education_and_health_services, leisure_and_hospitality, government) into sector/employees, then stack sum(employees):Q around the centre (no Y axis) over yearmonth(month):T (axis format "%Y"), coloured by sector:N.',
    hints: [
      'transform_fold([... six columns ...], as_=["sector", "employees"])',
      'alt.Y("sum(employees):Q", stack="center", axis=None)',
      'alt.X("yearmonth(month):T", axis=alt.Axis(format="%Y")) and color="sector:N" on mark_area().'
    ],
    concept: 'A streamgraph is an area chart stacked around a central baseline (`stack="center"`). It shows how the mix changes over time, not exact values, so the Y axis is usually dropped. Keep the categories within what the palette can tell apart.',
    docs: DOCS + 'marks/area.html',
    datasetId: 'us_employment',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.us_employment.url

alt.Chart(df).transform_fold(
    ['construction', 'manufacturing', 'retail_trade',
     'education_and_health_services', 'leisure_and_hospitality', 'government'],
    as_=['sector', 'employees']
).mark_area().encode(
    alt.X('yearmonth(month):T', axis=alt.Axis(format='%Y')),
    alt.Y('sum(employees):Q', stack='center', axis=None),
    alt.Color('sector:N')
)`
  },
  {
    id: 'bk-connected-scatter',
    title: 'Connected Scatter Plot Ordered by Year',
    level: 'Intermediate',
    topic: 'Chart types',
    task: 'Plot miles driven (miles:Q on X) against gas price (gas:Q on Y), both scales without zero, as a line with points that connects the rows in year order rather than X order.',
    hints: [
      'mark_line(point=True) draws the points and the connecting line.',
      'Lines connect in X order unless the order channel says otherwise: order="year".',
      'alt.X("miles:Q").scale(zero=False), alt.Y("gas:Q").scale(zero=False)'
    ],
    concept: 'A connected scatter plot shows how two measures moved together through time. The `order` channel connects points by a third field (here, year) that is not on either axis.',
    docs: DOCS + 'encodings/channels.html#order',
    datasetId: 'driving',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.driving.url

alt.Chart(df).mark_line(point=True).encode(
    alt.X('miles:Q').scale(zero=False),
    alt.Y('gas:Q').scale(zero=False),
    order='year:O'
)`
  },
  {
    id: 'bk-trail',
    title: 'Trail Chart with Variable Width',
    level: 'Beginner',
    topic: 'Chart types',
    task: 'Draw Iowa net generation per source as trails whose width also encodes the value: year:T on X, net_generation:Q on Y (title "Net generation"), colour source:N, size net_generation:Q.',
    hints: [
      'mark_trail() is a line whose width can vary.',
      'alt.Y("net_generation:Q", title="Net generation")',
      'Map the width with alt.Size("net_generation:Q").'
    ],
    concept: 'mark_trail lets the size channel vary a line\'s width point by point. Encoding the same field twice (position and width) is redundant but makes changes stand out; it also adds a size legend.',
    docs: DOCS + 'marks/trail.html',
    datasetId: 'iowa_electricity',
    solution: `${IOWA}
alt.Chart(df).mark_trail().encode(
    alt.X('year:T'),
    alt.Y('net_generation:Q', title='Net generation'),
    alt.Color('source:N'),
    alt.Size('net_generation:Q')
)`
  },
  {
    id: 'bk-step-line',
    title: 'Step Interpolation (Google Stock)',
    level: 'Beginner',
    topic: 'Chart types',
    task: 'Keep only the GOOG rows and draw date:T against price:Q as a step line that holds each value until the next one (interpolate step-after).',
    hints: [
      'transform_filter(alt.datum.symbol == "GOOG")',
      'mark_line(interpolate="step-after")',
      'encode(x="date:T", y="price:Q")'
    ],
    concept: '`interpolate` changes how points are joined: linear, step, step-after, monotone, basis… Steps suit values that stay fixed between updates. Smoothing modes such as basis do not pass through the data points and can mislead.',
    docs: DOCS + 'marks/line.html#line-interpolation',
    datasetId: 'stocks',
    solution: `${STOCKS}
alt.Chart(df).mark_line(interpolate='step-after').encode(
    x='date:T',
    y='price:Q'
).transform_filter(
    alt.datum.symbol == 'GOOG'
)`
  },
  {
    id: 'bk-punchcard',
    title: 'GitHub Punch Card Heatmap',
    level: 'Intermediate',
    topic: 'Chart types',
    task: 'Heatmap of contributions by hour and weekday: hours(time):O on X, day(time):O on Y, colour sum(count):Q with the legend titled "Contributions".',
    hints: [
      'mark_rect() fills one cell per X/Y combination.',
      'Time units work inside the shorthand: "hours(time):O" and "day(time):O".',
      'alt.Color("sum(count):Q", legend=alt.Legend(title="Contributions"))'
    ],
    concept: 'Two time units of the same field (hour of day, day of week) turn a timestamp into a grid. The default legend title "Sum of count" says how it was computed, not what it means, so rename it.',
    docs: DOCS + 'marks/rect.html',
    datasetId: 'github',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.github.url

alt.Chart(source).mark_rect().encode(
    alt.X('hours(time):O'),
    alt.Y('day(time):O'),
    alt.Color('sum(count):Q', legend=alt.Legend(title='Contributions'))
)`
  },
  {
    id: 'bk-binned-heatmap',
    title: 'Binned Heatmap of Movie Ratings',
    level: 'Intermediate',
    topic: 'Chart types',
    task: 'Compare IMDB and Rotten Tomatoes ratings as a 2D histogram: bin IMDB_Rating:Q on X and Rotten_Tomatoes_Rating:Q on Y, colour count():Q with the oranges scheme and the legend title "Total Records".',
    hints: [
      'Both axes take bin=True.',
      'mark_rect() draws one cell per pair of bins.',
      'alt.Color("count():Q", scale=alt.Scale(scheme="oranges"), legend=alt.Legend(title="Total Records"))'
    ],
    concept: 'Binning both axes turns an overplotted scatter into a density grid. A sequential scheme (oranges) suits counts, which are ordered from low to high.',
    docs: DOCS + 'marks/rect.html',
    datasetId: 'movies',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

movies = data.movies.url

alt.Chart(movies).mark_rect().encode(
    alt.X('IMDB_Rating:Q', bin=True),
    alt.Y('Rotten_Tomatoes_Rating:Q', bin=True),
    alt.Color('count():Q', scale=alt.Scale(scheme='oranges'), legend=alt.Legend(title='Total Records'))
)`
  },
  {
    id: 'bk-jitter-strip',
    title: 'Jittered Strip Plot',
    level: 'Intermediate',
    topic: 'Chart types',
    task: 'Strip plot of Seattle precipitation:Q per weather:N (X title "Weather", chart title "Precipitation"), coloured by weather with no legend. Spread the circles sideways with a Gaussian jitter computed as sqrt(-2*log(random()))*cos(2*PI*random()) and mapped to xOffset.',
    hints: [
      'transform_calculate(jitter="sqrt(-2*log(random()))*cos(2*PI*random())")',
      'xOffset="jitter:Q" spreads the points inside each weather band.',
      'alt.Chart(df, title="Precipitation").mark_circle(size=8) with alt.Color("weather:N").legend(None)'
    ],
    concept: 'A strip plot shows every value of a distribution. Jitter (a random offset, here Gaussian via the Box-Muller transform) stops points from hiding each other. Because it is random, the points move a little on every run.',
    docs: DOCS + 'encodings/channels.html#position',
    datasetId: 'seattle_weather',
    solution: `${SEATTLE}
alt.Chart(df, title='Precipitation').mark_circle(size=8).encode(
    alt.X('weather:N', title='Weather'),
    alt.XOffset('jitter:Q'),
    alt.Y('precipitation:Q'),
    alt.Color('weather:N').legend(None)
).transform_calculate(
    jitter='sqrt(-2*log(random()))*cos(2*PI*random())'
)`
  },
  {
    id: 'bk-polar-area',
    title: 'Polar Area Chart',
    level: 'Intermediate',
    topic: 'Chart types',
    task: 'Draw a polar area chart: every system gets an equal slice (compute slice = 1 and stack it on theta) and the share sets the radius with a sqrt scale (zero=True, rangeMin=20). Use mark_arc(innerRadius=20, stroke="#fff") and colour by mobile system:N.',
    hints: [
      'transform_calculate(slice="1") gives every row the same angle.',
      'theta=alt.Theta("slice:Q", stack=True)',
      'radius=alt.Radius("percentage:Q", scale=alt.Scale(type="sqrt", zero=True, rangeMin=20))'
    ],
    concept: 'A polar area chart encodes the value in the radius instead of the angle. A sqrt scale makes the slice area, not its radius, proportional to the value, which is how readers judge it.',
    docs: DOCS + 'marks/arc.html#examples',
    datasetId: 'mobile_os',
    solution: `${MOBILE}
alt.Chart(source).mark_arc(innerRadius=20, stroke='#fff').encode(
    theta=alt.Theta('slice:Q', stack=True),
    radius=alt.Radius('percentage:Q', scale=alt.Scale(type='sqrt', zero=True, rangeMin=20)),
    color='mobile system:N'
).transform_calculate(slice='1')`
  },
  {
    id: 'bk-horizon',
    title: 'Horizon Graph of Disaster Deaths',
    level: 'Advanced',
    topic: 'Chart types',
    task: 'Build a two-band horizon graph of "All natural disasters" before 1950. Base: mark_area(clip=True, interpolate="monotone", opacity=0.6) with Year:Q on X (axis format "d") and Deaths:Q on Y with domain [0, 2000000], filtered, width 500, height 100. Upper band: the same chart with Y = Deaths minus 2,000,000 (computed as DeathsMod) in purple, layered on top.',
    hints: [
      'base = alt.Chart(source).mark_area(clip=True, interpolate="monotone", opacity=0.6).encode(alt.X("Year:Q", axis=alt.Axis(format="d")), alt.Y("Deaths:Q", scale=alt.Scale(domain=[0, 2000000])))',
      'Filter with (alt.datum.Entity == "All natural disasters") & (alt.datum.Year < 1950), then .properties(width=500, height=100).',
      'upper = base.encode(alt.Y("DeathsMod:Q", scale=alt.Scale(domain=[0, 2000000])), color=alt.value("purple")).transform_calculate(DeathsMod=alt.datum.Deaths - 2000000); then base + upper.'
    ],
    concept: 'A horizon graph clips tall peaks at a band height and folds the excess back over the chart in a darker colour, halving the vertical space per band. clip=True hides what falls outside the domain.',
    docs: DOCS + 'marks/area.html',
    datasetId: 'disasters',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.disasters.url

base = alt.Chart(source).mark_area(clip=True, interpolate='monotone', opacity=0.6).encode(
    alt.X('Year:Q', axis=alt.Axis(format='d')),
    alt.Y('Deaths:Q', scale=alt.Scale(domain=[0, 2000000]))
).transform_filter(
    (alt.datum.Entity == 'All natural disasters') & (alt.datum.Year < 1950)
).properties(width=500, height=100)

upper = base.encode(
    alt.Y('DeathsMod:Q', scale=alt.Scale(domain=[0, 2000000])),
    color=alt.value('purple')
).transform_calculate(DeathsMod=alt.datum.Deaths - 2000000)

base + upper`
  },

  // ── Transforms ──────────────────────────────────────────────────────────
  {
    id: 'bk-transform-aggregate',
    title: 'Mean MPG with transform_aggregate',
    level: 'Beginner',
    topic: 'Transforms',
    task: 'Compute the mean Miles_per_Gallon per Cylinders with transform_aggregate into a field named avgMPG, then draw bars with avgMPG:Q on X and Cylinders:O on Y.',
    hints: [
      'transform_aggregate(avgMPG="mean(Miles_per_Gallon)", groupby=["Cylinders"])',
      'Without groupby every row lands in a single group.',
      'encode(x="avgMPG:Q", y="Cylinders:O") on mark_bar().'
    ],
    concept: 'Aggregating in a transform gives the result a name you can reuse in several channels or layers; aggregating in the encoding ("mean(f)") is shorter. Fields not in groupby are dropped.',
    docs: DOCS + 'transform/aggregate.html',
    datasetId: 'cars',
    solution: `${CARS}
alt.Chart(cars).mark_bar().encode(
    x='avgMPG:Q',
    y='Cylinders:O'
).transform_aggregate(
    avgMPG='mean(Miles_per_Gallon)',
    groupby=['Cylinders']
)`
  },
  {
    id: 'bk-transform-bin',
    title: 'Five Bins with transform_bin',
    level: 'Beginner',
    topic: 'Transforms',
    task: 'Bin Displacement into at most 5 bins with transform_bin into a field named binnedDisp, then count the cars per bin: binnedDisp:O on X, count():Q on Y.',
    hints: [
      'transform_bin("binnedDisp", field="Displacement", bin=alt.Bin(maxbins=5))',
      'Encode the new field as ordinal: x="binnedDisp:O".',
      'y="count():Q" on mark_bar().'
    ],
    concept: 'transform_bin writes each bin\'s start into a new field, so the axis shows single values instead of ranges. Encoding-level binning (bin=True on X) keeps the ranges. maxbins caps how many bins there are.',
    docs: DOCS + 'transform/bin.html',
    datasetId: 'cars',
    solution: `${CARS}
alt.Chart(cars).mark_bar().encode(
    x='binnedDisp:O',
    y='count():Q'
).transform_bin(
    'binnedDisp', field='Displacement', bin=alt.Bin(maxbins=5)
)`
  },
  {
    id: 'bk-calc-circle',
    title: 'Points on a Circle with transform_calculate',
    level: 'Beginner',
    topic: 'Transforms',
    task: 'From the single column angle (0..50), compute x = sin(PI*(datum.angle - 25) / 25) and y = cos(PI*(datum.angle - 25) / 25) and plot them as circles (x:Q, y:Q). Make the chart 300 × 300 so the circle is not stretched.',
    hints: [
      'transform_calculate takes one keyword per new field: transform_calculate(x="sin(...)", y="cos(...)").',
      'Inside the expression, refer to the column as datum.angle and to π as PI.',
      'mark_circle().encode(x="x:Q", y="y:Q").properties(width=300, height=300)'
    ],
    concept: 'transform_calculate evaluates a Vega expression per row to create new fields (datum is the current row). Charts are not square by default, so equal X and Y units need an explicit width and height.',
    docs: DOCS + 'transform/calculate.html',
    datasetId: 'angles',
    solution: `import altair as alt
import pandas as pd

angles = pd.DataFrame({'angle': range(51)})

alt.Chart(angles).mark_circle().encode(
    x='x:Q',
    y='y:Q'
).transform_calculate(
    x='sin(PI*(datum.angle - 25) / 25)',
    y='cos(PI*(datum.angle - 25) / 25)'
).properties(width=300, height=300)`
  },
  {
    id: 'bk-calc-distance',
    title: 'Distance Heatmap from Chained Calculations',
    level: 'Intermediate',
    topic: 'Transforms',
    task: 'For every cell of the grid, compute xShift = datum.x - 3 and yShift = datum.y - 3, then dist = sqrt(xShift² + yShift²) from those new fields. Draw mark_rect cells with x:O on X, y:O on Y sorted descending (so -5 is at the bottom), and colour dist:Q.',
    hints: [
      'Fields created in one transform_calculate can be used in the next: chain two calls.',
      'transform_calculate(xShift="datum.x - 3", yShift="datum.y - 3").transform_calculate(dist="sqrt(datum.xShift*datum.xShift + datum.yShift*datum.yShift)")',
      'encode(x="x:O", y=alt.Y("y:O", sort="descending"), color="dist:Q")'
    ],
    concept: 'Calculated fields only exist inside the chart, not in the DataFrame, and a later transform can build on an earlier one. Here the shifted centre moves the bright spot to (3, 3).',
    docs: DOCS + 'transform/calculate.html',
    datasetId: 'pixel_grid',
    solution: `import altair as alt
import numpy as np
import pandas as pd

x, y = np.meshgrid(range(-5, 6), range(-5, 6))
df = pd.DataFrame({'x': x.ravel(), 'y': y.ravel()})

alt.Chart(df).mark_rect().encode(
    x='x:O',
    y=alt.Y('y:O', sort='descending'),
    color='dist:Q'
).transform_calculate(
    xShift='datum.x - 3',
    yShift='datum.y - 3'
).transform_calculate(
    dist='sqrt(datum.xShift*datum.xShift + datum.yShift*datum.yShift)'
)`
  },
  {
    id: 'bk-timeunit-transform',
    title: 'Monthly Precipitation with transform_timeunit',
    level: 'Intermediate',
    topic: 'Transforms',
    task: 'Create monthY = yearmonth(date) with transform_timeunit and plot average(precipitation):Q per monthY:T as a teal line. Title the X axis "Month" and print its labels as abbreviated month names (format "%b").',
    hints: [
      'transform_timeunit(monthY="yearmonth(date)")',
      'alt.X("monthY:T", title="Month", axis=alt.Axis(format="%b"))',
      'mark_line(color="teal") with y="average(precipitation):Q".'
    ],
    concept: 'transform_timeunit names the discretised date so other channels and layers can reuse it. Axis formats use D3 directives: %b short month, %B full month, %Y year, %d day.',
    docs: DOCS + 'transform/timeunit.html',
    datasetId: 'seattle_weather',
    solution: `${SEATTLE}
alt.Chart(df).mark_line(color='teal').encode(
    alt.X('monthY:T', title='Month', axis=alt.Axis(format='%b')),
    alt.Y('average(precipitation):Q')
).transform_timeunit(
    monthY='yearmonth(date)'
)`
  },
  {
    id: 'bk-filter-base',
    title: 'Two Filtered Layers from One Base (LAX vs HOU)',
    level: 'Intermediate',
    topic: 'Transforms',
    task: 'Build a base line chart of flights per day of the month (date(date):O on X titled "Day", count():Q on Y titled "Flights") coloured by origin:N with domain ["LAX", "HOU"] mapped to ["teal", "orange"]. Layer two copies of it, one filtered to origin LAX and one to HOU.',
    hints: [
      'base = alt.Chart(df).mark_line().encode(alt.X("date(date):O", title="Day"), alt.Y("count():Q", title="Flights"), alt.Color("origin:N").scale(domain=["LAX", "HOU"], range=["teal", "orange"]))',
      'lax = base.transform_filter(alt.datum.origin == "LAX"); hou likewise.',
      'lax + hou'
    ],
    concept: 'Reusing a base chart keeps shared encodings in one place; each layer only adds its filter. Colouring by the field (with a fixed domain and range) gives a legend and stable colours that a constant colour would not.',
    docs: DOCS + 'transform/filter.html',
    datasetId: 'flights_2k',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.flights_2k.url

base = alt.Chart(df).mark_line().encode(
    alt.X('date(date):O', title='Day'),
    alt.Y('count():Q', title='Flights'),
    alt.Color('origin:N').scale(domain=['LAX', 'HOU'], range=['teal', 'orange'])
)

lax = base.transform_filter(alt.datum.origin == 'LAX')
hou = base.transform_filter(alt.datum.origin == 'HOU')

lax + hou`
  },
  {
    id: 'bk-lookup-regions',
    title: 'Region Names with transform_lookup',
    level: 'Intermediate',
    topic: 'Transforms',
    task: 'gapminder only has a numeric cluster id. Look up the region name from the clusters DataFrame already in the editor (key id, field region), keep year 2005, and scatter fertility:Q against life_expect:Q (size 60 circles) coloured by region:N, with country and region in the tooltip.',
    hints: [
      'The lookup field in gapminder is cluster; in clusters it is id.',
      'transform_lookup(lookup="cluster", from_=alt.LookupData(data=clusters, key="id", fields=["region"]))',
      'transform_filter(alt.datum.year == 2005); color="region:N", tooltip=["country:N", "region:N"].'
    ],
    concept: 'transform_lookup is a left join: for each row it finds the matching key in a second table and copies the listed fields. Rows without a match get nulls, so check keys before trusting the chart.',
    docs: DOCS + 'transform/lookup.html',
    datasetId: 'gapminder',
    starter: `${GAPMINDER}
${CLUSTERS}`,
    solution: `${GAPMINDER}
${CLUSTERS}
alt.Chart(df).mark_circle(size=60).encode(
    alt.X('fertility:Q'),
    alt.Y('life_expect:Q'),
    color='region:N',
    tooltip=['country:N', 'region:N']
).transform_lookup(
    lookup='cluster',
    from_=alt.LookupData(data=clusters, key='id', fields=['region'])
).transform_filter(
    alt.datum.year == 2005
)`
  },

  // ── Customisation & annotation ──────────────────────────────────────────
  {
    id: 'bk-axis-style',
    title: 'Styling an Axis',
    level: 'Beginner',
    topic: 'Customisation & annotation',
    task: 'Bar chart of max(price):Q on X per symbol:N on Y (Y titled "Stock"). Style the X axis: dashed grid [7, 3], red ticks, blue labels rotated 45 degrees.',
    hints: [
      'Axis styling goes in alt.Axis(...), passed as axis= to alt.X.',
      'alt.Axis(gridDash=[7, 3], tickColor="red", labelColor="blue", labelAngle=45)',
      'alt.Y("symbol:N").title("Stock")'
    ],
    concept: 'alt.Axis controls everything about an axis: grid, ticks, labels, title, format. Just because you can restyle it does not mean you should; keep only changes that help reading.',
    docs: DOCS + 'customization.html#adjusting-axis-labels',
    datasetId: 'stocks',
    solution: `${STOCKS}
alt.Chart(df).mark_bar().encode(
    alt.X('max(price):Q',
          axis=alt.Axis(gridDash=[7, 3], tickColor='red', labelColor='blue', labelAngle=45)),
    alt.Y('symbol:N').title('Stock')
)`
  },
  {
    id: 'bk-legend-config',
    title: 'A Boxed Legend with configure_legend',
    level: 'Intermediate',
    topic: 'Customisation & annotation',
    task: 'Bars of max(price):Q per symbol:N (Y title empty), coloured by symbol:N with the legend title "Stock". Chart title "Max stock prices", 350 × 300. Then configure the legend: stroke gray, fill "#EEEEFF", padding 5, corner radius 5, placed top-right.',
    hints: [
      'alt.Y("symbol:N").title("") and alt.Color("symbol:N").title("Stock")',
      '.properties(title="Max stock prices", width=350, height=300)',
      '.configure_legend(strokeColor="gray", fillColor="#EEEEFF", padding=5, cornerRadius=5, orient="top-right") must come last.'
    ],
    concept: 'configure_* sets chart-wide styling and must be the last call (it only works on the top-level chart). Per-channel options such as a legend title belong in the encoding.',
    docs: DOCS + 'configuration.html#legend-configuration',
    datasetId: 'stocks',
    solution: `${STOCKS}
alt.Chart(df).mark_bar().encode(
    alt.X('max(price):Q'),
    alt.Y('symbol:N').title(''),
    alt.Color('symbol:N').title('Stock')
).properties(
    title='Max stock prices',
    width=350,
    height=300
).configure_legend(
    strokeColor='gray',
    fillColor='#EEEEFF',
    padding=5,
    cornerRadius=5,
    orient='top-right'
)`
  },
  {
    id: 'bk-annotate-minmax',
    title: 'Labelling Lines with an Annotation Layer',
    level: 'Intermediate',
    topic: 'Customisation & annotation',
    task: 'For 2014, plot mean(temp_max) in crimson and mean(temp_min) in steelblue per month(date):T (X title "Month", Y title "Temperature", chart title "Seattle temperature"). Instead of a legend, add an annotation layer from a small DataFrame with the texts "Max" at 29 and "Min" at 11, both in July 2014, in bold 16px Courier.',
    hints: [
      'Filter both lines with transform_filter("year(datum.date) == 2014") and give both the same Y title.',
      'labels = pd.DataFrame({"date": ["2014-07-01", "2014-07-01"], "temp": [29, 11], "text": ["Max", "Min"]})',
      'alt.Chart(labels).mark_text(fontStyle="bold", font="Courier", fontSize=16).encode(alt.X("month(date):T"), alt.Y("temp:Q"), text="text:N"); then alt.layer(ch1, ch2, ch3).'
    ],
    concept: 'Annotations are just another layer with its own tiny dataset. Placing them in data coordinates (a month, a temperature) keeps them on the shared scales, so they move with the chart. Labels next to lines read faster than a legend.',
    docs: DOCS + 'marks/text.html',
    datasetId: 'seattle_weather',
    solution: `${SEATTLE}
ch1 = alt.Chart(df, title='Seattle temperature').mark_line(color='crimson').encode(
    alt.X('month(date):T', title='Month'),
    alt.Y('mean(temp_max):Q', title='Temperature')
).transform_filter('year(datum.date) == 2014')

ch2 = alt.Chart(df).mark_line(color='steelblue').encode(
    alt.X('month(date):T', title='Month'),
    alt.Y('mean(temp_min):Q', title='Temperature')
).transform_filter('year(datum.date) == 2014')

labels = pd.DataFrame({
    'date': ['2014-07-01', '2014-07-01'],
    'temp': [29, 11],
    'text': ['Max', 'Min']
})
ch3 = alt.Chart(labels).mark_text(fontStyle='bold', font='Courier', fontSize=16).encode(
    alt.X('month(date):T'),
    alt.Y('temp:Q'),
    text='text:N'
)

alt.layer(ch1, ch2, ch3)`
  },
  {
    id: 'bk-emoji-weather',
    title: 'Weather Calendar with Emoji',
    level: 'Intermediate',
    topic: 'Customisation & annotation',
    task: 'Draw a 2015 weather calendar: date(date):O (day of month) on X, month(date):O on Y, and one emoji per day as text, computed from weather with the mapping sun ☀️, rain 🌧️, drizzle 🌦️, fog 🌫️, snow ❄️. Use mark_text(fontSize=14).',
    hints: [
      'transform_calculate(emoji="{\'sun\': \'☀️\', \'rain\': \'🌧️\', ...}[datum.weather]") looks the emoji up per row.',
      'Keep 2015 with transform_filter("year(datum.date) == 2015").',
      'encode(x="date(date):O", y="month(date):O", text="emoji:N")'
    ],
    concept: 'Emoji are text, so mark_text can draw pictograms. A Vega expression can index an object literal ({...}[datum.weather]) to map categories to symbols without touching the data.',
    docs: DOCS + 'marks/text.html',
    datasetId: 'seattle_weather',
    solution: `${SEATTLE}
alt.Chart(df).mark_text(fontSize=14).encode(
    alt.X('date(date):O'),
    alt.Y('month(date):O'),
    text='emoji:N'
).transform_filter(
    'year(datum.date) == 2015'
).transform_calculate(
    emoji="{'sun': '☀️', 'rain': '🌧️', 'drizzle': '🌦️', 'fog': '🌫️', 'snow': '❄️'}[datum.weather]"
)`
  },

  // ── Interaction ─────────────────────────────────────────────────────────
  {
    id: 'bk-interactive-zoom',
    title: 'Pan and Zoom',
    level: 'Beginner',
    topic: 'Interaction',
    task: 'Scatter fertility:Q (X, title "Fertility rate", domain 0 to 9) against life_expect:Q (Y, title "Life expectancy"), size pop:Q (title "Population"), colour country:N (title "Country"), for Afghanistan and Argentina after 1980. Make it zoomable and pannable.',
    hints: [
      'Filter: (alt.datum.year > 1980) & ((alt.datum.country == "Argentina") | (alt.datum.country == "Afghanistan"))',
      'alt.X("fertility:Q", title="Fertility rate", scale=alt.Scale(domain=(0, 9)))',
      'End with .interactive(), the same as adding alt.selection_interval(bind="scales").'
    ],
    concept: '.interactive() binds an interval selection to the scales: dragging pans and the wheel zooms. It is the simplest interaction, and it only changes the view, not the data.',
    docs: DOCS + 'interactions/index.html',
    datasetId: 'gapminder',
    solution: `${GAPMINDER}
alt.Chart(df).mark_circle().encode(
    alt.X('fertility:Q', title='Fertility rate', scale=alt.Scale(domain=(0, 9))),
    alt.Y('life_expect:Q', title='Life expectancy'),
    alt.Size('pop:Q', title='Population'),
    alt.Color('country:N', title='Country')
).transform_filter(
    (alt.datum.year > 1980)
    & ((alt.datum.country == 'Argentina') | (alt.datum.country == 'Afghanistan'))
).interactive()`
  },
  {
    id: 'bk-slider-filter',
    title: 'Filtering with a Slider Parameter',
    level: 'Intermediate',
    topic: 'Interaction',
    task: 'Same scatter as the pan-and-zoom exercise (Afghanistan and Argentina, fertility vs life expectancy, size pop, colour country, X domain 0 to 9), but the minimum year comes from a slider from 1960 to 2005 in steps of 5 (label "year:", starting at 1960): keep rows with year greater than the parameter.',
    hints: [
      'slider = alt.binding_range(min=1960, max=2005, step=5, name="year:")',
      'year_param = alt.param(value=1960, bind=slider)',
      'transform_filter((alt.datum.year > year_param) & (...countries...)) and .add_params(year_param).'
    ],
    concept: 'alt.param is a variable the reader can change: bind it to a widget (binding_range is a slider) and use it inside expressions like any value. add_params attaches it to the chart.',
    docs: DOCS + 'interactions/parameters.html',
    datasetId: 'gapminder',
    solution: `${GAPMINDER}
slider = alt.binding_range(min=1960, max=2005, step=5, name='year:')
year_param = alt.param(value=1960, bind=slider)

alt.Chart(df).mark_circle().encode(
    alt.X('fertility:Q', title='Fertility rate', scale=alt.Scale(domain=(0, 9))),
    alt.Y('life_expect:Q', title='Life expectancy'),
    alt.Size('pop:Q', title='Population'),
    alt.Color('country:N', title='Country')
).transform_filter(
    (alt.datum.year > year_param)
    & ((alt.datum.country == 'Afghanistan') | (alt.datum.country == 'Argentina'))
).add_params(year_param)`
  },
  {
    id: 'bk-point-highlight',
    title: 'Click to Highlight a Point',
    level: 'Beginner',
    topic: 'Interaction',
    task: 'On the Afghanistan / Argentina after-1980 scatter (fertility vs life expectancy, size pop, colour country, X domain 0 to 9), add a point selection: the clicked point stays fully opaque (1.0) and the others fade to 0.2.',
    hints: [
      'select = alt.selection_point()',
      'opacity=alt.when(select).then(alt.value(1.0)).otherwise(alt.value(0.2)); alt.condition(select, alt.value(1.0), alt.value(0.2)) is the older spelling.',
      'Attach it with .add_params(select).'
    ],
    concept: 'A selection does nothing on its own: a condition decides how selected and unselected marks look. With nothing selected, every mark counts as selected, so the chart starts fully opaque.',
    docs: DOCS + 'interactions/parameters.html#conditions',
    datasetId: 'gapminder',
    solution: `${GAPMINDER}
select = alt.selection_point()

alt.Chart(df).mark_circle().encode(
    alt.X('fertility:Q', title='Fertility rate', scale=alt.Scale(domain=(0, 9))),
    alt.Y('life_expect:Q', title='Life expectancy'),
    alt.Size('pop:Q', title='Population'),
    alt.Color('country:N', title='Country'),
    opacity=alt.when(select).then(alt.value(1.0)).otherwise(alt.value(0.2))
).transform_filter(
    (alt.datum.year > 1980)
    & ((alt.datum.country == 'Afghanistan') | (alt.datum.country == 'Argentina'))
).add_params(select)`
  },
  {
    id: 'bk-brush-x',
    title: 'Brushing along One Axis',
    level: 'Intermediate',
    topic: 'Interaction',
    task: 'Scatter pop:Q (X, title "Population") against life_expect:Q (Y, title "Life expectancy") as size-50 circles, for years after 1980 and countries above 100 million people. Add an interval selection along X only that starts empty: brushed points take their country colour, the rest are lightgray.',
    hints: [
      'brush = alt.selection_interval(encodings=["x"], empty=False)',
      'color=alt.when(brush).then(alt.Color("country:N")).otherwise(alt.value("lightgray"))',
      'Filter (alt.datum.year > 1980) & (alt.datum.pop > 100000000) and .add_params(brush).'
    ],
    concept: 'An interval selection (a brush) selects everything inside a dragged range; encodings=["x"] limits it to one axis. empty=False means "nothing is selected until the reader brushes", so the chart starts gray.',
    docs: DOCS + 'interactions/parameters.html#interval-selections',
    datasetId: 'gapminder',
    solution: `${GAPMINDER}
brush = alt.selection_interval(encodings=['x'], empty=False)

alt.Chart(df).mark_circle(size=50).encode(
    alt.X('pop:Q', title='Population'),
    alt.Y('life_expect:Q', title='Life expectancy'),
    color=alt.when(brush).then(alt.Color('country:N')).otherwise(alt.value('lightgray'))
).transform_filter(
    (alt.datum.year > 1980) & (alt.datum.pop > 100000000)
).add_params(brush)`
  },
  {
    id: 'bk-cross-highlight',
    title: 'Linked Views: Brush One, Highlight Both',
    level: 'Advanced',
    topic: 'Interaction',
    task: 'Two size-50 scatters of countries above 100 million after 1980, side by side: life_expect vs pop (left) and life_expect vs fertility (right). A Y-only brush on the left (empty=False) paints selected points crimson in both; the rest use country colours from the pastel1 scheme. In the right chart only, selected points are also bigger (80 vs 30).',
    hints: [
      'brush = alt.selection_interval(encodings=["y"], empty=False), added to the left chart only.',
      'color=alt.when(brush).then(alt.value("crimson")).otherwise(alt.Color("country:N", scale=alt.Scale(scheme="pastel1")))',
      'Right chart adds size=alt.when(brush).then(alt.value(80)).otherwise(alt.value(30)); combine with left | right.'
    ],
    concept: 'One selection can drive conditions in several views: brushing in one chart highlights the same rows everywhere (coordinated views). A muted palette makes the highlight colour stand out; size helps where the brush itself is not drawn.',
    docs: DOCS + 'interactions/index.html',
    datasetId: 'gapminder',
    solution: `${GAPMINDER}
brush = alt.selection_interval(encodings=['y'], empty=False)
color = alt.when(brush).then(alt.value('crimson')).otherwise(
    alt.Color('country:N', scale=alt.Scale(scheme='pastel1'))
)

left = alt.Chart(df).mark_circle(size=50, opacity=1.0).encode(
    alt.X('life_expect:Q', title='Life expectancy'),
    alt.Y('pop:Q', title='Population'),
    color=color
).transform_filter(
    (alt.datum.year > 1980) & (alt.datum.pop > 100000000)
).add_params(brush)

right = alt.Chart(df).mark_circle(opacity=1.0).encode(
    alt.X('life_expect:Q', title='Life expectancy'),
    alt.Y('fertility:Q', title='Fertility'),
    color=color,
    size=alt.when(brush).then(alt.value(80)).otherwise(alt.value(30))
).transform_filter(
    (alt.datum.year > 1980) & (alt.datum.pop > 100000000)
)

left | right`
  },
  {
    id: 'bk-legend-selector',
    title: 'A Clickable Legend Chart',
    level: 'Intermediate',
    topic: 'Interaction',
    task: 'Scatter Horsepower:Q vs Miles_per_Gallon:Q (Y title "Miles per gallon", Name in the tooltip) next to a small legend chart: size-120 circles with Origin:N on a right-oriented Y axis. Clicking a legend circle selects that origin by its colour encoding: selected cars keep the Origin colour (no legend), others turn lightgray. Define the colour condition once and use it in both charts.',
    hints: [
      'select = alt.selection_point(encodings=["color"])',
      'color = alt.when(select).then(alt.Color("Origin:N", legend=None)).otherwise(alt.value("lightgray"))',
      'legend = alt.Chart(cars).mark_circle(size=120).encode(alt.Y("Origin:N").axis(orient="right"), color=color).add_params(select); then scatter | legend.'
    ],
    concept: 'A selection projected on an encoding (encodings=["color"]) selects every mark with the clicked colour, so a tiny chart can act as a legend. Naming the condition (color = ...) avoids repeating it.',
    docs: DOCS + 'interactions/parameters.html#selection-targets',
    datasetId: 'cars',
    solution: `${CARS}
select = alt.selection_point(encodings=['color'])
color = alt.when(select).then(alt.Color('Origin:N', legend=None)).otherwise(alt.value('lightgray'))

scatter = alt.Chart(cars).mark_point().encode(
    alt.X('Horsepower:Q'),
    alt.Y('Miles_per_Gallon:Q').title('Miles per gallon'),
    color=color,
    tooltip='Name:N'
)

legend = alt.Chart(cars).mark_circle(size=120).encode(
    alt.Y('Origin:N').axis(orient='right'),
    color=color
).add_params(select)

scatter | legend`
  },
  {
    id: 'bk-matrix-selector',
    title: 'Origin × Cylinders Selector Matrix',
    level: 'Advanced',
    topic: 'Interaction',
    task: 'Like the clickable legend, but the selector is a matrix: mark_rect with Cylinders:O on X and Origin:N on a right-oriented Y axis. The point selection works on the fields Origin and Cylinders, so clicking a cell (shift-click for several) selects that combination in the Horsepower vs Miles_per_Gallon scatter.',
    hints: [
      'select = alt.selection_point(fields=["Origin", "Cylinders"])',
      'color = alt.when(select).then(alt.Color("Origin:N", legend=None)).otherwise(alt.value("lightgray"))',
      'matrix = alt.Chart(cars).mark_rect().encode(alt.X("Cylinders:O"), alt.Y("Origin:N").axis(orient="right"), color=color).add_params(select); scatter | matrix'
    ],
    concept: 'Selecting by fields matches rows on the values of those fields, whatever channel shows them. Two fields make each matrix cell a combination; shift-click adds cells to the selection.',
    docs: DOCS + 'interactions/parameters.html#selection-targets',
    datasetId: 'cars',
    solution: `${CARS}
select = alt.selection_point(fields=['Origin', 'Cylinders'])
color = alt.when(select).then(alt.Color('Origin:N', legend=None)).otherwise(alt.value('lightgray'))

scatter = alt.Chart(cars).mark_point().encode(
    alt.X('Horsepower:Q'),
    alt.Y('Miles_per_Gallon:Q').title('Miles per gallon'),
    color=color,
    tooltip='Name:N'
)

matrix = alt.Chart(cars).mark_rect().encode(
    alt.X('Cylinders:O'),
    alt.Y('Origin:N').axis(orient='right'),
    color=color
).add_params(select)

scatter | matrix`
  },
  {
    id: 'bk-radio-origin',
    title: 'Radio Buttons with Fixed Axes',
    level: 'Intermediate',
    topic: 'Interaction',
    task: 'Scatter Horsepower:Q (domain 0 to 240) vs Miles_per_Gallon:Q (title "Miles per Gallon", domain 0 to 50), coloured by Origin:N with the colour domain fixed to ["Europe", "Japan", "USA"]. Radio buttons (labels "Europe ", "Japan ", "USA ", "All", named "Region: ") select an Origin and filter the chart; "All" maps to None.',
    hints: [
      'options = ["Europe", "Japan", "USA"]; radio = alt.binding_radio(options=options + [None], labels=[o + " " for o in options] + ["All"], name="Region: ")',
      'selection = alt.selection_point(fields=["Origin"], bind=radio)',
      'Fix both scale domains and the colour domain, then .add_params(selection).transform_filter(selection).'
    ],
    concept: 'Filtering by a selection removes rows, so scales would re-fit and axes jump between choices. Fixing the domains keeps every state comparable, and a fixed colour domain keeps each origin\'s colour.',
    docs: DOCS + 'interactions/bindings_widgets.html',
    datasetId: 'cars',
    solution: `${CARS}
options = ['Europe', 'Japan', 'USA']
labels = [option + ' ' for option in options]
radio = alt.binding_radio(options=options + [None], labels=labels + ['All'], name='Region: ')
selection = alt.selection_point(fields=['Origin'], bind=radio)

alt.Chart(cars).mark_point().encode(
    alt.X('Horsepower:Q', scale=alt.Scale(domain=(0, 240))),
    alt.Y('Miles_per_Gallon:Q', title='Miles per Gallon', scale=alt.Scale(domain=(0, 50))),
    color=alt.Color('Origin:N').scale(domain=options)
).add_params(selection).transform_filter(selection)`
  },
  {
    id: 'bk-dropdown-region',
    title: 'Dropdown Region and Year Slider',
    level: 'Advanced',
    topic: 'Interaction',
    task: 'Look up region names from the clusters DataFrame in the editor into gapminder (as in the lookup exercise) and scatter fertility:Q (title "Fertility") vs life_expect:Q (title "Life Expectancy"). A dropdown of the six regions (labelled "Region ") colours the chosen region by region:N and the rest lightgray. A year slider (labelled "Year ", 1960 to 2005, step 5, starting at 2000) shows only that year: opacity 1 when the year is selected, 0 otherwise.',
    hints: [
      'region = alt.selection_point(fields=["region"], bind=alt.binding_select(options=list(clusters["region"]), name="Region "))',
      'year = alt.selection_point(fields=["year"], bind=alt.binding_range(min=1960, max=2005, step=5, name="Year "), value={"year": 2000})',
      'color=alt.when(region).then(alt.Color("region:N")).otherwise(alt.value("lightgray")), opacity=alt.when(year).then(alt.value(1.0)).otherwise(alt.value(0.0)); .add_params(region, year)'
    ],
    concept: 'Using opacity instead of a filter hides the other years without removing them, so the axes keep the domain of the whole dataset and positions stay comparable across years. Without a name= on the binding, Vega labels the widget after the selection and field (Year_year).',
    docs: DOCS + 'interactions/bindings_widgets.html',
    datasetId: 'gapminder',
    starter: `${GAPMINDER}
${CLUSTERS}`,
    solution: `${GAPMINDER}
${CLUSTERS}
region = alt.selection_point(
    fields=['region'],
    bind=alt.binding_select(options=list(clusters['region']), name='Region ')
)
year = alt.selection_point(
    fields=['year'],
    bind=alt.binding_range(min=1960, max=2005, step=5, name='Year '),
    value={'year': 2000}
)

alt.Chart(df).mark_circle(opacity=1.0).encode(
    alt.X('fertility:Q', title='Fertility'),
    alt.Y('life_expect:Q', title='Life Expectancy'),
    color=alt.when(region).then(alt.Color('region:N')).otherwise(alt.value('lightgray')),
    opacity=alt.when(year).then(alt.value(1.0)).otherwise(alt.value(0.0))
).transform_lookup(
    lookup='cluster',
    from_=alt.LookupData(data=clusters, key='id', fields=['region'])
).add_params(region, year)`
  },
  {
    id: 'bk-dropdown-axis',
    title: 'Choosing the X Column from a Dropdown',
    level: 'Advanced',
    topic: 'Interaction',
    task: 'Scatter an X column chosen from a dropdown (Horsepower, Displacement, Weight_in_lbs, Acceleration; default Horsepower; named "X axis ") against Miles_per_Gallon:Q (title "Miles per Gallon"). Copy the chosen column into a field x with transform_calculate and plot x:Q with an empty title.',
    hints: [
      'xcol = alt.param(value="Horsepower", bind=alt.binding_select(options=[...], name="X axis "))',
      'transform_calculate(x=f"datum[{xcol.name}]") reads the column whose name the parameter holds.',
      'alt.X("x:Q").title(""), then .add_params(xcol).'
    ],
    concept: 'A parameter can hold a field name. datum[name] looks the column up at run time, so one chart template serves every choice.',
    docs: DOCS + 'interactions/parameters.html',
    datasetId: 'cars',
    solution: `${CARS}
dropdown = alt.binding_select(
    options=['Horsepower', 'Displacement', 'Weight_in_lbs', 'Acceleration'],
    name='X axis '
)
xcol = alt.param(value='Horsepower', bind=dropdown)

alt.Chart(cars).mark_circle().encode(
    alt.X('x:Q').title(''),
    alt.Y('Miles_per_Gallon:Q', title='Miles per Gallon')
).add_params(xcol).transform_calculate(
    x=f'datum[{xcol.name}]'
)`
  },
  {
    id: 'bk-checkbox-size',
    title: 'Checkbox for Bigger Points',
    level: 'Intermediate',
    topic: 'Interaction',
    task: 'Scatter Horsepower:Q vs Acceleration:Q as filled, opaque circles coloured by Origin:N with the accent scheme. A checkbox named "Large points" switches the point size between 100 (checked) and 40.',
    hints: [
      'large = alt.param(bind=alt.binding_checkbox(name="Large points"))',
      'size=alt.when(large).then(alt.value(100)).otherwise(alt.value(40))',
      'mark_circle(filled=True, opacity=1.0); color=alt.Color("Origin:N").scale(scheme="accent"); .add_params(large)'
    ],
    concept: 'A checkbox binding gives a boolean parameter, and a condition can test it directly. Parameters do not have to filter data; they can drive any mark property.',
    docs: DOCS + 'interactions/bindings_widgets.html',
    datasetId: 'cars',
    solution: `${CARS}
large = alt.param(bind=alt.binding_checkbox(name='Large points'))

alt.Chart(cars).mark_circle(filled=True, opacity=1.0).encode(
    alt.X('Horsepower:Q'),
    alt.Y('Acceleration:Q'),
    color=alt.Color('Origin:N').scale(scheme='accent'),
    size=alt.when(large).then(alt.value(100)).otherwise(alt.value(40))
).add_params(large)`
  },
  {
    id: 'bk-brush-histogram',
    title: 'Overview + Detail Histograms',
    level: 'Advanced',
    topic: 'Interaction',
    task: 'Compute time = hours(datum.date) + minutes(datum.date) / 60 and build two 600 × 100 histograms of count() over time:Q. The lower overview bins the whole day (maxbins 30) and holds an X-only brush. The upper detail chart re-bins only the brushed range (bin extent = brush) and zooms its X scale to it (scale domain = brush). Stack detail over overview.',
    hints: [
      'brush = alt.selection_interval(encodings=["x"])',
      'base = alt.Chart(source).transform_calculate(time="hours(datum.date) + minutes(datum.date) / 60").mark_bar().encode(alt.Y("count():Q")).properties(width=600, height=100)',
      'detail = base.encode(alt.X("time:Q", bin=alt.Bin(maxbins=30, extent=brush), scale=alt.Scale(domain=brush))); overview = base.encode(alt.X("time:Q", bin=alt.Bin(maxbins=30))).add_params(brush); detail & overview'
    ],
    concept: 'A selection can feed a scale domain or a bin extent, not just conditions. The detail view follows the brush, re-binning finer as the range shrinks: the overview + detail pattern.',
    docs: DOCS + 'interactions/index.html',
    datasetId: 'flights_5k',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.flights_5k.url

brush = alt.selection_interval(encodings=['x'])

base = alt.Chart(source).transform_calculate(
    time='hours(datum.date) + minutes(datum.date) / 60'
).mark_bar().encode(
    alt.Y('count():Q')
).properties(width=600, height=100)

detail = base.encode(
    alt.X('time:Q', bin=alt.Bin(maxbins=30, extent=brush), scale=alt.Scale(domain=brush))
)
overview = base.encode(
    alt.X('time:Q', bin=alt.Bin(maxbins=30))
).add_params(brush)

detail & overview`
  },
  {
    id: 'bk-hover-rule',
    title: 'Hover Rule with Value Label',
    level: 'Advanced',
    topic: 'Interaction',
    task: 'For 2014, draw mean(temp_max) (crimson) and mean(temp_min) (steelblue) per month(date):T (X title "Month", Y title "Temperature"). Add a nearest, hover-driven point selection on X (empty=False) with three helper layers: a crimson point on the max line visible only when selected, a gray rule from min(temp_min) to max(temp_max) visible only when selected, and a left-aligned label (dx=10, dy=-10) with the max temperature formatted ".1f".',
    hints: [
      'nearest = alt.selection_point(nearest=True, on="pointerover", encodings=["x"], empty=False) (on="mouseover" also works)',
      'base = alt.Chart(df).encode(alt.X("month(date):T", title="Month")).transform_filter("year(datum.date) == 2014"); tmax = base.mark_line(color="crimson").encode(alt.Y("mean(temp_max):Q", title="Temperature"))',
      'points = tmax.mark_point(color="crimson").encode(opacity=alt.when(nearest).then(alt.value(1)).otherwise(alt.value(0))).add_params(nearest); text uses text=alt.when(nearest).then(alt.Text("mean(temp_max):Q", format=".1f")).otherwise(alt.value(" "))'
    ],
    concept: 'nearest=True selects the closest mark, so a hover works without hitting the point exactly. Hidden helper layers (opacity 0 until selected) build details-on-demand; formatting the label avoids long decimals.',
    docs: DOCS + 'interactions/index.html',
    datasetId: 'seattle_weather',
    solution: `${SEATTLE}
nearest = alt.selection_point(nearest=True, on='pointerover', encodings=['x'], empty=False)

base = alt.Chart(df).encode(
    alt.X('month(date):T', title='Month')
).transform_filter('year(datum.date) == 2014')

tmax = base.mark_line(color='crimson').encode(alt.Y('mean(temp_max):Q', title='Temperature'))
tmin = base.mark_line(color='steelblue').encode(alt.Y('mean(temp_min):Q', title='Temperature'))

points = tmax.mark_point(color='crimson').encode(
    opacity=alt.when(nearest).then(alt.value(1)).otherwise(alt.value(0))
).add_params(nearest)

rule = base.mark_rule(color='gray').encode(
    alt.Y('min(temp_min):Q'),
    alt.Y2('max(temp_max):Q'),
    opacity=alt.when(nearest).then(alt.value(1)).otherwise(alt.value(0))
)

text = tmax.mark_text(align='left', dx=10, dy=-10).encode(
    text=alt.when(nearest).then(alt.Text('mean(temp_max):Q', format='.1f')).otherwise(alt.value(' '))
)

alt.layer(tmax, tmin, points, rule, text)`
  },
  {
    id: 'bk-threshold-slider',
    title: 'Threshold Slider inside a Condition',
    level: 'Intermediate',
    topic: 'Interaction',
    task: 'Plot each 2014 day\'s temp_max:Q (Y title "Max temperature") per month(date):T (X title "Month") as points. A slider named "Temp cut: " (0 to 40, step 1, starting at 20) sets a threshold: days below it are teal, the rest salmon.',
    hints: [
      'cutoff = alt.param(value=20, bind=alt.binding_range(min=0, max=40, step=1, name="Temp cut: "))',
      'color=alt.when(alt.datum.temp_max < cutoff).then(alt.value("teal")).otherwise(alt.value("salmon"))',
      'transform_filter("year(datum.date) == 2014") and .add_params(cutoff).'
    ],
    concept: 'A parameter can appear inside a predicate, so the reader moves the line between the two colour classes. The book builds it from a selection_point with init; a plain param is the current, shorter way.',
    docs: DOCS + 'interactions/parameters.html',
    datasetId: 'seattle_weather',
    solution: `${SEATTLE}
cutoff = alt.param(value=20, bind=alt.binding_range(min=0, max=40, step=1, name='Temp cut: '))

alt.Chart(df).mark_point().encode(
    alt.X('month(date):T', title='Month'),
    alt.Y('temp_max:Q', title='Max temperature'),
    color=alt.when(alt.datum.temp_max < cutoff).then(alt.value('teal')).otherwise(alt.value('salmon'))
).transform_filter(
    'year(datum.date) == 2014'
).add_params(cutoff)`
  },

  // ── Repeat & facet ──────────────────────────────────────────────────────
  {
    id: 'bk-trellis-area',
    title: 'Small Multiples of Areas',
    level: 'Beginner',
    topic: 'Repeat & facet',
    task: 'Split the Iowa net generation areas (year:T on X, net_generation:Q on Y, opacity 0.6, colour source:N) into one column per source:N, each 200 wide.',
    hints: [
      'The column channel creates one panel per value: column="source:N".',
      'Use columns rather than rows, so readers do not have to scroll to compare.',
      'mark_area(opacity=0.6) and .properties(width=200).'
    ],
    concept: 'Small multiples (trellis charts) give each category its own panel with shared scales, so shapes can be compared without overlap. Side by side is usually easier to compare than stacked rows.',
    docs: DOCS + 'compound_charts.html#faceted-charts',
    datasetId: 'iowa_electricity',
    solution: `${IOWA}
alt.Chart(df).mark_area(opacity=0.6).encode(
    alt.X('year:T'),
    alt.Y('net_generation:Q'),
    alt.Color('source:N'),
    alt.Column('source:N')
).properties(width=200)`
  },
  {
    id: 'bk-repeat-matrix',
    title: 'Scatter Matrix with repeat',
    level: 'Intermediate',
    topic: 'Repeat & facet',
    task: 'Build a 2 × 2 grid of 200 × 200 scatter plots coloured by Origin:N: rows Cylinders and Displacement on Y, columns Horsepower and Miles_per_Gallon on X, using one chart template and repeat.',
    hints: [
      'In the template, X and Y take alt.repeat("column") and alt.repeat("row") with type="quantitative".',
      '.properties(width=200, height=200) on the template, before repeat.',
      '.repeat(row=["Cylinders", "Displacement"], column=["Horsepower", "Miles_per_Gallon"])'
    ],
    concept: 'repeat stamps one chart template across a list of fields: each cell swaps the field, not the data. It replaces a grid of hand-written concatenations.',
    docs: DOCS + 'compound_charts.html#repeated-charts',
    datasetId: 'cars',
    solution: `${CARS}
alt.Chart(cars).mark_point().encode(
    alt.X(alt.repeat('column'), type='quantitative'),
    alt.Y(alt.repeat('row'), type='quantitative'),
    color='Origin:N'
).properties(width=200, height=200).repeat(
    row=['Cylinders', 'Displacement'],
    column=['Horsepower', 'Miles_per_Gallon']
)`
  },
  {
    id: 'bk-facet-hover',
    title: 'Faceting a Layered Hover Chart',
    level: 'Advanced',
    topic: 'Repeat & facet',
    task: 'Per species, show sepalLength:Q vs sepalWidth:Q (both without zero) in 180 × 180 panels. Hovering selects the nearest point (empty=False): it keeps its species colour, the others go lightgray, and a text label (left, dx=5, dy=-5, size 12) shows its petalLength only when selected. Layer points and text, then facet by species:N.',
    hints: [
      'hover = alt.selection_point(on="pointerover", nearest=True, empty=False)',
      'base = alt.Chart(source).encode(alt.X("sepalLength:Q").scale(zero=False), alt.Y("sepalWidth:Q").scale(zero=False), color=alt.when(hover).then(alt.Color("species:N")).otherwise(alt.value("lightgray"))).properties(width=180, height=180)',
      'points = base.mark_point().add_params(hover); text = base.mark_text(align="left", dx=5, dy=-5, fontSize=12).encode(text="petalLength:Q", opacity=alt.when(hover).then(alt.value(1)).otherwise(alt.value(0))); alt.layer(points, text).facet("species:N")'
    ],
    concept: 'The column channel only facets a single chart. .facet() can split a whole layered (and interactive) chart, with the data given once at the top.',
    docs: DOCS + 'compound_charts.html#faceted-charts',
    datasetId: 'iris',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.iris.url

hover = alt.selection_point(on='pointerover', nearest=True, empty=False)

base = alt.Chart(source).encode(
    alt.X('sepalLength:Q').scale(zero=False),
    alt.Y('sepalWidth:Q').scale(zero=False),
    color=alt.when(hover).then(alt.Color('species:N')).otherwise(alt.value('lightgray'))
).properties(width=180, height=180)

points = base.mark_point().add_params(hover)
text = base.mark_text(align='left', dx=5, dy=-5, fontSize=12).encode(
    text='petalLength:Q',
    opacity=alt.when(hover).then(alt.value(1)).otherwise(alt.value(0))
)

alt.layer(points, text).facet('species:N')`
  },
  {
    id: 'bk-marginal-hist',
    title: 'Scatter Plot with Marginal Histograms',
    level: 'Advanced',
    topic: 'Repeat & facet',
    task: 'Scatter Horsepower (X, domain 0 to 240) vs Displacement:Q (Y, domain 0 to 500) as circles coloured by Origin:N. Above it, a 60-high histogram of Horsepower; to its right, a 60-wide histogram of Displacement. Both histograms are translucent bars (opacity 0.3, binSpacing 0), 20 bins over the scatter\'s domain, unstacked, coloured by Origin, with empty titles. Arrange them as top & (points | right).',
    hints: [
      'Share the scales: xscale = alt.Scale(domain=(0, 240)); yscale = alt.Scale(domain=(0, 500)); use .scale(xscale) / .scale(yscale) in the scatter.',
      'top = base_bar.encode(alt.X("Horsepower:Q").bin(maxbins=20, extent=xscale.domain).stack(None).title(""), alt.Y("count()").stack(None).title(""), alt.Color("Origin:N")).properties(height=60)',
      'right is the same turned sideways: Y bins Displacement over yscale.domain, X counts; .properties(width=60).'
    ],
    concept: 'Marginal histograms show each variable\'s distribution next to the joint one. Reusing the scatter\'s domains as bin extents keeps the bars aligned with the points; stack(None) overlaps the origins instead of stacking them.',
    docs: DOCS + 'compound_charts.html#vertical-concatenation',
    datasetId: 'cars',
    solution: `${CARS}
base = alt.Chart(cars)
base_bar = base.mark_bar(opacity=0.3, binSpacing=0)

xscale = alt.Scale(domain=(0, 240))
yscale = alt.Scale(domain=(0, 500))

points = base.mark_circle().encode(
    alt.X('Horsepower:Q').scale(xscale),
    alt.Y('Displacement:Q').scale(yscale),
    color='Origin:N'
)

top_hist = base_bar.encode(
    alt.X('Horsepower:Q').bin(maxbins=20, extent=xscale.domain).stack(None).title(''),
    alt.Y('count()').stack(None).title(''),
    alt.Color('Origin:N')
).properties(height=60)

right_hist = base_bar.encode(
    alt.Y('Displacement:Q').bin(maxbins=20, extent=yscale.domain).stack(None).title(''),
    alt.X('count()').stack(None).title(''),
    alt.Color('Origin:N')
).properties(width=60)

top_hist & (points | right_hist)`
  },

  // ── Maps ────────────────────────────────────────────────────────────────
  {
    id: 'bk-projections',
    title: 'One World, Four Projections',
    level: 'Intermediate',
    topic: 'Maps',
    task: 'Draw the world countries (lightgray fill, white stroke, 250 × 180) in four projections, equirectangular, mercator, orthographic and gnomonic, each titled with its projection name, in a two-column grid.',
    hints: [
      'base = alt.Chart(countries).mark_geoshape(fill="lightgray", stroke="white").properties(width=250, height=180)',
      'charts = [base.project(p).properties(title=p) for p in ["equirectangular", "mercator", "orthographic", "gnomonic"]]',
      'alt.concat(*charts, columns=2)'
    ],
    concept: 'A projection flattens the globe and every one distorts something (area, shape, distance). project() picks one per chart; a list comprehension builds the variants.',
    docs: DOCS + 'marks/geoshape.html#basic-map',
    datasetId: 'world_110m',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

countries = alt.topo_feature(data.world_110m.url, 'countries')

base = alt.Chart(countries).mark_geoshape(fill='lightgray', stroke='white').properties(width=250, height=180)
charts = [base.project(p).properties(title=p)
          for p in ['equirectangular', 'mercator', 'orthographic', 'gnomonic']]

alt.concat(*charts, columns=2)`
  },
  {
    id: 'bk-choropleth',
    title: 'Choropleth with transform_lookup',
    level: 'Intermediate',
    topic: 'Maps',
    task: 'Colour the US counties by unemployment rate: look up rate from unemp (key id) into the county shapes, encode rate:Q with the reds scheme, project with albersUsa at 500 × 300.',
    hints: [
      'alt.Chart(counties).mark_geoshape()',
      'transform_lookup(lookup="id", from_=alt.LookupData(unemp, "id", ["rate"]))',
      'alt.Color("rate:Q", scale=alt.Scale(scheme="reds")), then .project(type="albersUsa").properties(width=500, height=300)'
    ],
    concept: 'Map shapes and statistics usually live in different files. transform_lookup joins them on a shared id, and the joined field can then be encoded like any other.',
    docs: DOCS + 'transform/lookup.html',
    datasetId: 'us_unemployment',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

counties = alt.topo_feature(data.us_10m.url, feature='counties')
unemp = data.unemployment.url

alt.Chart(counties).mark_geoshape().encode(
    alt.Color('rate:Q', scale=alt.Scale(scheme='reds'))
).transform_lookup(
    lookup='id',
    from_=alt.LookupData(unemp, 'id', ['rate'])
).project(
    type='albersUsa'
).properties(width=500, height=300)`
  },
  {
    id: 'bk-airports-graduated',
    title: 'Graduated Symbol Map of Airports per State',
    level: 'Advanced',
    topic: 'Maps',
    task: 'Over a lightgray albersUsa map of the states (white stroke, 500 × 300), draw one steelblue circle per state at the mean latitude/longitude of its airports, sized by the number of airports (legend title "Number of Airports"), with state and count in the tooltip. Title the circle chart "Number of airports in US" and draw the map first.',
    hints: [
      'transform_aggregate(latitude="mean(latitude)", longitude="mean(longitude)", count="count()", groupby=["state"])',
      'mark_circle().encode(longitude="longitude:Q", latitude="latitude:Q", size=alt.Size("count:Q").title("Number of Airports"), color=alt.value("steelblue"), tooltip=["state:N", "count:Q"])',
      'background + points: layers draw in order, so the map goes first.'
    ],
    concept: 'Aggregating points by region and sizing circles by the count gives a graduated symbol map. latitude/longitude channels are projected with the map\'s projection, so the layers line up.',
    docs: DOCS + 'marks/geoshape.html',
    datasetId: 'airports_us',
    solution: `import altair as alt
from vega_datasets import data

map = alt.topo_feature(data.us_10m.url, feature='states')
airports = data.airports.url

background = alt.Chart(map).mark_geoshape(
    fill='lightgray', stroke='white'
).project('albersUsa').properties(width=500, height=300)

points = alt.Chart(airports, title='Number of airports in US').transform_aggregate(
    latitude='mean(latitude)',
    longitude='mean(longitude)',
    count='count()',
    groupby=['state']
).mark_circle().encode(
    longitude='longitude:Q',
    latitude='latitude:Q',
    size=alt.Size('count:Q').title('Number of Airports'),
    color=alt.value('steelblue'),
    tooltip=['state:N', 'count:Q']
)

background + points`
  }
];
