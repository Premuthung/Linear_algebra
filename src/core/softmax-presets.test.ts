import { describe, expect, it } from 'vitest';
import { softmax } from './softmax';
import { apply, det } from './mat';
import { IDENTITY, flipX, flipY, projectX, rotate, scale, shear, swapXY } from './presets';
import { norm } from './vec';

describe('softmax', () => {
  it('adds up to 1 and keeps the order of the scores', () => {
    const p = softmax([1, 2, 3]);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    expect(p[2]).toBeGreaterThan(p[1]);
    expect(p[1]).toBeGreaterThan(p[0]);
    expect(p[2]).toBeCloseTo(0.66524096, 6);
  });
  it('equal scores give equal probabilities', () => {
    expect(softmax([5, 5, 5, 5])).toEqual([0.25, 0.25, 0.25, 0.25]);
  });
  it('is stable for huge scores (no NaN or Infinity)', () => {
    const p = softmax([1000, 1001, 999]);
    expect(p.every(Number.isFinite)).toBe(true);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    const q = softmax([-1000, -1001]);
    expect(q[0]).toBeCloseTo(0.7310586, 6);
  });
  it('temperature: high is flatter, low is sharper', () => {
    const base = softmax([1, 2, 3]);
    expect(softmax([1, 2, 3], 5)[2]).toBeLessThan(base[2]);
    expect(softmax([1, 2, 3], 0.2)[2]).toBeGreaterThan(base[2]);
    expect(() => softmax([1, 2], 0)).toThrow();
  });
  it('empty and single inputs', () => {
    expect(softmax([])).toEqual([]);
    expect(softmax([42])).toEqual([1]);
  });
});

describe('presets', () => {
  const v = [2, 1] as const;

  it('identity', () => {
    expect(apply(IDENTITY, v)).toEqual([2, 1]);
  });
  it('flips only change a sign or swap the numbers', () => {
    expect(apply(flipX, v)).toEqual([2, -1]);
    expect(apply(flipY, v)).toEqual([-2, 1]);
    expect(apply(swapXY, v)).toEqual([1, 2]);
  });
  it('rotate(θ) = [[cosθ, −sinθ], [sinθ, cosθ]] and keeps length', () => {
    const quarter = apply(rotate(Math.PI / 2), [1, 0]);
    expect(quarter[0]).toBeCloseTo(0);
    expect(quarter[1]).toBeCloseTo(1);
    expect(norm(apply(rotate(1.234), v))).toBeCloseTo(norm(v));
  });
  it('rotation by 0 and by 2π changes nothing', () => {
    expect(rotate(0)).toEqual(IDENTITY);
    const full = apply(rotate(2 * Math.PI), v);
    expect(full[0]).toBeCloseTo(2);
    expect(full[1]).toBeCloseTo(1);
  });
  it('shear pushes x by k·y and keeps area', () => {
    expect(apply(shear(2), v)).toEqual([4, 1]);
    expect(det(shear(2))).toBe(1);
  });
  it('scale stretches each axis', () => {
    expect(apply(scale(3, -2), v)).toEqual([6, -2]);
  });
  it('projectX squashes onto the x-axis and has det 0', () => {
    expect(apply(projectX, v)).toEqual([2, 0]);
    expect(det(projectX)).toBe(0);
  });
});
