import { describe, it, expect } from 'vitest';
import { DATASETS } from '../content/datasets.js';
import { columnRoles, TEMPLATES, generateExercise } from './generator.js';

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
  it('returns null for a dataset with only N columns', () => {
    const ds = { id: 'x', varName: 'df', setupCode: '', columns: [
      { name: 'a', type: 'N', unique: 3 }, { name: 'b', type: 'N', unique: 4 }] };
    for (const lv of LEVELS) expect(generateExercise(ds, lv, 1)).toBeNull();
  });
  it('respects template needs', () => {
    expect(TEMPLATES).toHaveLength(9);
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
