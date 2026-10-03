import { describe, expect, it } from 'vitest';
import {
  apply,
  column,
  det,
  fromColumns,
  identity,
  inverse,
  lerp,
  mul,
  rank,
  solve,
  transpose,
  type Mat,
  type Mat2,
} from './mat';
import { flipX, rotate } from './presets';

function expectMatClose(A: Mat | null, B: Mat): void {
  expect(A).not.toBeNull();
  A!.forEach((row, i) => row.forEach((x, j) => expect(x).toBeCloseTo(B[i][j], 8)));
}

const A: Mat2 = [
  [2, 1],
  [-1, 3],
];

describe('apply', () => {
  it('A · [x, y] = [a·x + b·y, c·x + d·y]', () => {
    const [[a, b], [c, d]] = A;
    const [x, y] = [5, -2];
    expect(apply(A, [x, y])).toEqual([a * x + b * y, c * x + d * y]);
  });
  it('columns of A are the images of î and ĵ', () => {
    expect(apply(A, [1, 0])).toEqual(column(A, 0));
    expect(apply(A, [0, 1])).toEqual(column(A, 1));
    expect(fromColumns(apply(A, [1, 0]), apply(A, [0, 1]))).toEqual(A);
  });
  it('the identity leaves vectors alone', () => {
    expect(apply(identity(2), [3, -4])).toEqual([3, -4]);
  });
  it('rejects mismatched shapes', () => {
    expect(() => apply(A, [1, 2, 3])).toThrow();
  });
});

describe('mul', () => {
  it('multiplies 2x2', () => {
    expect(
      mul(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ),
    ).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });
  it('AB means "B first, then A"', () => {
    const B = rotate(Math.PI / 2);
    const v = [1, 0] as const;
    const twoSteps = apply(flipX, apply(B, v));
    const oneStep = apply(mul(flipX, B), v);
    expect(oneStep[0]).toBeCloseTo(twoSteps[0]);
    expect(oneStep[1]).toBeCloseTo(twoSteps[1]);
  });
  it('AB ≠ BA in general (rotate then flip vs flip then rotate)', () => {
    const R = rotate(Math.PI / 2);
    const flipAfterRotate = mul(flipX, R);
    const rotateAfterFlip = mul(R, flipX);
    expectMatClose(flipAfterRotate, [
      [0, -1],
      [-1, 0],
    ]);
    expectMatClose(rotateAfterFlip, [
      [0, 1],
      [1, 0],
    ]);
  });
  it('handles non-square shapes and rejects bad ones', () => {
    expect(mul([[1, 2, 3]], [[1], [2], [3]])).toEqual([[14]]);
    expect(() => mul([[1, 2]], [[1, 2]])).toThrow();
  });
});

describe('det', () => {
  it('2x2 is a·d − b·c', () => {
    expect(det(A)).toBe(2 * 3 - 1 * -1);
  });
  it('|det| is the area of the unit square after A', () => {
    // Shoelace area of the parallelogram with sides A·î and A·ĵ.
    const [p, q] = [apply(A, [1, 0]), apply(A, [0, 1])];
    const area = Math.abs(p[0] * q[1] - p[1] * q[0]);
    expect(Math.abs(det(A))).toBeCloseTo(area);
  });
  it('a negative det means the plane was flipped', () => {
    expect(det(flipX)).toBe(-1);
    expect(det(rotate(1))).toBeCloseTo(1);
  });
  it('det = 0 when the columns are on the same line', () => {
    expect(
      det([
        [1, 2],
        [2, 4],
      ]),
    ).toBe(0);
  });
  it('3x3 and larger', () => {
    expect(
      det([
        [2, 0, 0],
        [0, 3, 0],
        [0, 0, 4],
      ]),
    ).toBe(24);
    expect(
      det([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [2, 6, 4, 8],
        [3, 1, 1, 2],
      ]),
    ).toBeCloseTo(72);
    expect(
      det([
        [0, 1, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ]),
    ).toBeCloseTo(-1);
    expect(det(identity(5))).toBeCloseTo(1);
    expect(
      det([
        [1, 2, 3, 4],
        [2, 4, 6, 8],
        [0, 1, 0, 1],
        [1, 0, 1, 0],
      ]),
    ).toBeCloseTo(0);
  });
  it('1x1 and non-square', () => {
    expect(det([[7]])).toBe(7);
    expect(() => det([[1, 2, 3]])).toThrow();
  });
});

describe('inverse', () => {
  it('A · A⁻¹ = I', () => {
    expectMatClose(mul(A, inverse(A)!), identity(2));
  });
  it('returns null when det = 0', () => {
    expect(
      inverse([
        [1, 2],
        [2, 4],
      ]),
    ).toBeNull();
    expect(
      inverse([
        [1, 0],
        [0, 0],
      ]),
    ).toBeNull();
    expect(
      inverse([
        [1, 2, 3],
        [2, 4, 6],
        [1, 1, 1],
      ]),
    ).toBeNull();
  });
  it('a rotation is undone by the opposite rotation', () => {
    expectMatClose(inverse(rotate(0.7)), rotate(-0.7));
  });
  it('3x3', () => {
    const M = [
      [2, 0, 1],
      [1, 3, 2],
      [1, 1, 2],
    ];
    expectMatClose(mul(M, inverse(M)!), identity(3));
  });
});

describe('transpose', () => {
  it('swaps rows and columns', () => {
    expect(transpose(A)).toEqual([
      [2, -1],
      [1, 3],
    ]);
    expect(
      transpose([
        [1, 2, 3],
        [4, 5, 6],
      ]),
    ).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });
});

describe('rank', () => {
  it('counts the dimensions that survive: 2, 1, or 0', () => {
    expect(rank(A)).toBe(2);
    expect(
      rank([
        [1, 2],
        [2, 4],
      ]),
    ).toBe(1);
    expect(
      rank([
        [0, 0],
        [0, 0],
      ]),
    ).toBe(0);
  });
  it('works for non-square matrices', () => {
    expect(
      rank([
        [1, 2, 3],
        [2, 4, 6],
      ]),
    ).toBe(1);
    expect(
      rank([
        [1, 0, 0],
        [0, 1, 0],
      ]),
    ).toBe(2);
  });
});

describe('solve', () => {
  it('solves 2x + y = 5, x − y = 1', () => {
    const x = solve(
      [
        [2, 1],
        [1, -1],
      ],
      [5, 1],
    );
    expect(x![0]).toBeCloseTo(2);
    expect(x![1]).toBeCloseTo(1);
  });
  it('returns null when there is no inverse', () => {
    expect(
      solve(
        [
          [1, 2],
          [2, 4],
        ],
        [1, 1],
      ),
    ).toBeNull();
  });
});

describe('lerp', () => {
  it('t = 0 gives A, t = 1 gives B, halfway is the average', () => {
    const I = identity(2);
    expect(lerp(I, A, 0)).toEqual(I);
    expect(lerp(I, A, 1)).toEqual(A);
    expect(lerp(I, A, 0.5)).toEqual([
      [1.5, 0.5],
      [-0.5, 2],
    ]);
  });
});
