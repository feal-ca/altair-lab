// The curated exercises. `solution` runs under Pyodide + Altair 6.3 and is used to build target specs.
// Solutions use the current API (alt.when, selection_point/interval); the checker compares
// compiled specs, so older spellings such as alt.condition produce the same checks.
// Plain ESM: importable from Node and from Vite.

import { BOOK_EXERCISES } from './bookExercises.js';

// Topic order follows "Data Visualization with Vega-Altair 5" (Vázquez, UPC 2024).
export const TOPICS = [
  'Data & types',
  'Marks & channels',
  'Encoding options',
  'Layering & views',
  'Chart types',
  'Transforms',
  'Customisation & annotation',
  'Interaction',
  'Repeat & facet',
  'Maps',
  'Exam-style'
];

const COURSE_EXERCISES = [
  {
    id: 'nb1-bar-color',
    title: 'Colored Category Bar Chart',
    level: 'Beginner',
    topic: 'Marks & channels',
    task: 'Create a bar chart using Country_data with Country:N on X, Population (Millions):Q on Y, Color encoded by Country, and chart title "Population".',
    hints: [
      'Pass Country_data to alt.Chart(Country_data).mark_bar()',
      'Inside .encode(), map alt.X("Country:N"), alt.Y("Population (Millions):Q"), and alt.Color("Country:N")',
      'Chain .properties(title="Population") at the end.'
    ],
    concept: 'Each encoding channel maps a column to a visual property; the `:N` suffix tells Altair the column is nominal (unordered categories).',
    docs: 'https://altair-viz.github.io/user_guide/encodings/index.html',
    datasetId: 'country_pop',
    solution: `import altair as alt
import pandas as pd

Country_data = pd.DataFrame({
    'Country': ['Germany', 'France', 'Italy', 'Spain', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Czech Republic', 'Greece'],
    'Population (Millions)': [83.155, 67.657, 59.236, 47.399, 37.840, 19.202, 17.475, 11.555, 10.702, 10.679]
})

alt.Chart(Country_data).mark_bar().encode(
    alt.X('Country:N'),
    alt.Y('Population (Millions):Q'),
    alt.Color('Country:N')
).properties(title='Population')`
  },
  {
    id: 'nb1-iphone-tooltip',
    title: 'Filled Square Scatterplot with Tooltip',
    level: 'Beginner',
    topic: 'Marks & channels',
    task: 'Plot df (iPhone_data) using mark_point(shape="square", filled=True). Map year:O to X, price:Q to Y, name to tooltip, and set title to "Apple smartphones 2007-2020".',
    hints: [
      'Configure mark_point with shape="square" and filled=True.',
      'Inside .encode(), use alt.X("year:O"), alt.Y("price:Q"), and tooltip="name".',
      'Add .properties(title="Apple smartphones 2007-2020").'
    ],
    concept: 'Mark properties like `shape` and `filled` style every mark the same way, while the `tooltip` channel adds per-point detail on hover.',
    docs: 'https://altair-viz.github.io/user_guide/marks/point.html',
    datasetId: 'iphone_data',
    solution: `import altair as alt
import pandas as pd

iPhone_data = {
    'name': ['iPhone', 'iPhone 3G', 'iPhone 3GS', 'iPhone 4', 'iPhone 4S', 'iPhone 5', 'iPhone 5S', 'iPhone 6', 'iPhone 6S', 'iPhone 7', 'iPhone X', 'iPhone XS', 'iPhone 11 Pro', 'iPhone 12 Pro'],
    'year': ['2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'],
    'price': [499, 599, 699, 599, 649, 649, 649, 649, 699, 649, 999, 999, 1099, 1099]
}
df = pd.DataFrame(iPhone_data)

alt.Chart(df).mark_point(shape='square', filled=True).encode(
    alt.X('year:O'),
    alt.Y('price:Q'),
    tooltip='name'
).properties(title='Apple smartphones 2007-2020')`
  },
  {
    id: 'nb1-cars-opacity',
    title: 'Multi-Channel Opacity Encoding',
    level: 'Beginner',
    topic: 'Marks & channels',
    task: 'Using cars, create a point chart with size=50. Encode Acceleration:Q on X, Miles_per_Gallon:Q on Y, Origin:N on color, and Horsepower:Q on opacity.',
    hints: [
      'Use alt.Chart(cars).mark_point(size=50)',
      'Map x="Acceleration:Q", y="Miles_per_Gallon:Q", color="Origin:N", and opacity="Horsepower:Q".'
    ],
    concept: 'Any channel can carry data: here opacity encodes horsepower, so fainter points are less powerful cars.',
    docs: 'https://altair-viz.github.io/user_guide/encodings/channels.html',
    datasetId: 'cars',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

cars = data.cars.url

alt.Chart(cars).mark_point(size=50).encode(
    x='Acceleration:Q',
    y='Miles_per_Gallon:Q',
    color='Origin:N',
    opacity='Horsepower:Q'
)`
  },
  {
    id: 'nb1-line-stroke',
    title: 'Custom Dashed Line Properties',
    level: 'Beginner',
    topic: 'Marks & channels',
    task: 'Plot US construction employment over month:T using mark_line with strokeDash=[10, 50], stroke="black", strokeWidth=5, strokeOpacity=0.5, and size=10.',
    hints: [
      'Pass strokeDash=[10, 50], stroke="black", strokeWidth=5, strokeOpacity=0.5, size=10 inside .mark_line().',
      'Encode alt.X("month:T") and alt.Y("construction:Q").'
    ],
    concept: 'Fixed styling passed to `mark_line()` (dash pattern, width, opacity) applies to the whole line, independent of the data.',
    docs: 'https://altair-viz.github.io/user_guide/marks/line.html',
    datasetId: 'us_employment',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.us_employment.url

alt.Chart(df).mark_line(
    strokeDash=[10, 50],
    stroke='black',
    strokeWidth=5,
    strokeOpacity=0.5,
    size=10
).encode(
    alt.X('month:T'),
    alt.Y('construction:Q')
)`
  },
  {
    id: 'nb1-stocks-predicate',
    title: 'Transform Calculate & Predicate Filtering',
    level: 'Intermediate',
    topic: 'Transforms',
    task: 'Plot a line chart of stocks (date:T vs price:Q, colored by symbol:N). Calculate year="year(datum.date)" and filter for symbols in ["GOOG", "MSFT"] where year > 2005.',
    hints: [
      'Chain .transform_calculate(year="year(datum.date)") on the chart.',
      'Chain .transform_filter(alt.FieldOneOfPredicate(field="symbol", oneOf=["GOOG", "MSFT"]) & ~(alt.datum.year <= 2005)).'
    ],
    concept: '`transform_calculate` derives a new field with a Vega expression; `transform_filter` keeps rows matching a predicate, and predicates combine with `&`, `|` and `~`.',
    docs: 'https://altair-viz.github.io/user_guide/transform/filter.html',
    datasetId: 'stocks',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.stocks.url

alt.Chart(df).mark_line().encode(
    x='date:T',
    y='price:Q',
    color='symbol:N'
).transform_calculate(
    year='year(datum.date)'
).transform_filter(
    alt.FieldOneOfPredicate(field='symbol', oneOf=['GOOG', 'MSFT'])
    & ~(alt.datum.year <= 2005)
)`
  },
  {
    id: 'nb1-jobs-scale',
    title: 'Percentage Axis & Custom Color Domain/Range',
    level: 'Intermediate',
    topic: 'Customisation & annotation',
    task: 'Filter jobs for job == "Welder". Plot year:O on X and perc:Q on Y with "%" axis format. Map sex:N to color with domain ["men", "women"], range ["green", "blue"], and legend title "Gender".',
    hints: [
      'Use alt.Y("perc:Q", axis=alt.Axis(format="%")) for percentage formatting.',
      'Use alt.Color("sex:N", scale=alt.Scale(domain=["men", "women"], range=["green", "blue"]), legend=alt.Legend(title="Gender")).',
      'Add .transform_filter(alt.datum.job == "Welder").'
    ],
    concept: 'A scale\'s `domain` lists data values and its `range` the colours they map to; `axis=alt.Axis(format=\'%\')` changes only how ticks are printed.',
    docs: 'https://altair-viz.github.io/user_guide/customization.html',
    datasetId: 'jobs',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.jobs.url

alt.Chart(source).mark_line().encode(
    alt.X('year:O'),
    alt.Y('perc:Q', axis=alt.Axis(format='%')),
    color=alt.Color(
        'sex:N',
        scale=alt.Scale(domain=['men', 'women'], range=['green', 'blue']),
        legend=alt.Legend(title='Gender')
    )
).transform_filter(
    alt.datum.job == 'Welder'
)`
  },
  {
    id: 'nb1-barley-grouped',
    title: 'Faceted Grouped Bar Chart (Barley)',
    level: 'Intermediate',
    topic: 'Repeat & facet',
    task: 'Using barley data, build a grouped bar chart with year:O on X, sum(yield):Q on Y, year:N on color, and faceted into columns by site:N.',
    hints: [
      'Use mark_bar() and encode x="year:O", y="sum(yield):Q".',
      'Add color="year:N" and column="site:N" inside .encode().'
    ],
    concept: 'Encoding `column` splits one chart into small multiples, one panel per category, sharing the same axes.',
    docs: 'https://altair-viz.github.io/user_guide/compound_charts.html',
    datasetId: 'barley',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.barley()

alt.Chart(source).mark_bar().encode(
    x='year:O',
    y='sum(yield):Q',
    color='year:N',
    column='site:N'
)`
  },
  {
    id: 'nb2-pie-labels',
    title: 'Superposed Pie Chart with Radial Labels',
    level: 'Intermediate',
    topic: 'Layering & views',
    task: 'Create a baseChart with theta=alt.Theta("value", stack=True) and descending order on "value". Superpose ch1 (mark_arc colored by fruit:N) and ch2 (mark_text(radius=100) with text="fruit:N").',
    hints: [
      'Define baseChart = alt.Chart(source).encode(theta=alt.Theta("value", stack=True), order=alt.Order("value", sort="descending")).',
      'Create ch1 = baseChart.mark_arc().encode(color="fruit:N") and ch2 = baseChart.mark_text(radius=100).encode(text="fruit:N").',
      'Combine with ch1 + ch2.'
    ],
    concept: 'Building charts from a shared base lets layers reuse the same theta and order, so the labels land on their slices.',
    docs: 'https://altair-viz.github.io/user_guide/marks/arc.html',
    datasetId: 'fruit_pie',
    solution: `import altair as alt
import pandas as pd

source = pd.DataFrame({
    'fruit': ['orange', 'pear', 'apple', 'lemon', 'plum'],
    'value': [4, 6, 10, 3, 7]
})

baseChart = alt.Chart(source).encode(
    theta=alt.Theta('value', stack=True),
    order=alt.Order('value', sort='descending')
)

ch1 = baseChart.mark_arc().encode(
    color='fruit:N'
)

ch2 = baseChart.mark_text(radius=100).encode(
    text='fruit:N'
)

ch1 + ch2`
  },
  {
    id: 'nb2-superposition-jobs',
    title: 'Superposed Jobs with Independent Palettes',
    level: 'Intermediate',
    topic: 'Layering & views',
    task: 'Create a base line chart (year:O vs perc:Q with "%" format). Layer ch1 (filtered for "Welder", color scheme "accent", legend title "Welder") and ch2 (filtered for "Weaver", scheme "category10", legend title "Weaver") with independent color scales.',
    hints: [
      'Create base = alt.Chart(source).mark_line().encode(alt.X("year:O"), alt.Y("perc:Q", axis=alt.Axis(format="%"))).',
      'Create ch1 and ch2 using base.transform_filter(...).encode(alt.Color("sex:N", scale=alt.Scale(scheme=...), legend=alt.Legend(title=...))).',
      'Combine with (ch1 + ch2).resolve_scale(color="independent").'
    ],
    concept: '`+` overlays charts; `resolve_scale(color=\'independent\')` gives each layer its own colour scale and legend.',
    docs: 'https://altair-viz.github.io/user_guide/compound_charts.html',
    datasetId: 'jobs',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.jobs.url

base = alt.Chart(source).mark_line().encode(
    alt.X('year:O'),
    alt.Y('perc:Q', axis=alt.Axis(format='%'))
)

ch1 = base.transform_filter(alt.datum.job == 'Welder').encode(
    alt.Color('sex:N', scale=alt.Scale(scheme='accent'), legend=alt.Legend(title='Welder'))
)

ch2 = base.transform_filter(alt.datum.job == 'Weaver').encode(
    alt.Color('sex:N', scale=alt.Scale(scheme='category10'), legend=alt.Legend(title='Weaver'))
)

(ch1 + ch2).resolve_scale(color='independent')`
  },
  {
    id: 'nb2-lollipop-eu',
    title: 'Sorted Lollipop Chart (Europe Population)',
    level: 'Intermediate',
    topic: 'Layering & views',
    task: 'Layer a thin bar chart (mark_bar(height=2)) and filled points (mark_point(size=50, filled=True, opacity=1.0)) showing population:Q on X, country:N on Y sorted by population (largest first), colored by EU_membership:N (domain ["Yes", "No"], range ["teal", "gray"]).',
    hints: [
      'Encode x=alt.X("population:Q", title="Population in Millions") and y=alt.Y("country:N", title="Country", sort=...).',
      'In a layered chart `sort="-x"` is silently dropped. Sort with alt.EncodingSortField("population", op="max", order="descending") instead.',
      'Use scale=alt.Scale(domain=["Yes", "No"], range=["teal", "gray"]) on alt.Color("EU_membership:N").',
      'Combine with (ch1 + ch2).properties(width=400, title="10 most populated countries in Europe in 2023").'
    ],
    concept: 'A lollipop is two layers on the same encodings: a thin bar for the stick and a point for the head. Layers share one Y axis, and Vega-Lite can only merge their sorts when they use `op` max, min or count, so `sort=\'-x\'` (a sum) is dropped.',
    docs: 'https://altair-viz.github.io/user_guide/compound_charts.html',
    datasetId: 'eu_lollipop',
    solution: `import altair as alt
import pandas as pd

data = pd.DataFrame({
    'country': ['France', 'Germany', 'UK', 'Italy', 'Spain', 'Poland', 'Ukraine', 'Romania', 'Netherlands', 'Russia'],
    'population': [65.27, 83.78, 67.88, 60.46, 46.75, 37.8, 43.73, 19.24, 17.13, 145.93],
    'EU_membership': ['Yes', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'No', 'Yes', 'Yes', 'No']
})

ch1 = alt.Chart(data).mark_bar(height=2).encode(
    x=alt.X('population:Q', title='Population in Millions'),
    y=alt.Y('country:N', title='Country', sort=alt.EncodingSortField('population', op='max', order='descending')),
    color=alt.Color('EU_membership:N', scale=alt.Scale(domain=['Yes', 'No'], range=['teal', 'gray']), legend=alt.Legend(title='EU member?'))
)

ch2 = alt.Chart(data).mark_point(size=50, filled=True, opacity=1.0).encode(
    x=alt.X('population:Q', title='Population in Millions'),
    y=alt.Y('country:N', title='Country', sort=alt.EncodingSortField('population', op='max', order='descending')),
    color=alt.Color('EU_membership:N', scale=alt.Scale(domain=['Yes', 'No'], range=['teal', 'gray']), legend=alt.Legend(title='EU member?'))
)

(ch1 + ch2).properties(width=400, title='10 most populated countries in Europe in 2023')`
  },
  {
    id: 'nb2-connected-dot',
    title: 'Connected Dot Plot (Smoking by Gender)',
    level: 'Advanced',
    topic: 'Layering & views',
    task: 'Create a 3-layer connected dot plot: ch3 is a gray line connecting each Country (detail="Country"), ch1 plots teal circles (size=50) filtered for Gender == "M", and ch2 plots lightsalmon circles filtered for Gender == "F". Sort the countries by their highest smoking rate, largest first, in all three layers.',
    hints: [
      'Create ch3 with mark_line(color="gray") and encode X("Smoking rate:Q"), Y("Country:N"), and detail="Country".',
      'Create ch1 (Gender == "M", color="teal") and ch2 (Gender == "F", color="lightsalmon") using mark_circle(opacity=1, size=50) and scale=alt.Scale(domain=(0, 0.6)).',
      'Sort Y in every layer with alt.EncodingSortField("Smoking rate", op="max", order="descending"); `sort="-x"` is dropped when layers are merged.',
      'Superpose as ch3 + ch1 + ch2.'
    ],
    concept: 'The `detail` channel groups rows without adding colour, so the line connects the two dots of each country. A sort only survives layering if every layer uses the same one, with `op` max, min or count.',
    docs: 'https://altair-viz.github.io/user_guide/encodings/channels.html',
    datasetId: 'smoking_rates',
    solution: `import altair as alt
import pandas as pd

data = {
    'Country': ['Lithuania', 'Cyprus', 'Romania', 'Sweden', 'Finland', 'Lithuania', 'Cyprus', 'Romania', 'Sweden', 'Finland'],
    'Smoking rate': [0.36, 0.52, 0.31, 0.07, 0.14, 0.13, 0.21, 0.08, 0.06, 0.11],
    'Gender': ['M', 'M', 'M', 'M', 'M', 'F', 'F', 'F', 'F', 'F']
}
df = pd.DataFrame(data)

ch1 = alt.Chart(df).mark_circle(opacity=1, size=50, color='teal').encode(
    alt.X('Smoking rate:Q', scale=alt.Scale(domain=(0, 0.6))),
    alt.Y('Country:N', sort=alt.EncodingSortField('Smoking rate', op='max', order='descending'))
).transform_filter(alt.datum.Gender == 'M').properties(title='Smoking population')

ch2 = alt.Chart(df).mark_circle(opacity=1, size=50, color='lightsalmon').encode(
    alt.X('Smoking rate:Q', scale=alt.Scale(domain=(0, 0.6))),
    alt.Y('Country:N', sort=alt.EncodingSortField('Smoking rate', op='max', order='descending'))
).transform_filter(alt.datum.Gender == 'F').properties(title='Smoking population')

ch3 = alt.Chart(df).mark_line(color='gray').encode(
    alt.X('Smoking rate:Q'),
    alt.Y('Country:N', sort=alt.EncodingSortField('Smoking rate', op='max', order='descending')),
    detail='Country'
).properties(title='Smoking population')

ch3 + ch1 + ch2`
  },
  {
    id: 'nb2-regression-cars',
    title: 'Linear & Polynomial Regression Layers',
    level: 'Advanced',
    topic: 'Layering & views',
    task: 'Create a circle scatterplot of Horsepower:Q vs Miles_per_Gallon:Q colored by Origin:N. Superpose a teal linear regression line and a crimson 2nd-order polynomial regression line.',
    hints: [
      'Create base ch = alt.Chart(cars).mark_circle().encode(alt.X("Horsepower:Q"), alt.Y("Miles_per_Gallon:Q")).',
      'Use ch.transform_regression("Horsepower", "Miles_per_Gallon").mark_line(color="teal") for linear.',
      'Use ch.transform_regression("Horsepower", "Miles_per_Gallon", method="poly", order=2).mark_line(color="crimson") for polynomial.'
    ],
    concept: '`transform_regression` replaces the data with a fitted curve; `method=\'poly\', order=2` fits a parabola instead of a line.',
    docs: 'https://altair-viz.github.io/user_guide/transform/regression.html',
    datasetId: 'cars',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

cars = data.cars.url

ch = alt.Chart(cars).mark_circle().encode(
    alt.X('Horsepower:Q', title='Horsepower'),
    alt.Y('Miles_per_Gallon:Q', title='Miles per Gallon')
)

linear_regression = ch.transform_regression(
    'Horsepower',
    'Miles_per_Gallon'
).mark_line(color='teal')

polygonal_regression = ch.transform_regression(
    'Horsepower',
    'Miles_per_Gallon',
    method='poly',
    order=2
).mark_line(color='crimson')

(ch.encode(alt.Color('Origin:N')) + linear_regression + polygonal_regression)`
  },
  {
    id: 'nb2-bump-tennis',
    title: 'Bump Chart with Window Ranking (Catalan Tennis)',
    level: 'Advanced',
    topic: 'Transforms',
    task: 'Use transform_window(rank="row_number()", groupby=["year"]) sorted by points descending and item ascending. Plot mark_line(point=True) with year:O on X, rank:Q (reversed domain [1, 5]) on Y, and item:N on Color.',
    hints: [
      'Use .transform_window(rank="row_number()", sort=[alt.SortField("points", order="descending"), alt.SortField("item", order="ascending")], groupby=["year"]).',
      'Encode alt.Y("rank:Q", scale=alt.Scale(domain=[1, 5], reverse=True, nice=False, zero=False)).',
      'Chain .configure_mark(strokeWidth=3).configure_point(size=60).'
    ],
    concept: '`transform_window` with `row_number()` ranks rows inside each group (here, each year) after sorting them.',
    docs: 'https://altair-viz.github.io/user_guide/transform/window.html',
    datasetId: 'catalan_tennis',
    solution: `import altair as alt
import pandas as pd

rows = [
    {"year": 2018, "item": "Maria", "points": 40}, {"year": 2018, "item": "Laura", "points": 58}, {"year": 2018, "item": "Anna", "points": 79}, {"year": 2018, "item": "Joana", "points": 84}, {"year": 2018, "item": "Montse", "points": 88},
    {"year": 2019, "item": "Maria", "points": 40}, {"year": 2019, "item": "Laura", "points": 84}, {"year": 2019, "item": "Anna", "points": 49}, {"year": 2019, "item": "Joana", "points": 86}, {"year": 2019, "item": "Montse", "points": 96},
    {"year": 2020, "item": "Maria", "points": 74}, {"year": 2020, "item": "Laura", "points": 88}, {"year": 2020, "item": "Anna", "points": 83}, {"year": 2020, "item": "Joana", "points": 45}, {"year": 2020, "item": "Montse", "points": 61},
    {"year": 2021, "item": "Maria", "points": 56}, {"year": 2021, "item": "Laura", "points": 81}, {"year": 2021, "item": "Anna", "points": 51}, {"year": 2021, "item": "Joana", "points": 82}, {"year": 2021, "item": "Montse", "points": 72},
    {"year": 2022, "item": "Maria", "points": 80}, {"year": 2022, "item": "Laura", "points": 76}, {"year": 2022, "item": "Anna", "points": 45}, {"year": 2022, "item": "Joana", "points": 68}, {"year": 2022, "item": "Montse", "points": 83},
    {"year": 2023, "item": "Maria", "points": 69}, {"year": 2023, "item": "Laura", "points": 89}, {"year": 2023, "item": "Anna", "points": 86}, {"year": 2023, "item": "Joana", "points": 82}, {"year": 2023, "item": "Montse", "points": 92},
    {"year": 2024, "item": "Maria", "points": 88}, {"year": 2024, "item": "Laura", "points": 71}, {"year": 2024, "item": "Anna", "points": 47}, {"year": 2024, "item": "Joana", "points": 68}, {"year": 2024, "item": "Montse", "points": 87}
]
df = pd.DataFrame(rows)

ranks = alt.Chart(df).transform_window(
    rank='row_number()',
    sort=[
        alt.SortField('points', order='descending'),
        alt.SortField('item', order='ascending')
    ],
    groupby=['year']
)

ranks.mark_line(point=True).encode(
    alt.X('year:O', title=None),
    alt.Y('rank:Q', scale=alt.Scale(domain=[1, 5], reverse=True, nice=False, zero=False), axis=alt.Axis(values=[1, 2, 3, 4, 5], title='Rank')),
    alt.Color('item:N', title='Players'),
    tooltip=['year:O', 'item:N', 'points:Q', 'rank:Q']
).properties(width=500, height=280, title='Best Catalan tennis players').configure_mark(strokeWidth=3).configure_point(size=60)`
  },
  {
    id: 'nb2-priestley-range',
    title: 'Priestley Range Chart (X & X2 with Text Offsets)',
    level: 'Advanced',
    topic: 'Layering & views',
    task: 'Build a Priestley range bar chart encoding min(Income):Q on X (domain 1000 to 2800), max(Income):Q on X2, and Month:N on Y & Color. Superpose min text labels (xOffset=-20) and max text labels (xOffset=20).',
    hints: [
      'In ch1, use mark_bar() with alt.X("min(Income):Q", scale=alt.Scale(domain=(1000, 2800))) and alt.X2("max(Income):Q").',
      'Create ch2Min with mark_text(xOffset=-20) encoding min(Income):Q on X and Text.',
      'Create ch2Max with mark_text(xOffset=20) encoding max(Income):Q on X and Text, then combine ch1 + ch2Min + ch2Max.'
    ],
    concept: '`x` and `x2` give a bar its start and end, so each bar spans from the minimum to the maximum income.',
    docs: 'https://altair-viz.github.io/user_guide/encodings/channels.html',
    datasetId: 'priestley_income',
    solution: `import altair as alt
import pandas as pd

data = [
    {"Month": "Jan", "Income": 1651, "Year": 2024, "Day": 1}, {"Month": "Jan", "Income": 2118, "Year": 2024, "Day": 1},
    {"Month": "Feb", "Income": 2036, "Year": 2024, "Day": 1}, {"Month": "Feb", "Income": 1562, "Year": 2024, "Day": 1},
    {"Month": "Mar", "Income": 1518, "Year": 2024, "Day": 1}, {"Month": "Mar", "Income": 2203, "Year": 2024, "Day": 1},
    {"Month": "Apr", "Income": 2012, "Year": 2024, "Day": 1}, {"Month": "Apr", "Income": 2054, "Year": 2024, "Day": 1},
    {"Month": "May", "Income": 2248, "Year": 2024, "Day": 1}, {"Month": "May", "Income": 1613, "Year": 2024, "Day": 1},
    {"Month": "Jun", "Income": 1900, "Year": 2024, "Day": 1}, {"Month": "Jun", "Income": 1768, "Year": 2024, "Day": 1},
    {"Month": "Jul", "Income": 2274, "Year": 2024, "Day": 1}, {"Month": "Jul", "Income": 2171, "Year": 2024, "Day": 1},
    {"Month": "Aug", "Income": 2392, "Year": 2024, "Day": 1}, {"Month": "Aug", "Income": 2343, "Year": 2024, "Day": 1},
    {"Month": "Sep", "Income": 1930, "Year": 2024, "Day": 1}, {"Month": "Sep", "Income": 2201, "Year": 2024, "Day": 1},
    {"Month": "Oct", "Income": 2375, "Year": 2024, "Day": 1}, {"Month": "Oct", "Income": 1623, "Year": 2024, "Day": 1},
    {"Month": "Nov", "Income": 2095, "Year": 2024, "Day": 1}, {"Month": "Nov", "Income": 2065, "Year": 2024, "Day": 1},
    {"Month": "Dec", "Income": 2197, "Year": 2024, "Day": 1}, {"Month": "Dec", "Income": 1561, "Year": 2024, "Day": 1}
]
df = pd.DataFrame(data)
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

ch1 = alt.Chart(df).mark_bar().encode(
    alt.X('min(Income):Q', title='Income', scale=alt.Scale(domain=(1000, 2800))),
    alt.X2('max(Income):Q'),
    alt.Y('Month:N', sort=months),
    alt.Color('Month:N', scale=alt.Scale(scheme='category20'))
).properties(title='Priestley chart')

ch2Min = alt.Chart(df).mark_text(xOffset=-20).encode(
    alt.X('min(Income):Q'),
    alt.Y('Month:N', sort=months),
    alt.Text('min(Income):Q')
)

ch2Max = alt.Chart(df).mark_text(xOffset=20).encode(
    alt.X('max(Income):Q'),
    alt.Y('Month:N', sort=months),
    alt.Text('max(Income):Q')
)

ch1 + ch2Min + ch2Max`
  },
  {
    id: 'nb2-us-airports-map',
    title: 'US Airports Geo Dot Map (albersUsa)',
    level: 'Advanced',
    topic: 'Maps',
    task: 'Layer a US states geoshape map (fill="lightgray", stroke="white", project="albersUsa") with an aggregated circle layer of airports grouped by state (mean(latitude), mean(longitude), count()).',
    hints: [
      'Create usChart = alt.Chart(map).mark_geoshape(fill="lightgray", stroke="white").properties(width=500, height=300).project("albersUsa").',
      'On airportsMap, use .transform_aggregate(latitude="mean(latitude)", longitude="mean(longitude)", count="count()", groupby=["state"]).',
      'Encode longitude:Q, latitude:Q, size=alt.Size("count:Q"), color=alt.value("steelblue"), and superpose usChart + airportsMap.'
    ],
    concept: '`mark_geoshape` draws map features from TopoJSON; a projection like `albersUsa` turns longitude/latitude into screen positions.',
    docs: 'https://altair-viz.github.io/user_guide/marks/geoshape.html',
    datasetId: 'airports_us',
    solution: `import altair as alt
from vega_datasets import data

map = alt.topo_feature(data.us_10m.url, feature='states')

usChart = alt.Chart(map).mark_geoshape(
    fill='lightgray',
    stroke='white'
).properties(
    width=500,
    height=300
).project('albersUsa')

airports = data.airports.url

airportsMap = alt.Chart(airports, title='Number of airports in US').transform_aggregate(
    latitude='mean(latitude)',
    longitude='mean(longitude)',
    count='count()',
    groupby=['state']
).mark_circle().encode(
    longitude='longitude:Q',
    latitude='latitude:Q',
    size=alt.Size('count:Q', title='Number of Airports'),
    color=alt.value('steelblue'),
    tooltip=['state:N', 'count:Q']
)

usChart + airportsMap`
  },
  {
    id: 'nb2-parallel-coords',
    title: 'Normalized Parallel Coordinates (Cars)',
    level: 'Advanced',
    topic: 'Transforms',
    task: 'Create a normalized parallel coordinates plot of cars across ["Weight_in_lbs", "Miles_per_Gallon", "Cylinders", "Displacement", "Horsepower", "Acceleration"] using transform_window, transform_fold, transform_joinaggregate, and transform_calculate.',
    hints: [
      'Chain .transform_window(index="count()") and .transform_fold(["Weight_in_lbs", "Miles_per_Gallon", "Cylinders", "Displacement", "Horsepower", "Acceleration"]).',
      'Use .transform_joinaggregate(min="min(value)", max="max(value)", groupby=["key"]) and .transform_calculate(minmax_value="(datum.value - datum.min) / (datum.max - datum.min)").',
      'Encode X("key:N"), Y("minmax_value:Q"), Color("Origin:N"), Detail("index:N"), Opacity(alt.value(0.25)).'
    ],
    concept: '`transform_fold` turns several columns into key/value rows, and `transform_joinaggregate` adds each key\'s min and max so values can be normalised to 0–1.',
    docs: 'https://altair-viz.github.io/user_guide/transform/fold.html',
    datasetId: 'cars',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

cars = data.cars.url

alt.Chart(cars).mark_line().transform_window(
    index='count()'
).transform_fold(
    ['Weight_in_lbs', 'Miles_per_Gallon', 'Cylinders', 'Displacement', 'Horsepower', 'Acceleration']
).transform_filter(
    'isValid(datum.value) && isFinite(datum.value)'
).transform_joinaggregate(
    min='min(value)',
    max='max(value)',
    groupby=['key']
).transform_calculate(
    minmax_value='(datum.value - datum.min) / (datum.max - datum.min)'
).encode(
    alt.X('key:N', title=None, axis=alt.Axis(labelAngle=-45)),
    alt.Y('minmax_value:Q', title='Value'),
    alt.Color('Origin:N'),
    alt.Detail('index:N'),
    opacity=alt.value(0.25)
).properties(width=500)`
  },
  {
    id: 'mv-heatmap-text',
    title: 'Heatmap with Count Labels',
    level: 'Intermediate',
    topic: 'Layering & views',
    task: 'Using the Seattle weather data, layer a heatmap and its labels. Both share a base: month(date):O on X and weather:N on Y. The heatmap is mark_rect() coloured by count():Q with the "blues" scheme; the labels are mark_text() showing count():Q. End with heat + labels.',
    hints: [
      'Build the shared part once: base = alt.Chart(df).encode(x="month(date):O", y="weather:N").',
      'heat = base.mark_rect().encode(color=alt.Color("count():Q", scale=alt.Scale(scheme="blues")))',
      'labels = base.mark_text().encode(text="count():Q"), then heat + labels.'
    ],
    concept: 'A base chart holds the encodings every layer shares; each layer adds its own mark and channels, so rect and text line up cell by cell.',
    docs: 'https://altair-viz.github.io/user_guide/compound_charts.html#layered-charts',
    datasetId: 'seattle_weather',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.seattle_weather.url

base = alt.Chart(df).encode(
    x='month(date):O',
    y='weather:N'
)

heat = base.mark_rect().encode(
    color=alt.Color('count():Q', scale=alt.Scale(scheme='blues'))
)

labels = base.mark_text().encode(
    text='count():Q'
)

heat + labels`
  },
  {
    id: 'mv-errorbar-barley',
    title: 'Mean Points with Error Bars (Barley)',
    level: 'Intermediate',
    topic: 'Layering & views',
    task: 'Using barley, show each variety:N on Y with two layers: mark_errorbar(extent="stdev") over yield:Q, and black filled points at mean(yield):Q. The X scale of the points must not start at zero. End with bars + points.',
    hints: [
      'bars = alt.Chart(source).mark_errorbar(extent="stdev").encode(x="yield:Q", y="variety:N")',
      'points = alt.Chart(source).mark_point(filled=True, color="black").encode(x=alt.X("mean(yield):Q", scale=alt.Scale(zero=False)), y="variety:N")',
      'Layer them with bars + points.'
    ],
    concept: 'mark_errorbar is a composite mark: it aggregates the raw field itself (here mean ± one standard deviation), so it takes yield:Q, not mean(yield).',
    docs: 'https://altair-viz.github.io/user_guide/marks/errorbar.html',
    datasetId: 'barley',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.barley()

bars = alt.Chart(source).mark_errorbar(extent='stdev').encode(
    x='yield:Q',
    y='variety:N'
)

points = alt.Chart(source).mark_point(filled=True, color='black').encode(
    x=alt.X('mean(yield):Q', scale=alt.Scale(zero=False)),
    y='variety:N'
)

bars + points`
  },
  {
    id: 'mv-dual-axis',
    title: 'Dual-Axis Bars and Line (Seattle)',
    level: 'Advanced',
    topic: 'Layering & views',
    task: 'With a base on month(date):O for X, layer light steel blue bars of sum(precipitation):Q and a crimson line with points of mean(temp_max):Q. Give the Y axes the titles "Precipitation (mm)" and "Max temperature (°C)" and make the two Y scales independent.',
    hints: [
      'base = alt.Chart(df).encode(x="month(date):O")',
      'bars = base.mark_bar(color="lightsteelblue").encode(y=alt.Y("sum(precipitation):Q", title="Precipitation (mm)")); the line uses mark_line(color="crimson", point=True).',
      'Layer and split the axes: (bars + line).resolve_scale(y="independent")'
    ],
    concept: 'Layers share scales by default; resolve_scale(y="independent") gives each layer its own Y scale and axis, which a dual-axis chart needs.',
    docs: 'https://altair-viz.github.io/user_guide/scale_resolve.html',
    datasetId: 'seattle_weather',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.seattle_weather.url

base = alt.Chart(df).encode(
    x='month(date):O'
)

bars = base.mark_bar(color='lightsteelblue').encode(
    y=alt.Y('sum(precipitation):Q', title='Precipitation (mm)')
)

line = base.mark_line(color='crimson', point=True).encode(
    y=alt.Y('mean(temp_max):Q', title='Max temperature (°C)')
)

(bars + line).resolve_scale(y='independent')`
  },
  {
    id: 'mv-area-normalize',
    title: 'Normalised Stacked Area (Iowa Electricity)',
    level: 'Intermediate',
    topic: 'Encoding options',
    task: 'Draw a stacked area chart of the Iowa data: year:T on X, net_generation:Q on Y stacked as "normalize" with a ".0%" axis format, and colour by source:N.',
    hints: [
      'Use alt.Chart(df).mark_area().',
      'Encode y=alt.Y("net_generation:Q", stack="normalize", axis=alt.Axis(format=".0%")).',
      'Add x="year:T" and color="source:N".'
    ],
    concept: 'stack="normalize" rescales each X position to sum to 1, turning absolute amounts into shares of the total.',
    docs: 'https://altair-viz.github.io/user_guide/marks/area.html',
    datasetId: 'iowa_electricity',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.iowa_electricity.url

alt.Chart(df).mark_area().encode(
    x='year:T',
    y=alt.Y('net_generation:Q', stack='normalize', axis=alt.Axis(format='.0%')),
    color='source:N'
)`
  },
  {
    id: 'mv-hconcat-weather',
    title: 'Side-by-Side Views (Weather Counts | Scatter)',
    level: 'Intermediate',
    topic: 'Layering & views',
    task: 'Put two charts side by side. Left: bars with weather:N on X and count():Q on Y, coloured by weather:N. Right: filled points (opacity 0.5) with temp_max:Q on X and precipitation:Q on Y, coloured by weather:N. Store them as bars and points and end with bars | points.',
    hints: [
      'bars = alt.Chart(df).mark_bar().encode(x="weather:N", y="count():Q", color="weather:N")',
      'points = alt.Chart(df).mark_point(filled=True, opacity=0.5).encode(x="temp_max:Q", y="precipitation:Q", color="weather:N")',
      'The | operator is alt.hconcat: bars | points.'
    ],
    concept: 'Juxtaposition (| for side by side, & for stacked) shows different views of the same data next to each other; a shared colour encoding links them.',
    docs: 'https://altair-viz.github.io/user_guide/compound_charts.html#horizontal-concatenation',
    datasetId: 'seattle_weather',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.seattle_weather.url

bars = alt.Chart(df).mark_bar().encode(
    x='weather:N',
    y='count():Q',
    color='weather:N'
)

points = alt.Chart(df).mark_point(filled=True, opacity=0.5).encode(
    x='temp_max:Q',
    y='precipitation:Q',
    color='weather:N'
)

bars | points`
  },
  {
    id: 'mv-boxplot-strip',
    title: 'Box Plot | Strip Plot (Cars MPG)',
    level: 'Intermediate',
    topic: 'Layering & views',
    task: 'Compare two views of the MPG distribution per origin, side by side. Left: mark_boxplot(extent="min-max"). Right: mark_tick(opacity=0.6). Both use Origin:N on X, Miles_per_Gallon:Q on Y and colour by Origin:N. End with box | strip.',
    hints: [
      'box = alt.Chart(cars).mark_boxplot(extent="min-max").encode(x="Origin:N", y="Miles_per_Gallon:Q", color="Origin:N")',
      'strip is the same encoding with .mark_tick(opacity=0.6).',
      'Combine with box | strip.'
    ],
    concept: 'A box plot summarises a distribution in five numbers; a strip plot shows every value. Putting them side by side shows what the summary hides.',
    docs: 'https://altair-viz.github.io/user_guide/marks/boxplot.html',
    datasetId: 'cars',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

cars = data.cars.url

box = alt.Chart(cars).mark_boxplot(extent='min-max').encode(
    x='Origin:N',
    y='Miles_per_Gallon:Q',
    color='Origin:N'
)

strip = alt.Chart(cars).mark_tick(opacity=0.6).encode(
    x='Origin:N',
    y='Miles_per_Gallon:Q',
    color='Origin:N'
)

box | strip`
  },
  {
    id: 'mv-vconcat-stocks',
    title: 'Stacked Overview: Lines over Ranked Bars',
    level: 'Advanced',
    topic: 'Layering & views',
    task: 'Stack two views of the stocks data vertically. Top: a line per symbol:N (colour) with date:T on X and price:Q on Y. Bottom: horizontal bars of mean(price):Q on X with symbol:N on Y sorted by descending X, coloured by symbol:N. End with lines & bars.',
    hints: [
      'lines = alt.Chart(df).mark_line().encode(x="date:T", y="price:Q", color="symbol:N")',
      'bars = alt.Chart(df).mark_bar().encode(x="mean(price):Q", y=alt.Y("symbol:N", sort="-x"), color="symbol:N")',
      'The & operator is alt.vconcat: lines & bars.'
    ],
    concept: 'Vertical concatenation stacks views that answer different questions (trend over time vs overall level) about the same entities.',
    docs: 'https://altair-viz.github.io/user_guide/compound_charts.html#vertical-concatenation',
    datasetId: 'stocks',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.stocks.url

lines = alt.Chart(df).mark_line().encode(
    x='date:T',
    y='price:Q',
    color='symbol:N'
)

bars = alt.Chart(df).mark_bar().encode(
    x='mean(price):Q',
    y=alt.Y('symbol:N', sort='-x'),
    color='symbol:N'
)

lines & bars`
  },
  {
    id: 'exam-cars-condition',
    title: 'Conditional Colour and Shapes (exam, Nov 2022)',
    level: 'Intermediate',
    topic: 'Exam-style',
    task: 'Plot cars newer than 1975 (filter "year(datum.Year) > 1975") as filled points with a black stroke and size 200: Horsepower:Q on X, Miles_per_Gallon:Q on Y, shape by Origin:N. Cars with 4 cylinders are red and the rest blue, with a condition (so the colour has no legend).',
    hints: [
      'mark_point(filled=True, stroke="black", size=200)',
      'color=alt.when(alt.datum.Cylinders == 4).then(alt.value("red")).otherwise(alt.value("blue")) and shape="Origin:N". The older alt.condition(test, a, b) gives the same chart.',
      'Filter with .transform_filter("year(datum.Year) > 1975").'
    ],
    concept: '`alt.when(test).then(a).otherwise(b)` picks one of two values per row (older code writes `alt.condition(test, a, b)`); with constant values (alt.value) it adds no legend, unlike a field encoding.',
    docs: 'https://altair-viz.github.io/user_guide/interactions/parameters.html#conditions',
    datasetId: 'cars',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

cars = data.cars.url

alt.Chart(cars).mark_point(filled=True, stroke='black', size=200).encode(
    x='Horsepower:Q',
    y='Miles_per_Gallon:Q',
    shape='Origin:N',
    color=alt.when(alt.datum.Cylinders == 4).then(alt.value('red')).otherwise(alt.value('blue'))
).transform_filter(
    'year(datum.Year) > 1975'
)`
  },
  {
    id: 'exam-slope-parliament',
    title: 'Slope Chart with Labels and Squares (exam, Nov 2024)',
    level: 'Advanced',
    topic: 'Exam-style',
    task: 'Build a slope chart of seats per party with three layers sharing Year:O on X and Seats:Q on Y. lines: mark_line coloured by Party:N. labels: gray mark_text(xOffset=15) showing Seats:Q, only for 2023. squares: filled square points (opacity 1) coloured yellow when Governing, else by Party:N, and sized 60 when Governing, else 30. End with (lines + labels + squares).properties(width=300).',
    hints: [
      'labels = alt.Chart(data).mark_text(color="gray", xOffset=15).encode(x="Year:O", y="Seats:Q", text="Seats:Q").transform_filter(alt.datum.Year == 2023)',
      'squares use mark_point(shape="square", filled=True, opacity=1) and color=alt.when(alt.datum.Governing).then(alt.value("yellow")).otherwise("Party:N") (alt.condition also works).',
      'size=alt.when(alt.datum.Governing).then(alt.value(60)).otherwise(alt.value(30)); then (lines + labels + squares).properties(width=300).'
    ],
    concept: 'Exam charts are usually layers of simple marks: each layer adds one element (lines, labels, end markers), and filters or conditions decide which rows a layer draws and how.',
    docs: 'https://altair-viz.github.io/user_guide/compound_charts.html#layered-charts',
    datasetId: 'parliament_seats',
    solution: `import altair as alt
import pandas as pd

data = pd.DataFrame({
    'Party': ['Liberals', 'Democrats', 'Conservatives', 'Activists', 'Extreme', 'Liberals', 'Democrats', 'Conservatives', 'Activists', 'Extreme'],
    'Seats': [81, 92, 61, 10, 21, 89, 70, 75, 21, 10],
    'Year': [2018, 2018, 2018, 2018, 2018, 2023, 2023, 2023, 2023, 2023],
    'Governing': [True, False, True, False, False, False, True, False, True, False]
})

lines = alt.Chart(data).mark_line().encode(
    x='Year:O',
    y='Seats:Q',
    color='Party:N'
)

labels = alt.Chart(data).mark_text(color='gray', xOffset=15).encode(
    x='Year:O',
    y='Seats:Q',
    text='Seats:Q'
).transform_filter(
    alt.datum.Year == 2023
)

squares = alt.Chart(data).mark_point(shape='square', filled=True, opacity=1).encode(
    x='Year:O',
    y='Seats:Q',
    color=alt.when(alt.datum.Governing).then(alt.value('yellow')).otherwise('Party:N'),
    size=alt.when(alt.datum.Governing).then(alt.value(60)).otherwise(alt.value(30))
)

(lines + labels + squares).properties(width=300)`
  },
  {
    id: 'exam-disasters-timeline',
    title: 'Disaster Timelines: Circles on Lines (exam, Nov 2021)',
    level: 'Advanced',
    topic: 'Exam-style',
    task: 'Draw one horizontal timeline per disaster type: Entity:N on Y, Year:O on X, both coloured by Entity:N. Layer circles (opacity 1) sized by Deaths:Q over plain lines. Keep only years after 1990 and drop the "All natural disasters" rows, with one filter on the layered chart.',
    hints: [
      'points = alt.Chart(source).mark_circle(opacity=1).encode(y="Entity:N", x="Year:O", size="Deaths:Q", color="Entity:N")',
      'lines = alt.Chart(source).mark_line().encode(y="Entity:N", x="Year:O", color="Entity:N")',
      "(points + lines).transform_filter((alt.datum.Year > 1990) & (alt.datum.Entity != 'All natural disasters'))"
    ],
    concept: 'A transform on a layered chart applies to every layer; predicates combine with & (and), | (or) and ~ (not), each side in brackets.',
    docs: 'https://altair-viz.github.io/user_guide/transform/filter.html',
    datasetId: 'disasters',
    solution: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.disasters.url

points = alt.Chart(source).mark_circle(opacity=1).encode(
    y='Entity:N',
    x='Year:O',
    size='Deaths:Q',
    color='Entity:N'
)

lines = alt.Chart(source).mark_line().encode(
    y='Entity:N',
    x='Year:O',
    color='Entity:N'
)

(points + lines).transform_filter(
    (alt.datum.Year > 1990) & (alt.datum.Entity != 'All natural disasters')
)`
  },
  {
    id: 'exam-bullet-hospital',
    title: 'Six-Layer Bullet Chart (exam, Jan 2024)',
    level: 'Advanced',
    topic: 'Exam-style',
    task: 'Build a bullet chart per month from a base with month:N on Y (sorted January, February, March, no title). Layer, in order: red, yellow and green bars (opacity 0.5, size 24) at level3, level2 and level1, where only the red layer sets X to alt.X("level3:Q", title=None, scale=alt.Scale(domain=[0, 160])); a black bar (size 4) at value; a yellow-filled point (filled, stroke black, size 70) at value; and a purple tick (thickness 2, size 30) at historic. Combine with alt.layer.',
    hints: [
      "base = alt.Chart(df).encode(y=alt.Y('month:N', sort=['January', 'February', 'March'], title=None))",
      "ch3 = base.mark_bar(color='red', opacity=0.5, size=24).encode(x=alt.X('level3:Q', title=None, scale=alt.Scale(domain=[0, 160]))); ch2 and ch1 are the same with x='level2:Q' / 'level1:Q'.",
      "ch4 = base.mark_bar(color='black', size=4).encode(x='value:Q'); ch5 = base.mark_point(filled=True, fill='yellow', stroke='black', size=70).encode(x='value:Q'); ch6 = base.mark_tick(color='purple', thickness=2, size=30).encode(x='historic:Q')",
      'alt.layer(ch3, ch2, ch1, ch4, ch5, ch6): later layers draw on top.'
    ],
    concept: 'A bullet chart is built from overlapping bars of different widths: wide translucent bands for the ranges, a thin bar for the measure, and markers for targets.',
    docs: 'https://altair-viz.github.io/user_guide/compound_charts.html#layered-charts',
    datasetId: 'hospital_occupancy',
    solution: `import altair as alt
import pandas as pd

df = pd.DataFrame({
    'month': ['January', 'February', 'March'],
    'level1': [75, 75, 75],
    'level2': [100, 100, 100],
    'level3': [150, 150, 150],
    'value': [115, 120, 80],
    'historic': [60, 95, 65]
})

base = alt.Chart(df).encode(
    y=alt.Y('month:N', sort=['January', 'February', 'March'], title=None)
)

ch3 = base.mark_bar(color='red', opacity=0.5, size=24).encode(
    x=alt.X('level3:Q', title=None, scale=alt.Scale(domain=[0, 160]))
)
ch2 = base.mark_bar(color='yellow', opacity=0.5, size=24).encode(x='level2:Q')
ch1 = base.mark_bar(color='green', opacity=0.5, size=24).encode(x='level1:Q')
ch4 = base.mark_bar(color='black', size=4).encode(x='value:Q')
ch5 = base.mark_point(filled=True, fill='yellow', stroke='black', size=70).encode(x='value:Q')
ch6 = base.mark_tick(color='purple', thickness=2, size=30).encode(x='historic:Q')

alt.layer(ch3, ch2, ch1, ch4, ch5, ch6)`
  }
];

// The main list: two to four representative exercises per topic. The rest are extras,
// shown when a topic is expanded in the rail.
export const CORE = [
  'bk-wide-fold', 'bk-types-explicit',
  'nb1-bar-color', 'nb1-iphone-tooltip', 'bk-donut-order', 'bk-detail-iowa',
  'bk-hist-stacked', 'bk-timeunit-stocks', 'mv-area-normalize',
  'mv-heatmap-text', 'nb2-superposition-jobs', 'nb2-lollipop-eu', 'mv-hconcat-weather',
  'bk-streamgraph', 'bk-connected-scatter', 'bk-punchcard',
  'nb1-stocks-predicate', 'bk-transform-aggregate', 'nb2-bump-tennis', 'bk-lookup-regions',
  'nb1-jobs-scale', 'bk-axis-style', 'bk-annotate-minmax',
  'bk-point-highlight', 'bk-slider-filter', 'bk-legend-selector', 'bk-brush-histogram',
  'nb1-barley-grouped', 'bk-repeat-matrix', 'bk-marginal-hist',
  'nb2-us-airports-map', 'bk-choropleth',
  'exam-cars-condition', 'exam-slope-parliament', 'exam-disasters-timeline', 'exam-bullet-hospital'
];

// Ordered by topic, core exercises first within each. `n` is the position in this list;
// `label` numbers each exercise inside its topic ("3.2"), so extras follow the core ones.
const ALL = [...COURSE_EXERCISES, ...BOOK_EXERCISES];
export const EXERCISES = TOPICS.flatMap((t, ti) => {
  const inTopic = ALL.filter((e) => e.topic === t);
  return [...inTopic.filter((e) => CORE.includes(e.id)), ...inTopic.filter((e) => !CORE.includes(e.id))]
    .map((e, k) => ({ ...e, core: CORE.includes(e.id), label: `${ti + 1}.${k + 1}` }));
}).map((e, i) => ({ ...e, n: i + 1 }));
