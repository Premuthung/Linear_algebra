import { create } from 'zustand';
import type { Vec2 } from '../../core/vec';

export type VectorView = 'arrow' | 'list' | 'walk';

interface State {
  /** The main vector. Number boxes and the arrow both read and write this. */
  v: Vec2;
  /** Two extra arrows for the "same length" challenge. */
  a: Vec2;
  b: Vec2;
  view: VectorView;
  setV: (v: Vec2) => void;
  setA: (a: Vec2) => void;
  setB: (b: Vec2) => void;
  setView: (view: VectorView) => void;
  reset: () => void;
  surprise: () => void;
}

const START = { v: [3, 2] as Vec2, a: [2, 1] as Vec2, b: [-1, 3] as Vec2, view: 'arrow' as const };

const randomInt = (): number => Math.round(Math.random() * 10 - 5) + 0;

export const useVectorsLesson = create<State>()((set) => ({
  ...START,
  setV: (v) => set({ v }),
  setA: (a) => set({ a }),
  setB: (b) => set({ b }),
  setView: (view) => set({ view }),
  reset: () => set(START),
  surprise: () =>
    set({
      v: [randomInt(), randomInt()],
      a: [randomInt(), randomInt()],
      b: [randomInt(), randomInt()],
    }),
}));
