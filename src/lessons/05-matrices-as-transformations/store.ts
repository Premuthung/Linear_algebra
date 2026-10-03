import { create } from 'zustand';
import type { Mat2 } from '../../core/mat';
import type { Vec2 } from '../../core/vec';
import { round1 } from '../../format';

interface State {
  /** The matrix. The editor, the presets, and the dragged î / ĵ arrows all write here. */
  M: Mat2;
  /** True while dragging, so the picture follows the pointer with no glide. */
  instant: boolean;
  /** Animation position: 0 = nothing applied yet, 1 = the matrix is fully applied. */
  t: number;
  /** The point we follow through the transformation. */
  p: Vec2;
  setM: (M: Mat2, instant?: boolean) => void;
  setT: (t: number) => void;
  setP: (p: Vec2) => void;
  reset: () => void;
  surprise: () => void;
}

const START = {
  M: [
    [1, 1],
    [0, 1],
  ] as Mat2,
  instant: false,
  t: 1,
  p: [2, 1] as Vec2,
};

const r = (): number => round1(Math.random() * 4 - 2);

export const useMatrixLesson = create<State>()((set) => ({
  ...START,
  setM: (M, instant = false) => set({ M, instant, t: 1 }),
  setT: (t) => set({ t }),
  setP: (p) => set({ p }),
  reset: () => set(START),
  surprise: () =>
    set({
      M: [
        [r(), r()],
        [r(), r()],
      ],
      instant: false,
      t: 1,
    }),
}));
