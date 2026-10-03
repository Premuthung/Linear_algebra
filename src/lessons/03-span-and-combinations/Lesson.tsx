import { AiPanel } from '../../components/AiPanel/AiPanel';
import {
  CoordinatePlane,
  type PlaneLine,
  type PlanePoint,
} from '../../components/CoordinatePlane/CoordinatePlane';
import { Term } from '../../components/Glossary/Term';
import { LessonShell, type LessonStep } from '../../components/LessonShell';
import { Quiz, type Question } from '../../components/Quiz/Quiz';
import { VectorInput } from '../../components/VectorInput/VectorInput';
import { BreakIt, Button, Card, Challenge, Numbers, Slider, Stage, Tex } from '../../components/ui';
import { isParallel, norm, scale, type Vec2 } from '../../core/vec';
import { fmt, fmtVec, paren, texVec } from '../../format';
import { useProgress } from '../../store/progress';
import { COLORS } from '../../theme';
import { combine, useSpanLesson } from './store';

const ID = '03-span-and-combinations';

type SpanKind = 'plane' | 'line' | 'origin';

function spanOf(u: Vec2, v: Vec2): SpanKind {
  const uZero = norm(u) < 1e-9;
  const vZero = norm(v) < 1e-9;
  if (uZero && vZero) return 'origin';
  if (uZero || vZero || isParallel(u, v)) return 'line';
  return 'plane';
}

const SPAN_TEXT: Record<SpanKind, string> = {
  plane: 'The span is the whole plane. You can reach every point.',
  line: 'The span is only a line. Both arrows push along the same line, so you can never leave it.',
  origin: 'The span is just the origin. Scaling and adding zero vectors always gives [0, 0].',
};

/** The plane used by every step of this lesson. */
function SpanPlane({ showSpan, target }: { showSpan: boolean; target?: Vec2 }) {
  const { u, v, a, b, trail, setVectors } = useSpanLesson();
  const snap = useProgress((s) => s.snap);
  const au = scale(u, a);
  const bv = scale(v, b);
  const p = combine({ u, v, a, b });
  const kind = spanOf(u, v);

  const lines: PlaneLine[] = [];
  if (showSpan && kind === 'line') {
    lines.push({ dir: norm(u) > 1e-9 ? u : v, color: COLORS.accent, width: 6 });
  }
  const points: PlanePoint[] = [{ p, color: COLORS.accent, label: `a·u + b·v = ${fmtVec(p)}` }];
  if (target) points.unshift({ p: target, shape: 'ring', color: COLORS.jhat, label: 'target' });

  return (
    <CoordinatePlane
      snap={snap}
      shadePlane={showSpan && kind === 'plane' ? COLORS.accent : undefined}
      lines={lines}
      trail={trail}
      points={points}
      vectors={[
        { id: 'au', v: au, color: COLORS.u, dashed: true, width: 2 },
        { id: 'bv', v: bv, from: au, color: COLORS.v, dashed: true, width: 2 },
        { id: 'u', v: u, color: COLORS.u, label: 'u', onChange: (x) => setVectors({ u: x }) },
        { id: 'v', v, color: COLORS.v, label: 'v', onChange: (x) => setVectors({ v: x }) },
      ]}
      ariaLabel="Plane with u, v and the point a times u plus b times v"
    />
  );
}

function WeightSliders() {
  const { a, b, setWeights } = useSpanLesson();
  return (
    <>
      <Slider
        label={
          <>
            a = <strong>{fmt(a)}</strong>
          </>
        }
        min={-3}
        max={3}
        step={0.25}
        value={a}
        testId="a-slider"
        onChange={(x) => setWeights({ a: x })}
      />
      <Slider
        label={
          <>
            b = <strong>{fmt(b)}</strong>
          </>
        }
        min={-3}
        max={3}
        step={0.25}
        value={b}
        testId="b-slider"
        onChange={(x) => setWeights({ b: x })}
      />
    </>
  );
}

