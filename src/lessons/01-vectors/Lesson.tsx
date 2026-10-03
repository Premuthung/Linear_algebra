import { useState } from 'react';
import { AiPanel } from '../../components/AiPanel/AiPanel';
import {
  CoordinatePlane,
  type PlaneVector,
} from '../../components/CoordinatePlane/CoordinatePlane';
import { Term } from '../../components/Glossary/Term';
import { LessonShell, type LessonStep } from '../../components/LessonShell';
import { NumberFlow } from '../../components/NumberFlow/NumberFlow';
import { PredictReveal } from '../../components/PredictReveal/PredictReveal';
import { Quiz, type Question } from '../../components/Quiz/Quiz';
import { VectorInput } from '../../components/VectorInput/VectorInput';
import { BreakIt, Button, Card, Challenge, Numbers, Stage, Tex } from '../../components/ui';
import { angleOf, norm, type Vec2 } from '../../core/vec';
import { fmt, fmtVec, paren } from '../../format';
import { useProgress } from '../../store/progress';
import { COLORS } from '../../theme';
import { useVectorsLesson, type VectorView } from './store';

const ID = '01-vectors';

/** "3 right, then 2 up" */
function walkText(v: Vec2): string {
  const [x, y] = v;
  const xPart = x === 0 ? '' : `${fmt(Math.abs(x))} ${x > 0 ? 'right' : 'left'}`;
  const yPart = y === 0 ? '' : `${fmt(Math.abs(y))} ${y > 0 ? 'up' : 'down'}`;
  if (!xPart && !yPart) return 'Stay at the origin';
  if (!xPart) return yPart;
  if (!yPart) return xPart;
  return `${xPart}, then ${yPart}`;
}

/** Two dashed arrows: first along x, then along y. */
function walkArrows(v: Vec2): PlaneVector[] {
  return [
    { id: 'walk-x', v: [v[0], 0], color: COLORS.ihat, dashed: true, width: 2 },
    { id: 'walk-y', v: [0, v[1]], from: [v[0], 0], color: COLORS.jhat, dashed: true, width: 2 },
  ];
}

const VIEWS: { key: VectorView; name: string; text: string }[] = [
  {
    key: 'arrow',
    name: 'Arrow',
    text: 'An arrow with a length and a direction. Its tail sits at the origin.',
  },
  {
    key: 'list',
    name: 'List of numbers',
    text: 'A list of two numbers. The order matters: [3, 2] is not the same as [2, 3].',
  },
  {
    key: 'walk',
    name: 'Walking steps',
    text: 'Instructions for a walk from the origin: first along x, then along y.',
  },
];

