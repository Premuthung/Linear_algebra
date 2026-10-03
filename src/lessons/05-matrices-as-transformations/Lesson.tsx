import { useState } from 'react';
import { AiPanel } from '../../components/AiPanel/AiPanel';
import {
  CoordinatePlane,
  type PlaneLine,
  type PlaneVector,
} from '../../components/CoordinatePlane/CoordinatePlane';
import { Term } from '../../components/Glossary/Term';
import { LessonShell, type LessonStep } from '../../components/LessonShell';
import { MatrixEditor } from '../../components/MatrixEditor/MatrixEditor';
import { NumberFlow } from '../../components/NumberFlow/NumberFlow';
import { PredictReveal } from '../../components/PredictReveal/PredictReveal';
import { Quiz, type Question } from '../../components/Quiz/Quiz';
import { TransformPlayer } from '../../components/TransformPlayer/TransformPlayer';
import { VectorInput } from '../../components/VectorInput/VectorInput';
import { BreakIt, Button, Card, Challenge, Numbers, Slider, Stage, Tex } from '../../components/ui';
import { apply, column, det, fromColumns, lerp, type Mat2 } from '../../core/mat';
import { IDENTITY, flipX, flipY, projectX, rotate, swapXY } from '../../core/presets';
import { norm, type Vec2 } from '../../core/vec';
import { fmt, fmtVec, paren, texMat, texVec } from '../../format';
import { useSmoothMat } from '../../hooks/animation';
import { useProgress } from '../../store/progress';
import { COLORS } from '../../theme';
import { useMatrixLesson } from './store';

const ID = '05-matrices-as-transformations';

const sameMatrix = (A: Mat2, B: Mat2): boolean =>
  A.every((row, i) => row.every((x, j) => Math.abs(x - B[i][j]) < 0.01));

/** Arrows for where î and ĵ are right now. Drag them to edit the matrix columns. */
function basisArrows(
  shown: Mat2,
  M: Mat2,
  setM?: (M: Mat2, instant: boolean) => void,
): PlaneVector[] {
  return [
    {
      id: 'i-hat',
      v: column(shown, 0),
      color: COLORS.ihat,
      label: 'î',
      onChange: setM ? (x) => setM(fromColumns(x, column(M, 1)), true) : undefined,
    },
    {
      id: 'j-hat',
      v: column(shown, 1),
      color: COLORS.jhat,
      label: 'ĵ',
      onChange: setM ? (x) => setM(fromColumns(column(M, 0), x), true) : undefined,
    },
  ];
}

function PlayStep() {
  const { M, instant, t, setM, setT } = useMatrixLesson();
  const snap = useProgress((s) => s.snap);
  const smooth = useSmoothMat(M, instant);
  const shown = lerp(IDENTITY, smooth, t);
  const d = det(M);

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          grid={shown}
          unitSquare={shown}
          shapeF={shown}
          vectors={basisArrows(shown, M, setM)}
          ariaLabel="Plane transformed by the matrix"
        />
      }
    >
      <Card title="Four numbers move the whole plane">
        <p>
          A <Term k="matrix" /> is a grid of numbers. It is a rule that moves every point of the
          plane at once. That is called a <Term k="transformation" />.
        </p>
        <MatrixEditor value={M} onChange={(m) => setM(m)} />
        <p className="rounded-lg border border-line px-3 py-2">
          <strong>Key idea:</strong> <span style={{ color: COLORS.ihat }}>column 1</span> is where{' '}
          <span style={{ color: COLORS.ihat }}>î</span> lands.{' '}
          <span style={{ color: COLORS.jhat }}>Column 2</span> is where{' '}
          <span style={{ color: COLORS.jhat }}>ĵ</span> lands. Drag the green or red arrow and watch
          its column change.
        </p>
        <p data-testid="columns-readout">
          î lands at <strong style={{ color: COLORS.ihat }}>{fmtVec(column(M, 0))}</strong>, ĵ lands
          at <strong style={{ color: COLORS.jhat }}>{fmtVec(column(M, 1))}</strong>
        </p>
        {Math.abs(d) < 1e-9 ? (
          <p role="status" className="rounded-lg bg-warn/15 px-3 py-2 text-warn">
            ✗ Squashed! The whole plane is now flat (a line or a point). Information is lost.
          </p>
        ) : d < 0 ? (
          <p role="status" className="rounded-lg bg-panel2 px-3 py-2">
            The plane was <strong>flipped over</strong>, like turning a sheet of paper. The square
            turns pink with a dashed edge to show it.
          </p>
        ) : null}
      </Card>

      <Card title="Watch it happen">
        <p className="text-sm text-muted">
          Play the move from “nothing changed” to your matrix. The grid lines stay straight and
          evenly spaced, and the origin stays put.
        </p>
        <TransformPlayer t={t} onT={setT} target={M} />
        <BreakIt>Make both columns the same. What happens to the letter F?</BreakIt>
      </Card>
    </Stage>
  );
}

