import { useState } from 'react';
import { AiPanel } from '../../components/AiPanel/AiPanel';
import { CoordinatePlane } from '../../components/CoordinatePlane/CoordinatePlane';
import { Term } from '../../components/Glossary/Term';
import { LessonShell, type LessonStep } from '../../components/LessonShell';
import { PredictReveal } from '../../components/PredictReveal/PredictReveal';
import { Quiz, type Question } from '../../components/Quiz/Quiz';
import { NumberField } from '../../components/VectorInput/NumberField';
import { VectorInput } from '../../components/VectorInput/VectorInput';
import { BreakIt, Button, Card, Challenge, Numbers, Slider, Stage, Tex } from '../../components/ui';
import { add, scale, type Vec2 } from '../../core/vec';
import { fmt, fmtVec, paren, texVec } from '../../format';
import { usePlayOnce } from '../../hooks/animation';
import { useProgress } from '../../store/progress';
import { COLORS } from '../../theme';
import { useAddScaleLesson } from './store';

const ID = '02-add-scale-flip';

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

function AddStep() {
  const { u, v, set } = useAddScaleLesson();
  const snap = useProgress((s) => s.snap);
  const { t, play } = usePlayOnce(3000);
  const sum = add(u, v);

  // Three parts of the animation: walk along u, then along v, then draw the sum.
  const p1 = clamp01(t / 0.3);
  const p2 = clamp01((t - 0.35) / 0.35);
  const p3 = clamp01((t - 0.8) / 0.2);
  const stepText =
    t >= 1
      ? 'The yellow arrow goes from the start of the walk to the end. It is u + v.'
      : p2 <= 0
        ? 'Step 1: walk along u.'
        : p3 <= 0
          ? 'Step 2: from the tip of u, walk along v.'
          : 'Step 3: draw one arrow from the start to the end.';

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          vectors={[
            { id: 'ghost-u', v: u, from: v, color: COLORS.u, dashed: true, width: 1.5 },
            { id: 'ghost-v', v: scale(v, p2), from: u, color: COLORS.v, dashed: true, width: 2 },
            {
              id: 'sum',
              v: scale(sum, p3),
              color: COLORS.accent,
              label: p3 >= 1 ? 'u + v' : undefined,
              width: 4,
            },
            {
              id: 'u',
              v: scale(u, p1),
              color: COLORS.u,
              label: 'u',
              onChange: (x) => set({ u: x }),
            },
            { id: 'v', v, color: COLORS.v, label: 'v', onChange: (x) => set({ v: x }) },
          ]}
          ariaLabel="Plane with u, v and their sum"
        />
      }
    >
      <Card title="Add two vectors: tip to tail">
        <p>
          To add, move a copy of <strong>v</strong> so its tail sits on the tip of{' '}
          <strong>u</strong>. The dashed arrow is that copy. Drag u or v and watch the sum follow.
        </p>
        <VectorInput name="u" value={u} onChange={(x) => set({ u: x })} color={COLORS.u} />
        <VectorInput name="v" value={v} onChange={(x) => set({ v: x })} color={COLORS.v} />
        <div className="flex flex-wrap items-center gap-3">
          <Button tone="primary" onClick={play}>
            ▶ Play step by step
          </Button>
          <span className="text-sm text-muted" role="status">
            {stepText}
          </span>
        </div>
      </Card>

      <Card title="The same thing in numbers">
        <p>Add the x numbers together. Add the y numbers together. That is all.</p>
        <Numbers>
          <Tex block>
            {`u + v = ${texVec(u)} + ${texVec(v)} = ${texVec([
              `${fmt(u[0])} + ${paren(v[0])}`,
              `${fmt(u[1])} + ${paren(v[1])}`,
            ])} = ${texVec(sum)}`}
          </Tex>
        </Numbers>
        <p data-testid="sum-readout">
          u + v = <strong>{fmtVec(sum)}</strong>
        </p>
        <p className="text-sm text-muted">
          Why it works: walking u and then v ends at the same place as walking u + v in one go. The
          thin dashed blue arrow shows the other order, v then u. It ends at the same place.
        </p>
        <BreakIt>Make v the exact opposite of u. What is u + v then?</BreakIt>
      </Card>
    </Stage>
  );
}

