import { create } from 'zustand';
import type { Vec2 } from '../../core/vec';
import { round1 } from '../../format';

interface State {
  u: Vec2;
  v: Vec2;
  /** The scalar that stretches, shrinks, or flips v. */
  k: number;
  /** Challenge 1: reach the target with u + k·v. */
  cv: Vec2;
  ck: number;
  /** Challenge 2: which k sends [2, 1] to [−4, −2]? */
  k2: number;
  set: (patch: Partial<Pick<State, 'u' | 'v' | 'k' | 'cv' | 'ck' | 'k2'>>) => void;
  reset: () => void;
  surprise: () => void;
}

const START = {
  u: [3, 1] as Vec2,
  v: [1, 2] as Vec2,
  k: 1.5,
  cv: [1, 1] as Vec2,
  ck: 1,
  k2: 1,
};

const randomInt = (): number => Math.round(Math.random() * 8 - 4) + 0;

export const useAddScaleLesson = create<State>()((set) => ({
  ...START,
  set: (patch) => set(patch),
  reset: () => set(START),
  surprise: () =>
    set({
      u: [randomInt(), randomInt()],
      v: [randomInt(), randomInt()],
      k: round1(Math.random() * 6 - 3),
    }),
}));
