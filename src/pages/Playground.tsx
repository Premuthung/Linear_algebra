import { useCallback, useState } from 'react';
import { AiPanel } from '../components/AiPanel/AiPanel';
import { CoordinatePlane } from '../components/CoordinatePlane/CoordinatePlane';
import { Term } from '../components/Glossary/Term';
import { MatrixEditor } from '../components/MatrixEditor/MatrixEditor';
import { NumberFlow } from '../components/NumberFlow/NumberFlow';
import { PredictReveal } from '../components/PredictReveal/PredictReveal';
import { Quiz } from '../components/Quiz/Quiz';
import { TransformPlayer } from '../components/TransformPlayer/TransformPlayer';
import { VectorInput } from '../components/VectorInput/VectorInput';
import { Card, Challenge, Stage, Toggle } from '../components/ui';
import { apply, column, lerp, type Mat2 } from '../core/mat';
import { IDENTITY, shear } from '../core/presets';
import { norm, type Vec2 } from '../core/vec';
import { useSmoothMat } from '../hooks/animation';
import { COLORS } from '../theme';

/** One page that shows every shared component, for testing them outside a lesson. */
export function Playground() {
  const [v, setV] = useState<Vec2>([2, 1]);
  const [M, setM] = useState<Mat2>(shear(1));
  const [t, setT] = useState(1);
  const [snap, setSnap] = useState(true);
  const [guess, setGuess] = useState<Vec2>([0, 0]);
  const [revealed, setRevealed] = useState(false);
  const onT = useCallback((x: number) => setT(x), []);

  const smooth = useSmoothMat(M, false);
  const shown = lerp(IDENTITY, smooth, t);
  const answer = apply(M, [1, 1]);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-4">
      <a href="#/" className="text-sm text-muted hover:text-ink">
        ← All lessons
      </a>
      <h1 className="mb-4 mt-1 text-2xl font-bold">Component playground</h1>
      <Stage
        plane={
          <CoordinatePlane
            snap={snap}
            grid={shown}
            unitSquare={shown}
            shapeF={shown}
            onPlaneClick={setGuess}
            points={[{ p: guess, shape: 'ring', color: COLORS.w, label: 'guess' }]}
            vectors={[
              { id: 'i-hat', v: column(shown, 0), color: COLORS.ihat, label: 'î' },
              { id: 'j-hat', v: column(shown, 1), color: COLORS.jhat, label: 'ĵ' },
              { id: 'out', v: apply(shown, v), color: COLORS.accent, label: 'A·v' },
              { id: 'v', v, color: COLORS.v, label: 'v', onChange: setV },
            ]}
          />
        }
      >
        <Card title="VectorInput + CoordinatePlane (two-way linked)">
          <VectorInput name="v" value={v} onChange={setV} color={COLORS.v} />
          <Toggle label="Snap to grid" checked={snap} onChange={setSnap} />
          <p>
            NumberFlow, length of v: <NumberFlow value={norm(v)} />
          </p>
          <p>
            Glossary: hover <Term k="vector" />, <Term k="matrix" />, <Term k="span" />.
          </p>
        </Card>
        <Card title="MatrixEditor">
          <MatrixEditor
            value={M}
            onChange={(m) => {
              setM(m);
              setT(1);
            }}
          />
        </Card>
        <Card title="TransformPlayer">
          <TransformPlayer t={t} onT={onT} target={M} />
        </Card>
        <Card title="PredictReveal">
          <PredictReveal
            question="Where does [1, 1] land under the matrix above?"
            answer={answer}
            guess={guess}
            onGuess={setGuess}
            revealed={revealed}
            onReveal={setRevealed}
            why="Add column 1 and column 2."
          />
        </Card>
        <Challenge
          title="Challenge: make v = [−1, 3]."
          done={v[0] === -1 && v[1] === 3}
          hints={['Left is negative x.', 'x = −1 and y = 3.']}
          answer="v = [−1, 3]"
        />
        <Card title="Quiz">
          <Quiz
            lessonId="playground"
            questions={[
              {
                kind: 'choice',
                prompt: 'Which one is a vector?',
                options: ['[3, 2]', 'blue'],
                answer: 0,
                hint: 'A vector is a list of numbers.',
                explain: '[3, 2] is a list of two numbers.',
              },
              {
                kind: 'number',
                prompt: '2 + 3 = ?',
                answer: 5,
                hint: 'Count on your fingers.',
                explain: '2 + 3 = 5.',
              },
            ]}
          />
        </Card>
        <AiPanel
          points={['This card ends every lesson.']}
          scaleNote="Real models are much bigger."
        />
      </Stage>
    </main>
  );
}
