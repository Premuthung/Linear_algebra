import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { apply, type Mat2 } from '../../core/mat';
import { norm, type Vec2 } from '../../core/vec';
import { fmt, fmtVec, round1 } from '../../format';
import { COLORS } from '../../theme';

/** An arrow on the plane. Give it `onChange` to make its tip draggable. */
export interface PlaneVector {
  id: string;
  v: Vec2;
  /** Where the tail sits. Default is the origin. */
  from?: Vec2;
  color: string;
  /** Short name, e.g. "v". Coordinates are added unless `hideCoords` is set. */
  label?: string;
  hideCoords?: boolean;
  dashed?: boolean;
  width?: number;
  onChange?: (v: Vec2) => void;
}

export interface PlanePoint {
  p: Vec2;
  color?: string;
  label?: string;
  /** A ring marks a target; a dot marks a plain point. */
  shape?: 'dot' | 'ring';
}

export interface PlaneLine {
  /** Direction of an endless line through the origin. */
  dir: Vec2;
  color: string;
  dashed?: boolean;
  width?: number;
}

export interface CoordinatePlaneProps {
  vectors?: PlaneVector[];
  /** Snap dragged tips and clicks to whole numbers. */
  snap?: boolean;
  /** Half-width of the default view. 6 means −6 to 6. */
  range?: number;
  /** Draw the grid bent by this matrix. */
  grid?: Mat2;
  /** Draw the unit square after this matrix. */
  unitSquare?: Mat2;
  /** Draw the test letter "F" after this matrix. */
  shapeF?: Mat2;
  points?: PlanePoint[];
  lines?: PlaneLine[];
  /** Shade the whole plane (span of two independent vectors). */
  shadePlane?: string;
  /** Points left behind by a moving tip. */
  trail?: readonly Vec2[];
  onPlaneClick?: (p: Vec2) => void;
  ariaLabel?: string;
}

const S = 520;
const GRID_REACH = 12;
// The letter F. It has no symmetry, so flips and turns are easy to see.
const F_SHAPE: Vec2[] = [
  [1, 1],
  [1, 4],
  [3, 4],
  [3, 3.4],
  [1.7, 3.4],
  [1.7, 2.8],
  [2.6, 2.8],
  [2.6, 2.2],
  [1.7, 2.2],
  [1.7, 1],
];

interface View {
  cx: number;
  cy: number;
  half: number;
}

function Arrow(props: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dashed?: boolean;
  width?: number;
}) {
  const { x1, y1, x2, y2, color, dashed, width = 3 } = props;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1.5) return <circle cx={x1} cy={y1} r={4.5} fill={color} />;
  const ux = dx / len;
  const uy = dy / len;
  const head = Math.min(13, len * 0.6);
  const hw = head * 0.45;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? '7 6' : undefined}
      />
      <polygon
        points={`${x2},${y2} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}`}
        fill={color}
      />
    </g>
  );
}

