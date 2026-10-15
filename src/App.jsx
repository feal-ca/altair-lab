import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// ============================================================================
// 1. BUILT-IN & NOTEBOOK DATASETS (Part 1 & Part 2)
// ============================================================================
const INITIAL_DATASETS = {
  country_pop: {
    id: 'country_pop',
    name: 'EU Country Population (Country_data)',
    sourceType: 'dataframe',
    varName: 'Country_data',
    description: '10 European countries with population in millions from Part 1.',
    importCode: `import altair as alt\nimport pandas as pd\n\nCountry_data = pd.DataFrame({\n    'Country': ['Germany', 'France', 'Italy', 'Spain', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Czech Republic', 'Greece'],\n    'Population (Millions)': [83.155, 67.657, 59.236, 47.399, 37.840, 19.202, 17.475, 11.555, 10.702, 10.679]\n})\n`,
    columns: [
      { name: 'Country', type: 'N', unique: 10, sample: 'Germany, France, Italy' },
      { name: 'Population (Millions)', type: 'Q', min: 10.68, max: 83.16, mean: 36.49 }
    ],
    rows: [
      { 'Country': 'Germany', 'Population (Millions)': 83.155 },
      { 'Country': 'France', 'Population (Millions)': 67.657 },
      { 'Country': 'Italy', 'Population (Millions)': 59.236 },
      { 'Country': 'Spain', 'Population (Millions)': 47.399 },
      { 'Country': 'Poland', 'Population (Millions)': 37.840 },
      { 'Country': 'Romania', 'Population (Millions)': 19.202 },
      { 'Country': 'Netherlands', 'Population (Millions)': 17.475 },
      { 'Country': 'Belgium', 'Population (Millions)': 11.555 },
      { 'Country': 'Czech Republic', 'Population (Millions)': 10.702 },
      { 'Country': 'Greece', 'Population (Millions)': 10.679 }
    ]
  },
  iphone_data: {
    id: 'iphone_data',
    name: 'Apple Smartphones 2007-2020 (iPhone_data)',
    sourceType: 'dataframe',
    varName: 'df',
    description: 'iPhone model release years and launch prices in USD.',
    importCode: `import altair as alt\nimport pandas as pd\n\niPhone_data = {\n    'name': ['iPhone', 'iPhone 3G', 'iPhone 3GS', 'iPhone 4', 'iPhone 4S', 'iPhone 5', 'iPhone 5S', 'iPhone 6', 'iPhone 6S', 'iPhone 7', 'iPhone X', 'iPhone XS', 'iPhone 11 Pro', 'iPhone 12 Pro'],\n    'year': ['2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'],\n    'price': [499, 599, 699, 599, 649, 649, 649, 649, 699, 649, 999, 999, 1099, 1099]\n}\ndf = pd.DataFrame(iPhone_data)\n`,
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
    sourceType: 'vega_url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/cars.json',
    varName: 'cars',
    description: '406 automobiles with MPG, Cylinders, Displacement, Horsepower, Weight, Acceleration, Year, Origin.',
    importCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\ncars = data.cars.url\n`,
    columns: [
      { name: 'Name', type: 'N', unique: 311, sample: 'chevrolet chevelle, vw pickup' },
      { name: 'Miles_per_Gallon', type: 'Q', min: 9.0, max: 46.6, mean: 23.5 },
      { name: 'Cylinders', type: 'O', unique: 5, sample: '3, 4, 5, 6, 8' },
      { name: 'Displacement', type: 'Q', min: 68.0, max: 455.0, mean: 194.8 },
      { name: 'Horsepower', type: 'Q', min: 46.0, max: 230.0, mean: 105.1 },
      { name: 'Weight_in_lbs', type: 'Q', min: 1613, max: 5140, mean: 2979 },
      { name: 'Acceleration', type: 'Q', min: 8.0, max: 24.8, mean: 15.5 },
      { name: 'Year', type: 'T', unique: 13, sample: '1970-01-01 .. 1982-01-01' },
      { name: 'Origin', type: 'N', unique: 3, sample: 'USA, Europe, Japan' }
    ],
    rows: [
      { Name: 'chevrolet chevelle malibu', Miles_per_Gallon: 18.0, Cylinders: 8, Displacement: 307.0, Horsepower: 130.0, Weight_in_lbs: 3504, Acceleration: 12.0, Year: '1970-01-01', Origin: 'USA' },
      { Name: 'buick skylark 320', Miles_per_Gallon: 15.0, Cylinders: 8, Displacement: 350.0, Horsepower: 165.0, Weight_in_lbs: 3693, Acceleration: 11.5, Year: '1970-01-01', Origin: 'USA' },
      { Name: 'plymouth satellite', Miles_per_Gallon: 18.0, Cylinders: 8, Displacement: 318.0, Horsepower: 150.0, Weight_in_lbs: 3436, Acceleration: 11.0, Year: '1970-01-01', Origin: 'USA' },
      { Name: 'toyota corona mark ii', Miles_per_Gallon: 24.0, Cylinders: 4, Displacement: 113.0, Horsepower: 95.0, Weight_in_lbs: 2372, Acceleration: 15.0, Year: '1970-01-01', Origin: 'Japan' },
      { Name: 'vw pickup', Miles_per_Gallon: 44.0, Cylinders: 4, Displacement: 97.0, Horsepower: 52.0, Weight_in_lbs: 2130, Acceleration: 24.6, Year: '1982-01-01', Origin: 'Europe' }
    ]
  },
  stocks: {
    id: 'stocks',
    name: 'Tech Stocks (data.stocks)',
    sourceType: 'vega_url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/stocks.csv',
    varName: 'df',
    description: 'Monthly stock prices for AAPL, AMZN, GOOG, IBM, and MSFT (2000-2010).',
    importCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\ndf = data.stocks.url\n`,
    columns: [
      { name: 'symbol', type: 'N', unique: 5, sample: 'MSFT, AMZN, IBM, GOOG, AAPL' },
      { name: 'date', type: 'T', unique: 123, sample: '2000-01-01 .. 2010-03-01' },
      { name: 'price', type: 'Q', min: 5.97, max: 707.0, mean: 100.7 }
    ],
    rows: [
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
    sourceType: 'vega_url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/jobs.json',
    varName: 'source',
    description: '255 job categories by sex (men/women), census decade year, count, and percentage.',
    importCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\nsource = data.jobs.url\n`,
    columns: [
      { name: 'job', type: 'N', unique: 255, sample: 'Welder, Weaver, Actor, Machinist' },
      { name: 'sex', type: 'N', unique: 2, sample: 'men, women' },
      { name: 'year', type: 'O', unique: 15, sample: '1850, 1900, 1950, 2000' },
      { name: 'count', type: 'Q', min: 0, max: 3500000, mean: 45200 },
      { name: 'perc', type: 'Q', min: 0.0, max: 0.15, mean: 0.002 }
    ],
    rows: [
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
    sourceType: 'vega_url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/us-employment.csv',
    varName: 'df',
    description: 'Monthly US employment figures across sectors (construction, government, manufacturing).',
    importCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\ndf = data.us_employment.url\n`,
    columns: [
      { name: 'month', type: 'T', unique: 120, sample: '2006-01-01 .. 2015-12-01' },
      { name: 'construction', type: 'Q', min: 5400, max: 7726, mean: 6410 },
      { name: 'government', type: 'Q', min: 21800, max: 22600, mean: 22100 },
      { name: 'manufacturing', type: 'Q', min: 11450, max: 14200, mean: 12400 }
    ],
    rows: [
      { month: '2006-01-01', construction: 7601, government: 21894, manufacturing: 14217 },
      { month: '2008-01-01', construction: 7474, government: 22382, manufacturing: 13731 },
      { month: '2010-01-01', construction: 5632, government: 22481, manufacturing: 11462 }
    ]
  },
  barley: {
    id: 'barley',
    name: 'Minnesota Barley Yield (data.barley)',
    sourceType: 'vega_url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/barley.json',
    varName: 'source',
    description: 'Crop yields across 6 sites and 10 varieties in 1931 and 1932.',
    importCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\nsource = data.barley()\n`,
    columns: [
      { name: 'yield', type: 'Q', min: 14.4, max: 65.8, mean: 34.4 },
      { name: 'variety', type: 'N', unique: 10, sample: 'Manchuria, Glabron, Velvet' },
      { name: 'year', type: 'O', unique: 2, sample: '1931, 1932' },
      { name: 'site', type: 'N', unique: 6, sample: 'University Farm, Waseca, Morris' }
    ],
    rows: [
      { yield: 27.0, variety: 'Manchuria', year: 1931, site: 'University Farm' },
      { yield: 48.87, variety: 'Manchuria', year: 1931, site: 'Waseca' },
      { yield: 27.43, variety: 'Manchuria', year: 1931, site: 'Morris' },
      { yield: 39.93, variety: 'Manchuria', year: 1931, site: 'Crookston' },
      { yield: 32.97, variety: 'Manchuria', year: 1931, site: 'Grand Rapids' }
    ]
  },
  fruit_pie: {
    id: 'fruit_pie',
    name: 'Fruit Proportions (Pie & Radial Labels)',
    sourceType: 'dataframe',
    varName: 'source',
    description: 'Fruit quantities for sorted pie charts and superposed radial text labels.',
    importCode: `import altair as alt\nimport pandas as pd\n\nsource = pd.DataFrame({\n    'fruit': ['orange', 'pear', 'apple', 'lemon', 'plum'],\n    'value': [4, 6, 10, 3, 7]\n})\n`,
    columns: [
      { name: 'fruit', type: 'N', unique: 5, sample: 'orange, pear, apple, lemon, plum' },
      { name: 'value', type: 'Q', min: 3, max: 10, mean: 6.0 }
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
    sourceType: 'dataframe',
    varName: 'df',
    description: 'Phyllum values across Programs A, B, and C for multi-layer bullet charts.',
    importCode: `import altair as alt\nimport pandas as pd\n\ndata = {\n    'Phyllum': ['Arthropoda', 'Chordata', 'Mollusca', 'Arthropoda', 'Chordata', 'Mollusca', 'Arthropoda', 'Chordata', 'Mollusca', 'Arthropoda', 'Chordata', 'Mollusca', 'Arthropoda', 'Chordata', 'Mollusca', 'Arthropoda', 'Chordata', 'Mollusca'],\n    'Program': ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C', 'A', 'B'],\n    'Value': [0.23, 0.45, 0.12, 0.67, 0.34, 0.56, 0.78, 0.89, 0.90, 0.12, 0.23, 0.34, 0.45, 0.56, 0.67, 0.78, 0.89, 0.90]\n}\ndf = pd.DataFrame(data)\n`,
    columns: [
      { name: 'Phyllum', type: 'N', unique: 3, sample: 'Arthropoda, Chordata, Mollusca' },
      { name: 'Program', type: 'N', unique: 3, sample: 'A, B, C' },
      { name: 'Value', type: 'Q', min: 0.12, max: 0.90, mean: 0.52 }
    ],
    rows: [
      { Phyllum: 'Arthropoda', Program: 'A', Value: 0.23 },
      { Phyllum: 'Chordata', Program: 'B', Value: 0.45 },
      { Phyllum: 'Mollusca', Program: 'C', Value: 0.12 },
      { Phyllum: 'Arthropoda', Program: 'A', Value: 0.67 },
      { Phyllum: 'Chordata', Program: 'B', Value: 0.34 }
    ]
  },
  smoking_rates: {
    id: 'smoking_rates',
    name: 'Smoking Rates by Gender (Connected Dot Plot)',
    sourceType: 'dataframe',
    varName: 'df',
    description: 'Smoking rates across 5 European countries split by Gender (M / F).',
    importCode: `import altair as alt\nimport pandas as pd\n\ndata = {\n    'Country': ['Lithuania', 'Cyprus', 'Romania', 'Sweden', 'Finland', 'Lithuania', 'Cyprus', 'Romania', 'Sweden', 'Finland'],\n    'Smoking rate': [0.36, 0.52, 0.31, 0.07, 0.14, 0.13, 0.21, 0.08, 0.06, 0.11],\n    'Gender': ['M', 'M', 'M', 'M', 'M', 'F', 'F', 'F', 'F', 'F']\n}\ndf = pd.DataFrame(data)\n`,
    columns: [
      { name: 'Country', type: 'N', unique: 5, sample: 'Lithuania, Cyprus, Romania, Sweden, Finland' },
      { name: 'Smoking rate', type: 'Q', min: 0.06, max: 0.52, mean: 0.20 },
      { name: 'Gender', type: 'N', unique: 2, sample: 'M, F' }
    ],
    rows: [
      { Country: 'Lithuania', 'Smoking rate': 0.36, Gender: 'M' },
      { Country: 'Cyprus', 'Smoking rate': 0.52, Gender: 'M' },
      { Country: 'Romania', 'Smoking rate': 0.31, Gender: 'M' },
      { Country: 'Lithuania', 'Smoking rate': 0.13, Gender: 'F' },
      { Country: 'Cyprus', 'Smoking rate': 0.21, Gender: 'F' }
    ]
  },
  eu_lollipop: {
    id: 'eu_lollipop',
    name: 'Europe Top 10 Populated Countries 2023 (Lollipop)',
    sourceType: 'dataframe',
    varName: 'data',
    description: '10 most populated countries in Europe in 2023 with EU_membership indicator.',
    importCode: `import altair as alt\nimport pandas as pd\n\ndata = pd.DataFrame({\n    'country': ['France', 'Germany', 'UK', 'Italy', 'Spain', 'Poland', 'Ukraine', 'Romania', 'Netherlands', 'Russia'],\n    'population': [65.27, 83.78, 67.88, 60.46, 46.75, 37.8, 43.73, 19.24, 17.13, 145.93],\n    'EU_membership': ['Yes', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'No', 'Yes', 'Yes', 'No']\n})\n`,
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
      { country: 'Russia', population: 145.93, EU_membership: 'No' }
    ]
  },
  catalan_tennis: {
    id: 'catalan_tennis',
    name: 'Catalan Tennis Players (Bump Chart Window)',
    sourceType: 'dataframe',
    varName: 'df',
    description: 'Annual tournament points (2018-2024) for 5 Catalan tennis players (Maria, Laura, Anna, Joana, Montse).',
    importCode: `import altair as alt\nimport pandas as pd\n\nrows = [\n    {"year": 2018, "item": "Maria", "points": 40}, {"year": 2018, "item": "Laura", "points": 58}, {"year": 2018, "item": "Anna", "points": 79}, {"year": 2018, "item": "Joana", "points": 84}, {"year": 2018, "item": "Montse", "points": 88},\n    {"year": 2019, "item": "Maria", "points": 40}, {"year": 2019, "item": "Laura", "points": 84}, {"year": 2019, "item": "Anna", "points": 49}, {"year": 2019, "item": "Joana", "points": 86}, {"year": 2019, "item": "Montse", "points": 96},\n    {"year": 2020, "item": "Maria", "points": 74}, {"year": 2020, "item": "Laura", "points": 88}, {"year": 2020, "item": "Anna", "points": 83}, {"year": 2020, "item": "Joana", "points": 45}, {"year": 2020, "item": "Montse", "points": 61},\n    {"year": 2021, "item": "Maria", "points": 56}, {"year": 2021, "item": "Laura", "points": 81}, {"year": 2021, "item": "Anna", "points": 51}, {"year": 2021, "item": "Joana", "points": 82}, {"year": 2021, "item": "Montse", "points": 72},\n    {"year": 2022, "item": "Maria", "points": 80}, {"year": 2022, "item": "Laura", "points": 76}, {"year": 2022, "item": "Anna", "points": 45}, {"year": 2022, "item": "Joana", "points": 68}, {"year": 2022, "item": "Montse", "points": 83},\n    {"year": 2023, "item": "Maria", "points": 69}, {"year": 2023, "item": "Laura", "points": 89}, {"year": 2023, "item": "Anna", "points": 86}, {"year": 2023, "item": "Joana", "points": 82}, {"year": 2023, "item": "Montse", "points": 92},\n    {"year": 2024, "item": "Maria", "points": 88}, {"year": 2024, "item": "Laura", "points": 71}, {"year": 2024, "item": "Anna", "points": 47}, {"year": 2024, "item": "Joana", "points": 68}, {"year": 2024, "item": "Montse", "points": 87}\n]\ndf = pd.DataFrame(rows)\n`,
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
      { year: 2018, item: 'Montse', points: 88 }
    ]
  },
  priestley_income: {
    id: 'priestley_income',
    name: 'Monthly Income Ranges 2024 (Priestley Chart)',
    sourceType: 'dataframe',
    varName: 'df',
    description: 'Two income entries per month (Jan-Dec) for min/max range bars.',
    importCode: `import altair as alt\nimport pandas as pd\n\ndata = [\n    {"Month": "Jan", "Income": 1651, "Year": 2024, "Day": 1}, {"Month": "Jan", "Income": 2118, "Year": 2024, "Day": 1},\n    {"Month": "Feb", "Income": 2036, "Year": 2024, "Day": 1}, {"Month": "Feb", "Income": 1562, "Year": 2024, "Day": 1},\n    {"Month": "Mar", "Income": 1518, "Year": 2024, "Day": 1}, {"Month": "Mar", "Income": 2203, "Year": 2024, "Day": 1},\n    {"Month": "Apr", "Income": 2012, "Year": 2024, "Day": 1}, {"Month": "Apr", "Income": 2054, "Year": 2024, "Day": 1},\n    {"Month": "May", "Income": 2248, "Year": 2024, "Day": 1}, {"Month": "May", "Income": 1613, "Year": 2024, "Day": 1},\n    {"Month": "Jun", "Income": 1900, "Year": 2024, "Day": 1}, {"Month": "Jun", "Income": 1768, "Year": 2024, "Day": 1},\n    {"Month": "Jul", "Income": 2274, "Year": 2024, "Day": 1}, {"Month": "Jul", "Income": 2171, "Year": 2024, "Day": 1},\n    {"Month": "Aug", "Income": 2392, "Year": 2024, "Day": 1}, {"Month": "Aug", "Income": 2343, "Year": 2024, "Day": 1},\n    {"Month": "Sep", "Income": 1930, "Year": 2024, "Day": 1}, {"Month": "Sep", "Income": 2201, "Year": 2024, "Day": 1},\n    {"Month": "Oct", "Income": 2375, "Year": 2024, "Day": 1}, {"Month": "Oct", "Income": 1623, "Year": 2024, "Day": 1},\n    {"Month": "Nov", "Income": 2095, "Year": 2024, "Day": 1}, {"Month": "Nov", "Income": 2065, "Year": 2024, "Day": 1},\n    {"Month": "Dec", "Income": 2197, "Year": 2024, "Day": 1}, {"Month": "Dec", "Income": 1561, "Year": 2024, "Day": 1}\n]\ndf = pd.DataFrame(data)\n`,
    columns: [
      { name: 'Month', type: 'N', unique: 12, sample: 'Jan, Feb, Mar .. Dec' },
      { name: 'Income', type: 'Q', min: 1518, max: 2392, mean: 1996 },
      { name: 'Year', type: 'O', unique: 1, sample: '2024' }
    ],
    rows: [
      { Month: 'Jan', Income: 1651, Year: 2024, Day: 1 },
      { Month: 'Jan', Income: 2118, Year: 2024, Day: 1 },
      { Month: 'Feb', Income: 2036, Year: 2024, Day: 1 },
      { Month: 'Feb', Income: 1562, Year: 2024, Day: 1 }
    ]
  },
  iowa_electricity: {
    id: 'iowa_electricity',
    name: 'Iowa Electricity (data.iowa_electricity)',
    sourceType: 'vega_url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/iowa-electricity.csv',
    varName: 'df',
    description: 'Net electricity generation in Iowa (2001-2017) by source (Fossil Fuels, Nuclear, Renewables).',
    importCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\ndf = data.iowa_electricity.url\n`,
    columns: [
      { name: 'year', type: 'T', unique: 17, sample: '2001-01-01 .. 2017-01-01' },
      { name: 'source', type: 'N', unique: 3, sample: 'Fossil Fuels, Nuclear Energy, Renewables' },
      { name: 'net_generation', type: 'Q', min: 1437, max: 42750, mean: 18500 }
    ],
    rows: [
      { year: '2001-01-01', source: 'Fossil Fuels', net_generation: 35361 },
      { year: '2001-01-01', source: 'Nuclear Energy', net_generation: 3853 },
      { year: '2001-01-01', source: 'Renewables', net_generation: 1437 },
      { year: '2017-01-01', source: 'Renewables', net_generation: 21933 }
    ]
  },
  airports_us: {
    id: 'airports_us',
    name: 'US Airports & TopoJSON Map (data.airports + us_10m)',
    sourceType: 'vega_url',
    url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/airports.csv',
    varName: 'airports',
    description: 'US airport coordinates layered over US 10m state boundaries TopoJSON.',
    importCode: `import altair as alt\nfrom vega_datasets import data\n\nmap = alt.topo_feature(data.us_10m.url, feature='states')\nairports = data.airports.url\n`,
    columns: [
      { name: 'iata', type: 'N', unique: 3376, sample: 'ORD, ATL, LAX, JFK' },
      { name: 'state', type: 'N', unique: 56, sample: 'IL, GA, CA, NY, TX' },
      { name: 'latitude', type: 'Q', min: 18.0, max: 71.3, mean: 37.8 },
      { name: 'longitude', type: 'Q', min: -176.6, max: -65.0, mean: -95.4 }
    ],
    rows: [
      { iata: '00M', name: 'Thigpen', city: 'Bay Springs', state: 'MS', country: 'USA', latitude: 31.9537, longitude: -89.2345 },
      { iata: '00R', name: 'Livingston Municipal', city: 'Livingston', state: 'TX', country: 'USA', latitude: 30.6858, longitude: -95.0179 },
      { iata: '00V', name: 'Meadow Lake', city: 'Colorado Springs', state: 'CO', country: 'USA', latitude: 38.9457, longitude: -104.5698 }
    ]
  }
};

// ============================================================================
// 2. CURATED EXERCISES FROM PART 1 & PART 2 NOTEBOOKS
// ============================================================================
const CURATED_CHALLENGES = [
  {
    id: 'nb1-bar-color',
    title: '1. Colored Category Bar Chart',
    difficulty: 'Beginner',
    notebookRef: 'Notebook 1: First Steps with Altair',
    datasetId: 'country_pop',
    prompt: 'Create a bar chart using Country_data with Country:N on X, Population (Millions):Q on Y, Color encoded by Country, and chart title "Population".',
    hints: [
      'Pass Country_data to alt.Chart(Country_data).mark_bar()',
      'Inside .encode(), map alt.X("Country:N"), alt.Y("Population (Millions):Q"), and alt.Color("Country:N")',
      'Chain .properties(title="Population") at the end.'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\n\nCountry_data = pd.DataFrame({\n    'Country': ['Germany', 'France', 'Italy', 'Spain', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Czech Republic', 'Greece'],\n    'Population (Millions)': [83.155, 67.657, 59.236, 47.399, 37.840, 19.202, 17.475, 11.555, 10.702, 10.679]\n})\n\nalt.Chart(Country_data).mark_bar().encode(\n    alt.X('Country:N'),\n    alt.Y('Population (Millions):Q'),\n    alt.Color('Country:N')\n).properties(title='Population')`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: INITIAL_DATASETS.country_pop.rows },
      mark: { type: 'bar' },
      encoding: {
        x: { field: 'Country', type: 'nominal' },
        y: { field: 'Population (Millions)', type: 'quantitative' },
        color: { field: 'Country', type: 'nominal' }
      },
      title: 'Population'
    }
  },
  {
    id: 'nb1-iphone-tooltip',
    title: '2. Filled Square Scatterplot with Tooltip',
    difficulty: 'Beginner',
    notebookRef: 'Notebook 1: Marks & Tooltips',
    datasetId: 'iphone_data',
    prompt: 'Plot df (iPhone_data) using mark_point(shape="square", filled=True). Map year:O to X, price:Q to Y, name to tooltip, and set title to "Apple smartphones 2007-2020".',
    hints: [
      'Configure mark_point with shape="square" and filled=True.',
      'Inside .encode(), use alt.X("year:O"), alt.Y("price:Q"), and tooltip="name".',
      'Add .properties(title="Apple smartphones 2007-2020").'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\n\niPhone_data = {\n    'name': ['iPhone', 'iPhone 3G', 'iPhone 3GS', 'iPhone 4', 'iPhone 4S', 'iPhone 5', 'iPhone 5S', 'iPhone 6', 'iPhone 6S', 'iPhone 7', 'iPhone X', 'iPhone XS', 'iPhone 11 Pro', 'iPhone 12 Pro'],\n    'year': ['2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'],\n    'price': [499, 599, 699, 599, 649, 649, 649, 649, 699, 649, 999, 999, 1099, 1099]\n}\ndf = pd.DataFrame(iPhone_data)\n\nalt.Chart(df).mark_point(shape='square', filled=True).encode(\n    alt.X('year:O'),\n    alt.Y('price:Q'),\n    tooltip='name'\n).properties(title='Apple smartphones 2007-2020')`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: INITIAL_DATASETS.iphone_data.rows },
      mark: { type: 'point', shape: 'square', filled: true },
      encoding: {
        x: { field: 'year', type: 'ordinal' },
        y: { field: 'price', type: 'quantitative' },
        tooltip: { field: 'name', type: 'nominal' }
      },
      title: 'Apple smartphones 2007-2020'
    }
  },
  {
    id: 'nb1-cars-opacity',
    title: '3. Multi-Channel Opacity Encoding',
    difficulty: 'Beginner',
    notebookRef: 'Notebook 1: Channels Configuration',
    datasetId: 'cars',
    prompt: 'Using cars, create a point chart with size=50. Encode Acceleration:Q on X, Miles_per_Gallon:Q on Y, Origin:N on color, and Horsepower:Q on opacity.',
    hints: [
      'Use alt.Chart(cars).mark_point(size=50)',
      'Map x="Acceleration:Q", y="Miles_per_Gallon:Q", color="Origin:N", and opacity="Horsepower:Q".'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\ncars = data.cars.url\n\nalt.Chart(cars).mark_point(size=50).encode(\n    x='Acceleration:Q',\n    y='Miles_per_Gallon:Q',\n    color='Origin:N',\n    opacity='Horsepower:Q'\n)`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { url: INITIAL_DATASETS.cars.url },
      mark: { type: 'point', size: 50 },
      encoding: {
        x: { field: 'Acceleration', type: 'quantitative' },
        y: { field: 'Miles_per_Gallon', type: 'quantitative' },
        color: { field: 'Origin', type: 'nominal' },
        opacity: { field: 'Horsepower', type: 'quantitative' }
      }
    }
  },
  {
    id: 'nb1-line-stroke',
    title: '4. Custom Dashed Line Properties',
    difficulty: 'Beginner',
    notebookRef: 'Notebook 1: Changing Line Properties',
    datasetId: 'us_employment',
    prompt: 'Plot US construction employment over month:T using mark_line with strokeDash=[10, 50], stroke="black", strokeWidth=5, strokeOpacity=0.5, and size=10.',
    hints: [
      'Pass strokeDash=[10, 50], stroke="black", strokeWidth=5, strokeOpacity=0.5, size=10 inside .mark_line().',
      'Encode alt.X("month:T") and alt.Y("construction:Q").'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\ndf = data.us_employment.url\n\nalt.Chart(df).mark_line(\n    strokeDash=[10, 50],\n    stroke='black',\n    strokeWidth=5,\n    strokeOpacity=0.5,\n    size=10\n).encode(\n    alt.X('month:T'),\n    alt.Y('construction:Q')\n)`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { url: INITIAL_DATASETS.us_employment.url },
      mark: { type: 'line', strokeDash: [10, 50], stroke: 'black', strokeWidth: 5, strokeOpacity: 0.5, size: 10 },
      encoding: {
        x: { field: 'month', type: 'temporal' },
        y: { field: 'construction', type: 'quantitative' }
      }
    }
  },
  {
    id: 'nb1-stocks-predicate',
    title: '5. Transform Calculate & Predicate Filtering',
    difficulty: 'Intermediate',
    notebookRef: 'Notebook 1: Simple Filtering & Predicates',
    datasetId: 'stocks',
    prompt: 'Plot a line chart of stocks (date:T vs price:Q, colored by symbol:N). Calculate year="year(datum.date)" and filter for symbols in ["GOOG", "MSFT"] where year > 2005.',
    hints: [
      'Chain .transform_calculate(year="year(datum.date)") on the chart.',
      'Chain .transform_filter(alt.FieldOneOfPredicate(field="symbol", oneOf=["GOOG", "MSFT"]) & ~(alt.datum.year <= 2005)).'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\ndf = data.stocks.url\n\nalt.Chart(df).mark_line().encode(\n    x='date:T',\n    y='price:Q',\n    color='symbol:N'\n).transform_calculate(\n    year='year(datum.date)'\n).transform_filter(\n    alt.FieldOneOfPredicate(field='symbol', oneOf=['GOOG', 'MSFT'])\n    & ~(alt.datum.year <= 2005)\n)`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { url: INITIAL_DATASETS.stocks.url },
      mark: { type: 'line' },
      encoding: {
        x: { field: 'date', type: 'temporal' },
        y: { field: 'price', type: 'quantitative' },
        color: { field: 'symbol', type: 'nominal' }
      },
      transform: [
        { calculate: 'year(datum.date)', as: 'year' },
        { filter: { and: [{ field: 'symbol', oneOf: ['GOOG', 'MSFT'] }, '(!(datum.year <= 2005))'] } }
      ]
    }
  },
  {
    id: 'nb1-jobs-scale',
    title: '6. Percentage Axis & Custom Color Domain/Range',
    difficulty: 'Intermediate',
    notebookRef: 'Notebook 1: Changing Axes & Color Scales',
    datasetId: 'jobs',
    prompt: 'Filter jobs for job == "Welder". Plot year:O on X and perc:Q on Y with "%" axis format. Map sex:N to color with domain ["men", "women"], range ["green", "blue"], and legend title "Gender".',
    hints: [
      'Use alt.Y("perc:Q", axis=alt.Axis(format="%")) for percentage formatting.',
      'Use alt.Color("sex:N", scale=alt.Scale(domain=["men", "women"], range=["green", "blue"]), legend=alt.Legend(title="Gender")).',
      'Add .transform_filter(alt.datum.job == "Welder").'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\nsource = data.jobs.url\n\nalt.Chart(source).mark_line().encode(\n    alt.X('year:O'),\n    alt.Y('perc:Q', axis=alt.Axis(format='%')),\n    color=alt.Color(\n        'sex:N',\n        scale=alt.Scale(domain=['men', 'women'], range=['green', 'blue']),\n        legend=alt.Legend(title='Gender')\n    )\n).transform_filter(\n    alt.datum.job == 'Welder'\n)`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { url: INITIAL_DATASETS.jobs.url },
      mark: { type: 'line' },
      encoding: {
        x: { field: 'year', type: 'ordinal' },
        y: { field: 'perc', type: 'quantitative', axis: { format: '%' } },
        color: {
          field: 'sex',
          type: 'nominal',
          scale: { domain: ['men', 'women'], range: ['green', 'blue'] },
          legend: { title: 'Gender' }
        }
      },
      transform: [{ filter: "(datum.job === 'Welder')" }]
    }
  },
  {
    id: 'nb1-barley-grouped',
    title: '7. Faceted Grouped Bar Chart (Barley)',
    difficulty: 'Intermediate',
    notebookRef: 'Notebook 1: Grouped/Paired Bar Charts',
    datasetId: 'barley',
    prompt: 'Using barley data, build a grouped bar chart with year:O on X, sum(yield):Q on Y, year:N on color, and faceted into columns by site:N.',
    hints: [
      'Use mark_bar() and encode x="year:O", y="sum(yield):Q".',
      'Add color="year:N" and column="site:N" inside .encode().'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\nsource = data.barley()\n\nalt.Chart(source).mark_bar().encode(\n    x='year:O',\n    y='sum(yield):Q',\n    color='year:N',\n    column='site:N'\n)`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { url: INITIAL_DATASETS.barley.url },
      mark: { type: 'bar' },
      encoding: {
        x: { field: 'year', type: 'ordinal' },
        y: { field: 'yield', aggregate: 'sum', type: 'quantitative' },
        color: { field: 'year', type: 'nominal' },
        column: { field: 'site', type: 'nominal' }
      }
    }
  },
  {
    id: 'nb2-pie-labels',
    title: '8. Superposed Pie Chart with Radial Labels',
    difficulty: 'Intermediate',
    notebookRef: 'Notebook 2: Adding Labels & Reusing Charts',
    datasetId: 'fruit_pie',
    prompt: 'Create a baseChart with theta=alt.Theta("value", stack=True) and descending order on "value". Superpose ch1 (mark_arc colored by fruit:N) and ch2 (mark_text(radius=100) with text="fruit:N").',
    hints: [
      'Define baseChart = alt.Chart(source).encode(theta=alt.Theta("value", stack=True), order=alt.Order("value", sort="descending")).',
      'Create ch1 = baseChart.mark_arc().encode(color="fruit:N") and ch2 = baseChart.mark_text(radius=100).encode(text="fruit:N").',
      'Combine with ch1 + ch2.'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\n\nsource = pd.DataFrame({\n    'fruit': ['orange', 'pear', 'apple', 'lemon', 'plum'],\n    'value': [4, 6, 10, 3, 7]\n})\n\nbaseChart = alt.Chart(source).encode(\n    theta=alt.Theta('value', stack=True),\n    order=alt.Order('value', sort='descending')\n)\n\nch1 = baseChart.mark_arc().encode(\n    color='fruit:N'\n)\n\nch2 = baseChart.mark_text(radius=100).encode(\n    text='fruit:N'\n)\n\nch1 + ch2`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: INITIAL_DATASETS.fruit_pie.rows },
      layer: [
        {
          mark: { type: 'arc' },
          encoding: {
            color: { field: 'fruit', type: 'nominal' },
            order: { field: 'value', sort: 'descending', type: 'quantitative' },
            theta: { field: 'value', stack: true, type: 'quantitative' }
          }
        },
        {
          mark: { type: 'text', radius: 100 },
          encoding: {
            order: { field: 'value', sort: 'descending', type: 'quantitative' },
            text: { field: 'fruit', type: 'nominal' },
            theta: { field: 'value', stack: true, type: 'quantitative' }
          }
        }
      ]
    }
  },
  {
    id: 'nb2-superposition-jobs',
    title: '9. Superposed Jobs with Independent Palettes',
    difficulty: 'Intermediate',
    notebookRef: 'Notebook 2: Multiple Superposed Charts',
    datasetId: 'jobs',
    prompt: 'Create a base line chart (year:O vs perc:Q with "%" format). Layer ch1 (filtered for "Welder", color scheme "accent", legend title "Welder") and ch2 (filtered for "Weaver", scheme "category10", legend title "Weaver") with independent color scales.',
    hints: [
      'Create base = alt.Chart(source).mark_line().encode(alt.X("year:O"), alt.Y("perc:Q", axis=alt.Axis(format="%"))).',
      'Create ch1 and ch2 using base.transform_filter(...).encode(alt.Color("sex:N", scale=alt.Scale(scheme=...), legend=alt.Legend(title=...))).',
      'Combine with (ch1 + ch2).resolve_scale(color="independent").'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\nsource = data.jobs.url\n\nbase = alt.Chart(source).mark_line().encode(\n    alt.X('year:O'),\n    alt.Y('perc:Q', axis=alt.Axis(format='%'))\n)\n\nch1 = base.transform_filter(alt.datum.job == 'Welder').encode(\n    alt.Color('sex:N', scale=alt.Scale(scheme='accent'), legend=alt.Legend(title='Welder'))\n)\n\nch2 = base.transform_filter(alt.datum.job == 'Weaver').encode(\n    alt.Color('sex:N', scale=alt.Scale(scheme='category10'), legend=alt.Legend(title='Weaver'))\n)\n\n(ch1 + ch2).resolve_scale(color='independent')`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { url: INITIAL_DATASETS.jobs.url },
      layer: [
        {
          mark: { type: 'line' },
          encoding: {
            x: { field: 'year', type: 'ordinal' },
            y: { field: 'perc', type: 'quantitative', axis: { format: '%' } },
            color: { field: 'sex', type: 'nominal', scale: { scheme: 'accent' }, legend: { title: 'Welder' } }
          },
          transform: [{ filter: "(datum.job === 'Welder')" }]
        },
        {
          mark: { type: 'line' },
          encoding: {
            x: { field: 'year', type: 'ordinal' },
            y: { field: 'perc', type: 'quantitative', axis: { format: '%' } },
            color: { field: 'sex', type: 'nominal', scale: { scheme: 'category10' }, legend: { title: 'Weaver' } }
          },
          transform: [{ filter: "(datum.job === 'Weaver')" }]
        }
      ],
      resolve: { scale: { color: 'independent' } }
    }
  },
  {
    id: 'nb2-lollipop-eu',
    title: '10. Sorted Lollipop Chart (Europe Population)',
    difficulty: 'Intermediate',
    notebookRef: 'Notebook 2: Lollipop & Superposition',
    datasetId: 'eu_lollipop',
    prompt: 'Layer a thin bar chart (mark_bar(height=2)) and filled points (mark_point(size=50, filled=True, opacity=1.0)) showing population:Q on X, country:N sorted by "-x" on Y, colored by EU_membership:N (domain ["Yes", "No"], range ["teal", "gray"]).',
    hints: [
      'Encode x=alt.X("population:Q", title="Population in Millions") and y=alt.Y("country:N", title="Country", sort="-x").',
      'Use scale=alt.Scale(domain=["Yes", "No"], range=["teal", "gray"]) on alt.Color("EU_membership:N").',
      'Combine with (ch1 + ch2).properties(width=400, title="10 most populated countries in Europe in 2023").'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\n\ndata = pd.DataFrame({\n    'country': ['France', 'Germany', 'UK', 'Italy', 'Spain', 'Poland', 'Ukraine', 'Romania', 'Netherlands', 'Russia'],\n    'population': [65.27, 83.78, 67.88, 60.46, 46.75, 37.8, 43.73, 19.24, 17.13, 145.93],\n    'EU_membership': ['Yes', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'No', 'Yes', 'Yes', 'No']\n})\n\nch1 = alt.Chart(data).mark_bar(height=2).encode(\n    x=alt.X('population:Q', title='Population in Millions'),\n    y=alt.Y('country:N', title='Country', sort='-x'),\n    color=alt.Color('EU_membership:N', scale=alt.Scale(domain=['Yes', 'No'], range=['teal', 'gray']), legend=alt.Legend(title='EU member?'))\n)\n\nch2 = alt.Chart(data).mark_point(size=50, filled=True, opacity=1.0).encode(\n    x=alt.X('population:Q', title='Population in Millions'),\n    y=alt.Y('country:N', title='Country', sort='-x'),\n    color=alt.Color('EU_membership:N', scale=alt.Scale(domain=['Yes', 'No'], range=['teal', 'gray']), legend=alt.Legend(title='EU member?'))\n)\n\n(ch1 + ch2).properties(width=400, title='10 most populated countries in Europe in 2023')`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: INITIAL_DATASETS.eu_lollipop.rows },
      width: 400,
      title: '10 most populated countries in Europe in 2023',
      layer: [
        {
          mark: { type: 'bar', height: 2 },
          encoding: {
            x: { field: 'population', type: 'quantitative', title: 'Population in Millions' },
            y: { field: 'country', type: 'nominal', title: 'Country', sort: '-x' },
            color: { field: 'EU_membership', type: 'nominal', scale: { domain: ['Yes', 'No'], range: ['teal', 'gray'] }, legend: { title: 'EU member?' } }
          }
        },
        {
          mark: { type: 'point', size: 50, filled: true, opacity: 1.0 },
          encoding: {
            x: { field: 'population', type: 'quantitative', title: 'Population in Millions' },
            y: { field: 'country', type: 'nominal', title: 'Country', sort: '-x' },
            color: { field: 'EU_membership', type: 'nominal', scale: { domain: ['Yes', 'No'], range: ['teal', 'gray'] }, legend: { title: 'EU member?' } }
          }
        }
      ]
    }
  },
  {
    id: 'nb2-connected-dot',
    title: '11. Connected Dot Plot (Smoking by Gender)',
    difficulty: 'Advanced',
    notebookRef: 'Notebook 2: Connected Dot Plot',
    datasetId: 'smoking_rates',
    prompt: 'Create a 3-layer connected dot plot: ch3 is a gray line connecting each Country (detail="Country"), ch1 plots teal circles (size=50) filtered for Gender == "M", and ch2 plots lightsalmon circles filtered for Gender == "F" sorted by "-x".',
    hints: [
      'Create ch3 with mark_line(color="gray") and encode X("Smoking rate:Q"), Y("Country:N"), and detail="Country".',
      'Create ch1 (Gender == "M", color="teal") and ch2 (Gender == "F", color="lightsalmon") using mark_circle(opacity=1, size=50) and scale=alt.Scale(domain=(0, 0.6)).',
      'Superpose as ch3 + ch1 + ch2.'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\n\ndata = {\n    'Country': ['Lithuania', 'Cyprus', 'Romania', 'Sweden', 'Finland', 'Lithuania', 'Cyprus', 'Romania', 'Sweden', 'Finland'],\n    'Smoking rate': [0.36, 0.52, 0.31, 0.07, 0.14, 0.13, 0.21, 0.08, 0.06, 0.11],\n    'Gender': ['M', 'M', 'M', 'M', 'M', 'F', 'F', 'F', 'F', 'F']\n}\ndf = pd.DataFrame(data)\n\nch1 = alt.Chart(df).mark_circle(opacity=1, size=50, color='teal').encode(\n    alt.X('Smoking rate:Q', scale=alt.Scale(domain=(0, 0.6))),\n    alt.Y('Country:N', sort='-x')\n).transform_filter(alt.datum.Gender == 'M').properties(title='Smoking population')\n\nch2 = alt.Chart(df).mark_circle(opacity=1, size=50, color='lightsalmon').encode(\n    alt.X('Smoking rate:Q', scale=alt.Scale(domain=(0, 0.6))),\n    alt.Y('Country:N', sort='-x')\n).transform_filter(alt.datum.Gender == 'F').properties(title='Smoking population')\n\nch3 = alt.Chart(df).mark_line(color='gray').encode(\n    alt.X('Smoking rate:Q'),\n    alt.Y('Country:N'),\n    detail='Country'\n).properties(title='Smoking population')\n\nch3 + ch1 + ch2`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: [
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
      ]},
      layer: [
        {
          mark: { type: 'line', color: 'gray' },
          encoding: { x: { field: 'Smoking rate', type: 'quantitative' }, y: { field: 'Country', type: 'nominal' }, detail: { field: 'Country', type: 'nominal' } },
          title: 'Smoking population'
        },
        {
          mark: { type: 'circle', opacity: 1, size: 50, color: 'teal' },
          encoding: { x: { field: 'Smoking rate', type: 'quantitative', scale: { domain: [0, 0.6] } }, y: { field: 'Country', type: 'nominal', sort: '-x' } },
          transform: [{ filter: "(datum.Gender === 'M')" }],
          title: 'Smoking population'
        },
        {
          mark: { type: 'circle', opacity: 1, size: 50, color: 'lightsalmon' },
          encoding: { x: { field: 'Smoking rate', type: 'quantitative', scale: { domain: [0, 0.6] } }, y: { field: 'Country', type: 'nominal', sort: '-x' } },
          transform: [{ filter: "(datum.Gender === 'F')" }],
          title: 'Smoking population'
        }
      ]
    }
  },
  {
    id: 'nb2-regression-cars',
    title: '12. Linear & Polynomial Regression Layers',
    difficulty: 'Advanced',
    notebookRef: 'Notebook 2: Adding Regression Lines',
    datasetId: 'cars',
    prompt: 'Create a circle scatterplot of Horsepower:Q vs Miles_per_Gallon:Q colored by Origin:N. Superpose a teal linear regression line and a crimson 2nd-order polynomial regression line.',
    hints: [
      'Create base ch = alt.Chart(cars).mark_circle().encode(alt.X("Horsepower:Q"), alt.Y("Miles_per_Gallon:Q")).',
      'Use ch.transform_regression("Horsepower", "Miles_per_Gallon").mark_line(color="teal") for linear.',
      'Use ch.transform_regression("Horsepower", "Miles_per_Gallon", method="poly", order=2).mark_line(color="crimson") for polynomial.'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\ncars = data.cars.url\n\nch = alt.Chart(cars).mark_circle().encode(\n    alt.X('Horsepower:Q', title='Horsepower'),\n    alt.Y('Miles_per_Gallon:Q', title='Miles per Gallon')\n)\n\nlinear_regression = ch.transform_regression(\n    'Horsepower',\n    'Miles_per_Gallon'\n).mark_line(color='teal')\n\npolygonal_regression = ch.transform_regression(\n    'Horsepower',\n    'Miles_per_Gallon',\n    method='poly',\n    order=2\n).mark_line(color='crimson')\n\n(ch.encode(alt.Color('Origin:N')) + linear_regression + polygonal_regression)`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { url: INITIAL_DATASETS.cars.url },
      layer: [
        {
          mark: { type: 'circle' },
          encoding: {
            x: { field: 'Horsepower', type: 'quantitative', title: 'Horsepower' },
            y: { field: 'Miles_per_Gallon', type: 'quantitative', title: 'Miles per Gallon' },
            color: { field: 'Origin', type: 'nominal' }
          }
        },
        {
          mark: { type: 'line', color: 'teal' },
          encoding: {
            x: { field: 'Horsepower', type: 'quantitative', title: 'Horsepower' },
            y: { field: 'Miles_per_Gallon', type: 'quantitative', title: 'Miles per Gallon' }
          },
          transform: [{ regression: 'Miles_per_Gallon', on: 'Horsepower' }]
        },
        {
          mark: { type: 'line', color: 'crimson' },
          encoding: {
            x: { field: 'Horsepower', type: 'quantitative', title: 'Horsepower' },
            y: { field: 'Miles_per_Gallon', type: 'quantitative', title: 'Miles per Gallon' }
          },
          transform: [{ regression: 'Miles_per_Gallon', on: 'Horsepower', method: 'poly', order: 2 }]
        }
      ]
    }
  },
  {
    id: 'nb2-bump-tennis',
    title: '13. Bump Chart with Window Ranking (Catalan Tennis)',
    difficulty: 'Advanced',
    notebookRef: 'Notebook 2: Window Transform & Bump Chart',
    datasetId: 'catalan_tennis',
    prompt: 'Use transform_window(rank="row_number()", groupby=["year"]) sorted by points descending and item ascending. Plot mark_line(point=True) with year:O on X, rank:Q (reversed domain [1, 5]) on Y, and item:N on Color.',
    hints: [
      'Use .transform_window(rank="row_number()", sort=[alt.SortField("points", order="descending"), alt.SortField("item", order="ascending")], groupby=["year"]).',
      'Encode alt.Y("rank:Q", scale=alt.Scale(domain=[1, 5], reverse=True, nice=False, zero=False)).',
      'Chain .configure_mark(strokeWidth=3).configure_point(size=60).'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\n\nrows = [\n    {"year": 2018, "item": "Maria", "points": 40}, {"year": 2018, "item": "Laura", "points": 58}, {"year": 2018, "item": "Anna", "points": 79}, {"year": 2018, "item": "Joana", "points": 84}, {"year": 2018, "item": "Montse", "points": 88},\n    {"year": 2019, "item": "Maria", "points": 40}, {"year": 2019, "item": "Laura", "points": 84}, {"year": 2019, "item": "Anna", "points": 49}, {"year": 2019, "item": "Joana", "points": 86}, {"year": 2019, "item": "Montse", "points": 96},\n    {"year": 2020, "item": "Maria", "points": 74}, {"year": 2020, "item": "Laura", "points": 88}, {"year": 2020, "item": "Anna", "points": 83}, {"year": 2020, "item": "Joana", "points": 45}, {"year": 2020, "item": "Montse", "points": 61},\n    {"year": 2021, "item": "Maria", "points": 56}, {"year": 2021, "item": "Laura", "points": 81}, {"year": 2021, "item": "Anna", "points": 51}, {"year": 2021, "item": "Joana", "points": 82}, {"year": 2021, "item": "Montse", "points": 72},\n    {"year": 2022, "item": "Maria", "points": 80}, {"year": 2022, "item": "Laura", "points": 76}, {"year": 2022, "item": "Anna", "points": 45}, {"year": 2022, "item": "Joana", "points": 68}, {"year": 2022, "item": "Montse", "points": 83},\n    {"year": 2023, "item": "Maria", "points": 69}, {"year": 2023, "item": "Laura", "points": 89}, {"year": 2023, "item": "Anna", "points": 86}, {"year": 2023, "item": "Joana", "points": 82}, {"year": 2023, "item": "Montse", "points": 92},\n    {"year": 2024, "item": "Maria", "points": 88}, {"year": 2024, "item": "Laura", "points": 71}, {"year": 2024, "item": "Anna", "points": 47}, {"year": 2024, "item": "Joana", "points": 68}, {"year": 2024, "item": "Montse", "points": 87}\n]\ndf = pd.DataFrame(rows)\n\nranks = alt.Chart(df).transform_window(\n    rank='row_number()',\n    sort=[\n        alt.SortField('points', order='descending'),\n        alt.SortField('item', order='ascending')\n    ],\n    groupby=['year']\n)\n\nranks.mark_line(point=True).encode(\n    alt.X('year:O', title=None),\n    alt.Y('rank:Q', scale=alt.Scale(domain=[1, 5], reverse=True, nice=False, zero=False), axis=alt.Axis(values=[1, 2, 3, 4, 5], title='Rank')),\n    alt.Color('item:N', title='Players'),\n    tooltip=['year:O', 'item:N', 'points:Q', 'rank:Q']\n).properties(width=500, height=280, title='Best Catalan tennis players').configure_mark(strokeWidth=3).configure_point(size=60)`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      config: { mark: { strokeWidth: 3 }, point: { size: 60 } },
      width: 500,
      height: 280,
      title: 'Best Catalan tennis players',
      data: { values: [
        {"year": 2018, "item": "Maria", "points": 40}, {"year": 2018, "item": "Laura", "points": 58}, {"year": 2018, "item": "Anna", "points": 79}, {"year": 2018, "item": "Joana", "points": 84}, {"year": 2018, "item": "Montse", "points": 88},
        {"year": 2019, "item": "Maria", "points": 40}, {"year": 2019, "item": "Laura", "points": 84}, {"year": 2019, "item": "Anna", "points": 49}, {"year": 2019, "item": "Joana", "points": 86}, {"year": 2019, "item": "Montse", "points": 96},
        {"year": 2020, "item": "Maria", "points": 74}, {"year": 2020, "item": "Laura", "points": 88}, {"year": 2020, "item": "Anna", "points": 83}, {"year": 2020, "item": "Joana", "points": 45}, {"year": 2020, "item": "Montse", "points": 61},
        {"year": 2021, "item": "Maria", "points": 56}, {"year": 2021, "item": "Laura", "points": 81}, {"year": 2021, "item": "Anna", "points": 51}, {"year": 2021, "item": "Joana", "points": 82}, {"year": 2021, "item": "Montse", "points": 72},
        {"year": 2022, "item": "Maria", "points": 80}, {"year": 2022, "item": "Laura", "points": 76}, {"year": 2022, "item": "Anna", "points": 45}, {"year": 2022, "item": "Joana", "points": 68}, {"year": 2022, "item": "Montse", "points": 83},
        {"year": 2023, "item": "Maria", "points": 69}, {"year": 2023, "item": "Laura", "points": 89}, {"year": 2023, "item": "Anna", "points": 86}, {"year": 2023, "item": "Joana", "points": 82}, {"year": 2023, "item": "Montse", "points": 92},
        {"year": 2024, "item": "Maria", "points": 88}, {"year": 2024, "item": "Laura", "points": 71}, {"year": 2024, "item": "Anna", "points": 47}, {"year": 2024, "item": "Joana", "points": 68}, {"year": 2024, "item": "Montse", "points": 87}
      ]},
      mark: { type: 'line', point: true },
      encoding: {
        x: { field: 'year', type: 'ordinal', title: null },
        y: { field: 'rank', type: 'quantitative', scale: { domain: [1, 5], reverse: true, nice: false, zero: false }, axis: { values: [1, 2, 3, 4, 5], title: 'Rank' } },
        color: { field: 'item', type: 'nominal', title: 'Players' },
        tooltip: [{ field: 'year', type: 'ordinal' }, { field: 'item', type: 'nominal' }, { field: 'points', type: 'quantitative' }, { field: 'rank', type: 'quantitative' }]
      },
      transform: [{
        window: [{ op: 'row_number', field: '', as: 'rank' }],
        groupby: ['year'],
        sort: [{ field: 'points', order: 'descending' }, { field: 'item', order: 'ascending' }]
      }]
    }
  },
  {
    id: 'nb2-priestley-range',
    title: '14. Priestley Range Chart (X & X2 with Text Offsets)',
    difficulty: 'Advanced',
    notebookRef: 'Notebook 2: Priestley Chart',
    datasetId: 'priestley_income',
    prompt: 'Build a Priestley range bar chart encoding min(Income):Q on X (domain 1000 to 2800), max(Income):Q on X2, and Month:N on Y & Color. Superpose min text labels (xOffset=-20) and max text labels (xOffset=20).',
    hints: [
      'In ch1, use mark_bar() with alt.X("min(Income):Q", scale=alt.Scale(domain=(1000, 2800))) and alt.X2("max(Income):Q").',
      'Create ch2Min with mark_text(xOffset=-20) encoding min(Income):Q on X and Text.',
      'Create ch2Max with mark_text(xOffset=20) encoding max(Income):Q on X and Text, then combine ch1 + ch2Min + ch2Max.'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\n\ndata = [\n    {"Month": "Jan", "Income": 1651, "Year": 2024, "Day": 1}, {"Month": "Jan", "Income": 2118, "Year": 2024, "Day": 1},\n    {"Month": "Feb", "Income": 2036, "Year": 2024, "Day": 1}, {"Month": "Feb", "Income": 1562, "Year": 2024, "Day": 1},\n    {"Month": "Mar", "Income": 1518, "Year": 2024, "Day": 1}, {"Month": "Mar", "Income": 2203, "Year": 2024, "Day": 1},\n    {"Month": "Apr", "Income": 2012, "Year": 2024, "Day": 1}, {"Month": "Apr", "Income": 2054, "Year": 2024, "Day": 1},\n    {"Month": "May", "Income": 2248, "Year": 2024, "Day": 1}, {"Month": "May", "Income": 1613, "Year": 2024, "Day": 1},\n    {"Month": "Jun", "Income": 1900, "Year": 2024, "Day": 1}, {"Month": "Jun", "Income": 1768, "Year": 2024, "Day": 1},\n    {"Month": "Jul", "Income": 2274, "Year": 2024, "Day": 1}, {"Month": "Jul", "Income": 2171, "Year": 2024, "Day": 1},\n    {"Month": "Aug", "Income": 2392, "Year": 2024, "Day": 1}, {"Month": "Aug", "Income": 2343, "Year": 2024, "Day": 1},\n    {"Month": "Sep", "Income": 1930, "Year": 2024, "Day": 1}, {"Month": "Sep", "Income": 2201, "Year": 2024, "Day": 1},\n    {"Month": "Oct", "Income": 2375, "Year": 2024, "Day": 1}, {"Month": "Oct", "Income": 1623, "Year": 2024, "Day": 1},\n    {"Month": "Nov", "Income": 2095, "Year": 2024, "Day": 1}, {"Month": "Nov", "Income": 2065, "Year": 2024, "Day": 1},\n    {"Month": "Dec", "Income": 2197, "Year": 2024, "Day": 1}, {"Month": "Dec", "Income": 1561, "Year": 2024, "Day": 1}\n]\ndf = pd.DataFrame(data)\nmonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']\n\nch1 = alt.Chart(df).mark_bar().encode(\n    alt.X('min(Income):Q', title='Income', scale=alt.Scale(domain=(1000, 2800))),\n    alt.X2('max(Income):Q'),\n    alt.Y('Month:N', sort=months),\n    alt.Color('Month:N', scale=alt.Scale(scheme='category20'))\n).properties(title='Priestley chart')\n\nch2Min = alt.Chart(df).mark_text(xOffset=-20).encode(\n    alt.X('min(Income):Q'),\n    alt.Y('Month:N', sort=months),\n    alt.Text('min(Income):Q')\n)\n\nch2Max = alt.Chart(df).mark_text(xOffset=20).encode(\n    alt.X('max(Income):Q'),\n    alt.Y('Month:N', sort=months),\n    alt.Text('max(Income):Q')\n)\n\nch1 + ch2Min + ch2Max`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: [
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
      ]},
      layer: [
        {
          mark: { type: 'bar' },
          encoding: {
            x: { field: 'Income', aggregate: 'min', type: 'quantitative', title: 'Income', scale: { domain: [1000, 2800] } },
            x2: { field: 'Income', aggregate: 'max' },
            y: { field: 'Month', type: 'nominal', sort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
            color: { field: 'Month', type: 'nominal', scale: { scheme: 'category20' } }
          },
          title: 'Priestley chart'
        },
        {
          mark: { type: 'text', xOffset: -20 },
          encoding: {
            x: { field: 'Income', aggregate: 'min', type: 'quantitative' },
            y: { field: 'Month', type: 'nominal', sort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
            text: { field: 'Income', aggregate: 'min', type: 'quantitative' }
          }
        },
        {
          mark: { type: 'text', xOffset: 20 },
          encoding: {
            x: { field: 'Income', aggregate: 'max', type: 'quantitative' },
            y: { field: 'Month', type: 'nominal', sort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
            text: { field: 'Income', aggregate: 'max', type: 'quantitative' }
          }
        }
      ]
    }
  },
  {
    id: 'nb2-us-airports-map',
    title: '15. US Airports Geo Dot Map (albersUsa)',
    difficulty: 'Advanced',
    notebookRef: 'Notebook 2: Dot Maps',
    datasetId: 'airports_us',
    prompt: 'Layer a US states geoshape map (fill="lightgray", stroke="white", project="albersUsa") with an aggregated circle layer of airports grouped by state (mean(latitude), mean(longitude), count()).',
    hints: [
      'Create usChart = alt.Chart(map).mark_geoshape(fill="lightgray", stroke="white").properties(width=500, height=300).project("albersUsa").',
      'On airportsMap, use .transform_aggregate(latitude="mean(latitude)", longitude="mean(longitude)", count="count()", groupby=["state"]).',
      'Encode longitude:Q, latitude:Q, size=alt.Size("count:Q"), color=alt.value("steelblue"), and superpose usChart + airportsMap.'
    ],
    solutionCode: `import altair as alt\nfrom vega_datasets import data\n\nmap = alt.topo_feature(data.us_10m.url, feature='states')\n\nusChart = alt.Chart(map).mark_geoshape(\n    fill='lightgray',\n    stroke='white'\n).properties(\n    width=500,\n    height=300\n).project('albersUsa')\n\nairports = data.airports.url\n\nairportsMap = alt.Chart(airports, title='Number of airports in US').transform_aggregate(\n    latitude='mean(latitude)',\n    longitude='mean(longitude)',\n    count='count()',\n    groupby=['state']\n).mark_circle().encode(\n    longitude='longitude:Q',\n    latitude='latitude:Q',\n    size=alt.Size('count:Q', title='Number of Airports'),\n    color=alt.value('steelblue'),\n    tooltip=['state:N', 'count:Q']\n)\n\nusChart + airportsMap`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 500,
      height: 300,
      layer: [
        {
          data: { url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/us-10m.json', format: { type: 'topojson', feature: 'states' } },
          mark: { type: 'geoshape', fill: 'lightgray', stroke: 'white' },
          projection: { type: 'albersUsa' }
        },
        {
          data: { url: 'https://cdn.jsdelivr.net/npm/vega-datasets@v1.29.0/data/airports.csv' },
          title: 'Number of airports in US',
          transform: [{
            aggregate: [
              { op: 'mean', field: 'latitude', as: 'latitude' },
              { op: 'mean', field: 'longitude', as: 'longitude' },
              { op: 'count', as: 'count' }
            ],
            groupby: ['state']
          }],
          mark: { type: 'circle' },
          encoding: {
            longitude: { field: 'longitude', type: 'quantitative' },
            latitude: { field: 'latitude', type: 'quantitative' },
            size: { field: 'count', type: 'quantitative', title: 'Number of Airports' },
            color: { value: 'steelblue' },
            tooltip: [{ field: 'state', type: 'nominal' }, { field: 'count', type: 'quantitative' }]
          }
        }
      ]
    }
  },
  {
    id: 'nb2-parallel-coords',
    title: '16. Normalized Parallel Coordinates (Cars)',
    difficulty: 'Advanced',
    notebookRef: 'Notebook 2: Parallel Coordinate Plots',
    datasetId: 'cars',
    prompt: 'Create a normalized parallel coordinates plot of cars across ["Weight_in_lbs", "Miles_per_Gallon", "Cylinders", "Displacement", "Horsepower", "Acceleration"] using transform_window, transform_fold, transform_joinaggregate, and transform_calculate.',
    hints: [
      'Chain .transform_window(index="count()") and .transform_fold(["Weight_in_lbs", "Miles_per_Gallon", "Cylinders", "Displacement", "Horsepower", "Acceleration"]).',
      'Use .transform_joinaggregate(min="min(value)", max="max(value)", groupby=["key"]) and .transform_calculate(minmax_value="(datum.value - datum.min) / (datum.max - datum.min)").',
      'Encode X("key:N"), Y("minmax_value:Q"), Color("Origin:N"), Detail("index:N"), Opacity(alt.value(0.25)).'
    ],
    solutionCode: `import altair as alt\nimport pandas as pd\nfrom vega_datasets import data\n\ncars = data.cars.url\n\nalt.Chart(cars).mark_line().transform_window(\n    index='count()'\n).transform_fold(\n    ['Weight_in_lbs', 'Miles_per_Gallon', 'Cylinders', 'Displacement', 'Horsepower', 'Acceleration']\n).transform_filter(\n    'isValid(datum.value) && isFinite(datum.value)'\n).transform_joinaggregate(\n    min='min(value)',\n    max='max(value)',\n    groupby=['key']\n).transform_calculate(\n    minmax_value='(datum.value - datum.min) / (datum.max - datum.min)'\n).encode(\n    alt.X('key:N', title=None, axis=alt.Axis(labelAngle=-45)),\n    alt.Y('minmax_value:Q', title='Value'),\n    alt.Color('Origin:N'),\n    alt.Detail('index:N'),\n    opacity=alt.value(0.25)\n).properties(width=500)`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { url: INITIAL_DATASETS.cars.url },
      width: 500,
      mark: { type: 'line' },
      transform: [
        { window: [{ op: 'count', as: 'index' }] },
        { fold: ['Weight_in_lbs', 'Miles_per_Gallon', 'Cylinders', 'Displacement', 'Horsepower', 'Acceleration'] },
        { filter: 'isValid(datum.value) && isFinite(datum.value)' },
        { joinaggregate: [{ op: 'min', field: 'value', as: 'min' }, { op: 'max', field: 'value', as: 'max' }], groupby: ['key'] },
        { calculate: '(datum.value - datum.min) / (datum.max - datum.min)', as: 'minmax_value' }
      ],
      encoding: {
        x: { field: 'key', type: 'nominal', title: null, axis: { labelAngle: -45 } },
        y: { field: 'minmax_value', type: 'quantitative', title: 'Value' },
        color: { field: 'Origin', type: 'nominal' },
        detail: { field: 'index', type: 'nominal' },
        opacity: { value: 0.25 }
      }
    }
  }
];