function PointStep() {
  const { M, instant, p, setM, setP } = useMatrixLesson();
  const snap = useProgress((s) => s.snap);
  const smooth = useSmoothMat(M, instant);
  const out = apply(M, p);
  const [[a, b], [c, d]] = M;

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          grid={smooth}
          vectors={[
            ...basisArrows(smooth, M),
            { id: 'out', v: apply(smooth, p), color: COLORS.accent, label: 'A·p', width: 4 },
            { id: 'p', v: p, color: COLORS.v, label: 'p', onChange: setP },
          ]}
          ariaLabel="Plane with the point p and where the matrix sends it"
        />
      }
    >
      <Card title="Type a point, see where it goes">
        <VectorInput name="p" value={p} onChange={setP} color={COLORS.v} />
        <p className="text-lg" data-testid="point-readout">
          {fmtVec(p)} → <strong className="text-accent">{fmtVec(out)}</strong>
        </p>
        <p>
          New x: <NumberFlow value={out[0]} /> &nbsp;·&nbsp; New y: <NumberFlow value={out[1]} />
        </p>
        <MatrixEditor value={M} onChange={(m) => setM(m)} showPresets={false} />
      </Card>

      <Card title="The arithmetic, written out">
        <Numbers>
          <Tex block>{`${texMat(M)} ${texVec(p)} = ${texVec(out)}`}</Tex>
          <Tex block>
            {`x' = a x + b y = ${paren(a)} \\cdot ${paren(p[0])} + ${paren(b)} \\cdot ${paren(p[1])} = ${fmt(out[0])}`}
          </Tex>
          <Tex block>
            {`y' = c x + d y = ${paren(c)} \\cdot ${paren(p[0])} + ${paren(d)} \\cdot ${paren(p[1])} = ${fmt(out[1])}`}
          </Tex>
        </Numbers>
        <p className="text-sm text-muted">
          Another way to read it: take <strong>x</strong> copies of where î lands, plus{' '}
          <strong>y</strong> copies of where ĵ lands.
        </p>
        <Numbers>
          <Tex block>
            {`${fmt(p[0])} \\cdot ${texVec(column(M, 0))} + ${fmt(p[1])} \\cdot ${texVec(column(M, 1))} = ${texVec(out)}`}
          </Tex>
        </Numbers>
      </Card>
    </Stage>
  );
}

type Demo = 'flipX' | 'flipY' | 'swap' | 'rotate' | 'squash';

const DEMOS: Record<Demo, { name: string; rule: string; note: string; mirror?: Vec2 }> = {
  flipX: {
    name: 'Flip over the x-axis',
    rule: '[x, y] → [x, −y]',
    note: 'Only the sign of y changes.',
    mirror: [1, 0],
  },
  flipY: {
    name: 'Flip over the y-axis',
    rule: '[x, y] → [−x, y]',
    note: 'Only the sign of x changes.',
    mirror: [0, 1],
  },
  swap: {
    name: 'Flip over the line y = x',
    rule: '[x, y] → [y, x]',
    note: 'The two numbers swap places.',
    mirror: [1, 1],
  },
  rotate: {
    name: 'Rotate',
    rule: '[x, y] → [x·cos θ − y·sin θ, x·sin θ + y·cos θ]',
    note: 'A rotation never changes the length of an arrow.',
  },
  squash: {
    name: 'Squash onto the x-axis',
    rule: '[x, y] → [x, 0]',
    note: 'The y number is thrown away. Many points land on the same spot, so you cannot undo it.',
    mirror: [1, 0],
  },
};

