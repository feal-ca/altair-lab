import { describe, it, expect } from 'vitest';
import { DATASETS } from './datasets.js';
import { EXERCISES, TOPICS } from './exercises.js';
import { CHART_METHODS, KWARGS, MARKS } from './altairApi.js';

const EXPECTED_ROWS = {
  eu_lollipop: 10,
  smoking_rates: 10,
  catalan_tennis: 35,
  priestley_income: 24,
  phyllum_bullet: 18,
  country_pop: 10,
  iphone_data: 14,
  fruit_pie: 5,
  parliament_seats: 10,
  hospital_occupancy: 3,
};

describe('datasets', () => {
  it('has 19 datasets keyed by their id', () => {
    expect(Object.keys(DATASETS)).toHaveLength(19);
    for (const [key, d] of Object.entries(DATASETS)) expect(d.id).toBe(key);
  });

  it('inline datasets hold every row from their setup code', () => {
    for (const [id, count] of Object.entries(EXPECTED_ROWS)) {
      const d = DATASETS[id];
      expect(d.source).toBe('inline');
      expect(d.rows).toHaveLength(count);
      expect(d.preview).toEqual(d.rows.slice(0, 5));
    }
  });

  it('inline row counts match the dicts in the setup code', () => {
    for (const id of Object.keys(EXPECTED_ROWS)) {
      const code = DATASETS[id].setupCode;
      const dictRows = (code.match(/\{"/g) || []).length;
      const listCols = code.match(/'[^']+': \[([^\]]*)\]/);
      const n = dictRows || listCols[1].split(',').length;
      expect(DATASETS[id].rows).toHaveLength(n);
    }
  });

  it('url datasets have a url, no rows and a small preview', () => {
    for (const d of Object.values(DATASETS)) {
      if (d.source === 'url') {
        expect(d.url).toMatch(/^https:\/\//);
        expect(d.rows).toBeUndefined();
      }
      expect(d.preview.length).toBeLessThanOrEqual(5);
      expect(d.columns.length).toBeGreaterThan(0);
      expect(d.setupCode).toContain('import altair as alt');
    }
  });
});

describe('exercises', () => {
  it('has 27 exercises numbered 1..27 with unique ids', () => {
    expect(EXERCISES.map((e) => e.n)).toEqual(Array.from({ length: 27 }, (_, i) => i + 1));
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(27);
  });

  it('references existing datasets and is fully filled in', () => {
    for (const e of EXERCISES) {
      expect(DATASETS[e.datasetId], e.id).toBeDefined();
      expect(e.hints.length, e.id).toBeGreaterThanOrEqual(1);
      expect(e.concept.length, e.id).toBeGreaterThan(0);
      expect(e.docs, e.id).toMatch(/^https:\/\/altair-viz\.github\.io\/user_guide\//);
      expect(TOPICS).toContain(e.topic);
      expect(['Beginner', 'Intermediate', 'Advanced']).toContain(e.level);
      expect(e.title).not.toMatch(/^\d+\./);
      expect(e.task.length).toBeGreaterThan(0);
      expect(e.solution.length).toBeGreaterThan(0);
    }
  });
});

describe('completion vocabulary', () => {
  it('lists the marks and chart methods without duplicates', () => {
    const marks = MARKS.map(([n]) => n);
    expect(new Set(marks).size).toBe(marks.length);
    for (const m of ['bar', 'point', 'line', 'text', 'rect', 'rule', 'tick', 'arc', 'square', 'errorbar']) expect(marks).toContain(m);
    const methods = CHART_METHODS.map(([n]) => n);
    expect(new Set(methods).size).toBe(methods.length);
    for (const m of ['encode', 'properties', 'transform_filter', 'resolve_scale']) expect(methods).toContain(m);
  });

  it('gives every keyword argument a detail', () => {
    for (const [callee, kws] of Object.entries(KWARGS)) {
      for (const [name, detail] of kws) expect(detail, `${callee}.${name}`).toBeTruthy();
    }
  });
});
