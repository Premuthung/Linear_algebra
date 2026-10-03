// Named 2x2 matrices used by the lessons.

import type { Mat2 } from './mat';

export const IDENTITY: Mat2 = [
  [1, 0],
  [0, 1],
];

/** Turn the plane by θ radians, counter-clockwise. */
export function rotate(theta: number): Mat2 {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [
    [c, -s + 0],
    [s, c],
  ];
}

/** Flip over the x-axis: [x, y] → [x, −y]. */
export const flipX: Mat2 = [
  [1, 0],
  [0, -1],
];

/** Flip over the y-axis: [x, y] → [−x, y]. */
export const flipY: Mat2 = [
  [-1, 0],
  [0, 1],
];

/** Flip over the line y = x: [x, y] → [y, x]. */
export const swapXY: Mat2 = [
  [0, 1],
  [1, 0],
];

/** Push the top of the plane sideways: [x, y] → [x + k·y, y]. */
export function shear(k: number): Mat2 {
  return [
    [1, k],
    [0, 1],
  ];
}

/** Stretch x by sx and y by sy. */
export function scale(sx: number, sy: number): Mat2 {
  return [
    [sx, 0],
    [0, sy],
  ];
}

/** Squash everything onto the x-axis: [x, y] → [x, 0]. */
export const projectX: Mat2 = [
  [1, 0],
  [0, 0],
];
