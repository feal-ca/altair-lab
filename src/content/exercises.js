// The 16 curated exercises. `solution` runs under Pyodide + Altair 6.3 and is used to build target specs.
// Plain ESM: importable from Node and from Vite.

export const TOPICS = ['Basics', 'Transforms & scales', 'Layering', 'Advanced'];

export const EXERCISES = [
  {
    id: 'nb1-bar-color',
    n: 1,
    title: 'Colored Category Bar Chart',
    level: 'Beginner',
    topic: 'Basics',
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
    n: 2,
    title: 'Filled Square Scatterplot with Tooltip',
    level: 'Beginner',
    topic: 'Basics',
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
    n: 3,
    title: 'Multi-Channel Opacity Encoding',
    level: 'Beginner',
    topic: 'Basics',
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
    n: 4,
    title: 'Custom Dashed Line Properties',
    level: 'Beginner',
    topic: 'Basics',
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
    n: 5,
    title: 'Transform Calculate & Predicate Filtering',
    level: 'Intermediate',
    topic: 'Transforms & scales',
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
    n: 6,
    title: 'Percentage Axis & Custom Color Domain/Range',
    level: 'Intermediate',
    topic: 'Transforms & scales',
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
    n: 7,
    title: 'Faceted Grouped Bar Chart (Barley)',
    level: 'Intermediate',
    topic: 'Transforms & scales',
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
    n: 8,
    title: 'Superposed Pie Chart with Radial Labels',
    level: 'Intermediate',
    topic: 'Layering',
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
    n: 9,
    title: 'Superposed Jobs with Independent Palettes',
    level: 'Intermediate',
    topic: 'Layering',
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
    n: 10,
    title: 'Sorted Lollipop Chart (Europe Population)',
    level: 'Intermediate',
    topic: 'Layering',
    task: 'Layer a thin bar chart (mark_bar(height=2)) and filled points (mark_point(size=50, filled=True, opacity=1.0)) showing population:Q on X, country:N sorted by "-x" on Y, colored by EU_membership:N (domain ["Yes", "No"], range ["teal", "gray"]).',
    hints: [
      'Encode x=alt.X("population:Q", title="Population in Millions") and y=alt.Y("country:N", title="Country", sort="-x").',
      'Use scale=alt.Scale(domain=["Yes", "No"], range=["teal", "gray"]) on alt.Color("EU_membership:N").',
      'Combine with (ch1 + ch2).properties(width=400, title="10 most populated countries in Europe in 2023").'
    ],
    concept: 'A lollipop is two layers on the same encodings: a thin bar for the stick and a point for the head. `sort=\'-x\'` orders categories by the x value, descending.',
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
    y=alt.Y('country:N', title='Country', sort='-x'),
    color=alt.Color('EU_membership:N', scale=alt.Scale(domain=['Yes', 'No'], range=['teal', 'gray']), legend=alt.Legend(title='EU member?'))
)

ch2 = alt.Chart(data).mark_point(size=50, filled=True, opacity=1.0).encode(
    x=alt.X('population:Q', title='Population in Millions'),
    y=alt.Y('country:N', title='Country', sort='-x'),
    color=alt.Color('EU_membership:N', scale=alt.Scale(domain=['Yes', 'No'], range=['teal', 'gray']), legend=alt.Legend(title='EU member?'))
)

(ch1 + ch2).properties(width=400, title='10 most populated countries in Europe in 2023')`
  },
  {
    id: 'nb2-connected-dot',
    n: 11,
    title: 'Connected Dot Plot (Smoking by Gender)',
    level: 'Advanced',
    topic: 'Layering',
    task: 'Create a 3-layer connected dot plot: ch3 is a gray line connecting each Country (detail="Country"), ch1 plots teal circles (size=50) filtered for Gender == "M", and ch2 plots lightsalmon circles filtered for Gender == "F" sorted by "-x".',
    hints: [
      'Create ch3 with mark_line(color="gray") and encode X("Smoking rate:Q"), Y("Country:N"), and detail="Country".',
      'Create ch1 (Gender == "M", color="teal") and ch2 (Gender == "F", color="lightsalmon") using mark_circle(opacity=1, size=50) and scale=alt.Scale(domain=(0, 0.6)).',
      'Superpose as ch3 + ch1 + ch2.'
    ],
    concept: 'The `detail` channel groups rows without adding colour, so the line connects the two dots of each country.',
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
    alt.Y('Country:N', sort='-x')
).transform_filter(alt.datum.Gender == 'M').properties(title='Smoking population')

ch2 = alt.Chart(df).mark_circle(opacity=1, size=50, color='lightsalmon').encode(
    alt.X('Smoking rate:Q', scale=alt.Scale(domain=(0, 0.6))),
    alt.Y('Country:N', sort='-x')
).transform_filter(alt.datum.Gender == 'F').properties(title='Smoking population')

ch3 = alt.Chart(df).mark_line(color='gray').encode(
    alt.X('Smoking rate:Q'),
    alt.Y('Country:N'),
    detail='Country'
).properties(title='Smoking population')

ch3 + ch1 + ch2`
  },
  {
    id: 'nb2-regression-cars',
    n: 12,
    title: 'Linear & Polynomial Regression Layers',
    level: 'Advanced',
    topic: 'Layering',
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
    n: 13,
    title: 'Bump Chart with Window Ranking (Catalan Tennis)',
    level: 'Advanced',
    topic: 'Advanced',
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
    n: 14,
    title: 'Priestley Range Chart (X & X2 with Text Offsets)',
    level: 'Advanced',
    topic: 'Layering',
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
    n: 15,
    title: 'US Airports Geo Dot Map (albersUsa)',
    level: 'Advanced',
    topic: 'Advanced',
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
    n: 16,
    title: 'Normalized Parallel Coordinates (Cars)',
    level: 'Advanced',
    topic: 'Advanced',
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
  }
];
