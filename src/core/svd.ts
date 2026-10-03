// Singular value decomposition: A = U Σ Vᵀ, which reads as rotate → stretch → rotate.

import { Matrix, SingularValueDecomposition } from 'ml-matrix';
import { apply, fromColumns, mul, transpose, type Mat, type Mat2 } from './mat';
import { eigen2x2 } from './eigen';
import { norm, scale, type Vec2 } from './vec';

const EPS = 1e-10;

export interface Svd2Result {
  U: Mat2;
  /** Singular values, largest first. Never negative. */
  S: [number, number];
  V: Mat2;
}

const perp = (v: Vec2): Vec2 => [-v[1] + 0, v[0]];

/** 2x2 SVD using the eigenvectors of AᵀA. */
export function svd2x2(A: Mat2): Svd2Result {
  const AtA = mul(transpose(A), A);
  const eig = eigen2x2(AtA);

  // AᵀA is symmetric, so its eigenvalues are always real.
  let v1: Vec2 = [1, 0];
  let lambda1 = AtA[0][0];
  let lambda2 = AtA[1][1];
  if (eig.kind === 'real') {
    v1 = eig.pairs[0].vector;
    lambda1 = eig.values[0];
    lambda2 = eig.values[1];
  }
  const v2 = perp(v1);
  const s1 = Math.sqrt(Math.max(0, lambda1));
  const s2 = Math.sqrt(Math.max(0, lambda2));

  let u1: Vec2 = [1, 0];
  if (s1 > EPS) u1 = scale(apply(A, v1), 1 / s1);
  let u2: Vec2 = perp(u1);
  if (s2 > EPS * Math.max(1, s1)) {
    const candidate = apply(A, v2);
    if (norm(candidate) > EPS) u2 = scale(candidate, 1 / s2);
  }

  return { U: fromColumns(u1, u2), S: [s1, s2], V: fromColumns(v1, v2) };
}

export interface SvdGeneralResult {
  U: number[][];
  S: number[];
  V: number[][];
}

/** SVD for any matrix, via ml-matrix. */
export function svdGeneral(A: Mat): SvdGeneralResult {
  const svd = new SingularValueDecomposition(new Matrix(A.map((row) => [...row])));
  return {
    U: svd.leftSingularVectors.to2DArray(),
    S: [...svd.diagonal],
    V: svd.rightSingularVectors.to2DArray(),
  };
}
