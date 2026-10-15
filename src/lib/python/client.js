const defaultCreateWorker = () =>
  new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

export function createPython({ createWorker = defaultCreateWorker, timeoutMs = 10000 } = {}) {
  let worker = null;
  let status = { phase: 'loading', step: 'Starting Python' };
  let nextId = 1;
  let pending = null; // { id, resolve, timer } for the latest run only
  const subscribers = new Set();

  function setStatus(next) {
    status = next;
    subscribers.forEach((cb) => cb(status));
  }

  function settle(result) {
    if (!pending) return;
    const { resolve, timer } = pending;
    clearTimeout(timer);
    pending = null;
    resolve(result);
  }

  function spawn() {
    const w = createWorker();
    worker = w;
    w.onmessage = (e) => {
      if (worker !== w) return;
      const m = e.data;
      if (m.type === 'status') {
        const { phase, step, error } = m;
        setStatus({ phase, ...(step !== undefined && { step }), ...(error !== undefined && { error }) });
      } else if (m.type === 'result' && pending && pending.id === m.id) {
        settle(m.result);
      }
    };
    w.onerror = (e) => {
      if (worker !== w) return;
      e.preventDefault?.();
      const message = e.message || 'Worker crashed';
      setStatus({ phase: 'error', error: message });
      settle({ error: { type: 'WorkerError', message, line: null } });
    };
    setStatus({ phase: 'loading', step: 'Starting Python' });
  }

  function restart() {
    if (worker) {
      worker.onmessage = null;
      worker.onerror = null;
      worker.terminate();
    }
    spawn();
  }

  function ensure() {
    if (!worker) spawn();
  }

  return {
    run(code) {
      ensure();
      settle({ stale: true });
      const id = nextId++;
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          if (!pending || pending.id !== id) return;
          settle({ timeout: true });
          restart();
        }, timeoutMs);
        pending = { id, resolve, timer };
        worker.postMessage({ type: 'run', id, code });
      });
    },
    subscribe(cb) {
      ensure();
      subscribers.add(cb);
      cb(status);
      return () => subscribers.delete(cb);
    },
    retry() {
      settle({ stale: true });
      if (worker) restart();
      else spawn();
    },
  };
}