function DemoStep() {
  const { M, instant, p, setM, setP } = useMatrixLesson();
  const snap = useProgress((s) => s.snap);
  const [demo, setDemo] = useState<Demo | null>(null);
  const [degrees, setDegrees] = useState(90);
  const smooth = useSmoothMat(M, instant, 700);
  const out = apply(M, p);

  const choose = (next: Demo, deg = degrees): void => {
    setDemo(next);
    const matrices: Record<Demo, Mat2> = {
      flipX,
      flipY,
      swap: swapXY,
      rotate: rotate((deg * Math.PI) / 180),
      squash: projectX,
    };
    setM(matrices[next]);
  };

  const info = demo ? DEMOS[demo] : null;
  const lines: PlaneLine[] = info?.mirror
    ? [{ dir: info.mirror, color: COLORS.accent, dashed: true, width: 2 }]
    : [];

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          grid={smooth}
          shapeF={smooth}
          lines={lines}
          vectors={[
            ...basisArrows(smooth, M),
            { id: 'out', v: apply(smooth, p), color: COLORS.accent, label: 'A·p', width: 4 },
            { id: 'p', v: p, color: COLORS.v, label: 'p', onChange: setP },
          ]}
          ariaLabel="Plane showing a flip, a rotation or a squash"
        />
      }
    >
      <Card title="Flip, turn, squash">
        <p>Pick a move. Watch the letter F, and watch what happens to the numbers of p.</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DEMOS) as Demo[]).map((key) => (
            <Button
              key={key}
              tone={demo === key ? 'primary' : 'plain'}
              aria-pressed={demo === key}
              onClick={() => choose(key)}
            >
              {DEMOS[key].name}
            </Button>
          ))}
          <Button
            onClick={() => {
              setDemo(null);
              setM(IDENTITY);
            }}
          >
            Undo (identity)
          </Button>
        </div>
        {demo === 'rotate' && (
          <Slider
            label={`θ = ${degrees}°`}
            min={-180}
            max={180}
            step={5}
            value={degrees}
            testId="theta-slider"
            onChange={(deg) => {
              setDegrees(deg);
              choose('rotate', deg);
            }}
          />
        )}
        {info && (
          <div className="rounded-lg bg-panel2 px-3 py-2" role="status">
            <p className="font-mono text-lg" data-testid="rule">
              {info.rule}
            </p>
            <p>{info.note}</p>
          </div>
        )}
      </Card>

      <Card title="What happened to p?">
        <VectorInput name="p" value={p} onChange={setP} color={COLORS.v} />
        <p className="text-lg" data-testid="demo-readout">
          {fmtVec(p)} → <strong className="text-accent">{fmtVec(out)}</strong>
        </p>
        <Numbers>
          <Tex block>{`${texMat(M)} ${texVec(p)} = ${texVec(out)}`}</Tex>
        </Numbers>
        <p>
          Length before: <strong>{fmt(norm(p))}</strong> &nbsp;·&nbsp; Length after:{' '}
          <strong>{fmt(norm(out))}</strong>
        </p>
        <p className="text-sm text-muted">
          A flip changes only a <strong>sign</strong> or <strong>swaps</strong> the two numbers. A
          rotation keeps the length. A squash loses information.
        </p>
      </Card>
    </Stage>
  );
}

const PREDICT_P: Vec2 = [2, 1];
const PREDICT_ANSWER = apply(flipY, PREDICT_P);

function PredictStep() {
  const snap = useProgress((s) => s.snap);
  const [guess, setGuess] = useState<Vec2>([0, 0]);
  const [revealed, setRevealed] = useState(false);
  const smooth = useSmoothMat(revealed ? flipY : IDENTITY, false, 900);

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          grid={smooth}
          shapeF={smooth}
          onPlaneClick={revealed ? undefined : setGuess}
          lines={[{ dir: [0, 1], color: COLORS.accent, dashed: true, width: 2 }]}
          points={[{ p: guess, shape: 'ring', color: COLORS.w, label: 'your guess' }]}
          vectors={[
            ...(revealed
              ? [
                  {
                    id: 'out',
                    v: apply(smooth, PREDICT_P),
                    color: COLORS.accent,
                    label: 'A·p',
                    width: 4,
                  },
                ]
              : []),
            { id: 'p', v: PREDICT_P, color: COLORS.v, label: 'p' },
          ]}
          ariaLabel="Plane with the point p and the y-axis as a mirror"
        />
      }
    >
      <Card title="Predict first">
        <PredictReveal
          question="Where will [2, 1] land after a flip over the y-axis?"
          answer={PREDICT_ANSWER}
          guess={guess}
          onGuess={setGuess}
          revealed={revealed}
          onReveal={setRevealed}
          tip={(g) =>
            g[0] === 2 && g[1] === -1
              ? 'That is a flip over the x-axis. Check which number changes sign.'
              : 'The y-axis is the mirror. The height stays the same.'
          }
          why={
            <>
              The y-axis is the mirror, so left and right swap: x changes sign and y stays. The
              matrix is <Tex>{texMat(flipY)}</Tex>.
            </>
          }
        />
      </Card>
    </Stage>
  );
}

const TURN_AND_STRETCH: Mat2 = [
  [0, -1],
  [2, 0],
];