// ============================================================================
// 3. ALTAIR 5.5 LIBRARY AUTOCOMPLETE KEYWORDS
// ============================================================================
const ALTAIR_SUGGESTIONS = [
  { label: 'alt.Chart', insert: 'alt.Chart(', detail: 'Chart(data=...) — Primary Altair chart constructor' },
  { label: 'mark_bar', insert: 'mark_bar()', detail: 'Bar mark (supports width, height, opacity, color)' },
  { label: 'mark_point', insert: 'mark_point()', detail: 'Point mark (supports shape, filled, size, opacity)' },
  { label: 'mark_circle', insert: 'mark_circle()', detail: 'Filled circle mark (supports size, opacity, color)' },
  { label: 'mark_line', insert: 'mark_line()', detail: 'Line mark (supports point, strokeDash, strokeWidth, stroke)' },
  { label: 'mark_area', insert: 'mark_area()', detail: 'Area mark (supports opacity, line)' },
  { label: 'mark_rule', insert: 'mark_rule()', detail: 'Rule / reference line mark' },
  { label: 'mark_text', insert: 'mark_text()', detail: 'Text label mark (supports dx, dy, xOffset, radius, size)' },
  { label: 'mark_arc', insert: 'mark_arc()', detail: 'Arc mark for pie and radial charts' },
  { label: 'mark_geoshape', insert: 'mark_geoshape()', detail: 'Geographic shape mark for TopoJSON/GeoJSON maps' },
  { label: 'encode', insert: 'encode(\n    \n)', detail: 'Map visual channels (X, Y, Color, Size, Opacity, Tooltip...)' },
  { label: 'alt.X', insert: "alt.X('')", detail: 'Primary horizontal position channel' },
  { label: 'alt.X2', insert: "alt.X2('')", detail: 'Secondary horizontal position for ranged marks (bar/rule)' },
  { label: 'alt.Y', insert: "alt.Y('')", detail: 'Primary vertical position channel' },
  { label: 'alt.Y2', insert: "alt.Y2('')", detail: 'Secondary vertical position for ranged marks' },
  { label: 'alt.Color', insert: "alt.Color('')", detail: 'Color encoding channel (supports scale, legend)' },
  { label: 'alt.Size', insert: "alt.Size('')", detail: 'Mark size/area encoding channel' },
  { label: 'alt.Opacity', insert: "alt.Opacity('')", detail: 'Mark opacity encoding channel' },
  { label: 'alt.Text', insert: "alt.Text('')", detail: 'Text value channel for mark_text' },
  { label: 'alt.Theta', insert: "alt.Theta('')", detail: 'Angular channel for mark_arc pie charts' },
  { label: 'alt.Order', insert: "alt.Order('', sort='descending')", detail: 'Stack/pie segment ordering channel' },
  { label: 'alt.Row', insert: "alt.Row('')", detail: 'Row facet encoding for small multiples' },
  { label: 'alt.Column', insert: "alt.Column('')", detail: 'Column facet encoding for grouped/juxtaposed views' },
  { label: 'alt.Scale', insert: 'alt.Scale()', detail: 'Configure domain, range, scheme, reverse, zero' },
  { label: 'alt.Axis', insert: 'alt.Axis()', detail: 'Configure format, labels, ticks, values, labelAngle' },
  { label: 'alt.Legend', insert: "alt.Legend(title='')", detail: 'Configure legend title and placement' },
  { label: 'transform_filter', insert: 'transform_filter()', detail: 'Filter data rows using alt.datum or predicates' },
  { label: 'transform_calculate', insert: 'transform_calculate()', detail: 'Derive new fields via Vega expressions' },
  { label: 'transform_aggregate', insert: 'transform_aggregate()', detail: 'Group and aggregate fields in-chart' },
  { label: 'transform_window', insert: 'transform_window()', detail: 'Compute window functions like row_number() or rank()' },
  { label: 'transform_regression', insert: 'transform_regression()', detail: 'Compute linear or polynomial regression lines' },
  { label: 'transform_lookup', insert: 'transform_lookup()', detail: 'Join secondary datasets or TopoJSON ids' },
  { label: 'transform_fold', insert: 'transform_fold([])', detail: 'Convert wide-form columns into key/value long form' },
  { label: 'transform_joinaggregate', insert: 'transform_joinaggregate()', detail: 'Append group-level min/max/sum without collapsing rows' },
  { label: 'alt.FieldOneOfPredicate', insert: "alt.FieldOneOfPredicate(field='', oneOf=[])", detail: 'Filter field matching a list of values' },
  { label: 'resolve_scale', insert: "resolve_scale(color='independent')", detail: 'Make color/position scales independent across layers' },
  { label: 'properties', insert: 'properties()', detail: 'Set chart title, width, and height' },
  { label: 'project', insert: "project('albersUsa')", detail: 'Set geographic map projection (albersUsa, mercator...)' },
  { label: 'configure_view', insert: 'configure_view(strokeWidth=0, strokeOpacity=0)', detail: 'Configure chart border and view box' },
  { label: 'configure_axis', insert: 'configure_axis(grid=False)', detail: 'Configure global axis properties like gridlines' }
];

