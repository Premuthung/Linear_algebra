import { describe, expect, it } from 'vitest';
import {
  add,
  angleBetween,
  angleOf,
  dot,
  isParallel,
  norm,
  normalize,
  projectOnto,
  scale,
  sub,
} from './vec';

describe('add / sub', () => {
  it('adds part by part', () => {
    expect(add([1, 2], [3, -1])).toEqual([4, 1]);
    expect(add([1, 2, 3], [10, 20, 30])).toEqual([11, 22, 33]);
  });
  it('subtracts part by part', () => {
    expect(sub([4, 1], [3, -1])).toEqual([1, 2]);
  });
  it('adding the zero vector changes nothing', () => {
    expect(add([3, 2], [0, 0])).toEqual([3, 2]);
  });
  it('rejects different lengths', () => {
    expect(() => add([1, 2], [1, 2, 3])).toThrow();
    expect(() => sub([1], [1, 2])).toThrow();
  });
});

describe('scale', () => {
  it('multiplies every part', () => {
    expect(scale([2, 1], 3)).toEqual([6, 3]);
    expect(scale([12, 9], 1 / 3)).toEqual([4, 3]);
  });
  it('a negative scalar flips the vector through the origin', () => {
    expect(scale([2, 1], -2)).toEqual([-4, -2]);
  });
  it('scaling by 0 gives the zero vector without -0', () => {
    const z = scale([-3, 2], 0);
    expect(Object.is(z[0], 0)).toBe(true);
    expect(z).toEqual([0, 0]);
  });
});

describe('dot / norm / normalize', () => {
  it('dot product', () => {
    expect(dot([1, 2], [3, 4])).toBe(11);
    expect(dot([1, 0], [0, 1])).toBe(0);
    expect(() => dot([1], [1, 2])).toThrow();
  });
  it('norm is the length', () => {
    expect(norm([3, 4])).toBe(5);
    expect(norm([0, 0])).toBe(0);
  });
  it('normalize gives length 1 in the same direction', () => {
    expect(normalize([3, 4])).toEqual([0.6, 0.8]);
    expect(norm(normalize([-7, 2]))).toBeCloseTo(1);
  });
  it('normalize leaves the zero vector alone', () => {
    expect(normalize([0, 0])).toEqual([0, 0]);
  });
});

describe('angleBetween / angleOf', () => {
  it('right angle', () => {
    expect(angleBetween([1, 0], [0, 5])).toBeCloseTo(Math.PI / 2);
  });
  it('same and opposite directions', () => {
    expect(angleBetween([2, 2], [5, 5])).toBeCloseTo(0);
    expect(angleBetween([1, 0], [-3, 0])).toBeCloseTo(Math.PI);
  });
  it('zero vector gives 0 instead of NaN', () => {
    expect(angleBetween([0, 0], [1, 2])).toBe(0);
  });
  it('angleOf measures from the positive x-axis', () => {
    expect(angleOf([1, 1])).toBeCloseTo(Math.PI / 4);
    expect(angleOf([0, -1])).toBeCloseTo(-Math.PI / 2);
    expect(angleOf([0, 0])).toBe(0);
  });
});

describe('projectOnto', () => {
  it('drops a shadow onto the other vector', () => {
    expect(projectOnto([3, 4], [1, 0])).toEqual([3, 0]);
    expect(projectOnto([2, 2], [0, 5])).toEqual([0, 2]);
  });
  it('projecting onto the zero vector gives zero', () => {
    expect(projectOnto([3, 4], [0, 0])).toEqual([0, 0]);
  });
  it('perpendicular vectors project to zero', () => {
    expect(projectOnto([0, 3], [2, 0])).toEqual([0, 0]);
  });
});

describe('isParallel', () => {
  it('same line, same or opposite direction', () => {
    expect(isParallel([1, 2], [2, 4])).toBe(true);
    expect(isParallel([1, 2], [-3, -6])).toBe(true);
  });
  it('different directions', () => {
    expect(isParallel([1, 2], [2, 1])).toBe(false);
    expect(isParallel([1, 0], [1, 0.01])).toBe(false);
  });
  it('the zero vector is parallel to everything', () => {
    expect(isParallel([0, 0], [3, 1])).toBe(true);
  });
  it('works in 3D', () => {
    expect(isParallel([1, 2, 3], [2, 4, 6])).toBe(true);
    expect(isParallel([1, 2, 3], [2, 4, 7])).toBe(false);
  });
});
