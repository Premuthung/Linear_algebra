import { useState } from 'react';
import { AiPanel } from '../../components/AiPanel/AiPanel';
import {
  CoordinatePlane,
  type PlaneVector,
} from '../../components/CoordinatePlane/CoordinatePlane';
import { Term } from '../../components/Glossary/Term';
import { LessonShell, type LessonStep } from '../../components/LessonShell';
import { PredictReveal } from '../../components/PredictReveal/PredictReveal';
import { Quiz, type Question } from '../../components/Quiz/Quiz';
import { VectorInput } from '../../components/VectorInput/VectorInput';
import { BreakIt, Button, Card, Challenge, Numbers, Stage, Tex } from '../../components/ui';
import { fromColumns, solve } from '../../core/mat';
import { scale, type Vec2 } from '../../core/vec';
import { fmt, fmtVec, paren, texVec } from '../../format';
import { useProgress } from '../../store/progress';
import { COLORS } from '../../theme';
import { useBasisLesson } from './store';

const ID = '04-basis-and-coordinates';

/** Coordinates of p when measured with the sticks b1 and b2. Null if the sticks share a line. */
function coordsIn(b1: Vec2, b2: Vec2, p: Vec2): Vec2 | null {
  return solve(fromColumns(b1, b2), p);
}

/** Dashed path: c1 steps of b1, then c2 steps of b2. */
function pathArrows(b1: Vec2, b2: Vec2, c: Vec2): PlaneVector[] {
  const first = scale(b1, c[0]);
  return [
    { id: 'path-1', v: first, color: COLORS.ihat, dashed: true, width: 2 },
    { id: 'path-2', v: scale(b2, c[1]), from: first, color: COLORS.jhat, dashed: true, width: 2 },
  ];
}

function BasisPlane({ p, onP }: { p: Vec2; onP?: (p: Vec2) => void }) {
  const { b1, b2, set } = useBasisLesson();
  const snap = useProgress((s) => s.snap);
  const c = coordsIn(b1, b2, p);

  return (
    <CoordinatePlane
      snap={snap}
      grid={c ? fromColumns(b1, b2) : undefined}
      vectors={[
        ...(c ? pathArrows(b1, b2, c) : []),
        { id: 'P', v: p, color: COLORS.accent, label: 'P', onChange: onP, width: 2 },
        { id: 'b1', v: b1, color: COLORS.ihat, label: 'b₁', onChange: (x) => set({ b1: x }) },
        { id: 'b2', v: b2, color: COLORS.jhat, label: 'b₂', onChange: (x) => set({ b2: x }) },
      ]}
      ariaLabel="Plane with the basis vectors b1 and b2 and the point P"
    />
  );
}

function CoordinateCards({ p }: { p: Vec2 }) {
  const { b1, b2 } = useBasisLesson();
  const c = coordsIn(b1, b2, p);
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-panel2 p-3">
          <p className="text-sm text-muted">Standard coordinates (using î and ĵ)</p>
          <p className="text-xl font-semibold" data-testid="standard-coords">
            {fmtVec(p)}
          </p>
        </div>
        <div className="rounded-lg bg-panel2 p-3">
          <p className="text-sm text-muted">Coordinates in your basis (using b₁ and b₂)</p>
          <p className="text-xl font-semibold text-accent" data-testid="basis-coords">
            {c ? fmtVec(c) : 'none'}
          </p>
        </div>
      </div>
      {c ? (
        <Numbers>
          <Tex block>
            {`P = ${fmt(c[0])} \\cdot b_1 + ${paren(c[1])} \\cdot b_2 = ${fmt(c[0])} ${texVec(b1)} + ${paren(c[1])} ${texVec(b2)} = ${texVec(p)}`}
          </Tex>
        </Numbers>
      ) : (
        <p role="status" className="rounded-lg bg-warn/15 px-3 py-2 text-warn">
          ✗ These two arrows lie on the same line. They cannot be a basis: they only reach a line,
          not the whole plane.
        </p>
      )}
    </>
  );
}

const BASES: { name: string; b1: Vec2; b2: Vec2 }[] = [
  { name: 'Standard: î and ĵ', b1: [1, 0], b2: [0, 1] },
  { name: 'Longer sticks', b1: [2, 0], b2: [0, 2] },
  { name: 'Tilted', b1: [1, 1], b2: [-1, 1] },
];

