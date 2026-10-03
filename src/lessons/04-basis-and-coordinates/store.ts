import { create } from 'zustand';
import type { Vec2 } from '../../core/vec';

interface State {
  /** The two basis vectors: the measuring sticks. */
  b1: Vec2;
  b2: Vec2;
  /** A point in space. It does not move when the basis changes. */
  p: Vec2;
  set: (patch: Partial<Pick<State, 'b1' | 'b2' | 'p'>>) => void;
  reset: () => void;
  surprise: () => void;
}

const START = { b1: [1, 0] as Vec2, b2: [0, 1] as Vec2, p: [3, 2] as Vec2 };

const randomInt = (): number => Math.round(Math.random() * 4 - 2) + 0;

export const useBasisLesson = create<State>()((set) => ({
  ...START,
  set: (patch) => set(patch),
  reset: () => set(START),
  surprise: () => {
    // Keep trying until the two sticks do not lie on the same line.
    let b1: Vec2 = [1, 0];
    let b2: Vec2 = [0, 1];
    for (let i = 0; i < 20; i++) {
      b1 = [randomInt(), randomInt()];
      b2 = [randomInt(), randomInt()];
      if (b1[0] * b2[1] - b1[1] * b2[0] !== 0) break;
    }
    set({ b1, b2 });
  },
}));