export function CoordinatePlane(props: CoordinatePlaneProps) {
  const {
    vectors = [],
    snap = false,
    range = 6,
    grid,
    unitSquare,
    shapeF,
    points = [],
    lines = [],
    shadePlane,
    trail,
    onPlaneClick,
    ariaLabel = 'Coordinate plane',
  } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>({ cx: 0, cy: 0, half: range });
  const pan = useRef<{ x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);

  const k = S / (2 * view.half); // pixels per unit
  const sx = (x: number): number => S / 2 + (x - view.cx) * k;
  const sy = (y: number): number => S / 2 - (y - view.cy) * k;

  const toWorld = (clientX: number, clientY: number): Vec2 => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * S;
    const py = ((clientY - rect.top) / rect.height) * S;
    return [view.cx + (px - S / 2) / k, view.cy - (py - S / 2) / k];
  };

  const tidy = (p: Vec2): Vec2 =>
    snap ? [Math.round(p[0]) + 0, Math.round(p[1]) + 0] : [round1(p[0]), round1(p[1])];

  // Scroll to zoom. React's onWheel is passive, so attach by hand to stop the page scrolling.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent): void => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      setView((v) => ({ ...v, half: Math.min(40, Math.max(2, v.half * factor)) }));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  // --- background: drag to pan (mouse), click to place a point ---
  const onBgDown = (e: PointerEvent<SVGSVGElement>): void => {
    pan.current = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy, moved: false };
    if (e.pointerType === 'mouse') e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onBgMove = (e: PointerEvent<SVGSVGElement>): void => {
    const p = pan.current;
    if (!p || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.moved && Math.hypot(dx, dy) < 4) return;
    p.moved = true;
    const unitsPerPx = (2 * view.half) / rect.width;
    setView((v) => ({ ...v, cx: p.cx - dx * unitsPerPx, cy: p.cy + dy * unitsPerPx }));
  };
  const onBgUp = (e: PointerEvent<SVGSVGElement>): void => {
    const p = pan.current;
    pan.current = null;
    if (p && !p.moved && onPlaneClick) onPlaneClick(tidy(toWorld(e.clientX, e.clientY)));
  };

  // --- arrow tips: drag or use the keyboard ---
  const dragTo = (vec: PlaneVector, e: PointerEvent<SVGCircleElement>): void => {
    const w = toWorld(e.clientX, e.clientY);
    const from = vec.from ?? [0, 0];
    const clamp = (x: number): number => Math.min(20, Math.max(-20, x));
    vec.onChange?.(tidy([clamp(w[0] - from[0]), clamp(w[1] - from[1])]));
  };
  const onHandleKey = (vec: PlaneVector, e: KeyboardEvent<SVGCircleElement>): void => {
    const step = e.shiftKey ? 1 : 0.1;
    const moves: Record<string, Vec2> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    vec.onChange?.([round1(vec.v[0] + move[0]), round1(vec.v[1] + move[1])]);
  };

  // --- what is visible ---
  const step = view.half <= 8 ? 1 : view.half <= 18 ? 2 : 5;
  const first = (c: number): number => Math.ceil((c - view.half) / step) * step;
  const ticksX: number[] = [];
  for (let x = first(view.cx); x <= view.cx + view.half; x += step) ticksX.push(x);
  const ticksY: number[] = [];
  for (let y = first(view.cy); y <= view.cy + view.half; y += step) ticksY.push(y);

  const reach = Math.abs(view.cx) + Math.abs(view.cy) + view.half * 3;
  const pts = (ps: readonly Vec2[]): string => ps.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ');

  const warped: { a: Vec2; b: Vec2; main: boolean }[] = [];
  if (grid) {
    for (let i = -GRID_REACH; i <= GRID_REACH; i++) {
      warped.push({
        a: apply(grid, [i, -GRID_REACH]),
        b: apply(grid, [i, GRID_REACH]),
        main: i === 0,
      });
      warped.push({
        a: apply(grid, [-GRID_REACH, i]),
        b: apply(grid, [GRID_REACH, i]),
        main: i === 0,
      });
    }
  }
  const squareDet = unitSquare
    ? unitSquare[0][0] * unitSquare[1][1] - unitSquare[0][1] * unitSquare[1][0]
    : 0;

  const zoom = (factor: number): void =>
    setView((v) => ({ ...v, half: Math.min(40, Math.max(2, v.half * factor)) }));

  return (
    <div className="relative w-full select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${S} ${S}`}
        className="block aspect-square w-full rounded-xl border border-line"
        style={{ background: COLORS.bg, touchAction: 'pan-y' }}
        role="group"
        aria-label={ariaLabel}
        data-testid="plane"
        onPointerDown={onBgDown}
        onPointerMove={onBgMove}
        onPointerUp={onBgUp}
        onPointerCancel={() => (pan.current = null)}
      >
        {shadePlane && <rect x={0} y={0} width={S} height={S} fill={shadePlane} opacity={0.16} />}

        {/* plain grid */}
        <g stroke={COLORS.grid} strokeWidth={1} opacity={grid ? 0.55 : 1}>
          {ticksX.map((x) => (
            <line key={`gx${x}`} x1={sx(x)} y1={0} x2={sx(x)} y2={S} />
          ))}
          {ticksY.map((y) => (
            <line key={`gy${y}`} x1={0} y1={sy(y)} x2={S} y2={sy(y)} />
          ))}
        </g>

        {/* grid bent by a matrix */}
        {warped.map((l, i) => (
          <line
            key={`w${i}`}
            x1={sx(l.a[0])}
            y1={sy(l.a[1])}
            x2={sx(l.b[0])}
            y2={sy(l.b[1])}
            stroke={COLORS.warped}
            strokeWidth={l.main ? 2 : 1}
            opacity={l.main ? 0.95 : 0.6}
          />
        ))}

        {/* axes and tick labels */}
        <g stroke={COLORS.axis} strokeWidth={1.5}>
          <line x1={0} y1={sy(0)} x2={S} y2={sy(0)} />
          <line x1={sx(0)} y1={0} x2={sx(0)} y2={S} />
        </g>
        <g fill={COLORS.muted} fontSize={11} aria-hidden="true">
          {ticksX
            .filter((x) => x !== 0)
            .map((x) => (
              <text key={`tx${x}`} x={sx(x)} y={sy(0) + 14} textAnchor="middle">
                {x}
              </text>
            ))}
          {ticksY
            .filter((y) => y !== 0)
            .map((y) => (
              <text key={`ty${y}`} x={sx(0) - 6} y={sy(y) + 4} textAnchor="end">
                {y}
              </text>
            ))}
          <text x={S - 8} y={sy(0) - 8} textAnchor="end" fontSize={13}>
            x
          </text>
          <text x={sx(0) + 8} y={14} fontSize={13}>
            y
          </text>
        </g>

        {unitSquare && (
          <polygon
            points={pts([
              [0, 0],
              apply(unitSquare, [1, 0]),
              apply(unitSquare, [1, 1]),
              apply(unitSquare, [0, 1]),
            ])}
            fill={squareDet < 0 ? COLORS.flipped : COLORS.accent}
            fillOpacity={0.28}
            stroke={squareDet < 0 ? COLORS.flipped : COLORS.accent}
            strokeWidth={1.5}
            strokeDasharray={squareDet < 0 ? '5 4' : undefined}
          />
        )}

        {shapeF && (
          <polygon
            points={pts(F_SHAPE.map((p) => apply(shapeF, p)))}
            fill={COLORS.u}
            fillOpacity={0.3}
            stroke={COLORS.u}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}

        {lines.map((l, i) => {
          const n = norm(l.dir);
          if (n < 1e-9) return null;
          const d: Vec2 = [(l.dir[0] / n) * reach, (l.dir[1] / n) * reach];
          return (
            <line
              key={`l${i}`}
              x1={sx(-d[0])}
              y1={sy(-d[1])}
              x2={sx(d[0])}
              y2={sy(d[1])}
              stroke={l.color}
              strokeWidth={l.width ?? 2}
              strokeDasharray={l.dashed ? '6 6' : undefined}
              opacity={0.75}
            />
          );
        })}

        {trail?.map((p, i) => (
          <circle
            key={`t${i}`}
            cx={sx(p[0])}
            cy={sy(p[1])}
            r={2.5}
            fill={COLORS.accent}
            opacity={0.55}
          />
        ))}

        {points.map((pt, i) => {
          const color = pt.color ?? COLORS.accent;
          const x = sx(pt.p[0]);
          const y = sy(pt.p[1]);
          return (
            <g key={`p${i}`}>
              {pt.shape === 'ring' ? (
                <>
                  <circle cx={x} cy={y} r={9} fill="none" stroke={color} strokeWidth={2.5} />
                  <circle cx={x} cy={y} r={2.5} fill={color} />
                </>
              ) : (
                <circle cx={x} cy={y} r={5} fill={color} stroke={COLORS.bg} strokeWidth={1.5} />
              )}
              {pt.label && (
                <text
                  x={x + 12}
                  y={y - 10}
                  fill={color}
                  fontSize={13}
                  fontWeight={600}
                  stroke={COLORS.bg}
                  strokeWidth={4}
                  paintOrder="stroke"
                >
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}

        {/* arrows */}
        {vectors.map((vec) => {
          const from = vec.from ?? [0, 0];
          const tip: Vec2 = [from[0] + vec.v[0], from[1] + vec.v[1]];
          return (
            <Arrow
              key={vec.id}
              x1={sx(from[0])}
              y1={sy(from[1])}
              x2={sx(tip[0])}
              y2={sy(tip[1])}
              color={vec.color}
              dashed={vec.dashed}
              width={vec.width}
            />
          );
        })}

        {/* labels sit above every arrow so they stay readable */}
        {vectors.map((vec) => {
          if (!vec.label) return null;
          const from = vec.from ?? [0, 0];
          const tip: Vec2 = [from[0] + vec.v[0], from[1] + vec.v[1]];
          const len = norm(vec.v);
          const ux = len > 1e-9 ? vec.v[0] / len : 0.7;
          const uy = len > 1e-9 ? vec.v[1] / len : 0.7;
          const text = vec.hideCoords ? vec.label : `${vec.label} = ${fmtVec(vec.v)}`;
          return (
            <text
              key={`label-${vec.id}`}
              x={sx(tip[0]) + ux * 14}
              // Lift labels of flat arrows so they do not sit on top of the axis.
              y={sy(tip[1]) - uy * 14 + 4 - (Math.abs(uy) < 0.35 ? 12 : 0)}
              textAnchor={ux > 0.3 ? 'start' : ux < -0.3 ? 'end' : 'middle'}
              fill={vec.color}
              fontSize={13}
              fontWeight={600}
              stroke={COLORS.bg}
              strokeWidth={4}
              paintOrder="stroke"
            >
              {text}
            </text>
          );
        })}

        {/* drag handles */}
        {vectors
          .filter((vec) => vec.onChange)
          .map((vec) => {
            const from = vec.from ?? [0, 0];
            return (
              <circle
                key={`handle-${vec.id}`}
                className="plane-handle"
                data-testid={`handle-${vec.id}`}
                cx={sx(from[0] + vec.v[0])}
                cy={sy(from[1] + vec.v[1])}
                r={15}
                fill="transparent"
                tabIndex={0}
                role="slider"
                aria-label={`${vec.label ?? vec.id} arrow. Use the arrow keys to move its tip.`}
                aria-valuenow={vec.v[0]}
                aria-valuetext={`x ${fmt(vec.v[0])}, y ${fmt(vec.v[1])}`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (e.currentTarget.hasPointerCapture(e.pointerId)) dragTo(vec, e);
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }}
                onKeyDown={(e) => onHandleKey(vec, e)}
              />
            );
          })}
      </svg>

      <div className="absolute right-2 top-2 flex gap-1">
        {(
          [
            ['+', 'Zoom in', () => zoom(1 / 1.3)],
            ['−', 'Zoom out', () => zoom(1.3)],
            ['⟲', 'Reset view', () => setView({ cx: 0, cy: 0, half: range })],
          ] as const
        ).map(([text, label, action]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            title={label}
            onClick={action}
            className="h-7 w-7 rounded-md border border-line bg-panel/90 text-sm text-muted hover:text-ink"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