function PlayStep() {
  const { b1, b2, p, set } = useBasisLesson();

  return (
    <Stage plane={<BasisPlane p={p} onP={(x) => set({ p: x })} />}>
      <Card title="Change the measuring sticks">
        <p>
          A <Term k="basis" /> is a pair of arrows used as measuring sticks. The usual pair is{' '}
          <strong style={{ color: COLORS.ihat }}>î = [1, 0]</strong> and{' '}
          <strong style={{ color: COLORS.jhat }}>ĵ = [0, 1]</strong>.
        </p>
        <p>
          Drag <strong style={{ color: COLORS.ihat }}>b₁</strong> and{' '}
          <strong style={{ color: COLORS.jhat }}>b₂</strong>. The blue grid is redrawn with your
          sticks. The point <strong className="text-accent">P</strong> does not move.
        </p>
        <div className="flex flex-wrap gap-2">
          {BASES.map((item) => (
            <Button key={item.name} onClick={() => set({ b1: item.b1, b2: item.b2 })}>
              {item.name}
            </Button>
          ))}
        </div>
        <VectorInput name="b₁" value={b1} onChange={(x) => set({ b1: x })} color={COLORS.ihat} />
        <VectorInput name="b₂" value={b2} onChange={(x) => set({ b2: x })} color={COLORS.jhat} />
        <VectorInput name="P" value={p} onChange={(x) => set({ p: x })} color={COLORS.accent} />
      </Card>

      <Card title="Same point, two lists of numbers">
        <CoordinateCards p={p} />
        <p className="rounded-lg border border-line px-3 py-2">
          <strong>Key idea:</strong> coordinates are instructions. “Take this many of b₁, then this
          many of b₂.” A different basis gives different numbers for the same point.
        </p>
        <BreakIt>Drag b₂ onto the line of b₁. What happens to the grid?</BreakIt>
      </Card>
    </Stage>
  );
}

const PREDICT = {
  b1: [2, 0] as Vec2,
  b2: [0, 2] as Vec2,
  p: [4, 2] as Vec2,
  answer: [2, 1] as Vec2,
};

function PredictStep() {
  const [guess, setGuess] = useState<Vec2>([0, 0]);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage
      plane={
        <CoordinatePlane
          grid={fromColumns(PREDICT.b1, PREDICT.b2)}
          vectors={[
            ...(revealed ? pathArrows(PREDICT.b1, PREDICT.b2, PREDICT.answer) : []),
            { id: 'P', v: PREDICT.p, color: COLORS.accent, label: 'P', hideCoords: true, width: 2 },
            { id: 'b1', v: PREDICT.b1, color: COLORS.ihat, label: 'b₁' },
            { id: 'b2', v: PREDICT.b2, color: COLORS.jhat, label: 'b₂' },
          ]}
          ariaLabel="Plane with a stretched basis and the point P"
        />
      }
    >
      <Card title="Predict first">
        <PredictReveal
          question="The basis is b₁ = [2, 0] and b₂ = [0, 2]. The point P sits at [4, 2] on the plane. What are the coordinates of P in this basis?"
          answer={PREDICT.answer}
          guess={guess}
          onGuess={setGuess}
          revealed={revealed}
          onReveal={setRevealed}
          typedOnly
          tip={(g) =>
            g[0] === 4 && g[1] === 2
              ? 'Those are the standard coordinates. Count in steps of b₁ and b₂ instead.'
              : 'How many b₁ steps fit in 4? How many b₂ steps fit in 2?'
          }
          why={
            <>
              Each stick is 2 long. You need 2 steps of b₁ to go 4 right, and 1 step of b₂ to go 2
              up. So P = 2·b₁ + 1·b₂, and its coordinates in this basis are [2, 1].
            </>
          }
        />
      </Card>
    </Stage>
  );
}

const CHALLENGE_P: Vec2 = [4, 2];
const near = (c: Vec2 | null, target: Vec2): boolean =>
  c !== null && Math.abs(c[0] - target[0]) < 0.05 && Math.abs(c[1] - target[1]) < 0.05;

