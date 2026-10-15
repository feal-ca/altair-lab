import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPython } from './client.js';

class FakeWorker {
  constructor() {
    this.sent = [];
    this.terminated = false;
    this.onmessage = null;
    this.onerror = null;
  }
  postMessage(m) { this.sent.push(m); }
  terminate() { this.terminated = true; }
  emit(data) { this.onmessage?.({ data }); }
}

function setup(opts = {}) {
  const workers = [];
  const python = createPython({
    createWorker: () => { const w = new FakeWorker(); workers.push(w); return w; },
    ...opts,
  });
  return { python, workers };
}

describe('python client', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('resolves run with the matching result', async () => {
    const { python, workers } = setup();
    const p = python.run('1+1');
    const msg = workers[0].sent[0];
    expect(msg).toMatchObject({ type: 'run', code: '1+1' });
    workers[0].emit({ type: 'result', id: msg.id, result: { spec: { a: 1 } } });
    await expect(p).resolves.toEqual({ spec: { a: 1 } });
  });

  it('marks earlier pending runs stale', async () => {
    const { python, workers } = setup();
    const p1 = python.run('a');
    const p2 = python.run('b');
    const [m1, m2] = workers[0].sent;
    expect(m2.id).toBeGreaterThan(m1.id);
    await expect(p1).resolves.toEqual({ stale: true });
    workers[0].emit({ type: 'result', id: m1.id, result: { noChart: true } });
    workers[0].emit({ type: 'result', id: m2.id, result: { noChart: true } });
    await expect(p2).resolves.toEqual({ noChart: true });
  });

  it('times out, restarts the worker', async () => {
    const { python, workers } = setup();
    const statuses = [];
    python.subscribe((s) => statuses.push(s));
    const p = python.run('while True: pass');
    expect(workers).toHaveLength(1);
    workers[0].emit({ type: 'status', phase: 'ready' });
    await vi.advanceTimersByTimeAsync(10000);
    await expect(p).resolves.toEqual({ timeout: true });
    expect(workers[0].terminated).toBe(true);
    expect(workers).toHaveLength(2);
    expect(statuses.at(-1).phase).toBe('loading');
  });

  it('does not time out when a result arrives', async () => {
    const { python, workers } = setup();
    const p = python.run('x');
    workers[0].emit({ type: 'result', id: workers[0].sent[0].id, result: { noChart: true } });
    await p;
    await vi.advanceTimersByTimeAsync(20000);
    expect(workers).toHaveLength(1);
  });

  it('delivers status to subscribers, latest first, until unsubscribed', () => {
    const { python, workers } = setup();
    const seen = [];
    const off = python.subscribe((s) => seen.push(s));
    expect(seen[0].phase).toBe('loading');
    workers[0].emit({ type: 'status', phase: 'loading', step: 'Loading pandas' });
    expect(seen.at(-1)).toEqual({ phase: 'loading', step: 'Loading pandas' });
    off();
    workers[0].emit({ type: 'status', phase: 'ready' });
    expect(seen.at(-1).phase).toBe('loading');
    const late = [];
    python.subscribe((s) => late.push(s));
    expect(late).toEqual([{ phase: 'ready' }]);
  });

  it('turns a worker crash into an error status and result', async () => {
    const { python, workers } = setup();
    const seen = [];
    python.subscribe((s) => seen.push(s));
    const p = python.run('x');
    workers[0].onerror({ message: 'boom', preventDefault() {} });
    await expect(p).resolves.toEqual({ error: { type: 'WorkerError', message: 'boom', line: null } });
    expect(seen.at(-1)).toEqual({ phase: 'error', error: 'boom' });
  });

  it('retry restarts the worker and makes pending runs stale', async () => {
    const { python, workers } = setup();
    const seen = [];
    python.subscribe((s) => seen.push(s));
    const p = python.run('x');
    python.retry();
    await expect(p).resolves.toEqual({ stale: true });
    expect(workers[0].terminated).toBe(true);
    expect(workers).toHaveLength(2);
    expect(seen.at(-1).phase).toBe('loading');
  });

  it('ignores messages from a terminated worker', async () => {
    const { python, workers } = setup();
    python.run('x');
    python.retry();
    workers[0].emit({ type: 'status', phase: 'ready' });
    const seen = [];
    python.subscribe((s) => seen.push(s));
    expect(seen[0].phase).toBe('loading');
  });

  it('does not time out while Python is still loading, then times out after ready', async () => {
    const { python, workers } = setup();
    const p = python.run('x');
    let done = false;
    p.then(() => { done = true; });
    await vi.advanceTimersByTimeAsync(20000);
    expect(done).toBe(false);
    expect(workers).toHaveLength(1);
    workers[0].emit({ type: 'status', phase: 'ready' });
    await vi.advanceTimersByTimeAsync(10000);
    await expect(p).resolves.toEqual({ timeout: true });
    expect(workers).toHaveLength(2);
  });

  it('a restarted worker loading does not trigger another timeout', async () => {
    const { python, workers } = setup();
    python.subscribe(() => {});
    workers[0].emit({ type: 'status', phase: 'ready' });
    const p = python.run('while True: pass');
    await vi.advanceTimersByTimeAsync(10000);
    await expect(p).resolves.toEqual({ timeout: true });
    const p2 = python.run('y');
    await vi.advanceTimersByTimeAsync(30000);
    expect(workers).toHaveLength(2);
    workers[1].emit({ type: 'status', phase: 'ready' });
    workers[1].emit({ type: 'result', id: workers[1].sent[0].id, result: { noChart: true } });
    await expect(p2).resolves.toEqual({ noChart: true });
  });
});