// ============================================================================
// 4. PROCEDURAL CHALLENGE GENERATOR & SPEC GRADER
// ============================================================================
function generateProceduralChallenge(dataset, difficulty) {
  const quantCols = dataset.columns.filter(c => c.type === 'Q');
  const catCols = dataset.columns.filter(c => c.type === 'N' || c.type === 'O');
  const timeCols = dataset.columns.filter(c => c.type === 'T' || c.type === 'O');

  const q1 = quantCols[0] || dataset.columns[0];
  const c1 = catCols[0] || dataset.columns[0];
  const t1 = timeCols[0] || c1;
  const dataObj = dataset.sourceType === 'vega_url' ? { url: dataset.url } : { values: dataset.rows };

  if (difficulty === 'Beginner') {
    const marks = ['bar', 'circle', 'point', 'area'];
    const mark = marks[Math.floor(Math.random() * marks.length)];
    return {
      id: `proc-beg-${Date.now()}`,
      title: `Generated Beginner: ${mark.toUpperCase()} on ${dataset.name.split(' ')[0]}`,
      difficulty: 'Beginner',
      notebookRef: 'Procedural Generator (Part 1 Style)',
      datasetId: dataset.id,
      prompt: `Using ${dataset.varName}, create a mark_${mark}() chart encoding '${c1.name}:${c1.type}' on X, '${q1.name}:Q' on Y, and '${c1.name}:${c1.type}' on Color.`,
      hints: [
        `Start with alt.Chart(${dataset.varName}).mark_${mark}()`,
        `Inside .encode(), set alt.X('${c1.name}:${c1.type}'), alt.Y('${q1.name}:Q'), and alt.Color('${c1.name}:${c1.type}').`
      ],
      solutionCode: `${dataset.importCode}\nalt.Chart(${dataset.varName}).mark_${mark}().encode(\n    alt.X('${c1.name}:${c1.type}'),\n    alt.Y('${q1.name}:Q'),\n    alt.Color('${c1.name}:${c1.type}')\n)`,
      targetSpec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        data: dataObj,
        mark: { type: mark },
        encoding: {
          x: { field: c1.name, type: c1.type === 'O' ? 'ordinal' : 'nominal' },
          y: { field: q1.name, type: 'quantitative' },
          color: { field: c1.name, type: c1.type === 'O' ? 'ordinal' : 'nominal' }
        }
      }
    };
  }

  if (difficulty === 'Intermediate') {
    return {
      id: `proc-int-${Date.now()}`,
      title: `Generated Intermediate: Sorted Mean Bar on ${dataset.name.split(' ')[0]}`,
      difficulty: 'Intermediate',
      notebookRef: 'Procedural Generator (Aggregations & Sorting)',
      datasetId: dataset.id,
      prompt: `Using ${dataset.varName}, create a horizontal bar chart (mark_bar) with 'mean(${q1.name}):Q' on X, '${c1.name}:${c1.type}' sorted by '-x' on Y, and '${c1.name}:${c1.type}' on Color with scheme='set2'.`,
      hints: [
        `Use alt.X('mean(${q1.name}):Q') and alt.Y('${c1.name}:${c1.type}', sort='-x').`,
        `Map alt.Color('${c1.name}:${c1.type}', scale=alt.Scale(scheme='set2')).`
      ],
      solutionCode: `${dataset.importCode}\nalt.Chart(${dataset.varName}).mark_bar().encode(\n    alt.X('mean(${q1.name}):Q'),\n    alt.Y('${c1.name}:${c1.type}', sort='-x'),\n    alt.Color('${c1.name}:${c1.type}', scale=alt.Scale(scheme='set2'))\n)`,
      targetSpec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        data: dataObj,
        mark: { type: 'bar' },
        encoding: {
          x: { field: q1.name, aggregate: 'mean', type: 'quantitative' },
          y: { field: c1.name, type: c1.type === 'O' ? 'ordinal' : 'nominal', sort: '-x' },
          color: { field: c1.name, type: c1.type === 'O' ? 'ordinal' : 'nominal', scale: { scheme: 'set2' } }
        }
      }
    };
  }

  return {
    id: `proc-adv-${Date.now()}`,
    title: `Generated Advanced: Superposed Layers on ${dataset.name.split(' ')[0]}`,
    difficulty: 'Advanced',
    notebookRef: 'Procedural Generator (Part 2 Superposition)',
    datasetId: dataset.id,
    prompt: `Using ${dataset.varName}, superpose two layers (ch1 + ch2): ch1 is a bar chart (opacity=0.4) of '${t1.name}:${t1.type}' vs 'mean(${q1.name}):Q', and ch2 is a crimson line mark with points (mark_line(point=True, color='crimson')) over the same encodings.`,
    hints: [
      `Define ch1 = alt.Chart(${dataset.varName}).mark_bar(opacity=0.4).encode(alt.X('${t1.name}:${t1.type}'), alt.Y('mean(${q1.name}):Q'))`,
      `Define ch2 = alt.Chart(${dataset.varName}).mark_line(point=True, color='crimson').encode(alt.X('${t1.name}:${t1.type}'), alt.Y('mean(${q1.name}):Q'))`,
      `Combine both using ch1 + ch2.`
    ],
    solutionCode: `${dataset.importCode}\nch1 = alt.Chart(${dataset.varName}).mark_bar(opacity=0.4).encode(\n    alt.X('${t1.name}:${t1.type}'),\n    alt.Y('mean(${q1.name}):Q')\n)\n\nch2 = alt.Chart(${dataset.varName}).mark_line(point=True, color='crimson').encode(\n    alt.X('${t1.name}:${t1.type}'),\n    alt.Y('mean(${q1.name}):Q')\n)\n\nch1 + ch2`,
    targetSpec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: dataObj,
      layer: [
        {
          mark: { type: 'bar', opacity: 0.4 },
          encoding: {
            x: { field: t1.name, type: t1.type === 'T' ? 'temporal' : t1.type === 'O' ? 'ordinal' : 'nominal' },
            y: { field: q1.name, aggregate: 'mean', type: 'quantitative' }
          }
        },
        {
          mark: { type: 'line', point: true, color: 'crimson' },
          encoding: {
            x: { field: t1.name, type: t1.type === 'T' ? 'temporal' : t1.type === 'O' ? 'ordinal' : 'nominal' },
            y: { field: q1.name, aggregate: 'mean', type: 'quantitative' }
          }
        }
      ]
    }
  };
}

