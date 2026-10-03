import { create } from 'zustand';
import { add, scale, type Vec2 } from '../../core/vec';

interface State {
  u: Vec2;
  v: Vec2;
  a: number;
  b: number;
  /** Points that a·u + b·v has visited. */
  trail: Vec2[];
  setVectors: (patch: { u?: Vec2; v?: Vec2 }) => void;
  setWeights: (patch: { a?: number; b?: number }) => void;
  scatter: () => void;
  clearTrail: () => void;
  reset: () => void;
  surprise: () => void;
}

const START = { u: [2, 1] as Vec2, v: [1, -1] as Vec2, a: 1, b: 1, trail: [] as Vec2[] };
const MAX_TRAIL = 600;

export const combine = (s: { u: Vec2; v: Vec2; a: number; b: number }): Vec2 =>
  add(scale(s.u, s.a), scale(s.v, s.b));

const randomInt = (): number => Math.round(Math.random() * 6 - 3) + 0;

export const useSpanLesson = create<State>()((set) => ({
  ...START,
  // Old trail points belong to the old vectors, so moving a vector clears the trail.
  setVectors: (patch) => set({ ...patch, trail: [] }),
  setWeights: (patch) =>
    set((s) => {
      const next = { ...s, ...patch };
      return { ...patch, trail: [...s.trail, combine(next)].slice(-MAX_TRAIL) };
    }),
  scatter: () =>
    set((s) => {
      const points: Vec2[] = Array.from({ length: 250 }, () =>
        combine({ u: s.u, v: s.v, a: Math.random() * 6 - 3, b: Math.random() * 6 - 3 }),
      );
      return { trail: [...s.trail, ...points].slice(-MAX_TRAIL) };
    }),
  clearTrail: () => set({ trail: [] }),
  reset: () => set(START),
  surprise: () =>
    set({
      u: [randomInt(), randomInt()],
      v: [randomInt(), randomInt()],
      a: 1,
      b: 1,
      trail: [],
    }),
}));