function scaleWords(k: number): string {
  if (k === 0) return 'k = 0 squashes the arrow to the zero vector [0, 0].';
  const flip = k < 0 ? 'Negative k flips the arrow through the origin. ' : '';
  const size = Math.abs(k);
  if (size === 1)
    return `${flip}${k > 0 ? 'k = 1 changes nothing.' : 'The length stays the same.'}`;
  return `${flip}${size > 1 ? `It is stretched to ${fmt(size)} times its length.` : `It is shrunk to ${fmt(size)} of its length.`}`;
}

function ScaleStep() {
  const { v, k, set } = useAddScaleLesson();
  const snap = useProgress((s) => s.snap);
  const kv = scale(v, k);

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          lines={[{ dir: v, color: COLORS.muted, dashed: true, width: 1 }]}
          vectors={[
            { id: 'kv', v: kv, color: COLORS.accent, label: 'k·v', width: 5 },
            { id: 'v', v, color: COLORS.v, label: 'v', onChange: (x) => set({ v: x }), width: 2.5 },
          ]}
          ariaLabel="Plane with v and k times v"
        />
      }
    >
      <Card title="Scale a vector with one number">
        <p>
          Multiply <strong>v</strong> by a number <strong>k</strong>. The number is called a{' '}
          <Term k="scalar" /> because it <em>scales</em> the arrow.
        </p>
        <VectorInput name="v" value={v} onChange={(x) => set({ v: x })} color={COLORS.v} />
        <Slider
          label={
            <>
              k = <strong>{fmt(k)}</strong>
            </>
          }
          min={-3}
          max={3}
          step={0.1}
          value={k}
          testId="k-slider"
          onChange={(x) => set({ k: x })}
        />
        <div className="flex flex-wrap gap-2">
          {[2, 0.5, 0, -1, -1.5].map((value) => (
            <Button key={value} onClick={() => set({ k: value })}>
              k = {value}
            </Button>
          ))}
        </div>
        <p role="status" className="font-medium" data-testid="scale-words">
          {scaleWords(k)}
        </p>
      </Card>

      <Card title="The same thing in numbers">
        <p>Multiply each number in the list by k.</p>
        <Numbers>
          <Tex block>
            {`k \\cdot v = ${fmt(k)} \\cdot ${texVec(v)} = ${texVec([
              `${fmt(k)} \\cdot ${paren(v[0])}`,
              `${fmt(k)} \\cdot ${paren(v[1])}`,
            ])} = ${texVec(kv)}`}
          </Tex>
        </Numbers>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>k bigger than 1: the arrow gets longer.</li>
          <li>k between 0 and 1: the arrow gets shorter.</li>
          <li>k negative: the arrow flips to the opposite side of the origin.</li>
          <li>The arrow never leaves the dashed line. Scaling cannot turn it.</li>
        </ul>
        <BreakIt>Set k to 0. Where did the arrow go?</BreakIt>
      </Card>
    </Stage>
  );
}

