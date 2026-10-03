import { useState } from 'react';
import { CoordinatePlane } from '../components/CoordinatePlane/CoordinatePlane';
import { Slider, Tex } from '../components/ui';
import { eigen2x2 } from '../core/eigen';
import { apply, det, fromColumns, mul, type Mat2 } from '../core/mat';
import { isParallel, norm, type Vec2 } from '../core/vec';
import { fmt, paren, texMat } from '../format';
import { COLORS } from '../theme';

// Small interactive pictures used inside the article on the home page.

function Figure({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className="my-4 rounded-2xl border border-line bg-panel2 p-4">
      {children}
      <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}

const chip = (on: boolean): string =>
  `rounded-full border px-3 py-1 text-sm ${
    on
      ? 'border-accent bg-accent font-semibold text-white'
      : 'border-line bg-panel text-ink hover:border-muted'
  }`;

/* ---------- §2.1 Scalar, vector, matrix, tensor ---------- */

const SHAPES = [
  { key: 'scalar', name: 'Scalar', layers: 1, rows: 1, cols: 1, tex: 's \\in \\mathbb{R}' },
  {
    key: 'vector',
    name: 'Vector',
    layers: 1,
    rows: 4,
    cols: 1,
    tex: '\\boldsymbol{x} \\in \\mathbb{R}^{4}',
  },
  {
    key: 'matrix',
    name: 'Matrix',
    layers: 1,
    rows: 4,
    cols: 3,
    tex: '\\boldsymbol{A} \\in \\mathbb{R}^{4 \\times 3}',
  },
  {
    key: 'tensor',
    name: 'Tensor',
    layers: 3,
    rows: 4,
    cols: 3,
    tex: '\\mathsf{A} \\in \\mathbb{R}^{4 \\times 3 \\times 3}',
  },
] as const;

export function ShapesFigure() {
  const [index, setIndex] = useState(2);
  const shape = SHAPES[index];
  const cell = 30;
  const shift = 14;
  const width = shape.cols * cell + (shape.layers - 1) * shift + 4;
  const height = shape.rows * cell + (shape.layers - 1) * shift + 4;
  const count = shape.layers * shape.rows * shape.cols;

  return (
    <Figure caption="One number, a line of numbers, a grid of numbers, a stack of grids. The number of indices you need to find one entry goes 0, 1, 2, 3.">
      <div className="flex flex-wrap gap-2">
        {SHAPES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={chip(i === index)}
            onClick={() => setIndex(i)}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${shape.name} drawn as ${count} ${count === 1 ? 'cell' : 'cells'}`}
        >
          {Array.from({ length: shape.layers }, (_, back) => {
            const layer = shape.layers - 1 - back;
            return Array.from({ length: shape.rows * shape.cols }, (_, k) => (
              <rect
                key={`${layer}-${k}`}
                x={2 + layer * shift + (k % shape.cols) * cell}
                y={2 + (shape.layers - 1 - layer) * shift + Math.floor(k / shape.cols) * cell}
                width={cell - 3}
                height={cell - 3}
                rx={5}
                fill={['#a78bfa', '#818cf8', '#60a5fa'][layer]}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            ));
          })}
        </svg>
        <div className="space-y-1">
          <Tex block>{shape.tex}</Tex>
          <p className="text-sm text-muted">
            {count} {count === 1 ? 'number' : 'numbers'}
          </p>
        </div>
      </div>
    </Figure>
  );
}

/* ---------- §2.2 Matrix product ---------- */

const A = [
  [1, 2, 0],
  [-1, 1, 3],
];
const B = [
  [2, 1],
  [0, -1],
  [1, 2],
];

function Grid({
  name,
  rows,
  lit,
  onPick,
  picked,
}: {
  name: string;
  rows: number[][];
  /** Should this cell be lit up? */
  lit: (r: number, c: number) => boolean;
  onPick?: (r: number, c: number) => void;
  picked?: [number, number];
}) {
  return (
    <div className="text-center">
      <div className="mb-1 text-sm font-bold">{name}</div>
      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `repeat(${rows[0].length}, 2.5rem)` }}
      >
        {rows.map((row, r) =>
          row.map((value, c) => {
            const on = lit(r, c);
            const base = `h-10 rounded-lg border font-mono text-sm tabular-nums ${
              on ? 'border-accent bg-accent/15 font-bold' : 'border-line bg-panel'
            }`;
            return onPick ? (
              <button
                key={`${r}-${c}`}
                type="button"
                aria-pressed={picked?.[0] === r && picked?.[1] === c}
                aria-label={`Entry row ${r + 1}, column ${c + 1}: ${value}`}
                className={`${base} hover:border-accent`}
                onClick={() => onPick(r, c)}
                onMouseEnter={() => onPick(r, c)}
              >
                {value}
              </button>
            ) : (
              <span key={`${r}-${c}`} className={`${base} flex items-center justify-center`}>
                {value}
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}

export function ProductFigure() {
  const [[i, j], setPicked] = useState<[number, number]>([0, 0]);
  const C = mul(A, B);
  const terms = A[i].map((a, k) => `${paren(a)}\\cdot${paren(B[k][j])}`).join(' + ');

  return (
    <Figure caption="Point at an entry of C. It is one row of A dotted with one column of B. A has 3 columns and B has 3 rows, so the product is defined.">
      <div className="flex flex-wrap items-center gap-4">
        <Grid name="A (2 × 3)" rows={A} lit={(r) => r === i} />
        <span className="text-xl text-muted">×</span>
        <Grid name="B (3 × 2)" rows={B} lit={(_, c) => c === j} />
        <span className="text-xl text-muted">=</span>
        <Grid
          name="C (2 × 2)"
          rows={C}
          lit={(r, c) => r === i && c === j}
          picked={[i, j]}
          onPick={(r, c) => setPicked([r, c])}
        />
      </div>
      <Tex block>
        {`C_{${i + 1},${j + 1}} = \\sum_k A_{${i + 1},k} B_{k,${j + 1}} = ${terms} = ${fmt(C[i][j])}`}
      </Tex>
    </Figure>
  );
}

/* ---------- §2.4 Span ---------- */

export function SpanFigure() {
  const [u, setU] = useState<Vec2>([2, 1]);
  const [v, setV] = useState<Vec2>([-1, 2]);
  const dependent = isParallel(u, v);
  const zero = norm(u) < 1e-9 && norm(v) < 1e-9;

  return (
    <Figure caption="Drag the two arrow tips. These are the two columns of a 2 × 2 matrix A. Put one arrow on the line of the other and the span drops from the whole plane to a line.">
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <CoordinatePlane
          snap
          vectors={[
            { id: 'span-u', v: u, color: COLORS.ihat, label: 'A:,1', onChange: setU },
            { id: 'span-v', v, color: COLORS.jhat, label: 'A:,2', onChange: setV },
          ]}
          shadePlane={dependent ? undefined : COLORS.accent}
          lines={dependent && !zero ? [{ dir: norm(u) > 1e-9 ? u : v, color: COLORS.accent }] : []}
          ariaLabel="Plane with the two columns of the matrix A"
        />
        <div className="space-y-2 text-[15px]">
          <Tex block>{`\\boldsymbol{A} = ${texMat(fromColumns(u, v))}`}</Tex>
          <p data-testid="span-status">
            {dependent ? (
              <>
                The columns are <strong>linearly dependent</strong>. Their span is only{' '}
                {zero ? 'a point' : 'a line'}. A is <strong>singular</strong>: most targets{' '}
                <Tex>{'\\boldsymbol{b}'}</Tex> cannot be reached, and A has no inverse.
              </>
            ) : (
              <>
                The columns are <strong>linearly independent</strong>. Their span is the whole
                plane, so <Tex>{'\\boldsymbol{Ax} = \\boldsymbol{b}'}</Tex> has exactly one solution
                for every <Tex>{'\\boldsymbol{b}'}</Tex>.
              </>
            )}
          </p>
          <p className="text-sm text-muted">
            Determinant: {fmt(det(fromColumns(u, v)))}
            {dependent && ' (zero means the plane was squashed flat)'}
          </p>
        </div>
      </div>
    </Figure>
  );
}

/* ---------- §2.5 Norms ---------- */

export function NormFigure() {
  const [x, setX] = useState(3);
  const [y, setY] = useState(2);
  const size = 280;
  const half = size / 2;
  const unit = half / 8;
  const l1 = Math.abs(x) + Math.abs(y);
  const l2 = Math.hypot(x, y);
  const max = Math.max(Math.abs(x), Math.abs(y));
  const px = half + x * unit;
  const py = half - y * unit;

  return (
    <Figure caption="Three ways to measure the size of the same vector. Each shape joins all the points that have the same size as x under one norm, so all three pass through the tip of x.">
      <div className="grid items-center gap-4 sm:grid-cols-[280px_minmax(0,1fr)]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[280px] rounded-xl bg-panel"
          role="img"
          aria-label="Diamond, circle and square through the tip of the vector x"
        >
          <line x1={0} y1={half} x2={size} y2={half} stroke={COLORS.gridStrong} />
          <line x1={half} y1={0} x2={half} y2={size} stroke={COLORS.gridStrong} />
          <polygon
            points={`${half},${half - l1 * unit} ${half + l1 * unit},${half} ${half},${half + l1 * unit} ${half - l1 * unit},${half}`}
            fill="none"
            stroke={COLORS.u}
            strokeWidth={2}
          />
          <circle
            cx={half}
            cy={half}
            r={l2 * unit}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={2}
          />
          <rect
            x={half - max * unit}
            y={half - max * unit}
            width={2 * max * unit}
            height={2 * max * unit}
            fill="none"
            stroke={COLORS.w}
            strokeWidth={2}
          />
          <line x1={half} y1={half} x2={px} y2={py} stroke={COLORS.ink} strokeWidth={2.5} />
          <circle cx={px} cy={py} r={5} fill={COLORS.ink} />
        </svg>
        <div className="space-y-2 text-[15px]">
          <Slider
            label={<Tex>{`x_1 = ${fmt(x)}`}</Tex>}
            value={x}
            onChange={setX}
            min={-4}
            max={4}
            step={0.5}
          />
          <Slider
            label={<Tex>{`x_2 = ${fmt(y)}`}</Tex>}
            value={y}
            onChange={setY}
            min={-4}
            max={4}
            step={0.5}
          />
          <p style={{ color: COLORS.u }}>
            <Tex>{`\\|\\boldsymbol{x}\\|_1 = |${fmt(x)}| + |${fmt(y)}| = ${fmt(l1)}`}</Tex>
          </p>
          <p style={{ color: COLORS.accent }}>
            <Tex>{`\\|\\boldsymbol{x}\\|_2 = \\sqrt{${paren(x)}^2 + ${paren(y)}^2} = ${fmt(l2)}`}</Tex>
          </p>
          <p style={{ color: COLORS.w }}>
            <Tex>{`\\|\\boldsymbol{x}\\|_\\infty = \\max(|${fmt(x)}|, |${fmt(y)}|) = ${fmt(max)}`}</Tex>
          </p>
        </div>
      </div>
    </Figure>
  );
}

/* ---------- §2.7 Eigenvectors ---------- */

export function EigenFigure() {
  const [a, setA] = useState(1.5);
  const [b, setB] = useState(0.5);
  const [d, setD] = useState(1.5);
  const M: Mat2 = [
    [a, b],
    [b, d],
  ];
  const result = eigen2x2(M);
  const size = 300;
  const half = size / 2;
  const unit = half / 3.2;
  const at = (p: Vec2): string => `${half + p[0] * unit},${half - p[1] * unit}`;

  const circle: Vec2[] = Array.from({ length: 72 }, (_, k) => {
    const t = (k / 72) * 2 * Math.PI;
    return [Math.cos(t), Math.sin(t)];
  });
  const pairs = result.kind === 'real' ? result.pairs : [];
  const colors = [COLORS.ihat, COLORS.jhat];

  return (
    <Figure caption="The grey circle is every unit vector. The purple shape is where the matrix sends them. Along each eigenvector the circle is only stretched, by its eigenvalue, and not turned.">
      <div className="grid items-center gap-4 sm:grid-cols-[300px_minmax(0,1fr)]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[300px] rounded-xl bg-panel"
          role="img"
          aria-label="Unit circle and its image under the matrix, with the eigenvectors"
        >
          <line x1={0} y1={half} x2={size} y2={half} stroke={COLORS.gridStrong} />
          <line x1={half} y1={0} x2={half} y2={size} stroke={COLORS.gridStrong} />
          <polygon
            points={circle.map(at).join(' ')}
            fill="none"
            stroke={COLORS.axis}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <polygon
            points={circle.map((p) => at(apply(M, p))).join(' ')}
            fill={COLORS.accent}
            fillOpacity={0.12}
            stroke={COLORS.accent}
            strokeWidth={2}
          />
          {pairs.map((pair, k) => {
            const tip: Vec2 = [pair.vector[0] * pair.value, pair.vector[1] * pair.value];
            const [x2, y2] = at(tip).split(',');
            const [x1, y1] = at(pair.vector).split(',');
            return (
              <g key={k}>
                <line x1={half} y1={half} x2={x2} y2={y2} stroke={colors[k]} strokeWidth={3} />
                <circle cx={x2} cy={y2} r={4.5} fill={colors[k]} />
                <circle cx={x1} cy={y1} r={3.5} fill="#ffffff" stroke={colors[k]} strokeWidth={2} />
              </g>
            );
          })}
        </svg>
        <div className="space-y-2 text-[15px]">
          <Tex block>{`\\boldsymbol{A} = ${texMat(M)}`}</Tex>
          <Slider
            label={<Tex>{`A_{1,1}`}</Tex>}
            value={a}
            onChange={setA}
            min={0.5}
            max={2.5}
            step={0.1}
          />
          <Slider
            label={<Tex>{`A_{1,2} = A_{2,1}`}</Tex>}
            value={b}
            onChange={setB}
            min={-1}
            max={1}
            step={0.1}
          />
          <Slider
            label={<Tex>{`A_{2,2}`}</Tex>}
            value={d}
            onChange={setD}
            min={0.5}
            max={2.5}
            step={0.1}
          />
          {result.kind === 'all' ? (
            <p>
              Every direction is an eigenvector, with <Tex>{`\\lambda = ${fmt(result.value)}`}</Tex>
              .
            </p>
          ) : (
            pairs.map((pair, k) => (
              <p key={k} style={{ color: colors[k] }}>
                <Tex>{`\\lambda_${k + 1} = ${fmt(pair.value)},\\quad \\boldsymbol{v}^{(${k + 1})} = [${fmt(pair.vector[0])},\\ ${fmt(pair.vector[1])}]`}</Tex>
              </p>
            ))
          )}
          <p className="text-sm text-muted">
            Product of the eigenvalues = determinant = {fmt(det(M))}.
            {Math.abs(det(M)) < 0.05 && ' Close to zero: the matrix is nearly singular.'}
          </p>
        </div>
      </div>
    </Figure>
  );
}
