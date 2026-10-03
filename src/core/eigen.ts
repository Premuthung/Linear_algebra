// Eigenvalues and eigenvectors.
// An eigenvector stays on its own line when the matrix is applied: A v = λ v.

import { EigenvalueDecomposition, Matrix } from 'ml-matrix';
import type { Mat, Mat2 } from './mat';
import { normalize, type Vec2 } from './vec';

const EPS = 1e-9;

export interface EigenPair {
  value: number;
  vector: Vec2;
}

export type Eigen2Result =
  /** Real eigenvalues. `pairs` has 2 entries, or 1 when only one direction survives (e.g. a shear). */
  | { kind: 'real'; values: [number, number]; pairs: EigenPair[] }
  /** Every direction is an eigenvector (the matrix is λ·I). */
  | { kind: 'all'; value: number }
  /** No real eigenvectors. This is what a pure rotation shows. */
  | { kind: 'none' };

/** Closed form for 2x2: λ = (tr ± √(tr² − 4·det)) / 2. */
export function eigen2x2(A: Mat2): Eigen2Result {
  const [[a, b], [c, d]] = A;
  const tr = a + d;
  const determinant = a * d - b * c;
  const disc = tr * tr - 4 * determinant;
  const scaleSq = Math.max(1, tr * tr);
  if (disc < -EPS * scaleSq) return { kind: 'none' };

  const root = Math.sqrt(Math.max(0, disc));
  const l1 = (tr + root) / 2;
  const l2 = (tr - root) / 2;

  // The matrix is a multiple of the identity: every vector is an eigenvector.
  if (Math.abs(b) < EPS && Math.abs(c) < EPS && Math.abs(a - d) < EPS) {
    return { kind: 'all', value: a };
  }

  const vectorFor = (lambda: number): Vec2 => {
    // Solve (A − λI) v = 0. Either row of A − λI gives a direction.
    const v1: Vec2 = [b, lambda - a];
    const v2: Vec2 = [lambda - d, c];
    const pick = Math.hypot(...v1) >= Math.hypot(...v2) ? v1 : v2;
    return normalize(pick);
  };

  if (root < 1e-7 * Math.max(1, Math.abs(tr))) {
    // Repeated eigenvalue but not λ·I: only one eigen-direction exists.
    return { kind: 'real', values: [l1, l2], pairs: [{ value: l1, vector: vectorFor(l1) }] };
  }
  return {
    kind: 'real',
    values: [l1, l2],
    pairs: [
      { value: l1, vector: vectorFor(l1) },
      { value: l2, vector: vectorFor(l2) },
    ],
  };
}

export interface EigenGeneralResult {
  /** Real parts of the eigenvalues. */
  real: number[];
  /** Imaginary parts. All zero when every eigenvalue is real. */
  imaginary: number[];
  /** Eigenvectors as the columns of this matrix. */
  vectors: number[][];
}

/** Eigen-decomposition for any square matrix, via ml-matrix. */
export function eigenGeneral(A: Mat): EigenGeneralResult {
  const evd = new EigenvalueDecomposition(new Matrix(A.map((row) => [...row])));
  return {
    real: [...evd.realEigenvalues],
    imaginary: [...evd.imaginaryEigenvalues],
    vectors: evd.eigenvectorMatrix.to2DArray(),
  };
}