const PREDICT_U: Vec2 = [3, 1];
const PREDICT_V: Vec2 = [-1, 2];
const PREDICT_ANSWER = add(PREDICT_U, PREDICT_V);

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
          points={[{ p: guess, shape: 'ring', color: COLORS.w, label: 'your guess' }]}
          vectors={[
            ...(revealed
              ? [
                  { id: 'ghost', v: PREDICT_V, from: PREDICT_U, color: COLORS.v, dashed: true },
                  { id: 'sum', v: PREDICT_ANSWER, color: COLORS.accent, label: 'u + v', width: 4 },
                ]
              : []),
            { id: 'u', v: PREDICT_U, color: COLORS.u, label: 'u' },
            { id: 'v', v: PREDICT_V, color: COLORS.v, label: 'v' },
          ]}
          ariaLabel="Plane with u and v, for your guess"
        />
      }
    >
      <Card title="Predict first">
        <PredictReveal
          question="u = [3, 1] and v = [−1, 2]. Where is the tip of u + v?"
          answer={PREDICT_ANSWER}
          guess={guess}
          onGuess={setGuess}
          revealed={revealed}
          onReveal={setRevealed}
          tip={(g) =>
            g[0] === 4 ? 'Check the sign of the x number of v.' : 'Add x to x, and y to y.'
          }
          why={
            <>
              x: 3 + (−1) = 2. y: 1 + 2 = 3. On the picture: put the tail of v on the tip of u and
              see where you end up.
            </>
          }
        />
      </Card>
    </Stage>
  );
}

const TARGET: Vec2 = [-3, 4];
const FIXED_U: Vec2 = [1, 2];

function ReachStep() {
  const { cv, ck, set } = useAddScaleLesson();
  const snap = useProgress((s) => s.snap);
  const scaled = scale(cv, ck);
  const result = add(FIXED_U, scaled);
  const done = Math.hypot(result[0] - TARGET[0], result[1] - TARGET[1]) < 0.15;

  return (
    <Stage
      plane={
        <CoordinatePlane
          snap={snap}
          points={[{ p: TARGET, shape: 'ring', color: COLORS.jhat, label: 'target' }]}
          vectors={[
            { id: 'kv', v: scaled, from: FIXED_U, color: COLORS.v, dashed: true },
            { id: 'result', v: result, color: COLORS.accent, label: 'u + k·v', width: 4 },
            { id: 'u', v: FIXED_U, color: COLORS.u, label: 'u' },
            { id: 'v', v: cv, color: COLORS.v, label: 'v', onChange: (x) => set({ cv: x }) },
          ]}
          ariaLabel="Plane with u, v, the result and the target"
        />
      }
    >
      <Challenge
        title="Reach the target [−3, 4] using only + and scaling."
        done={done}
        hints={[
          'You need u + k·v = [−3, 4]. So k·v must be the step from the tip of u to the target.',
          'The step from [1, 2] to [−3, 4] is [−4, 2]. Find a v and a k with k·v = [−4, 2].',
        ]}
        answer="One way: v = [2, −1] and k = −2. Then k·v = [−4, 2] and u + k·v = [−3, 4]."
        solvedNote="There are many answers. Any v and k with k·v = [−4, 2] work."
      >
        <p>
          <strong style={{ color: COLORS.u }}>u = [1, 2]</strong> is fixed. Drag <strong>v</strong>{' '}
          and move <strong>k</strong> until the yellow arrow <strong>u + k·v</strong> hits the
          target ring.
        </p>
        <VectorInput name="v" value={cv} onChange={(x) => set({ cv: x })} color={COLORS.v} />
        <Slider
          label={
            <>
              k = <strong>{fmt(ck)}</strong>
            </>
          }
          min={-3}
          max={3}
          step={0.5}
          value={ck}
          testId="ck-slider"
          onChange={(x) => set({ ck: x })}
        />
        <p data-testid="reach-readout">
          u + k·v = <strong>{fmtVec(result)}</strong>
        </p>
      </Challenge>
    </Stage>
  );
}

const FIND_V: Vec2 = [2, 1];
const FIND_TARGET: Vec2 = [-4, -2];

