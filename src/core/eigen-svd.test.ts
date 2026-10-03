import { describe, expect, it } from 'vitest';
import { eigen2x2, eigenGeneral } from './eigen';
import { svd2x2, svdGeneral } from './svd';
import { apply, det, mul, transpose, type Mat2 } from './mat';
import { flipX, projectX, rotate, scale, shear, swapXY } from './presets';
import { dot, norm } from './vec';

function sorted(xs: readonly number[]): number[] {
  return [...xs].sort((a, b) => b - a);
}

describe('eigen2x2', () => {
  it('diagonal matrix: eigenvalues are the diagonal, eigenvectors are the axes', () => {
    const r = eigen2x2(scale(3, 2));
    expect(r.kind).toBe('real');
    if (r.kind !== 'real') return;
    expect(r.values).toEqual([3, 2]);
    expect(Math.abs(r.pairs[0].vector[0])).toBeCloseTo(1);
    expect(Math.abs(r.pairs[1].vector[1])).toBeCloseTo(1);
  });

  it('A v = λ v for every pair', () => {
    const matrices: Mat2[] = [
      [
        [2, 1],
        [1, 2],
      ],
      [
        [4, -2],
        [1, 1],
      ],
      flipX,
      swapXY,
      projectX,
    ];
    for (const A of matrices) {
      const r = eigen2x2(A);
      expect(r.kind).toBe('real');
      if (r.kind !== 'real') continue;
      expect(r.pairs).toHaveLength(2);
      for (const { value, vector } of r.pairs) {
        const Av = apply(A, vector);
        expect(Av[0]).toBeCloseTo(value * vector[0]);
        expect(Av[1]).toBeCloseTo(value * vector[1]);
        expect(norm(vector)).toBeCloseTo(1);
      }
    }
  });

  it('a pure rotation has no real eigenvectors', () => {
    expect(eigen2x2(rotate(Math.PI / 2)).kind).toBe('none');
    expect(eigen2x2(rotate(0.3)).kind).toBe('none');
  });

  it('rotation by 0 or 2π is the identity: every direction is an eigenvector', () => {
    expect(eigen2x2(rotate(0))).toEqual({ kind: 'all', value: 1 });
    expect(eigen2x2(scale(2, 2))).toEqual({ kind: 'all', value: 2 });
    const full = eigen2x2(rotate(2 * Math.PI));
    expect(full.kind).not.toBe('none');
  });

  it('a shear has only one eigen-direction (the x-axis)', () => {
    const r = eigen2x2(shear(1));
    expect(r.kind).toBe('real');
    if (r.kind !== 'real') return;
    expect(r.values).toEqual([1, 1]);
    expect(r.pairs).toHaveLength(1);
    expect(Math.abs(r.pairs[0].vector[0])).toBeCloseTo(1);
    expect(r.pairs[0].vector[1]).toBeCloseTo(0);
  });

  it('agrees with ml-matrix', () => {
    const A: Mat2 = [
      [4, -2],
      [1, 1],
    ];
    const mine = eigen2x2(A);
    const theirs = eigenGeneral(A);
    expect(mine.kind).toBe('real');
    if (mine.kind !== 'real') return;
    const a = sorted(mine.values);
    const b = sorted(theirs.real);
    expect(a[0]).toBeCloseTo(b[0]);
    expect(a[1]).toBeCloseTo(b[1]);
    expect(theirs.imaginary.every((x) => Math.abs(x) < 1e-9)).toBe(true);
  });
});

describe('eigenGeneral', () => {
  it('reports imaginary parts for a rotation', () => {
    const r = eigenGeneral(rotate(Math.PI / 2));
    expect(r.imaginary.some((x) => Math.abs(x) > 0.5)).toBe(true);
  });
  it('handles 3x3', () => {
    const r = eigenGeneral([
      [2, 0, 0],
      [0, 5, 0],
      [0, 0, -1],
    ]);
    expect(sorted(r.real)).toEqual([5, 2, -1]);
    expect(r.vectors).toHaveLength(3);
  });
});

describe('svd2x2', () => {
  const cases: Mat2[] = [
    [
      [3, 1],
      [1, 2],
    ],
    [
      [1, 2],
      [3, 4],
    ],
    rotate(0.8),
    shear(1.5),
    flipX,
    projectX,
    [
      [1, 2],
      [2, 4],
    ],
    scale(2, 2),
    [
      [0, 0],
      [0, 0],
    ],
  ];

  it('U Σ Vᵀ rebuilds A', () => {
    for (const A of cases) {
      const { U, S, V } = svd2x2(A);
      const rebuilt = mul(mul(U, scale(S[0], S[1])), transpose(V));
      rebuilt.forEach((row, i) => row.forEach((x, j) => expect(x).toBeCloseTo(A[i][j], 6)));
    }
  });

  it('U and V are rotations or flips (orthonormal columns)', () => {
    for (const A of cases) {
      const { U, V } = svd2x2(A);
      for (const M of [U, V]) {
        const c1 = [M[0][0], M[1][0]];
        const c2 = [M[0][1], M[1][1]];
        expect(norm(c1)).toBeCloseTo(1);
        expect(norm(c2)).toBeCloseTo(1);
        expect(dot(c1, c2)).toBeCloseTo(0);
      }
    }
  });

  it('singular values are sorted, non-negative, and multiply to |det|', () => {
    for (const A of cases) {
      const { S } = svd2x2(A);
      expect(S[0]).toBeGreaterThanOrEqual(S[1]);
      expect(S[1]).toBeGreaterThanOrEqual(0);
      expect(S[0] * S[1]).toBeCloseTo(Math.abs(det(A)), 6);
    }
  });

  it('agrees with ml-matrix', () => {
    for (const A of cases) {
      const mine = svd2x2(A).S;
      const theirs = sorted(svdGeneral(A).S);
      expect(mine[0]).toBeCloseTo(theirs[0], 6);
      expect(mine[1]).toBeCloseTo(theirs[1], 6);
    }
  });
});

describe('svdGeneral', () => {
  it('works for a non-square matrix', () => {
    const r = svdGeneral([
      [1, 0, 0],
      [0, 2, 0],
    ]);
    expect(sorted(r.S).slice(0, 2)).toEqual([2, 1]);
  });
});