function VectorFields() {
  const { u, v, setVectors } = useSpanLesson();
  return (
    <>
      <VectorInput name="u" value={u} onChange={(x) => setVectors({ u: x })} color={COLORS.u} />
      <VectorInput name="v" value={v} onChange={(x) => setVectors({ v: x })} color={COLORS.v} />
    </>
  );
}

function MixStep() {
  const { u, v, a, b, clearTrail } = useSpanLesson();
  const p = combine({ u, v, a, b });

  return (
    <Stage plane={<SpanPlane showSpan={false} />}>
      <Card title="Mix two vectors">
        <p>
          Scale <strong>u</strong> by a number <strong>a</strong>. Scale <strong>v</strong> by a
          number <strong>b</strong>. Then add them. This mix is called a{' '}
          <Term k="linear combination" />.
        </p>
        <WeightSliders />
        <p className="text-sm text-muted">
          Move the sliders. The yellow point leaves a trail, so you can see where it has been.
        </p>
        <Button onClick={clearTrail}>Clear trail</Button>
      </Card>
      <Card title="The same thing in numbers">
        <Numbers>
          <Tex block>
            {`a\\,u + b\\,v = ${fmt(a)} ${texVec(u)} + ${paren(b)} ${texVec(v)} = ${texVec(p)}`}
          </Tex>
        </Numbers>
        <p data-testid="mix-readout">
          a·u + b·v = <strong>{fmtVec(p)}</strong>
        </p>
        <VectorFields />
      </Card>
    </Stage>
  );
}

const CASES: { name: string; u: Vec2; v: Vec2 }[] = [
  { name: 'Two different directions', u: [2, 1], v: [1, -1] },
  { name: 'Same line', u: [2, 1], v: [-4, -2] },
  { name: 'Only one vector', u: [2, 1], v: [0, 0] },
  { name: 'Both zero', u: [0, 0], v: [0, 0] },
];

