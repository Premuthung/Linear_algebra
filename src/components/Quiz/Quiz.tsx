import { useState, type ReactNode } from 'react';
import type { Vec2 } from '../../core/vec';
import { useProgress } from '../../store/progress';
import { Button } from '../ui';

interface Base {
  prompt: ReactNode;
  /** Shown after a wrong answer. */
  hint: string;
  /** Shown after the right answer. */
  explain: string;
}

export type Question =
  | (Base & { kind: 'choice'; options: string[]; answer: number })
  | (Base & { kind: 'number'; answer: number; tolerance?: number })
  | (Base & { kind: 'vector'; answer: Vec2; tolerance?: number });

type Status = 'idle' | 'wrong' | 'right';

const inputClass =
  'w-20 rounded-md border border-line bg-bg px-2 py-1 text-center font-mono text-base';

function QuestionCard({ q, index, onRight }: { q: Question; index: number; onRight: () => void }) {
  const [status, setStatus] = useState<Status>('idle');
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState<[string, string]>(['', '']);

  const check = (): void => {
    let ok: boolean;
    if (q.kind === 'choice') {
      ok = choice === q.answer;
    } else if (q.kind === 'number') {
      ok = text[0].trim() !== '' && Math.abs(Number(text[0]) - q.answer) <= (q.tolerance ?? 0.01);
    } else {
      const tol = q.tolerance ?? 0.01;
      ok =
        text[0].trim() !== '' &&
        text[1].trim() !== '' &&
        Math.abs(Number(text[0]) - q.answer[0]) <= tol &&
        Math.abs(Number(text[1]) - q.answer[1]) <= tol;
    }
    setStatus(ok ? 'right' : 'wrong');
    if (ok) onRight();
  };

  const locked = status === 'right';
  const edit = (): void => {
    if (status === 'wrong') setStatus('idle');
  };

  return (
    <fieldset
      className="rounded-xl border border-line bg-panel p-4"
      data-testid={`question-${index}`}
    >
      <legend className="px-1 text-sm text-muted">Question {index + 1}</legend>
      <div className="mb-3 font-medium">{q.prompt}</div>

      {q.kind === 'choice' && (
        <div className="space-y-1">
          {q.options.map((option, i) => (
            <label key={option} className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                className="mt-1.5"
                name={`question-${index}`}
                checked={choice === i}
                disabled={locked}
                onChange={() => {
                  setChoice(i);
                  edit();
                }}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}

      {q.kind === 'number' && (
        <input
          type="number"
          aria-label={`Answer to question ${index + 1}`}
          className={inputClass}
          value={text[0]}
          disabled={locked}
          onChange={(e) => {
            setText([e.target.value, '']);
            edit();
          }}
        />
      )}

      {q.kind === 'vector' && (
        <div className="flex items-center gap-2">
          <span className="text-xl text-muted" aria-hidden="true">
            [
          </span>
          {([0, 1] as const).map((i) => (
            <input
              key={i}
              type="number"
              aria-label={`Answer to question ${index + 1}, ${i === 0 ? 'x' : 'y'}`}
              className={inputClass}
              value={text[i]}
              disabled={locked}
              onChange={(e) => {
                setText(i === 0 ? [e.target.value, text[1]] : [text[0], e.target.value]);
                edit();
              }}
            />
          ))}
          <span className="text-xl text-muted" aria-hidden="true">
            ]
          </span>
        </div>
      )}

      <div className="mt-3" role="status">
        {status === 'right' && <p className="text-good">✓ Correct! {q.explain}</p>}
        {status === 'wrong' && <p className="text-warn">✗ Close! Hint: {q.hint}</p>}
      </div>
      {!locked && (
        <Button className="mt-2" onClick={check}>
          Check
        </Button>
      )}
    </fieldset>
  );
}

/** A short quiz. Passing it puts a star on the lesson. */
export function Quiz({ lessonId, questions }: { lessonId: string; questions: Question[] }) {
  const [right, setRight] = useState<ReadonlySet<number>>(new Set());
  const markPassed = useProgress((s) => s.markPassed);
  const alreadyPassed = useProgress((s) => s.passed[lessonId] === true);
  const allRight = right.size === questions.length;

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <QuestionCard
          key={i}
          q={q}
          index={i}
          onRight={() => {
            const next = new Set(right).add(i);
            setRight(next);
            if (next.size === questions.length) markPassed(lessonId);
          }}
        />
      ))}
      <p className="font-semibold" role="status" data-testid="quiz-result">
        {allRight
          ? '⭐ Quiz passed! You earned a star for this lesson.'
          : `${right.size} of ${questions.length} correct.${alreadyPassed ? ' (You already have the star.)' : ''}`}
      </p>
    </div>
  );
}
