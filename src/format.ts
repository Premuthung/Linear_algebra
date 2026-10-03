/** Round for display and never show "-0". */
export function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '?';
  const r = Number(n.toFixed(digits));
  return String(r === 0 ? 0 : r);
}

/** [3, 2] */
export function fmtVec(v: readonly number[], digits = 2): string {
  return `[${v.map((x) => fmt(x, digits)).join(', ')}]`;
}

/** A column vector for KaTeX. */
export function texVec(v: readonly (number | string)[], digits = 2): string {
  const parts = v.map((x) => (typeof x === 'number' ? fmt(x, digits) : x));
  return `\\begin{bmatrix} ${parts.join(' \\\\ ')} \\end{bmatrix}`;
}

/** A matrix for KaTeX. */
export function texMat(m: readonly (readonly (number | string)[])[], digits = 2): string {
  const rows = m.map((row) =>
    row.map((x) => (typeof x === 'number' ? fmt(x, digits) : x)).join(' & '),
  );
  return `\\begin{bmatrix} ${rows.join(' \\\\ ')} \\end{bmatrix}`;
}

/** Wrap negative numbers in brackets inside a formula: 3 · (−2). */
export function paren(n: number, digits = 2): string {
  const s = fmt(n, digits);
  return s.startsWith('-') ? `(${s})` : s;
}

export function round1(x: number): number {
  return Math.round(x * 10) / 10 + 0;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