function gradeVegaSpecs(userSpec, targetSpec) {
  if (!userSpec || !targetSpec) return { score: 0, checks: [] };
  const checks = [];
  let earned = 0;
  let total = 0;

  total += 25;
  const targetIsLayer = Array.isArray(targetSpec.layer);
  const userIsLayer = Array.isArray(userSpec.layer);
  const targetIsHConcat = Array.isArray(targetSpec.hconcat);
  const userIsHConcat = Array.isArray(userSpec.hconcat);

  if (targetIsLayer) {
    if (userIsLayer && userSpec.layer.length === targetSpec.layer.length) {
      earned += 25;
      checks.push({ label: `Multi-layer superposition (${targetSpec.layer.length} layers)`, passed: true });
    } else {
      checks.push({ label: `Expected ${targetSpec.layer.length} superposed layers (+)`, passed: false });
    }
  } else if (targetIsHConcat) {
    if (userIsHConcat) {
      earned += 25;
      checks.push({ label: 'Juxtaposed horizontal layout (|)', passed: true });
    } else {
      checks.push({ label: 'Expected horizontal concatenation (|)', passed: false });
    }
  } else {
    const tMark = typeof targetSpec.mark === 'string' ? targetSpec.mark : targetSpec.mark?.type;
    const uMark = typeof userSpec.mark === 'string' ? userSpec.mark : userSpec.mark?.type;
    if (tMark === uMark) {
      earned += 25;
      checks.push({ label: `Mark type matches (${tMark})`, passed: true });
    } else {
      checks.push({ label: `Mark type (expected '${tMark}', got '${uMark || 'none'}')`, passed: false });
    }
  }

  const tEnc = targetIsLayer ? targetSpec.layer[0].encoding || {} : targetSpec.encoding || {};
  const uEnc = userIsLayer ? (userSpec.layer?.[0]?.encoding || {}) : (userSpec.encoding || {});

  Object.keys(tEnc).forEach(channel => {
    total += 20;
    const tField = tEnc[channel]?.field || tEnc[channel]?.value;
    const uField = uEnc[channel]?.field || uEnc[channel]?.value;
    const tAgg = tEnc[channel]?.aggregate;
    const uAgg = uEnc[channel]?.aggregate;

    if (tField === uField && tAgg === uAgg) {
      earned += 20;
      checks.push({ label: `Channel '${channel}' maps '${tAgg ? `${tAgg}(${tField})` : tField}'`, passed: true });
    } else {
      checks.push({ label: `Channel '${channel}' (expected '${tAgg ? `${tAgg}(${tField})` : tField}')`, passed: false });
    }
  });

  const tTrans = targetSpec.transform || (targetIsLayer ? targetSpec.layer.flatMap(l => l.transform || []) : []);
  const uTrans = userSpec.transform || (userIsLayer ? (userSpec.layer || []).flatMap(l => l.transform || []) : []);

  if (tTrans.length > 0) {
    total += 20;
    if (uTrans.length >= tTrans.length) {
      earned += 20;
      checks.push({ label: `Data transformations applied (${tTrans.length})`, passed: true });
    } else {
      checks.push({ label: `Missing transform_filter / window / calculate (${uTrans.length}/${tTrans.length})`, passed: false });
    }
  }

  const score = total > 0 ? Math.min(100, Math.round((earned / total) * 100)) : 0;
  return { score, checks };
}

