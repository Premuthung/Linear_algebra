// Matrix math. Pure functions, no React.
// A matrix is a list of rows: [[a, b], [c, d]] means first row [a, b], second row [c, d].

import type { Vec, Vec2 } from './vec';

export type Mat = readonly (readonly number[])[];
export type Mat2 = readonly [Vec2, Vec2];

const EPS = 1e-10;

function copy(A: Mat): number[][] {
  return A.map((row) => [...row]);
}

function assertSquare(A: Mat): void {
  if (A.some((row) => row.length !== A.length)) {
    throw new Error('Matrix must be square');
  }
}

export function identity(n: 2): Mat2;
export function identity(n: number): number[][];
export function identity(n: number): Mat {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}

/** Matrix product AB. As a transformation: do B first, then A. */
export function mul(A: Mat2, B: Mat2): Mat2;
export function mul(A: Mat, B: Mat): number[][];
export function mul(A: Mat, B: Mat): Mat {
  const inner = B.length;
  if (A.some((row) => row.length !== inner)) {
    throw new Error('Shapes do not match: columns of A must equal rows of B');
  }
  const cols = B[0]?.length ?? 0;
  return A.map((row) =>
    Array.from({ length: cols }, (_, j) => {
      let sum = 0;
      for (let k = 0; k < inner; k++) sum += row[k] * B[k][j];
      return sum;
    }),
  );
}

/** Matrix times vector. For [[a,b],[c,d]] and [x,y] this is [a*x + b*y, c*x + d*y]. */
export function apply(A: Mat2, v: Vec2): Vec2;
export function apply(A: Mat, v: Vec): number[];
export function apply(A: Mat, v: Vec): Vec {
  if (A.some((row) => row.length !== v.length)) {
    throw new Error('Shapes do not match: columns of A must equal the length of v');
  }
  return A.map((row) => {
    let sum = 0;
    for (let i = 0; i < v.length; i++) sum += row[i] * v[i];
    return sum;
  });
}

/** Flip rows and columns. */
export function transpose(A: Mat2): Mat2;
export function transpose(A: Mat): number[][];
export function transpose(A: Mat): Mat {
  const cols = A[0]?.length ?? 0;
  return Array.from({ length: cols }, (_, j) => A.map((row) => row[j]));
}

/** Determinant. For 2x2 it is a*d - b*c. */
export function det(A: Mat): number {
  assertSquare(A);
  const n = A.length;
  if (n === 0) return 1;
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
  if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = A;
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  }
  // Gaussian elimination with partial pivoting.
  const M = copy(A);
  let result = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < EPS) return 0;
    if (pivot !== col) {
      [M[pivot], M[col]] = [M[col], M[pivot]];
      result = -result;
    }
    result *= M[col][col];
    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / M[col][col];
      for (let c = col; c < n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return result;
}

/** The matrix that undoes A. Returns null when det = 0 (nothing can undo a squash). */
export function inverse(A: Mat2): Mat2 | null;
export function inverse(A: Mat): number[][] | null;
export function inverse(A: Mat): Mat | null {
  assertSquare(A);
  const n = A.length;
  if (n === 2) {
    const d = det(A);
    if (Math.abs(d) < EPS) return null;
    const [[a, b], [c, e]] = A;
    return [
      [e / d + 0, -b / d + 0],
      [-c / d + 0, a / d + 0],
    ];
  }
  // Gauss-Jordan on [A | I].
  const M = A.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < EPS) return null;
    [M[pivot], M[col]] = [M[col], M[pivot]];
    const p = M[col][col];
    for (let c = 0; c < 2 * n; c++) M[col][c] /= p;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      if (factor === 0) continue;
      for (let c = 0; c < 2 * n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row) => row.slice(n));
}

/** How many dimensions survive the transformation (number of independent columns). */
export function rank(A: Mat, eps = 1e-9): number {
  const M = copy(A);
  const rows = M.length;
  const cols = M[0]?.length ?? 0;
  let r = 0;
  for (let col = 0; col < cols && r < rows; col++) {
    let pivot = r;
    for (let i = r + 1; i < rows; i++) {
      if (Math.abs(M[i][col]) > Math.abs(M[pivot][col])) pivot = i;
    }
    if (Math.abs(M[pivot][col]) < eps) continue;
    [M[pivot], M[r]] = [M[r], M[pivot]];
    for (let i = r + 1; i < rows; i++) {
      const factor = M[i][col] / M[r][col];
      for (let c = col; c < cols; c++) M[i][c] -= factor * M[r][c];
    }
    r++;
  }
  return r;
}

/** Solve A x = b for x. Returns null when A has no inverse. */
export function solve(A: Mat2, b: Vec2): Vec2 | null;
export function solve(A: Mat, b: Vec): number[] | null;
export function solve(A: Mat, b: Vec): Vec | null {
  const inv = inverse(A);
  if (!inv) return null;
  return apply(inv, b);
}

/** Blend two matrices entry by entry. t = 0 gives A, t = 1 gives B. Used for animations. */
export function lerp(A: Mat2, B: Mat2, t: number): Mat2;
export function lerp(A: Mat, B: Mat, t: number): number[][];
export function lerp(A: Mat, B: Mat, t: number): Mat {
  return A.map((row, i) => row.map((x, j) => x + (B[i][j] - x) * t));
}

/** Build a 2x2 matrix from its two columns (where î and ĵ land). */
export function fromColumns(c1: Vec2, c2: Vec2): Mat2 {
  return [
    [c1[0], c2[0]],
    [c1[1], c2[1]],
  ];
}

/** Column j of a 2x2 matrix: column 0 is where î lands, column 1 is where ĵ lands. */
export function column(A: Mat2, j: 0 | 1): Vec2 {
  return [A[0][j], A[1][j]];
}