function PlayStep() {
  const { v, setV, view, setView } = useVectorsLesson();
  const snap = useProgress((s) => s.snap);
  const length = norm(v);
  const degrees = (angleOf(v) * 180) / Math.PI;

  const vectors: PlaneVector[] = [
    ...(view === 'walk' ? walkArrows(v) : []),
    { id: 'v', v, color: COLORS.v, label: 'v', onChange: setV },
  ];

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          vectors={vectors}
          points={view === 'list' ? [{ p: v, color: COLORS.accent, label: fmtVec(v) }] : []}
          ariaLabel="Plane with the vector v"
        />
      }
    >
      <Card title="Make a vector">
        <p>
          Type two numbers, or drag the tip of the arrow. The numbers and the arrow always agree.
        </p>
        <VectorInput name="v" value={v} onChange={setV} color={COLORS.v} />
        <p className="text-sm text-muted">
          A <Term k="vector" /> starts at the <Term k="origin" />. The first number moves along x
          (right is +, left is −). The second number moves along y (up is +, down is −).
        </p>
      </Card>

      <Card title="Three ways to see the same vector">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a view">
          {VIEWS.map((item) => (
            <Button
              key={item.key}
              tone={view === item.key ? 'primary' : 'plain'}
              aria-pressed={view === item.key}
              onClick={() => setView(item.key)}
            >
              {item.name}
            </Button>
          ))}
        </div>
        <p>{VIEWS.find((item) => item.key === view)?.text}</p>
        <p className="text-lg" data-testid="view-readout">
          {view === 'arrow' && (
            <>
              Length <strong>{fmt(length)}</strong>, pointing at <strong>{fmt(degrees, 0)}°</strong>
            </>
          )}
          {view === 'list' && (
            <Tex>{`v = \\begin{bmatrix} ${fmt(v[0])} \\\\ ${fmt(v[1])} \\end{bmatrix}`}</Tex>
          )}
          {view === 'walk' && <strong>{walkText(v)}</strong>}
        </p>
        <p className="text-sm text-muted">
          All three say the same thing. Linear algebra is useful because you can switch between the
          picture and the numbers.
        </p>
      </Card>

      <Card title="Length and angle">
        <p>
          Length (<Term k="magnitude" />
          ): <NumberFlow value={length} /> &nbsp;·&nbsp; Angle from the x-axis:{' '}
          <NumberFlow value={degrees} digits={0} />°
        </p>
        <Numbers>
          <Tex block>
            {`|v| = \\sqrt{x^2 + y^2} = \\sqrt{${paren(v[0])}^2 + ${paren(v[1])}^2} = ${fmt(length)}`}
          </Tex>
        </Numbers>
        <BreakIt>
          Set the vector to [0, 0]. What is its length? Does it still point anywhere?
        </BreakIt>
      </Card>
    </Stage>
  );
}

const PREDICT_ANSWER: Vec2 = [-3, 5];

function PredictStep() {
  const snap = useProgress((s) => s.snap);
  const [guess, setGuess] = useState<Vec2>([0, 0]);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          onPlaneClick={revealed ? undefined : setGuess}
          points={[{ p: guess, shape: 'ring', color: COLORS.v, label: 'your guess' }]}
          vectors={
            revealed
              ? [
                  ...walkArrows(PREDICT_ANSWER),
                  { id: 'answer', v: PREDICT_ANSWER, color: COLORS.accent, label: 'v' },
                ]
              : []
          }
          ariaLabel="Plane for your guess"
        />
      }
    >
      <Card title="Predict first">
        <PredictReveal
          question="Start at the origin. Walk 3 left, then 5 up. Where is the tip of the vector?"
          answer={PREDICT_ANSWER}
          guess={guess}
          onGuess={setGuess}
          revealed={revealed}
          onReveal={setRevealed}
          tip={(g) =>
            g[0] === 3
              ? 'Check the sign of x: left is negative.'
              : Math.abs(g[0]) === 5
                ? 'The x number comes first, then y.'
                : 'Count 3 steps left on the x-axis, then 5 steps up.'
          }
          why={
            <>
              Left is the negative x direction, so x = −3. Up is the positive y direction, so y = 5.
              Every pair of numbers gives exactly one arrow, and every arrow gives exactly one pair
              of numbers.
            </>
          }
        />
      </Card>
      <Card title="How to read the two numbers">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            First number: steps along the <strong>x-axis</strong>. Positive is right, negative is
            left.
          </li>
          <li>
            Second number: steps along the <strong>y-axis</strong>. Positive is up, negative is
            down.
          </li>
          <li>
            These numbers are the <Term k="coordinates" /> of the vector.
          </li>
        </ul>
      </Card>
    </Stage>
  );
}

