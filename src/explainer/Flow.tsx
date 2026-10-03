import type { KeyboardEvent, ReactNode } from 'react';
import { fmt } from '../format';
import { FLOW } from '../theme';
import { CANDIDATES, DIM, FEATURES, W, type ModelRun } from './model';

export type StageId = 'tokens' | 'embedding' | 'attention' | 'matrix' | 'output';

export const STAGES: { id: StageId; label: string; x: number; width: number }[] = [
  { id: 'tokens', label: '1 · Words', x: 16, width: 100 },
  { id: 'embedding', label: '2 · Vectors', x: 176, width: 136 },
  { id: 'attention', label: '3 · Dot product', x: 334, width: 158 },
  { id: 'matrix', label: '4 · Matrix × vector', x: 548, width: 250 },
  { id: 'output', label: '5 · Scores → chances', x: 930, width: 254 },
];

// Everything is drawn in one 1200 × 480 picture and scaled to the page.
const WIDTH = 1200;
const HEIGHT = 480;
const MID = 268;
const CELL = 34;
const TOKEN_X = 16;
const TOKEN_W = 100;
const EMBED_X = 176;
const CONTEXT_X = 452;
const MATRIX_X = 556;
const HIDDEN_X = 756;
const COLUMN_W = 40;
const OUT_X = 930;
const BAR_X = 1024;
const BAR_MAX = 118;
const COLUMN_TOP = MID - (DIM * CELL) / 2;

function tokenY(i: number, n: number): number {
  return MID + (i - (n - 1) / 2) * 62;
}

function candidateY(j: number): number {
  return MID + (j - (CANDIDATES.length - 1) / 2) * 46;
}

/** A soft S-shaped line from left to right. */
function curve(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function activate(run: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      run();
    }
  };
}

/** One number as a coloured square: purple for positive, red for negative, pale for near zero. */
function Cell({ x, y, value, max }: { x: number; y: number; value: number; max: number }) {
  const strength = Math.min(1, Math.abs(value) / max);
  return (
    <g>
      <rect x={x} y={y} width={CELL} height={CELL} fill="#ffffff" />
      <rect
        x={x}
        y={y}
        width={CELL}
        height={CELL}
        fill={value < 0 ? FLOW.negative : FLOW.positive}
        opacity={0.06 + strength * 0.8}
      />
      <rect x={x} y={y} width={CELL} height={CELL} fill="none" stroke="#ffffff" strokeWidth={1.5} />
      <text
        x={x + CELL / 2}
        y={y + CELL / 2 + 3.5}
        textAnchor="middle"
        fontSize={10.5}
        fontFamily="ui-monospace, Consolas, monospace"
        fill={strength > 0.5 ? '#ffffff' : '#1c2033'}
      >
        {fmt(value)}
      </text>
    </g>
  );
}

/** A ribbon with a colour fade and small dashes that travel along it. */
function Ribbon({
  d,
  width,
  gradient,
  faded,
}: {
  d: string;
  width: number;
  gradient: string;
  faded: boolean;
}) {
  return (
    <g opacity={faded ? 0.4 : 1} style={{ transition: 'opacity 0.2s' }}>
      <path d={d} fill="none" stroke={`url(#${gradient})`} strokeWidth={width} opacity={0.75} />
      <path
        d={d}
        fill="none"
        stroke="#ffffff"
        strokeWidth={Math.min(2, width * 0.5)}
        strokeLinecap="round"
        className="flow-dash"
        opacity={0.9}
      />
    </g>
  );
}

function Part({
  delay,
  children,
}: {
  /** Order in which the parts slide in. */
  delay: number;
  children: ReactNode;
}) {
  return (
    <g className="flow-in" style={{ animationDelay: `${delay * 0.18}s` }}>
      {children}
    </g>
  );
}

interface FlowProps {
  run: ModelRun;
  stage: StageId;
  onStage: (stage: StageId) => void;
  /** The word whose path is lit up. */
  token: number;
  onToken: (index: number) => void;
  /** The answer word whose path is lit up. */
  candidate: number;
  onCandidate: (index: number) => void;
}

