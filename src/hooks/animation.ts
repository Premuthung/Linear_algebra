import { useCallback, useEffect, useRef, useState } from 'react';
import { lerp, type Mat2 } from '../core/mat';
import { prefersReducedMotion } from '../format';

const ease = (t: number): number => t * t * (3 - 2 * t);

/**
 * A one-shot animation value. `t` rests at 1 (the finished picture).
 * `play()` restarts it from 0. With reduced motion it stays at 1.
 */
export function usePlayOnce(durationMs: number): { t: number; play: () => void } {
  const [t, setT] = useState(1);
  const raf = useRef(0);

  const play = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (prefersReducedMotion()) {
      setT(1);
      return;
    }
    const start = performance.now();
    const tick = (now: number): void => {
      const next = Math.min(1, (now - start) / durationMs);
      setT(next);
      if (next < 1) raf.current = requestAnimationFrame(tick);
    };
    setT(0);
    raf.current = requestAnimationFrame(tick);
  }, [durationMs]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { t, play };
}

/**
 * Glide towards a target matrix so that edits are seen as motion.
 * Pass `instant` while dragging, so the picture never lags behind the pointer.
 */
export function useSmoothMat(target: Mat2, instant: boolean, durationMs = 350): Mat2 {
  const [shown, setShown] = useState<Mat2>(target);
  const shownRef = useRef<Mat2>(target);

  useEffect(() => {
    if (instant || prefersReducedMotion()) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const from = shownRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / durationMs);
      const m = lerp(from, target, ease(t));
      shownRef.current = m;
      setShown(m);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, instant, durationMs]);

  return instant ? target : shown;
}
