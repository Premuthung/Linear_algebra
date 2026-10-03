// Vector math. Pure functions, no React.
// A vector is a plain list of numbers. Vec2 is the 2D case used on the plane.

export type Vec = readonly number[];
export type Vec2 = readonly [number, number];

export const EPS = 1e-9;

function sameLength(a: Vec, b: Vec): void {
  if (a.length !== b.length) {
    throw new Error(`Vectors must have the same length (got ${a.length} and ${b.length})`);
  }
}

/** Add two vectors part by part: [a1 + b1, a2 + b2, ...]. */
export function add<T extends Vec>(a: T, b: T): T {
  sameLength(a, b);
  return a.map((x, i) => x + b[i]) as unknown as T;
}

/** Subtract part by part: [a1 - b1, a2 - b2, ...]. */
export function sub<T extends Vec>(a: T, b: T): T {
  sameLength(a, b);
  return a.map((x, i) => x - b[i]) as unknown as T;
}

/** Multiply every part by the number k. A negative k flips the vector. */
export function scale<T extends Vec>(v: T, k: number): T {
  // `+ 0` turns -0 into 0 so the UI never shows "-0".
  return v.map((x) => x * k + 0) as unknown as T;
}

/** Dot product: a1*b1 + a2*b2 + ... */
export function dot(a: Vec, b: Vec): number {
  sameLength(a, b);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/** Length (magnitude) of a vector. */
export function norm(v: Vec): number {
  return Math.sqrt(dot(v, v));
}

/** Same direction, length 1. The zero vector stays the zero vector. */
export function normalize<T extends Vec>(v: T): T {
  const n = norm(v);
  if (n < EPS) return v.map(() => 0) as unknown as T;
  return v.map((x) => x / n + 0) as unknown as T;
}

/** Angle between two vectors in radians, from 0 to π. Returns 0 if either is the zero vector. */
export function angleBetween(a: Vec, b: Vec): number {
  const na = norm(a);
  const nb = norm(b);
  if (na < EPS || nb < EPS) return 0;
  const cos = Math.min(1, Math.max(-1, dot(a, b) / (na * nb)));
  return Math.acos(cos);
}

/** The shadow of `a` on the line through `b`. Returns the zero vector if b is zero. */
export function projectOnto<T extends Vec>(a: T, b: T): T {
  const bb = dot(b, b);
  if (bb < EPS) return a.map(() => 0) as unknown as T;
  return scale(b, dot(a, b) / bb);
}

/**
 * True when both vectors lie on the same line through the origin.
 * The zero vector counts as parallel to everything.
 */
export function isParallel(a: Vec, b: Vec, eps = 1e-6): boolean {
  const na = norm(a);
  const nb = norm(b);
  if (na < EPS || nb < EPS) return true;
  return Math.abs(Math.abs(dot(a, b)) - na * nb) <= eps * Math.max(1, na * nb);
}

/** Direction of a 2D vector in radians, measured from the positive x-axis (-π to π). */
export function angleOf(v: Vec2): number {
  return Math.atan2(v[1], v[0]) + 0;
}
