'use client';
import { useEffect, useRef } from 'react';

/**
 * usePolling — calls `fn` immediately and then every `intervalMs` milliseconds.
 * Stops polling when the component unmounts or when `enabled` is false.
 */
export function usePolling(fn: () => void, intervalMs = 15000, enabled = true) {
  const fnRef = useRef(fn);

  // Keep ref in sync via effect (not during render) — avoids react-hooks/refs error
  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    if (!enabled) return;
    fnRef.current();
    const id = setInterval(() => fnRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