function FindKStep() {
  const { k2, set } = useAddScaleLesson();
  const kv = scale(FIND_V, k2);

  return (
    <Stage
      plane={
        <CoordinatePlane
          points={[{ p: FIND_TARGET, shape: 'ring', color: COLORS.jhat, label: 'target' }]}
          lines={[{ dir: FIND_V, color: COLORS.muted, dashed: true, width: 1 }]}
          vectors={[
            { id: 'kv', v: kv, color: COLORS.accent, label: 'k·v', width: 5 },
            { id: 'v', v: FIND_V, color: COLORS.v, label: 'v', width: 2.5 },
          ]}
          ariaLabel="Plane with v, k times v and the target"
        />
      }
    >
      <Challenge
        title="Which k sends [2, 1] to [−4, −2]?"
        done={k2 === -2}
        hints={[
          'The target is on the other side of the origin. What sign must k have?',
          'Look at x: k · 2 = −4. Then check that the same k works for y.',
        ]}
        answer="k = −2, because −2 · [2, 1] = [−4, −2]."
        solvedNote="A negative k flips the arrow; the 2 doubles its length."
      >
        <label className="flex items-center gap-2">
          k =
          <NumberField
            label="k"
            testId="k2"
            value={k2}
            step={0.5}
            min={-5}
            max={5}
            onChange={(x) => set({ k2: x })}
          />
        </label>
        <p>
          k·v = <strong>{fmtVec(kv)}</strong>
        </p>
      </Challenge>
      <BreakIt>Is there any k that sends [2, 1] to [3, 3]? Why not?</BreakIt>
    </Stage>
  );
}

const QUESTIONS: Question[] = [
  {
    kind: 'vector',
    prompt: '[2, 5] + [1, −3] = ?',
    answer: [3, 2],
    hint: 'Add x to x and y to y.',
    explain: '2 + 1 = 3 and 5 + (−3) = 2.',
  },
  {
    kind: 'vector',
    prompt: '−2 · [3, −1] = ?',
    answer: [-6, 2],
    hint: 'Multiply each number by −2. Check the sign of y.',
    explain: '−2 · 3 = −6 and −2 · (−1) = 2.',
  },
  {
    kind: 'choice',
    prompt: 'What does multiplying a vector by a negative number do?',
    options: [
      'It flips the arrow to the opposite direction',
      'It turns the arrow by a quarter turn',
      'It moves the tail away from the origin',
    ],
    answer: 0,
    hint: 'Try k = −1 on the Scale step.',
    explain: 'Both numbers change sign, so the arrow points the opposite way.',
  },
  {
    kind: 'choice',
    prompt: 'To add u + v with arrows, where do you put the tail of v?',
    options: ['On the origin', 'On the tip of u', 'On the middle of u'],
    answer: 1,
    hint: 'Think of two walks, one after the other.',
    explain: 'Tip to tail: walk along u, then continue along v.',
  },
  {
    kind: 'number',
    prompt: '0.5 · [8, 6] = [4, ?]. Type the missing number.',
    answer: 3,
    hint: 'Multiply the y number by 0.5 as well.',
    explain: '0.5 · 6 = 3.',
  },
];

function QuizStep() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Quiz lessonId={ID} questions={QUESTIONS} />
      <AiPanel
        points={[
          <>Adding vectors is how a model blends meanings. Two ideas added give a mix of both.</>,
          <>Scaling is how a model decides “how much” of something to use.</>,
          <>
            A famous example: the vector for <code>king − man + woman</code> lands near{' '}
            <code>queen</code>. You will see this in Lesson 12.
          </>,
          <>
            Inside a model, each layer <em>adds</em> its result back to its input. That is plain
            vector addition.
          </>,
        ]}
        scaleNote="Here we add lists of 2 numbers. A model adds lists with thousands of numbers, in the same way: number by number."
      />
    </div>
  );
}

const STEPS: LessonStep[] = [
  { title: 'Add', Body: AddStep },
  { title: 'Scale and flip', Body: ScaleStep },
  { title: 'Predict', Body: PredictStep },
  { title: 'Challenge: reach', Body: ReachStep },
  { title: 'Challenge: find k', Body: FindKStep },
  { title: 'Quiz and AI', Body: QuizStep },
];

export default function AddScaleLesson({ step }: { step: number }) {
  const reset = useAddScaleLesson((s) => s.reset);
  const surprise = useAddScaleLesson((s) => s.surprise);
  return <LessonShell id={ID} steps={STEPS} step={step} onReset={reset} onSurprise={surprise} />;
}