// ============================================================================
// 5. MAIN APPLICATION
// ============================================================================
export default function App() {
  const [datasets, setDatasets] = useState(INITIAL_DATASETS);
  const [challenges, setChallenges] = useState(CURATED_CHALLENGES);
  const [activeChallengeId, setActiveChallengeId] = useState(CURATED_CHALLENGES[0].id);
  const [starterMode, setStarterMode] = useState('imports'); // 'imports' | 'blank'
  const [code, setCode] = useState(INITIAL_DATASETS[CURATED_CHALLENGES[0].datasetId].importCode + '\n');
  const [unlockedHints, setUnlockedHints] = useState(0);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState('Loading Python (Pyodide + Altair 5.5)...');
  const [userSpec, setUserSpec] = useState(null);
  const [pythonError, setPythonError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDataName, setCustomDataName] = useState('');
  const [customCsvText, setCustomCsvText] = useState('category,score,group\nA,42,North\nB,67,South\nC,51,North\nD,89,South');

  const pyodideRef = useRef(null);
  const targetPlotRef = useRef(null);
  const userPlotRef = useRef(null);

  const activeChallenge = useMemo(
    () => challenges.find(c => c.id === activeChallengeId) || challenges[0],
    [challenges, activeChallengeId]
  );

  const activeDataset = useMemo(
    () => datasets[activeChallenge.datasetId] || datasets.cars,
    [datasets, activeChallenge]
  );

  // Reset editor to blank or imports-only when challenge or starterMode changes
  useEffect(() => {
    const ds = datasets[activeChallenge.datasetId];
    setCode(starterMode === 'blank' ? '' : (ds ? ds.importCode + '\n' : 'import altair as alt\nimport pandas as pd\n\n'));
    setUnlockedHints(0);
    setUserSpec(null);
    setPythonError(null);
  }, [activeChallengeId, starterMode, activeChallenge.datasetId, datasets]);

  // Initialize Pyodide with AST-aware runner
  useEffect(() => {
    async function initPyodideRuntime() {
      try {
        if (!window.loadPyodide) {
          setPyodideStatus('Waiting for Pyodide script...');
          return;
        }
        setPyodideStatus('Initializing Pyodide & installing altair==5.5.0, pandas, vega_datasets...');
        const pyodide = await window.loadPyodide();
        await pyodide.loadPackage(['pandas', 'numpy', 'micropip']);
        const micropip = pyodide.pyimport('micropip');
        await micropip.install(['altair==5.5.0', 'vega_datasets']);

        await pyodide.runPythonAsync(`
import ast, json, altair as alt, pandas as pd, numpy as np
from vega_datasets import data
alt.data_transformers.disable_max_rows()

def _run_user_altair(code_str):
    tree = ast.parse(code_str)
    if not tree.body:
        return None
    ns = {'alt': alt, 'pd': pd, 'np': np, 'data': data}
    last_node = tree.body[-1]
    if isinstance(last_node, ast.Expr):
        exec(compile(ast.Module(body=tree.body[:-1], type_ignores=[]), '<user>', 'exec'), ns)
        val = eval(compile(ast.Expression(body=last_node.value), '<user>', 'eval'), ns)
        if hasattr(val, 'to_json'):
            return val.to_json()
    else:
        exec(compile(tree, '<user>', 'exec'), ns)
        for k in reversed(list(ns.keys())):
            if hasattr(ns[k], 'to_json') and not isinstance(ns[k], pd.DataFrame):
                return ns[k].to_json()
    return None
`);
        pyodideRef.current = pyodide;
        setPyodideReady(true);
        setPyodideStatus('Altair 5.5.0 Ready (Live Execution)');
      } catch (err) {
        setPyodideStatus('Pyodide initialization error: ' + err.message);
      }
    }
    initPyodideRuntime();
  }, []);

  const renderTargetChart = useCallback(() => {
    if (window.vegaEmbed && targetPlotRef.current && activeChallenge?.targetSpec) {
      window.vegaEmbed(targetPlotRef.current, activeChallenge.targetSpec, { actions: false });
    }
  }, [activeChallenge]);

  useEffect(() => {
    renderTargetChart();
  }, [renderTargetChart]);

  // Debounced Live Execution
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!code.trim() || !code.includes('alt.Chart')) {
        setUserSpec(null);
        setPythonError(null);
        if (userPlotRef.current) userPlotRef.current.innerHTML = '';
        return;
      }

      if (pyodideRef.current) {
        try {
          pyodideRef.current.globals.set('_user_code_input', code);
          const jsonStr = await pyodideRef.current.runPythonAsync('_run_user_altair(_user_code_input)');
          if (jsonStr) {
            const specJson = JSON.parse(jsonStr);
            setUserSpec(specJson);
            setPythonError(null);
            if (window.vegaEmbed && userPlotRef.current) {
              window.vegaEmbed(userPlotRef.current, specJson, { actions: false });
            }
          }
        } catch (err) {
          setPythonError(err.message.split('\n').slice(-4).join('\n'));
        }
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [code, pyodideReady]);

  // Handle Custom CSV Dataset Creation
  const handleAddCustomDataset = () => {
    const lines = customCsvText.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => {
        const num = Number(vals[i]);
        obj[h] = !isNaN(num) && vals[i] !== '' ? num : vals[i];
      });
      return obj;
    });

    const columns = headers.map(h => {
      const sampleVal = rows[0][h];
      const isNum = typeof sampleVal === 'number';
      if (isNum) {
        const nums = rows.map(r => Number(r[h])).filter(n => !isNaN(n));
        return {
          name: h,
          type: 'Q',
          min: Math.min(...nums),
          max: Math.max(...nums),
          mean: Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2))
        };
      }
      return {
        name: h,
        type: 'N',
        unique: new Set(rows.map(r => r[h])).size,
        sample: rows.slice(0, 3).map(r => r[h]).join(', ')
      };
    });

    const id = `custom_${Date.now()}`;
    const name = customDataName.trim() || `Custom Dataset (${headers.slice(0, 2).join(', ')})`;
    const newDs = {
      id,
      name,
      sourceType: 'dataframe',
      varName: 'df',
      description: 'User-uploaded custom dataset.',
      importCode: `import altair as alt\nimport pandas as pd\n\ndata = ${JSON.stringify(rows, null, 2)}\ndf = pd.DataFrame(data)\n`,
      columns,
      rows
    };

    setDatasets(prev => ({ ...prev, [id]: newDs }));
    const genChall = generateProceduralChallenge(newDs, 'Beginner');
    setChallenges(prev => [genChall, ...prev]);
    setActiveChallengeId(genChall.id);
    setShowCustomModal(false);
  };

  // Library-Only Intellisense
  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);
    const cursorPos = e.target.selectionStart;
    const textBefore = val.slice(0, cursorPos);
    const match = textBefore.match(/([a-zA-Z0-9_.]+)$/);

    if (match && match[1].length >= 2) {
      const token = match[1].toLowerCase();
      const filtered = ALTAIR_SUGGESTIONS.filter(
        s => s.label.toLowerCase().includes(token) || s.insert.toLowerCase().includes(token)
      ).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const gradeResult = useMemo(
    () => gradeVegaSpecs(userSpec, activeChallenge.targetSpec),
    [userSpec, activeChallenge]
  );

  const handleGenerateChallenge = (diff) => {
    const newChall = generateProceduralChallenge(activeDataset, diff);
    setChallenges(prev => [newChall, ...prev]);
    setActiveChallengeId(newChall.id);
  };

  const filteredChallenges = useMemo(
    () => challenges.filter(c => selectedDifficulty === 'All' || c.difficulty === selectedDifficulty),
    [challenges, selectedDifficulty]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* TOP NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-indigo-600 text-xs font-bold tracking-wider uppercase">Altair 5.5</span>
          <h1 className="text-lg font-bold tracking-tight">AltairLab — Interactive Python Viz</h1>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border ${pyodideReady ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'}`}>
            {pyodideStatus}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition"
          >
            + Upload Custom CSV Dataset
          </button>
          <span className="text-xs text-slate-400 ml-2">Generate on Active Dataset:</span>
          {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
            <button
              key={diff}
              onClick={() => handleGenerateChallenge(diff)}
              className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-indigo-600 transition border border-slate-700"
            >
              + {diff}
            </button>
          ))}
        </div>
      </header>

      {/* CUSTOM DATASET MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">Add Custom CSV Dataset</h3>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <input
              type="text"
              value={customDataName}
              onChange={e => setCustomDataName(e.target.value)}
              placeholder="Dataset Name (e.g. Sales By Region)"
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs"
            />
            <textarea
              value={customCsvText}
              onChange={e => setCustomCsvText(e.target.value)}
              rows={6}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 font-mono text-xs text-emerald-300"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCustomModal(false)} className="px-3 py-1.5 text-xs rounded bg-slate-800">Cancel</button>
              <button onClick={handleAddCustomDataset} className="px-3 py-1.5 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500">
                Load Dataset & Generate Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT SIDEBAR: EXERCISES */}
        <aside className="lg:col-span-3 border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Curriculum ({filteredChallenges.length})</h2>
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="bg-slate-800 text-xs rounded px-2 py-1 border border-slate-700"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-1.5">
            {filteredChallenges.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChallengeId(ch.id)}
                className={`w-full text-left p-2.5 rounded-lg border transition ${
                  ch.id === activeChallengeId
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold truncate">{ch.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    ch.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-300' :
                    ch.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {ch.difficulty}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{ch.notebookRef}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* CENTER: EDITOR & VISUALIZATION-FOCUSED HEAD() INSPECTOR */}
        <main className="lg:col-span-5 border-r border-slate-800 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400">{activeChallenge.notebookRef}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStarterMode(m => m === 'imports' ? 'blank' : 'imports')}
                  className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700"
                >
                  Start: {starterMode === 'imports' ? 'Imports Only' : 'Completely Blank'}
                </button>
                <button
                  onClick={() => setCode(starterMode === 'blank' ? '' : activeDataset.importCode + '\n')}
                  className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700"
                >
                  Reset Code
                </button>
              </div>
            </div>
            <h3 className="text-base font-bold">{activeChallenge.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{activeChallenge.prompt}</p>
          </div>

          {/* Code Editor */}
          <div className="relative flex-1 flex flex-col bg-slate-950 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Variable: <code className="text-indigo-300">{activeDataset.varName}</code></span>
              <span>Live Debounced Execution (450ms)</span>
            </div>

            <textarea
              value={code}
              onChange={handleCodeChange}
              spellCheck={false}
              placeholder="# Write your Altair chart code from scratch..."
              className="w-full flex-1 min-h-[250px] bg-slate-900/90 text-emerald-300 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />

            {/* Library-Only Autocomplete */}
            {suggestions.length > 0 && (
              <div className="mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1.5 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 px-2">Altair API Suggestions</div>
                {suggestions.map(s => (
                  <button
                    key={s.label}
                    onClick={() => {
                      setCode(prev => prev + s.insert);
                      setSuggestions([]);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-indigo-600/30 flex items-center justify-between text-xs"
                  >
                    <code className="font-mono text-indigo-300">{s.label}</code>
                    <span className="text-[11px] text-slate-400 truncate ml-2">{s.detail}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Progressive Hints */}
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setUnlockedHints(h => Math.min(activeChallenge.hints.length + 1, h + 1))}
                  className="px-3 py-1 text-xs font-medium rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                >
                  {unlockedHints < activeChallenge.hints.length
                    ? `Reveal Hint (${unlockedHints}/${activeChallenge.hints.length})`
                    : 'Reveal Full Solution Code'}
                </button>
                {unlockedHints > activeChallenge.hints.length && (
                  <button
                    onClick={() => setCode(activeChallenge.solutionCode)}
                    className="px-2.5 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Load Solution into Editor
                  </button>
                )}
              </div>

              {activeChallenge.hints.slice(0, unlockedHints).map((hint, idx) => (
                <div key={idx} className="text-xs bg-slate-900/90 border border-slate-800 p-2 rounded text-slate-300">
                  <strong className="text-amber-400">Hint {idx + 1}:</strong> {hint}
                </div>
              ))}

              {unlockedHints > activeChallenge.hints.length && (
                <pre className="text-[11px] font-mono bg-slate-900 p-2.5 rounded border border-indigo-500/40 text-indigo-200 overflow-x-auto">
                  {activeChallenge.solutionCode}
                </pre>
              )}
            </div>
          </div>

          {/* VISUALIZATION-ORIENTED DATASET INSPECTOR (Enhanced df.head()) */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visual Schema & <code className="text-indigo-300">{activeDataset.varName}.head(5)</code>
              </h4>
              <span className="text-[11px] text-slate-400">Click column card to insert encoding shorthand</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeDataset.columns.map(col => (
                <button
                  key={col.name}
                  onClick={() => setCode(prev => prev + `'${col.name}:${col.type}'`)}
                  className="text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-slate-200 truncate">{col.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">:{col.type}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {col.type === 'Q'
                      ? `Range: ${col.min} – ${col.max} (μ=${col.mean})`
                      : `${col.unique || ''} vals (${col.sample})`}
                  </div>
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded border border-slate-800">
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    {Object.keys(activeDataset.rows[0] || {}).map(k => (
                      <th key={k} className="px-2 py-1">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/50">
                  {activeDataset.rows.slice(0, 5).map((r, i) => (
                    <tr key={i}>
                      {Object.values(r).map((v, j) => (
                        <td key={j} className="px-2 py-1 text-slate-300 truncate max-w-[120px]">{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* RIGHT: TARGET PLOT, LIVE USER PLOT & AUTOMATED SPEC CHECKER */}
        <section className="lg:col-span-4 p-4 overflow-y-auto space-y-4 bg-slate-900/20">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Automated Spec Checker</span>
              <span className={`text-sm font-bold ${gradeResult.score === 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                {gradeResult.score}% Match
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${gradeResult.score === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${gradeResult.score}%` }}
              />
            </div>
            <div className="space-y-1 pt-1">
              {gradeResult.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className={chk.passed ? 'text-emerald-400' : 'text-slate-500'}>
                    {chk.passed ? '✓' : '○'}
                  </span>
                  <span className={chk.passed ? 'text-slate-200' : 'text-slate-400'}>{chk.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white text-slate-900 shadow-lg">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Visualization</div>
            <div ref={targetPlotRef} className="overflow-x-auto flex justify-center min-h-[220px]" />
          </div>

          <div className="p-4 rounded-xl bg-white text-slate-900 shadow-lg">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Your Live Output</div>
            {pythonError ? (
              <pre className="text-xs font-mono text-rose-600 bg-rose-50 p-3 rounded border border-rose-200 whitespace-pre-wrap">
                {pythonError}
              </pre>
            ) : !userSpec ? (
              <div className="text-xs text-slate-400 italic py-12 text-center">
                Write your Altair chart expression in the editor to render your live plot...
              </div>
            ) : null}
            <div ref={userPlotRef} className="overflow-x-auto flex justify-center min-h-[220px]" />
          </div>
        </section>
      </div>
    </div>
  );
}