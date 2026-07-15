import { useEffect, useState, useRef } from 'react';

export default function useTickingValue(initial, jitter = 0.1, intervalMs = 4000) {
  const [value, setValue] = useState(initial);
  const baseRef = useRef(initial);

  useEffect(() => {
    baseRef.current = initial;
    setValue(initial);
    const id = setInterval(() => {
      const drift = (Math.random() * 2 - 1) * jitter;
      const next = +(baseRef.current + drift).toFixed(2);
      setValue(next);
    }, intervalMs);
    return () => clearInterval(id);
  }, [initial, jitter, intervalMs]);

  return value;
}

export function useRelativeTimer(seconds = 12, intervalMs = 1000) {
  const [s, setS] = useState(seconds);
  useEffect(() => {
    setS(seconds);
    const id = setInterval(() => {
      setS((prev) => (prev >= 30 ? 1 : prev + 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [seconds, intervalMs]);
  return s;
}