/** The big picture: words turn into vectors, mix, pass through a matrix, and become chances. */
export function Flow({ run, stage, onStage, token, onToken, candidate, onCandidate }: FlowProps) {
  const n = run.tokens.length;
  const maxHidden = Math.max(1, ...run.hidden.map(Math.abs));

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block w-full min-w-[920px]"
        role="group"
        aria-label="How a sentence flows through a small language model"
        data-testid="flow"
      >
        <defs>
          {(
            [
              ['g-token', TOKEN_X + TOKEN_W, EMBED_X, FLOW.token, FLOW.blue],
              ['g-attention', EMBED_X + DIM * CELL, CONTEXT_X, FLOW.blue, FLOW.indigo],
              ['g-matrix', CONTEXT_X + COLUMN_W, HIDDEN_X, FLOW.indigo, FLOW.purple],
              ['g-output', HIDDEN_X + COLUMN_W, OUT_X, FLOW.purple, FLOW.pink],
            ] as const
          ).map(([id, x1, x2, from, to]) => (
            <linearGradient key={id} id={id} gradientUnits="userSpaceOnUse" x1={x1} x2={x2}>
              <stop offset="0" stopColor={from} />
              <stop offset="1" stopColor={to} />
            </linearGradient>
          ))}
          <linearGradient id="g-bar" x1="0" x2="1">
            <stop offset="0" stopColor={FLOW.purple} />
            <stop offset="1" stopColor={FLOW.pink} />
          </linearGradient>
        </defs>

        {/* Stage names. Click one to read how that step works. */}
        {STAGES.map((s) => {
          const on = s.id === stage;
          return (
            <g
              key={s.id}
              className="flow-part"
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`Step ${s.label}`}
              data-testid={`stage-${s.id}`}
              onClick={() => onStage(s.id)}
              onKeyDown={activate(() => onStage(s.id))}
            >
              <rect
                x={s.x}
                y={10}
                width={s.width}
                height={30}
                rx={15}
                fill={on ? '#6d28d9' : '#f3f5fb'}
                stroke={on ? '#6d28d9' : '#dfe3ee'}
              />
              <text
                x={s.x + s.width / 2}
                y={30}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                fill={on ? '#ffffff' : '#1c2033'}
              >
                {s.label}
              </text>
            </g>
          );
        })}

        {/* 1 → 2: every word is swapped for its vector. */}
        <Part delay={1}>
          {run.tokens.map((_, i) => (
            <Ribbon
              key={i}
              d={curve(TOKEN_X + TOKEN_W, tokenY(i, n), EMBED_X, tokenY(i, n))}
              width={5}
              gradient="g-token"
              faded={i !== token}
            />
          ))}
        </Part>

        {/* 3: the wider the ribbon, the more this word counts in the mix. */}
        <Part delay={2}>
          {run.tokens.map((_, i) => (
            <g key={i}>
              <Ribbon
                d={curve(EMBED_X + DIM * CELL, tokenY(i, n), CONTEXT_X, MID)}
                width={2 + run.attention[i] * 30}
                gradient="g-attention"
                faded={i !== token}
              />
              <text
                x={EMBED_X + DIM * CELL + 8}
                y={tokenY(i, n) - 12}
                fontSize={11}
                fill="#5b6480"
                fontFamily="ui-monospace, Consolas, monospace"
              >
                {Math.round(run.attention[i] * 100)}%
              </text>
            </g>
          ))}
        </Part>

        {/* 4: the mixed vector goes through the matrix. */}
        <Part delay={3}>
          <Ribbon
            d={curve(CONTEXT_X + COLUMN_W, MID, MATRIX_X, MID)}
            width={26}
            gradient="g-matrix"
            faded={false}
          />
          <Ribbon
            d={curve(MATRIX_X + DIM * CELL, MID, HIDDEN_X, MID)}
            width={26}
            gradient="g-matrix"
            faded={false}
          />
        </Part>

        {/* 5: one ribbon to every answer word, as wide as its chance. */}
        <Part delay={4}>
          {CANDIDATES.map((c, j) => (
            <Ribbon
              key={c.word}
              d={curve(HIDDEN_X + COLUMN_W, MID, OUT_X, candidateY(j))}
              width={1.5 + run.probs[j] * 30}
              gradient="g-output"
              faded={j !== candidate}
            />
          ))}
        </Part>

        {/* Words */}
        <Part delay={0}>
          {run.tokens.map((word, i) => {
            const y = tokenY(i, n);
            const on = i === token;
            return (
              <g
                key={i}
                className="flow-part"
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`Word ${word}`}
                data-testid={`token-${i}`}
                onClick={() => onToken(i)}
                onMouseEnter={() => onToken(i)}
                onKeyDown={activate(() => onToken(i))}
              >
                <rect
                  x={TOKEN_X}
                  y={y - 18}
                  width={TOKEN_W}
                  height={36}
                  rx={10}
                  fill={on ? '#eef2ff' : '#f3f5fb'}
                  stroke={on ? '#6d28d9' : '#dfe3ee'}
                  strokeWidth={on ? 2 : 1}
                />
                <text
                  x={TOKEN_X + TOKEN_W / 2}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={15}
                  fontWeight={600}
                  fill="#1c2033"
                >
                  {word}
                </text>
              </g>
            );
          })}
        </Part>

        {/* Word vectors */}
        <Part delay={1}>
          {FEATURES.map((name, d) => (
            <text
              key={name}
              x={EMBED_X + d * CELL + CELL / 2}
              y={tokenY(0, n) - 24}
              textAnchor="middle"
              fontSize={9.5}
              fill="#5b6480"
            >
              {name}
            </text>
          ))}
          {run.vectors.map((x, i) => (
            <g key={i} opacity={i === token ? 1 : 0.55} style={{ transition: 'opacity 0.2s' }}>
              {x.map((value, d) => (
                <Cell
                  key={d}
                  x={EMBED_X + d * CELL}
                  y={tokenY(i, n) - CELL / 2}
                  value={value}
                  max={1}
                />
              ))}
            </g>
          ))}
        </Part>

        {/* Mixed vector c */}
        <Part delay={2}>
          <text x={CONTEXT_X + COLUMN_W / 2} y={COLUMN_TOP - 10} textAnchor="middle" fontSize={13}>
            <tspan fontStyle="italic" fontWeight={700}>
              c
            </tspan>
          </text>
          {run.context.map((value, d) => (
            <Cell
              key={d}
              x={CONTEXT_X + (COLUMN_W - CELL) / 2}
              y={COLUMN_TOP + d * CELL}
              value={value}
              max={1}
            />
          ))}
        </Part>

        {/* Matrix W and the result h */}
        <Part delay={3}>
          <text
            x={MATRIX_X + (DIM * CELL) / 2}
            y={COLUMN_TOP - 10}
            textAnchor="middle"
            fontSize={13}
          >
            <tspan fontWeight={700}>W</tspan>
          </text>
          {W.map((row, r) =>
            row.map((value, c) => (
              <Cell
                key={`${r}-${c}`}
                x={MATRIX_X + c * CELL}
                y={COLUMN_TOP + r * CELL}
                value={value}
                max={1.2}
              />
            )),
          )}
          <text x={HIDDEN_X + COLUMN_W / 2} y={COLUMN_TOP - 10} textAnchor="middle" fontSize={13}>
            <tspan fontStyle="italic" fontWeight={700}>
              h
            </tspan>
            <tspan fill="#5b6480"> = Wc</tspan>
          </text>
          {run.hidden.map((value, d) => (
            <Cell
              key={d}
              x={HIDDEN_X + (COLUMN_W - CELL) / 2}
              y={COLUMN_TOP + d * CELL}
              value={value}
              max={maxHidden}
            />
          ))}
        </Part>

        {/* Answer words with their chances */}
        <Part delay={4}>
          {CANDIDATES.map((c, j) => {
            const y = candidateY(j);
            const on = j === candidate;
            const best = j === run.best;
            return (
              <g
                key={c.word}
                className="flow-part"
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`Answer ${c.word}, ${Math.round(run.probs[j] * 100)} percent`}
                data-testid={`candidate-${c.word}`}
                onClick={() => onCandidate(j)}
                onMouseEnter={() => onCandidate(j)}
                onKeyDown={activate(() => onCandidate(j))}
              >
                <rect
                  x={OUT_X}
                  y={y - 17}
                  width={WIDTH - OUT_X - 8}
                  height={34}
                  rx={9}
                  fill={on ? '#f5f3ff' : 'transparent'}
                  stroke={on ? '#c4b5fd' : 'transparent'}
                />
                <text
                  x={OUT_X + 12}
                  y={y + 5}
                  fontSize={14}
                  fontWeight={best ? 700 : 500}
                  fill="#1c2033"
                >
                  {c.word}
                </text>
                <rect x={BAR_X} y={y - 8} width={BAR_MAX} height={16} rx={8} fill="#eef0f7" />
                <rect
                  x={BAR_X}
                  y={y - 8}
                  width={Math.max(3, run.probs[j] * BAR_MAX)}
                  height={16}
                  rx={8}
                  fill="url(#g-bar)"
                  style={{ transition: 'width 0.3s' }}
                />
                <text
                  x={BAR_X + BAR_MAX + 8}
                  y={y + 4}
                  fontSize={12}
                  fontFamily="ui-monospace, Consolas, monospace"
                  fill="#1c2033"
                >
                  {fmt(run.probs[j] * 100, 0)}%
                </text>
              </g>
            );
          })}
        </Part>
      </svg>
    </div>
  );
}
