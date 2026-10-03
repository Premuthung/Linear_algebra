import { useEffect, useRef, useState } from 'react';
import { lerp, type Mat2 } from '../../core/mat';
import { IDENTITY } from '../../core/presets';
import { prefersReducedMotion, texMat } from '../../format';
import { Button, Numbers, Tex } from '../ui';

interface TransformPlayerProps {
  /** 0 = nothing has happened yet (identity). 1 = the matrix is fully applied. */
  t: number;
  onT: (t: number) => void;
  /** The matrix the animation ends at. */
  target: Mat2;
}

const DURATION_MS = 1600;

/** Play, pause, and scrub the move from "do nothing" to the matrix A. */
export function TransformPlayer({ t, onT, target }: TransformPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number): void => {
      const next = Math.min(1, tRef.current + ((now - last) / DURATION_MS) * speed);
      last = now;
      tRef.current = next;
      onT(next);
      if (next >= 1) setPlaying(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, onT]);

  const play = (): void => {
    if (prefersReducedMotion()) {
      onT(1);
      return;
    }
    if (t >= 1) onT(0);
    setPlaying(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {playing ? (
          <Button onClick={() => setPlaying(false)}>⏸ Pause</Button>
        ) : (
          <Button tone="primary" onClick={play}>
            ▶ Play
          </Button>
        )}
        <Button
          onClick={() => {
            setPlaying(false);
            onT(0);
          }}
        >
          ⏮ Start
        </Button>
        <label className="flex items-center gap-1 text-sm text-muted">
          Speed
          <select
            className="rounded-md border border-line bg-bg px-1 py-1 text-ink"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
          </select>
        </label>
      </div>
      <input
        type="range"
        aria-label="Animation position"
        data-testid="scrub"
        className="w-full"
        min={0}
        max={1}
        step={0.01}
        value={t}
        onChange={(e) => {
          setPlaying(false);
          onT(Number(e.target.value));
        }}
      />
      <Numbers>
        <span className="text-sm text-muted">Matrix right now: </span>
        <Tex>{texMat(lerp(IDENTITY, target, t))}</Tex>
      </Numbers>
    </div>
  );
}