function ChallengeStep() {
  const { b1, b2, set } = useBasisLesson();
  const c = coordsIn(b1, b2, CHALLENGE_P);

  return (
    <Stage plane={<BasisPlane p={CHALLENGE_P} />}>
      <Card title="The point P is fixed at [4, 2]">
        <p>Only the basis may move. Drag b₁ and b₂, or type them.</p>
        <VectorInput name="b₁" value={b1} onChange={(x) => set({ b1: x })} color={COLORS.ihat} />
        <VectorInput name="b₂" value={b2} onChange={(x) => set({ b2: x })} color={COLORS.jhat} />
        <CoordinateCards p={CHALLENGE_P} />
      </Card>

      <Challenge
        title="Find a basis where P has the coordinates [1, 1]."
        done={near(c, [1, 1])}
        hints={[
          'Coordinates [1, 1] mean: one step of b₁, then one step of b₂, lands on P.',
          'You need b₁ + b₂ = [4, 2]. Pick any b₁, then choose b₂ to finish the trip.',
        ]}
        answer="For example b₁ = [3, 0] and b₂ = [1, 2]. Their sum is [4, 2]."
        solvedNote="Many bases work. Any two sticks that add up to P will do."
      />

      <Challenge
        title="Now find a basis where P has the coordinates [2, 0]."
        done={near(c, [2, 0])}
        hints={[
          'Coordinates [2, 0] mean: two steps of b₁ and no steps of b₂.',
          'You need 2·b₁ = [4, 2]. b₂ can be anything that is not on the same line.',
        ]}
        answer="b₁ = [2, 1], and for example b₂ = [0, 1]."
      />
    </Stage>
  );
}

const QUESTIONS: Question[] = [
  {
    kind: 'choice',
    prompt: 'You change the basis. What happens to the point itself?',
    options: [
      'It moves to a new place',
      'It stays where it is; only its numbers change',
      'It disappears',
    ],
    answer: 1,
    hint: 'On the Play step, drag b₁ and watch P.',
    explain:
      'The point is the same. Its coordinates are just a description, and the description changed.',
  },
  {
    kind: 'vector',
    prompt:
      'The basis is b₁ = [1, 1] and b₂ = [−1, 1]. A point has coordinates [2, 1] in this basis. Where is it in standard coordinates?',
    answer: [1, 3],
    hint: 'Take 2 of b₁ and 1 of b₂, then add.',
    explain: '2·[1, 1] + 1·[−1, 1] = [2, 2] + [−1, 1] = [1, 3].',
  },
  {
    kind: 'choice',
    prompt: 'Can [1, 2] and [2, 4] be a basis for the plane?',
    options: ['Yes', 'No, they lie on the same line'],
    answer: 1,
    hint: 'Is one of them a multiple of the other?',
    explain: '[2, 4] = 2·[1, 2]. Two sticks on one line can only reach that line.',
  },
  {
    kind: 'vector',
    prompt:
      'The basis is b₁ = [3, 0] and b₂ = [0, 1]. The point sits at [6, 2] on the plane. What are its coordinates in this basis?',
    answer: [2, 2],
    hint: 'How many steps of length 3 make 6? How many steps of length 1 make 2?',
    explain: '2·[3, 0] + 2·[0, 1] = [6, 2].',
  },
];

function QuizStep() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Quiz lessonId={ID} questions={QUESTIONS} />
      <AiPanel
        points={[
          <>
            The dimensions of an <Term k="embedding" /> are a basis that the model learned by
            itself.
          </>,
          <>
            Nobody labelled them. There is no hand-made axis such as “x = royalty”. In practice,
            meanings are mixed across many directions.
          </>,
          <>
            The same word could be described with other axes. The meaning stays; only the numbers
            change. That is exactly what you saw with the point P.
          </>,
        ]}
        scaleNote="Our basis has 2 vectors. A model's embedding space has hundreds or thousands of basis directions."
      />
    </div>
  );
}

const STEPS: LessonStep[] = [
  { title: 'Play', Body: PlayStep },
  { title: 'Predict', Body: PredictStep },
  { title: 'Challenges', Body: ChallengeStep },
  { title: 'Quiz and AI', Body: QuizStep },
];

export default function BasisLesson({ step }: { step: number }) {
  const reset = useBasisLesson((s) => s.reset);
  const surprise = useBasisLesson((s) => s.surprise);
  return <LessonShell id={ID} steps={STEPS} step={step} onReset={reset} onSurprise={surprise} />;
}
