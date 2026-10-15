// Datasets available in the lab. Plain ESM: importable from Node and from Vite.
// `columns` is the metadata the exercise generator builds on:
//   N nominal, O ordinal, Q quantitative, T temporal.
// Inline datasets carry every row; URL datasets carry only a 5-row `preview`.

export const DATASETS = {
  country_pop: {
    id: 'country_pop',
    name: 'EU Country Population (Country_data)',
    description: '10 European countries with population in millions from Part 1.',
    varName: 'Country_data',
    source: 'inline',
    setupCode: `import altair as alt
import pandas as pd

Country_data = pd.DataFrame({
    'Country': ['Germany', 'France', 'Italy', 'Spain', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Czech Republic', 'Greece'],
    'Population (Millions)': [83.155, 67.657, 59.236, 47.399, 37.840, 19.202, 17.475, 11.555, 10.702, 10.679]
})
`,
    columns: [
      { name: 'Country', type: 'N', unique: 10, sample: 'Germany, France, Italy' },
      { name: 'Population (Millions)', type: 'Q', min: 10.68, max: 83.16, mean: 36.49 }
    ],
    rows: [
      { Country: 'Germany', 'Population (Millions)': 83.155 },
      { Country: 'France', 'Population (Millions)': 67.657 },
      { Country: 'Italy', 'Population (Millions)': 59.236 },
      { Country: 'Spain', 'Population (Millions)': 47.399 },
      { Country: 'Poland', 'Population (Millions)': 37.84 },
      { Country: 'Romania', 'Population (Millions)': 19.202 },
      { Country: 'Netherlands', 'Population (Millions)': 17.475 },
      { Country: 'Belgium', 'Population (Millions)': 11.555 },
      { Country: 'Czech Republic', 'Population (Millions)': 10.702 },
      { Country: 'Greece', 'Population (Millions)': 10.679 }
    ]
  },
  iphone_data: {
    id: 'iphone_data',
    name: 'Apple Smartphones 2007-2020 (iPhone_data)',
    description: 'iPhone model release years and launch prices in USD.',
    varName: 'df',
    source: 'inline',
    setupCode: `import altair as alt
import pandas as pd

iPhone_data = {
    'name': ['iPhone', 'iPhone 3G', 'iPhone 3GS', 'iPhone 4', 'iPhone 4S', 'iPhone 5', 'iPhone 5S', 'iPhone 6', 'iPhone 6S', 'iPhone 7', 'iPhone X', 'iPhone XS', 'iPhone 11 Pro', 'iPhone 12 Pro'],
    'year': ['2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'],
    'price': [499, 599, 699, 599, 649, 649, 649, 649, 699, 649, 999, 999, 1099, 1099]
}
df = pd.DataFrame(iPhone_data)
`,
    columns: [
      { name: 'name', type: 'N', unique: 14, sample: 'iPhone, iPhone 3G, iPhone X' },
      { name: 'year', type: 'O', unique: 14, sample: '2007 .. 2020' },
      { name: 'price', type: 'Q', min: 499, max: 1099, mean: 731.1 }
    ],
    rows: [
      { name: 'iPhone', year: '2007', price: 499 },
      { name: 'iPhone 3G', year: '2008', price: 599 },
      { name: 'iPhone 3GS', year: '2009', price: 699 },
      { name: 'iPhone 4', year: '2010', price: 599 },
      { name: 'iPhone 4S', year: '2011', price: 649 },
      { name: 'iPhone 5', year: '2012', price: 649 },
      { name: 'iPhone 5S', year: '2013', price: 649 },
      { name: 'iPhone 6', year: '2014', price: 649 },
      { name: 'iPhone 6S', year: '2015', price: 699 },
      { name: 'iPhone 7', year: '2016', price: 649 },
      { name: 'iPhone X', year: '2017', price: 999 },
      { name: 'iPhone XS', year: '2018', price: 999 },
      { name: 'iPhone 11 Pro', year: '2019', price: 1099 },
      { name: 'iPhone 12 Pro', year: '2020', price: 1099 }
    ]
  },
  cars: {
    id: 'cars',
    name: 'Vega Cars (data.cars)',
    description: '406 automobiles with MPG, Cylinders, Displacement, Horsepower, Weight, Acceleration, Year, Origin.',
    varName: 'cars',
    source: 'url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/cars.json',
    setupCode: `import altair as alt
import pandas as pd
from vega_datasets import data

cars = data.cars.url
`,
    columns: [
      { name: 'Name', type: 'N', unique: 311, sample: 'chevrolet chevelle, vw pickup' },
      { name: 'Miles_per_Gallon', type: 'Q', min: 9, max: 46.6, mean: 23.5 },
      { name: 'Cylinders', type: 'O', unique: 5, sample: '3, 4, 5, 6, 8' },
      { name: 'Displacement', type: 'Q', min: 68, max: 455, mean: 194.8 },
      { name: 'Horsepower', type: 'Q', min: 46, max: 230, mean: 105.1 },
      { name: 'Weight_in_lbs', type: 'Q', min: 1613, max: 5140, mean: 2979 },
      { name: 'Acceleration', type: 'Q', min: 8, max: 24.8, mean: 15.5 },
      { name: 'Year', type: 'T', unique: 13, sample: '1970-01-01 .. 1982-01-01' },
      { name: 'Origin', type: 'N', unique: 3, sample: 'USA, Europe, Japan' }
    ],
    preview: [
      { Name: 'chevrolet chevelle malibu', Miles_per_Gallon: 18, Cylinders: 8, Displacement: 307, Horsepower: 130, Weight_in_lbs: 3504, Acceleration: 12, Year: '1970-01-01', Origin: 'USA' },
      { Name: 'buick skylark 320', Miles_per_Gallon: 15, Cylinders: 8, Displacement: 350, Horsepower: 165, Weight_in_lbs: 3693, Acceleration: 11.5, Year: '1970-01-01', Origin: 'USA' },
      { Name: 'plymouth satellite', Miles_per_Gallon: 18, Cylinders: 8, Displacement: 318, Horsepower: 150, Weight_in_lbs: 3436, Acceleration: 11, Year: '1970-01-01', Origin: 'USA' },
      { Name: 'toyota corona mark ii', Miles_per_Gallon: 24, Cylinders: 4, Displacement: 113, Horsepower: 95, Weight_in_lbs: 2372, Acceleration: 15, Year: '1970-01-01', Origin: 'Japan' },
      { Name: 'vw pickup', Miles_per_Gallon: 44, Cylinders: 4, Displacement: 97, Horsepower: 52, Weight_in_lbs: 2130, Acceleration: 24.6, Year: '1982-01-01', Origin: 'Europe' }
    ]
  },
  stocks: {
    id: 'stocks',
    name: 'Tech Stocks (data.stocks)',
    description: 'Monthly stock prices for AAPL, AMZN, GOOG, IBM, and MSFT (2000-2010).',
    varName: 'df',
    source: 'url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/stocks.csv',
    setupCode: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.stocks.url
`,
    columns: [
      { name: 'symbol', type: 'N', unique: 5, sample: 'MSFT, AMZN, IBM, GOOG, AAPL' },
      { name: 'date', type: 'T', unique: 123, sample: '2000-01-01 .. 2010-03-01' },
      { name: 'price', type: 'Q', min: 5.97, max: 707, mean: 100.7 }
    ],
    preview: [
      { symbol: 'MSFT', date: '2000-01-01', price: 39.81 },
      { symbol: 'AMZN', date: '2000-01-01', price: 64.56 },
      { symbol: 'IBM', date: '2000-01-01', price: 100.52 },
      { symbol: 'GOOG', date: '2005-01-01', price: 195.62 },
      { symbol: 'AAPL', date: '2007-10-01', price: 189.95 }
    ]
  },
  jobs: {
    id: 'jobs',
    name: 'US Census Jobs 1850-2000 (data.jobs)',
    description: '255 job categories by sex (men/women), census decade year, count, and percentage.',
    varName: 'source',
    source: 'url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/jobs.json',
    setupCode: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.jobs.url
`,
    columns: [
      { name: 'job', type: 'N', unique: 255, sample: 'Welder, Weaver, Actor, Machinist' },
      { name: 'sex', type: 'N', unique: 2, sample: 'men, women' },
      { name: 'year', type: 'O', unique: 15, sample: '1850, 1900, 1950, 2000' },
      { name: 'count', type: 'Q', min: 0, max: 3500000, mean: 45200 },
      { name: 'perc', type: 'Q', min: 0, max: 0.15, mean: 0.002 }
    ],
    preview: [
      { job: 'Welder', sex: 'men', year: 1950, count: 275410, perc: 0.0046 },
      { job: 'Welder', sex: 'women', year: 1950, count: 11200, perc: 0.00018 },
      { job: 'Weaver', sex: 'men', year: 1900, count: 84200, perc: 0.0029 },
      { job: 'Weaver', sex: 'women', year: 1900, count: 79800, perc: 0.0027 },
      { job: 'Actor', sex: 'men', year: 2000, count: 14500, perc: 0.00011 }
    ]
  },
  us_employment: {
    id: 'us_employment',
    name: 'US Employment (data.us_employment)',
    description: 'Monthly US employment figures across sectors (construction, government, manufacturing).',
    varName: 'df',
    source: 'url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/us-employment.csv',
    setupCode: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.us_employment.url
`,
    columns: [
      { name: 'month', type: 'T', unique: 120, sample: '2006-01-01 .. 2015-12-01' },
      { name: 'construction', type: 'Q', min: 5400, max: 7726, mean: 6410 },
      { name: 'government', type: 'Q', min: 21800, max: 22600, mean: 22100 },
      { name: 'manufacturing', type: 'Q', min: 11450, max: 14200, mean: 12400 }
    ],
    preview: [
      { month: '2006-01-01', construction: 7601, government: 21894, manufacturing: 14217 },
      { month: '2008-01-01', construction: 7474, government: 22382, manufacturing: 13731 },
      { month: '2010-01-01', construction: 5632, government: 22481, manufacturing: 11462 }
    ]
  },
  barley: {
    id: 'barley',
    name: 'Minnesota Barley Yield (data.barley)',
    description: 'Crop yields across 6 sites and 10 varieties in 1931 and 1932.',
    varName: 'source',
    source: 'url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/barley.json',
    setupCode: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.barley()
`,
    columns: [
      { name: 'yield', type: 'Q', min: 14.4, max: 65.8, mean: 34.4 },
      { name: 'variety', type: 'N', unique: 10, sample: 'Manchuria, Glabron, Velvet' },
      { name: 'year', type: 'O', unique: 2, sample: '1931, 1932' },
      { name: 'site', type: 'N', unique: 6, sample: 'University Farm, Waseca, Morris' }
    ],
    preview: [
      { yield: 27, variety: 'Manchuria', year: 1931, site: 'University Farm' },
      { yield: 48.87, variety: 'Manchuria', year: 1931, site: 'Waseca' },
      { yield: 27.43, variety: 'Manchuria', year: 1931, site: 'Morris' },
      { yield: 39.93, variety: 'Manchuria', year: 1931, site: 'Crookston' },
      { yield: 32.97, variety: 'Manchuria', year: 1931, site: 'Grand Rapids' }
    ]
  },
  fruit_pie: {
    id: 'fruit_pie',
    name: 'Fruit Proportions (Pie & Radial Labels)',
    description: 'Fruit quantities for sorted pie charts and superposed radial text labels.',
    varName: 'source',
    source: 'inline',
    setupCode: `import altair as alt
import pandas as pd

source = pd.DataFrame({
    'fruit': ['orange', 'pear', 'apple', 'lemon', 'plum'],
    'value': [4, 6, 10, 3, 7]
})
`,
    columns: [
      { name: 'fruit', type: 'N', unique: 5, sample: 'orange, pear, apple, lemon, plum' },
      { name: 'value', type: 'Q', min: 3, max: 10, mean: 6 }
    ],
    rows: [
      { fruit: 'orange', value: 4 },
      { fruit: 'pear', value: 6 },
      { fruit: 'apple', value: 10 },
      { fruit: 'lemon', value: 3 },
      { fruit: 'plum', value: 7 }
    ]
  },
  phyllum_bullet: {
    id: 'phyllum_bullet',
    name: 'Phyllum Programs A/B/C (Bullet Chart)',
    description: 'Phyllum values across Programs A, B, and C for multi-layer bullet charts.',
    varName: 'df',
    source: 'inline',
    setupCode: `import altair as alt
import pandas as pd

data = {
    'Phyllum': ['Arthropoda', 'Chordata', 'Mollusca', 'Arthropoda', 'Chordata', 'Mollusca', 'Arthropoda', 'Chordata', 'Mollusca', 'Arthropoda', 'Chordata', 'Mollusca', 'Arthropoda', 'Chordata', 'Mollusca', 'Arthropoda', 'Chordata', 'Mollusca'],
    'Program': ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C', 'A', 'B'],
    'Value': [0.23, 0.45, 0.12, 0.67, 0.34, 0.56, 0.78, 0.89, 0.90, 0.12, 0.23, 0.34, 0.45, 0.56, 0.67, 0.78, 0.89, 0.90]
}
df = pd.DataFrame(data)
`,
    columns: [
      { name: 'Phyllum', type: 'N', unique: 3, sample: 'Arthropoda, Chordata, Mollusca' },
      { name: 'Program', type: 'N', unique: 3, sample: 'A, B, C' },
      { name: 'Value', type: 'Q', min: 0.12, max: 0.9, mean: 0.52 }
    ],
    rows: [
      { Phyllum: 'Arthropoda', Program: 'A', Value: 0.23 },
      { Phyllum: 'Chordata', Program: 'B', Value: 0.45 },
      { Phyllum: 'Mollusca', Program: 'C', Value: 0.12 },
      { Phyllum: 'Arthropoda', Program: 'A', Value: 0.67 },
      { Phyllum: 'Chordata', Program: 'B', Value: 0.34 },
      { Phyllum: 'Mollusca', Program: 'C', Value: 0.56 },
      { Phyllum: 'Arthropoda', Program: 'A', Value: 0.78 },
      { Phyllum: 'Chordata', Program: 'A', Value: 0.89 },
      { Phyllum: 'Mollusca', Program: 'B', Value: 0.9 },
      { Phyllum: 'Arthropoda', Program: 'C', Value: 0.12 },
      { Phyllum: 'Chordata', Program: 'A', Value: 0.23 },
      { Phyllum: 'Mollusca', Program: 'B', Value: 0.34 },
      { Phyllum: 'Arthropoda', Program: 'C', Value: 0.45 },
      { Phyllum: 'Chordata', Program: 'A', Value: 0.56 },
      { Phyllum: 'Mollusca', Program: 'B', Value: 0.67 },
      { Phyllum: 'Arthropoda', Program: 'C', Value: 0.78 },
      { Phyllum: 'Chordata', Program: 'A', Value: 0.89 },
      { Phyllum: 'Mollusca', Program: 'B', Value: 0.9 }
    ]
  },
  smoking_rates: {
    id: 'smoking_rates',
    name: 'Smoking Rates by Gender (Connected Dot Plot)',
    description: 'Smoking rates across 5 European countries split by Gender (M / F).',
    varName: 'df',
    source: 'inline',
    setupCode: `import altair as alt
import pandas as pd

data = {
    'Country': ['Lithuania', 'Cyprus', 'Romania', 'Sweden', 'Finland', 'Lithuania', 'Cyprus', 'Romania', 'Sweden', 'Finland'],
    'Smoking rate': [0.36, 0.52, 0.31, 0.07, 0.14, 0.13, 0.21, 0.08, 0.06, 0.11],
    'Gender': ['M', 'M', 'M', 'M', 'M', 'F', 'F', 'F', 'F', 'F']
}
df = pd.DataFrame(data)
`,
    columns: [
      { name: 'Country', type: 'N', unique: 5, sample: 'Lithuania, Cyprus, Romania, Sweden, Finland' },
      { name: 'Smoking rate', type: 'Q', min: 0.06, max: 0.52, mean: 0.2 },
      { name: 'Gender', type: 'N', unique: 2, sample: 'M, F' }
    ],
    rows: [
      { Country: 'Lithuania', 'Smoking rate': 0.36, Gender: 'M' },
      { Country: 'Cyprus', 'Smoking rate': 0.52, Gender: 'M' },
      { Country: 'Romania', 'Smoking rate': 0.31, Gender: 'M' },
      { Country: 'Sweden', 'Smoking rate': 0.07, Gender: 'M' },
      { Country: 'Finland', 'Smoking rate': 0.14, Gender: 'M' },
      { Country: 'Lithuania', 'Smoking rate': 0.13, Gender: 'F' },
      { Country: 'Cyprus', 'Smoking rate': 0.21, Gender: 'F' },
      { Country: 'Romania', 'Smoking rate': 0.08, Gender: 'F' },
      { Country: 'Sweden', 'Smoking rate': 0.06, Gender: 'F' },
      { Country: 'Finland', 'Smoking rate': 0.11, Gender: 'F' }
    ]
  },
  eu_lollipop: {
    id: 'eu_lollipop',
    name: 'Europe Top 10 Populated Countries 2023 (Lollipop)',
    description: '10 most populated countries in Europe in 2023 with EU_membership indicator.',
    varName: 'data',
    source: 'inline',
    setupCode: `import altair as alt
import pandas as pd

data = pd.DataFrame({
    'country': ['France', 'Germany', 'UK', 'Italy', 'Spain', 'Poland', 'Ukraine', 'Romania', 'Netherlands', 'Russia'],
    'population': [65.27, 83.78, 67.88, 60.46, 46.75, 37.8, 43.73, 19.24, 17.13, 145.93],
    'EU_membership': ['Yes', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'No', 'Yes', 'Yes', 'No']
})
`,
    columns: [
      { name: 'country', type: 'N', unique: 10, sample: 'France, Germany, UK, Russia' },
      { name: 'population', type: 'Q', min: 17.13, max: 145.93, mean: 58.8 },
      { name: 'EU_membership', type: 'N', unique: 2, sample: 'Yes, No' }
    ],
    rows: [
      { country: 'France', population: 65.27, EU_membership: 'Yes' },
      { country: 'Germany', population: 83.78, EU_membership: 'Yes' },
      { country: 'UK', population: 67.88, EU_membership: 'No' },
      { country: 'Italy', population: 60.46, EU_membership: 'Yes' },
      { country: 'Spain', population: 46.75, EU_membership: 'Yes' },
      { country: 'Poland', population: 37.8, EU_membership: 'Yes' },
      { country: 'Ukraine', population: 43.73, EU_membership: 'No' },
      { country: 'Romania', population: 19.24, EU_membership: 'Yes' },
      { country: 'Netherlands', population: 17.13, EU_membership: 'Yes' },
      { country: 'Russia', population: 145.93, EU_membership: 'No' }
    ]
  },
  catalan_tennis: {
    id: 'catalan_tennis',
    name: 'Catalan Tennis Players (Bump Chart Window)',
    description: 'Annual tournament points (2018-2024) for 5 Catalan tennis players (Maria, Laura, Anna, Joana, Montse).',
    varName: 'df',
    source: 'inline',
    setupCode: `import altair as alt
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
`,
    columns: [
      { name: 'year', type: 'O', unique: 7, sample: '2018 .. 2024' },
      { name: 'item', type: 'N', unique: 5, sample: 'Maria, Laura, Anna, Joana, Montse' },
      { name: 'points', type: 'Q', min: 40, max: 96, mean: 72.1 }
    ],
    rows: [
      { year: 2018, item: 'Maria', points: 40 },
      { year: 2018, item: 'Laura', points: 58 },
      { year: 2018, item: 'Anna', points: 79 },
      { year: 2018, item: 'Joana', points: 84 },
      { year: 2018, item: 'Montse', points: 88 },
      { year: 2019, item: 'Maria', points: 40 },
      { year: 2019, item: 'Laura', points: 84 },
      { year: 2019, item: 'Anna', points: 49 },
      { year: 2019, item: 'Joana', points: 86 },
      { year: 2019, item: 'Montse', points: 96 },
      { year: 2020, item: 'Maria', points: 74 },
      { year: 2020, item: 'Laura', points: 88 },
      { year: 2020, item: 'Anna', points: 83 },
      { year: 2020, item: 'Joana', points: 45 },
      { year: 2020, item: 'Montse', points: 61 },
      { year: 2021, item: 'Maria', points: 56 },
      { year: 2021, item: 'Laura', points: 81 },
      { year: 2021, item: 'Anna', points: 51 },
      { year: 2021, item: 'Joana', points: 82 },
      { year: 2021, item: 'Montse', points: 72 },
      { year: 2022, item: 'Maria', points: 80 },
      { year: 2022, item: 'Laura', points: 76 },
      { year: 2022, item: 'Anna', points: 45 },
      { year: 2022, item: 'Joana', points: 68 },
      { year: 2022, item: 'Montse', points: 83 },
      { year: 2023, item: 'Maria', points: 69 },
      { year: 2023, item: 'Laura', points: 89 },
      { year: 2023, item: 'Anna', points: 86 },
      { year: 2023, item: 'Joana', points: 82 },
      { year: 2023, item: 'Montse', points: 92 },
      { year: 2024, item: 'Maria', points: 88 },
      { year: 2024, item: 'Laura', points: 71 },
      { year: 2024, item: 'Anna', points: 47 },
      { year: 2024, item: 'Joana', points: 68 },
      { year: 2024, item: 'Montse', points: 87 }
    ]
  },
  priestley_income: {
    id: 'priestley_income',
    name: 'Monthly Income Ranges 2024 (Priestley Chart)',
    description: 'Two income entries per month (Jan-Dec) for min/max range bars.',
    varName: 'df',
    source: 'inline',
    setupCode: `import altair as alt
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
`,
    columns: [
      { name: 'Month', type: 'N', unique: 12, sample: 'Jan, Feb, Mar .. Dec' },
      { name: 'Income', type: 'Q', min: 1518, max: 2392, mean: 1996 },
      { name: 'Year', type: 'O', unique: 1, sample: '2024' }
    ],
    rows: [
      { Month: 'Jan', Income: 1651, Year: 2024, Day: 1 },
      { Month: 'Jan', Income: 2118, Year: 2024, Day: 1 },
      { Month: 'Feb', Income: 2036, Year: 2024, Day: 1 },
      { Month: 'Feb', Income: 1562, Year: 2024, Day: 1 },
      { Month: 'Mar', Income: 1518, Year: 2024, Day: 1 },
      { Month: 'Mar', Income: 2203, Year: 2024, Day: 1 },
      { Month: 'Apr', Income: 2012, Year: 2024, Day: 1 },
      { Month: 'Apr', Income: 2054, Year: 2024, Day: 1 },
      { Month: 'May', Income: 2248, Year: 2024, Day: 1 },
      { Month: 'May', Income: 1613, Year: 2024, Day: 1 },
      { Month: 'Jun', Income: 1900, Year: 2024, Day: 1 },
      { Month: 'Jun', Income: 1768, Year: 2024, Day: 1 },
      { Month: 'Jul', Income: 2274, Year: 2024, Day: 1 },
      { Month: 'Jul', Income: 2171, Year: 2024, Day: 1 },
      { Month: 'Aug', Income: 2392, Year: 2024, Day: 1 },
      { Month: 'Aug', Income: 2343, Year: 2024, Day: 1 },
      { Month: 'Sep', Income: 1930, Year: 2024, Day: 1 },
      { Month: 'Sep', Income: 2201, Year: 2024, Day: 1 },
      { Month: 'Oct', Income: 2375, Year: 2024, Day: 1 },
      { Month: 'Oct', Income: 1623, Year: 2024, Day: 1 },
      { Month: 'Nov', Income: 2095, Year: 2024, Day: 1 },
      { Month: 'Nov', Income: 2065, Year: 2024, Day: 1 },
      { Month: 'Dec', Income: 2197, Year: 2024, Day: 1 },
      { Month: 'Dec', Income: 1561, Year: 2024, Day: 1 }
    ]
  },
  iowa_electricity: {
    id: 'iowa_electricity',
    name: 'Iowa Electricity (data.iowa_electricity)',
    description: 'Net electricity generation in Iowa (2001-2017) by source (Fossil Fuels, Nuclear, Renewables).',
    varName: 'df',
    source: 'url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/iowa-electricity.csv',
    setupCode: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.iowa_electricity.url
`,
    columns: [
      { name: 'year', type: 'T', unique: 17, sample: '2001-01-01 .. 2017-01-01' },
      { name: 'source', type: 'N', unique: 3, sample: 'Fossil Fuels, Nuclear Energy, Renewables' },
      { name: 'net_generation', type: 'Q', min: 1437, max: 42750, mean: 18500 }
    ],
    preview: [
      { year: '2001-01-01', source: 'Fossil Fuels', net_generation: 35361 },
      { year: '2001-01-01', source: 'Nuclear Energy', net_generation: 3853 },
      { year: '2001-01-01', source: 'Renewables', net_generation: 1437 },
      { year: '2017-01-01', source: 'Renewables', net_generation: 21933 }
    ]
  },
  airports_us: {
    id: 'airports_us',
    name: 'US Airports & TopoJSON Map (data.airports + us_10m)',
    description: 'US airport coordinates layered over US 10m state boundaries TopoJSON.',
    varName: 'airports',
    source: 'url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/airports.csv',
    setupCode: `import altair as alt
from vega_datasets import data

map = alt.topo_feature(data.us_10m.url, feature='states')
airports = data.airports.url
`,
    columns: [
      { name: 'iata', type: 'N', unique: 3376, sample: 'ORD, ATL, LAX, JFK' },
      { name: 'state', type: 'N', unique: 56, sample: 'IL, GA, CA, NY, TX' },
      { name: 'latitude', type: 'Q', min: 18, max: 71.3, mean: 37.8 },
      { name: 'longitude', type: 'Q', min: -176.6, max: -65, mean: -95.4 }
    ],
    preview: [
      { iata: '00M', name: 'Thigpen', city: 'Bay Springs', state: 'MS', country: 'USA', latitude: 31.9537, longitude: -89.2345 },
      { iata: '00R', name: 'Livingston Municipal', city: 'Livingston', state: 'TX', country: 'USA', latitude: 30.6858, longitude: -95.0179 },
      { iata: '00V', name: 'Meadow Lake', city: 'Colorado Springs', state: 'CO', country: 'USA', latitude: 38.9457, longitude: -104.5698 }
    ]
  },
  parliament_seats: {
    id: 'parliament_seats',
    name: 'Parliament Seats 2018 vs 2023 (exam, Nov 2024)',
    description: 'Seats won by five parties in two elections, and whether each party was governing.',
    varName: 'data',
    source: 'inline',
    setupCode: `import altair as alt
import pandas as pd

data = pd.DataFrame({
    'Party': ['Liberals', 'Democrats', 'Conservatives', 'Activists', 'Extreme', 'Liberals', 'Democrats', 'Conservatives', 'Activists', 'Extreme'],
    'Seats': [81, 92, 61, 10, 21, 89, 70, 75, 21, 10],
    'Year': [2018, 2018, 2018, 2018, 2018, 2023, 2023, 2023, 2023, 2023],
    'Governing': [True, False, True, False, False, False, True, False, True, False]
})
`,
    columns: [
      { name: 'Party', type: 'N', unique: 5, sample: 'Liberals, Democrats, Conservatives' },
      { name: 'Seats', type: 'Q', min: 10, max: 92, mean: 53 },
      { name: 'Year', type: 'O', unique: 2, sample: '2018, 2023' },
      { name: 'Governing', type: 'N', unique: 2, sample: 'True, False' }
    ],
    rows: [
      { Party: 'Liberals', Seats: 81, Year: 2018, Governing: true },
      { Party: 'Democrats', Seats: 92, Year: 2018, Governing: false },
      { Party: 'Conservatives', Seats: 61, Year: 2018, Governing: true },
      { Party: 'Activists', Seats: 10, Year: 2018, Governing: false },
      { Party: 'Extreme', Seats: 21, Year: 2018, Governing: false },
      { Party: 'Liberals', Seats: 89, Year: 2023, Governing: false },
      { Party: 'Democrats', Seats: 70, Year: 2023, Governing: true },
      { Party: 'Conservatives', Seats: 75, Year: 2023, Governing: false },
      { Party: 'Activists', Seats: 21, Year: 2023, Governing: true },
      { Party: 'Extreme', Seats: 10, Year: 2023, Governing: false }
    ]
  },
  hospital_occupancy: {
    id: 'hospital_occupancy',
    name: 'Hospital Occupancy vs Capacity Levels (exam, Jan 2024)',
    description: 'Monthly occupancy against three capacity levels, with the historic mean occupancy.',
    varName: 'df',
    source: 'inline',
    setupCode: `import altair as alt
import pandas as pd

df = pd.DataFrame({
    'month': ['January', 'February', 'March'],
    'level1': [75, 75, 75],
    'level2': [100, 100, 100],
    'level3': [150, 150, 150],
    'value': [115, 120, 80],
    'historic': [60, 95, 65]
})
`,
    columns: [
      { name: 'month', type: 'N', unique: 3, sample: 'January, February, March' },
      { name: 'level1', type: 'Q', min: 75, max: 75, mean: 75 },
      { name: 'level2', type: 'Q', min: 100, max: 100, mean: 100 },
      { name: 'level3', type: 'Q', min: 150, max: 150, mean: 150 },
      { name: 'value', type: 'Q', min: 80, max: 120, mean: 105 },
      { name: 'historic', type: 'Q', min: 60, max: 95, mean: 73.3 }
    ],
    rows: [
      { month: 'January', level1: 75, level2: 100, level3: 150, value: 115, historic: 60 },
      { month: 'February', level1: 75, level2: 100, level3: 150, value: 120, historic: 95 },
      { month: 'March', level1: 75, level2: 100, level3: 150, value: 80, historic: 65 }
    ]
  },
  disasters: {
    id: 'disasters',
    name: 'Natural Disasters 1900-2017 (data.disasters)',
    description: 'Yearly deaths per type of natural disaster, plus an "All natural disasters" total.',
    varName: 'source',
    source: 'url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/disasters.csv',
    setupCode: `import altair as alt
import pandas as pd
from vega_datasets import data

source = data.disasters.url
`,
    columns: [
      { name: 'Entity', type: 'N', unique: 11, sample: 'Drought, Earthquake, Flood, Wildfire' },
      { name: 'Year', type: 'O', unique: 117, sample: '1900 .. 2017' },
      { name: 'Deaths', type: 'Q', min: 1, max: 3706227, mean: 81213 }
    ],
    preview: [
      { Entity: 'All natural disasters', Year: 1900, Deaths: 1267360 },
      { Entity: 'All natural disasters', Year: 1901, Deaths: 200018 },
      { Entity: 'All natural disasters', Year: 1902, Deaths: 46037 },
      { Entity: 'All natural disasters', Year: 1903, Deaths: 6506 },
      { Entity: 'All natural disasters', Year: 1905, Deaths: 22758 }
    ]
  },
  seattle_weather: {
    id: 'seattle_weather',
    name: 'Seattle Weather 2012-2015 (data.seattle_weather)',
    description: 'Daily precipitation, temperatures, wind and weather type in Seattle.',
    varName: 'df',
    source: 'url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/seattle-weather.csv',
    setupCode: `import altair as alt
import pandas as pd
from vega_datasets import data

df = data.seattle_weather.url
`,
    columns: [
      { name: 'date', type: 'T', unique: 1461, sample: '2012/01/01 .. 2015/12/31' },
      { name: 'precipitation', type: 'Q', min: 0, max: 55.9, mean: 3 },
      { name: 'temp_max', type: 'Q', min: -1.6, max: 35.6, mean: 16.4 },
      { name: 'temp_min', type: 'Q', min: -7.1, max: 18.3, mean: 8.2 },
      { name: 'wind', type: 'Q', min: 0.4, max: 9.5, mean: 3.2 },
      { name: 'weather', type: 'N', unique: 5, sample: 'sun, rain, drizzle, fog, snow' }
    ],
    preview: [
      { date: '2012/01/01', precipitation: 0, temp_max: 12.8, temp_min: 5, wind: 4.7, weather: 'drizzle' },
      { date: '2012/01/02', precipitation: 10.9, temp_max: 10.6, temp_min: 2.8, wind: 4.5, weather: 'rain' },
      { date: '2012/01/03', precipitation: 0.8, temp_max: 11.7, temp_min: 7.2, wind: 2.3, weather: 'rain' },
      { date: '2012/01/04', precipitation: 20.3, temp_max: 12.2, temp_min: 5.6, wind: 4.7, weather: 'rain' },
      { date: '2012/01/05', precipitation: 1.3, temp_max: 8.9, temp_min: 2.8, wind: 6.1, weather: 'rain' }
    ]
  }
};

// Inline datasets: preview is the first 5 rows.
for (const d of Object.values(DATASETS)) {
  if (d.rows) d.preview = d.rows.slice(0, 5);
}
