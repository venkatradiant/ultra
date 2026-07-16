import { useEffect, useRef, useState } from 'react';

/**
 * Polling sibling of useAsyncData, for getters that take an argument.
 *
 * WHY THIS EXISTS: useAsyncData's effect deps are `[getter]`, so it only works
 * with a stable module-scope function reference. The observability getters are
 * keyed by component id — `useAsyncData(() => getComponentMetrics(id))` would
 * hand it a new function identity on every render and refetch forever. Rather
 * than change useAsyncData (five shipped components depend on it), this hook
 * takes the key separately and reads the getter through a ref.
 *
 * Usage: const metrics = usePolledData(getComponentMetrics, componentId);
 *        const activity = usePolledData(getComponentActivity, componentId, { intervalMs: 3000 });
 */
export function usePolledData(getter, key, options = {}) {
  const { intervalMs = 5000, enabled = true, pauseWhenHidden = true } = options;

  const [data, setData] = useState(null);

  // Latest-ref so `getter` stays out of the deps without going stale. Safe
  // because it's only ever called from a timer, never during render.
  const getterRef = useRef(getter);
  useEffect(() => { getterRef.current = getter; });

  // Monotonic counter the caller can pass to a getter that simulates time.
  const tickRef = useRef(0);

  useEffect(() => {
    if (!enabled || key == null) {
      setData(null);
      return undefined;
    }

    // Clearing on key change is deliberate: without it we'd render component
    // A's metrics under component B's name for a frame. The getter resolves on
    // a microtask, so this costs one blank frame and consumers show a skeleton.
    setData(null);

    let alive = true;
    let timer = null;
    let inFlight = false;

    const tick = async () => {
      if (inFlight) return; // never stack requests behind a slow response
      inFlight = true;
      try {
        const d = await getterRef.current(key, tickRef.current);
        // `alive` also guards staleness: on key change React tears this closure
        // down first, so an in-flight response for the OLD key can't land.
        if (alive) setData(d);
      } catch {
        if (alive) setData(null);
      } finally {
        inFlight = false;
        tickRef.current += 1;
      }
    };

    const start = () => {
      if (timer !== null) return; // idempotent — StrictMode double-invokes effects
      timer = setInterval(tick, intervalMs);
    };
    const stop = () => {
      if (timer !== null) { clearInterval(timer); timer = null; }
    };

    tick(); // paint immediately rather than waiting a full interval
    if (!pauseWhenHidden || document.visibilityState === 'visible') start();

    // The real value here isn't the pause (browsers throttle background timers
    // anyway) — it's the immediate refresh on return, so switching back from
    // another app doesn't show a stale frame for up to `intervalMs`.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') { tick(); start(); } else stop();
    };
    if (pauseWhenHidden) document.addEventListener('visibilitychange', onVisibility);

    return () => {
      alive = false;
      stop();
      if (pauseWhenHidden) document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [key, intervalMs, enabled, pauseWhenHidden]);

  return data;
}

export default usePolledData;