function ChallengeStep() {
  const { v, setV, a, setA, b, setB } = useVectorsLesson();
  const snap = useProgress((s) => s.snap);
  const lenA = norm(a);
  const lenB = norm(b);
  const sameLength =
    lenA > 0.5 && Math.abs(lenA - lenB) < 0.05 && Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.5;

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          vectors={[
            { id: 'a', v: a, color: COLORS.u, label: 'a', onChange: setA },
            { id: 'b', v: b, color: COLORS.w, label: 'b', onChange: setB },
            { id: 'v', v, color: COLORS.v, label: 'v', onChange: setV },
          ]}
          ariaLabel="Plane with the vectors v, a and b"
        />
      }
    >
      <Challenge
        title="Make the arrow v go 4 left and 3 up."
        done={v[0] === -4 && v[1] === 3}
        hints={['Left is the negative x direction.', 'x must be −4. What must y be for "3 up"?']}
        answer="v = [−4, 3]"
      >
        <VectorInput name="v" value={v} onChange={setV} color={COLORS.v} />
      </Challenge>

      <Challenge
        title="Make two different-looking arrows, a and b, with the same length."
        done={sameLength}
        hints={[
          'Length does not care about direction. Try pointing b a different way.',
          'Swap the two numbers, or change a sign: [3, 4] and [−4, 3] have the same length.',
        ]}
        answer="For example a = [3, 4] and b = [4, −3]. Both have length 5."
        solvedNote="Same length, different direction: they are different vectors."
      >
        <VectorInput name="a" value={a} onChange={setA} color={COLORS.u} />
        <VectorInput name="b" value={b} onChange={setB} color={COLORS.w} />
        <p className="text-sm text-muted">
          Length of a: <strong className="text-ink">{fmt(lenA)}</strong> &nbsp; Length of b:{' '}
          <strong className="text-ink">{fmt(lenB)}</strong>
        </p>
      </Challenge>

      <BreakIt>Can two arrows have the same numbers but look different? Try it.</BreakIt>
    </Stage>
  );
}

const QUESTIONS: Question[] = [
  {
    kind: 'choice',
    prompt: 'What walk does the vector [−2, 5] describe?',
    options: [
      '2 left, then 5 up',
      '2 right, then 5 down',
      '5 left, then 2 up',
      '2 down, then 5 right',
    ],
    answer: 0,
    hint: 'The first number is x. A negative x means left.',
    explain: 'x = −2 is 2 steps left. y = 5 is 5 steps up.',
  },
  {
    kind: 'vector',
    prompt: 'Start at the origin. Walk 6 right, then 2 down. Type the vector.',
    answer: [6, -2],
    hint: 'Right is positive x. Down is negative y.',
    explain: 'Right 6 gives x = 6. Down 2 gives y = −2.',
  },
  {
    kind: 'number',
    prompt: 'What is the length of the vector [3, 4]?',
    answer: 5,
    hint: 'Length = √(x² + y²). Here 3² + 4² = 25.',
    explain: '√(9 + 16) = √25 = 5.',
  },
  {
    kind: 'choice',
    prompt: 'Is [1, 2] the same vector as [2, 1]?',
    options: ['Yes, they use the same numbers', 'No, the order of the numbers matters'],
    answer: 1,
    hint: 'Draw both. Do the arrows point the same way?',
    explain: 'The first number is always x and the second is always y, so order matters.',
  },
];

function QuizStep() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Quiz lessonId={ID} questions={QUESTIONS} />
      <AiPanel
        points={[
          <>
            An AI model stores a word, an image, or a user as a list of numbers. That list is a
            vector. It is called an <Term k="embedding" />.
          </>,
          <>
            Example: the word “cat” might be stored as [0.21, −1.30, 0.74, …]. Same idea as [3, 2],
            just longer.
          </>,
          <>
            A list of 2 numbers is an arrow on this plane. A list of 3 numbers is an arrow in 3D
            space.
          </>,
        ]}
        scaleNote="Our vectors have 2 numbers so we can draw them. Real models use hundreds or thousands of numbers for one word."
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

export default function VectorsLesson({ step }: { step: number }) {
  const reset = useVectorsLesson((s) => s.reset);
  const surprise = useVectorsLesson((s) => s.surprise);
  return <LessonShell id={ID} steps={STEPS} step={step} onReset={reset} onSurprise={surprise} />;
}
