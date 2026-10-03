import { useEffect, useRef, useState } from 'react';
import { fmt, prefersReducedMotion } from '../../format';

/** Shows a number. When the number changes, it counts smoothly to the new value. */
export function NumberFlow({ value, digits = 2 }: { value: number; digits?: number }) {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion() || Math.abs(value - shownRef.current) < 1e-9) {
      shownRef.current = value;
      setShown(value);
      return;
    }
    const from = shownRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / 250);
      const x = from + (value - from) * t;
      shownRef.current = x;
      setShown(x);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className="font-mono tabular-nums">{fmt(shown, digits)}</span>;
}