function SpanStep() {
  const { u, v, setVectors, scatter, clearTrail } = useSpanLesson();
  const kind = spanOf(u, v);
  const independent = kind === 'plane';

  return (
    <Stage plane={<SpanPlane showSpan />}>
      <Card title="What can you reach?">
        <p>
          The <Term k="span" /> of u and v is every point you can reach with a·u + b·v, using any
          numbers a and b.
        </p>
        <div className="flex flex-wrap gap-2">
          {CASES.map((c) => (
            <Button key={c.name} onClick={() => setVectors({ u: c.u, v: c.v })}>
              {c.name}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button tone="primary" onClick={scatter}>
            Try 250 random mixes
          </Button>
          <Button onClick={clearTrail}>Clear trail</Button>
        </div>
        <p
          role="status"
          data-testid="independent"
          className={`rounded-lg px-3 py-2 font-semibold ${independent ? 'bg-good/15 text-good' : 'bg-warn/15 text-warn'}`}
        >
          {independent ? '✓ Linearly independent: yes' : '✗ Linearly independent: no'}
        </p>
        <p data-testid="span-text">{SPAN_TEXT[kind]}</p>
        <p className="text-sm text-muted">
          <Term k="linearly independent">Linearly independent</Term> means that neither arrow lies
          on the line of the other. Each one adds a new direction.
        </p>
      </Card>
      <Card title="Move things yourself">
        <VectorFields />
        <WeightSliders />
        <BreakIt>
          Drag v until it points the same way as u. Watch the shaded plane collapse to a line.
        </BreakIt>
      </Card>
    </Stage>
  );
}

const TARGET: Vec2 = [5, -2];

function ChallengeStep() {
  const { u, v, a, b, setVectors } = useSpanLesson();
  const p = combine({ u, v, a, b });
  const reached = Math.hypot(p[0] - TARGET[0], p[1] - TARGET[1]) < 0.1;
  const sameLine = norm(u) > 1e-9 && norm(v) > 1e-9 && isParallel(u, v);

  return (
    <Stage plane={<SpanPlane showSpan target={TARGET} />}>
      <Challenge
        title="Reach the target [5, −2] with a·u + b·v. Find a and b."
        done={reached}
        hints={[
          'Start with u = [2, 1] and v = [1, −1]. Move one slider at a time and watch the point.',
          'You need 2a + b = 5 and a − b = −2. Add the two lines: 3a = 3.',
        ]}
        answer="With u = [2, 1] and v = [1, −1]: a = 1 and b = 3."
      >
        <Button onClick={() => setVectors({ u: [2, 1], v: [1, -1] })}>
          Use u = [2, 1] and v = [1, −1]
        </Button>
        <WeightSliders />
        <p>
          a·u + b·v = <strong>{fmtVec(p)}</strong>
        </p>
      </Challenge>

      <Challenge
        title="Now make v = 2u. Can you still reach the target? Why not?"
        done={sameLine}
        hints={[
          'Press the button, then move both sliders. Where does the point go?',
          'If v = 2u, then a·u + b·v = (a + 2b)·u. That is just u scaled.',
        ]}
        answer="No. Every mix is a multiple of u, so the point is stuck on the line through u. The target is not on that line."
        solvedNote="Now move the sliders: the point is stuck on one line. The target is off that line, so no a and b can reach it."
      >
        <Button onClick={() => setVectors({ v: scale(u, 2) })}>Set v = 2u</Button>
      </Challenge>
    </Stage>
  );
}

const QUESTIONS: Question[] = [
  {
    kind: 'choice',
    prompt: 'u = [1, 2] and v = [2, 4]. What is their span?',
    options: ['The whole plane', 'A line', 'Only the origin'],
    answer: 1,
    hint: 'Look closely: v is 2 times u.',
    explain: 'v = 2u, so both arrows lie on the same line. You can never leave that line.',
  },
  {
    kind: 'choice',
    prompt: 'u = [1, 0] and v = [0, 1]. What is their span?',
    options: ['The whole plane', 'A line', 'Only the origin'],
    answer: 0,
    hint: 'One arrow moves you left and right. The other moves you up and down.',
    explain: 'They point in different directions, so together they reach every point.',
  },
  {
    kind: 'vector',
    prompt: '2 · [1, 0] + 3 · [0, 1] = ?',
    answer: [2, 3],
    hint: 'Scale each vector first, then add.',
    explain: '[2, 0] + [0, 3] = [2, 3].',
  },
  {
    kind: 'choice',
    prompt: 'Which pair is linearly independent?',
    options: ['[1, 1] and [3, 3]', '[1, 1] and [−1, 1]', '[2, 0] and [−5, 0]'],
    answer: 1,
    hint: 'Independent means: not on the same line through the origin.',
    explain: '[1, 1] and [−1, 1] point in different directions. The other pairs share a line.',
  },
];

function QuizStep() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Quiz lessonId={ID} questions={QUESTIONS} />
      <AiPanel
        points={[
          <>A model can only produce outputs that lie in the span of what its weights can build.</>,
          <>Fewer independent directions means the model can express less.</>,
          <>
            This idea returns as <strong>rank</strong> (Lesson 08) and as <strong>LoRA</strong>, a
            cheap way to fine-tune big models (Lesson 11).
          </>,
        ]}
        scaleNote="We mix 2 vectors on a flat plane. A model mixes thousands of vectors in a space with thousands of directions."
      />
    </div>
  );
}

const STEPS: LessonStep[] = [
  { title: 'Mix', Body: MixStep },
  { title: 'Span', Body: SpanStep },
  { title: 'Challenges', Body: ChallengeStep },
  { title: 'Quiz and AI', Body: QuizStep },
];

export default function SpanLesson({ step }: { step: number }) {
  const reset = useSpanLesson((s) => s.reset);
  const surprise = useSpanLesson((s) => s.surprise);
  return <LessonShell id={ID} steps={STEPS} step={step} onReset={reset} onSurprise={surprise} />;
}
