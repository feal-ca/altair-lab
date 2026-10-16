import { describe, it, expect } from 'vitest';
import { DATASETS } from '../content/datasets.js';
import { columnRoles, TEMPLATES, generateExercise, generateFromAny } from './generator.js';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const names = (cols) => cols.map((c) => c.name);

describe('columnRoles', () => {
  it('classifies cars columns', () => {
    const r = columnRoles(DATASETS.cars);
    expect(names(r.cat)).toEqual(expect.arrayContaining(['Origin', 'Cylinders']));
    expect(names(r.cat)).not.toContain('Name');
    expect(names(r.quant)).toContain('Horsepower');
    expect(names(r.time)).toEqual(['Year']);
  });
  it('treats year-like ordinal columns as time', () => {
    expect(names(columnRoles(DATASETS.iphone_data).time)).toEqual(['year']);
  });
});

describe('generateExercise', () => {
  it('is deterministic per seed and has the exercise shape', () => {
    const a = generateExercise(DATASETS.cars, 'Beginner', 42);
    const b = generateExercise(DATASETS.cars, 'Beginner', 42);
    expect(a).toEqual(b);
    expect(a.id).toBe('gen-cars-b-' + (42).toString(36));
    expect(a.n).toBeNull();
    expect(a.topic).toBe('Generated');
    expect(a.docs).toMatch(/^https:\/\/altair-viz\.github\.io\/user_guide\//);
    expect(a.solution.startsWith(DATASETS.cars.setupCode + '\n')).toBe(true);
    expect(a.hints.length).toBeGreaterThanOrEqual(2);
  });
  it('never uses airports iata as a category', () => {
    for (const lv of LEVELS) for (let s = 1; s <= 20; s++) {
      const ex = generateExercise(DATASETS.airports_us, lv, s);
      if (ex) expect(ex.solution).not.toContain('iata');
    }
  });
  it('returns null for a dataset with a single N column', () => {
    const ds = { id: 'x', varName: 'df', setupCode: '', columns: [{ name: 'a', type: 'N', unique: 3 }] };
    for (const lv of LEVELS) expect(generateExercise(ds, lv, 1)).toBeNull();
  });
  it('builds a labelled heatmap from two N columns', () => {
    const ds = { id: 'x', varName: 'df', setupCode: '', columns: [
      { name: 'a', type: 'N', unique: 3 }, { name: 'b', type: 'N', unique: 4 }] };
    expect(generateExercise(ds, 'Advanced', 1).templateId).toBe('heatmap-text');
    expect(generateExercise(ds, 'Beginner', 1)).toBeNull();
  });
  it('offers multi-view and multi-mark templates at every level above Beginner', () => {
    const ids = (lv) => TEMPLATES.filter((t) => t.level === lv).map((t) => t.id);
    expect(ids('Intermediate')).toEqual(expect.arrayContaining(['heatmap', 'bar-condition', 'boxplot', 'scatter-shape']));
    expect(ids('Advanced')).toEqual(expect.arrayContaining(['hconcat-bar-hist', 'vconcat-line-bar', 'range-text', 'dual-axis']));
  });
  it('respects template needs', () => {
    expect(TEMPLATES).toHaveLength(23);
    for (const ds of Object.values(DATASETS)) {
      const r = columnRoles(ds);
      for (const lv of LEVELS) for (let s = 1; s <= 10; s++) {
        const ex = generateExercise(ds, lv, s);
        if (!ex) continue;
        const t = TEMPLATES.find((t) => t.id === ex.templateId);
        expect(t.level).toBe(lv);
        for (const k of ['cat', 'quant', 'time']) expect(r[k].length).toBeGreaterThanOrEqual(t.needs[k] || 0);
      }
    }
  });
  it('quotes column names safely', () => {
    const ds = { id: 'q', varName: 'df', setupCode: 'S', columns: [
      { name: 'a "b"', type: 'N', unique: 3 }, { name: 'x y', type: 'Q' }] };
    const ex = generateExercise(ds, 'Beginner', 1);
    expect(ex.solution).toContain(JSON.stringify('a "b":N'));
  });
});

describe('generateFromAny', () => {
  it('is deterministic per seed and draws from the given datasets', () => {
    const list = Object.values(DATASETS);
    const a = generateFromAny(list, 'Intermediate', 7);
    expect(a).toEqual(generateFromAny(list, 'Intermediate', 7));
    expect(list.map((d) => d.id)).toContain(a.datasetId);
  });
  it('varies the dataset across seeds', () => {
    const list = Object.values(DATASETS);
    const ids = new Set();
    for (let s = 1; s <= 30; s++) ids.add(generateFromAny(list, 'Beginner', s).datasetId);
    expect(ids.size).toBeGreaterThan(3);
  });
  it('skips datasets that cannot fill the level', () => {
    const flat = { id: 'flat', varName: 'df', setupCode: '', columns: [{ name: 'a', type: 'N', unique: 5 }] };
    for (let s = 1; s <= 10; s++) expect(generateFromAny([flat, DATASETS.cars], 'Advanced', s).datasetId).toBe('cars');
    expect(generateFromAny([flat], 'Advanced', 1)).toBeNull();
  });
});