function ChallengeStep() {
  const { M, instant, setM } = useMatrixLesson();
  const snap = useProgress((s) => s.snap);
  const smooth = useSmoothMat(M, instant);

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          grid={smooth}
          shapeF={smooth}
          vectors={basisArrows(smooth, M, setM)}
          ariaLabel="Plane transformed by your matrix"
        />
      }
    >
      <Card title="Your matrix">
        <MatrixEditor value={M} onChange={(m) => setM(m)} showPresets={false} />
        <Button onClick={() => setM(IDENTITY)}>Start again from the identity</Button>
        <p className="text-sm text-muted">Type the numbers, or drag the green and red arrows.</p>
      </Card>

      <Challenge
        title="Write the matrix that flips the F upside down."
        done={sameMatrix(M, flipX)}
        hints={[
          'Upside down means: every y changes sign and every x stays.',
          'Where must î land? It stays at [1, 0]. Where must ĵ land? At [0, −1].',
        ]}
        answer={<Tex>{texMat(flipX)}</Tex>}
        solvedNote="That is a flip over the x-axis."
      />

      <Challenge
        title="Make a matrix that turns [1, 0] into [0, 2] and [0, 1] into [−1, 0]."
        done={sameMatrix(M, TURN_AND_STRETCH)}
        hints={[
          '[1, 0] is î and [0, 1] is ĵ. The columns say where they land.',
          'Column 1 must be [0, 2]. Column 2 must be [−1, 0].',
        ]}
        answer={<Tex>{texMat(TURN_AND_STRETCH)}</Tex>}
        solvedNote="You wrote it straight from the columns."
      />
    </Stage>
  );
}

const QUESTIONS: Question[] = [
  {
    kind: 'vector',
    prompt: (
      <>
        <Tex>{`A = ${texMat([
          [2, 0],
          [0, 3],
        ])}`}</Tex>
        . Where does [1, 1] land?
      </>
    ),
    answer: [2, 3],
    hint: "x' = 2·1 + 0·1 and y' = 0·1 + 3·1.",
    explain: 'x is doubled and y is tripled: [2, 3].',
  },
  {
    kind: 'choice',
    prompt: 'What does the first column of a matrix tell you?',
    options: ['Where î = [1, 0] lands', 'Where ĵ = [0, 1] lands', 'The length of every vector'],
    answer: 0,
    hint: 'On the Play step, drag the green arrow and see which column changes.',
    explain: 'Column 1 is where î lands. Column 2 is where ĵ lands.',
  },
  {
    kind: 'choice',
    prompt: 'Which matrix flips over the x-axis, so that [x, y] → [x, −y]?',
    options: ['[[1, 0], [0, −1]]', '[[−1, 0], [0, 1]]', '[[0, 1], [1, 0]]'],
    answer: 0,
    hint: 'î must stay at [1, 0]. ĵ must go to [0, −1].',
    explain: 'Columns [1, 0] and [0, −1]: x stays and y changes sign.',
  },
  {
    kind: 'vector',
    prompt: (
      <>
        <Tex>{`A = ${texMat([
          [0, -1],
          [1, 0],
        ])}`}</Tex>{' '}
        is a quarter turn. Where does [3, 0] land?
      </>
    ),
    answer: [0, 3],
    hint: '[3, 0] is 3 copies of î. Where does î land?',
    explain: 'î lands at [0, 1], so 3·î lands at [0, 3].',
  },
  {
    kind: 'choice',
    prompt:
      'The matrix [[1, 0], [0, 0]] squashes the plane onto the x-axis. Can another matrix undo it?',
    options: ['Yes, always', 'No, the y information is gone'],
    answer: 1,
    hint: 'Where do [2, 1] and [2, 5] both land?',
    explain: 'Many points land on the same spot, so nothing can tell them apart afterwards.',
  },
];

function QuizStep() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Quiz lessonId={ID} questions={QUESTIONS} />
      <AiPanel
        points={[
          <>
            <strong>A neural-network layer is exactly this:</strong> an input vector is multiplied
            by a matrix of <Term k="weight">weights</Term>, and an output vector comes out.
          </>,
          <>
            Written as a formula: <Tex>{'\\text{output} = W \\cdot \\text{input} + b'}</Tex>.
          </>,
          <>“Training” means finding good numbers for the matrix.</>,
          <>A layer that squashes (like the x-axis squash) throws information away.</>,
        ]}
        scaleNote="Our matrix has 4 numbers. One weight matrix in a real model can have millions of numbers, and a model has many of them."
      />
    </div>
  );
}

const STEPS: LessonStep[] = [
  { title: 'Play', Body: PlayStep },
  { title: 'Follow a point', Body: PointStep },
  { title: 'Flip, turn, squash', Body: DemoStep },
  { title: 'Predict', Body: PredictStep },
  { title: 'Challenges', Body: ChallengeStep },
  { title: 'Quiz and AI', Body: QuizStep },
];

export default function MatrixLesson({ step }: { step: number }) {
  const reset = useMatrixLesson((s) => s.reset);
  const surprise = useMatrixLesson((s) => s.surprise);
  return <LessonShell id={ID} steps={STEPS} step={step} onReset={reset} onSurprise={surprise} />;
}
