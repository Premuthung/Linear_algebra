import type { ComponentType } from 'react';
import { LESSONS, lessonLabel } from '../lessons/meta';
import { lessonHref } from '../router';
import { useProgress } from '../store/progress';
import { Button, Toggle } from './ui';

export interface LessonStep {
  title: string;
  Body: ComponentType;
}

interface LessonShellProps {
  id: string;
  steps: LessonStep[];
  /** Which step to show (from the URL). */
  step: number;
  onReset: () => void;
  onSurprise: () => void;
}

const linkClass =
  'rounded-lg border border-line bg-panel2 px-3 py-1.5 text-sm text-ink no-underline hover:border-muted';

/** Frame around every lesson: title, goal, one step at a time, and the shared buttons. */
export function LessonShell({ id, steps, step, onReset, onSurprise }: LessonShellProps) {
  const index = LESSONS.findIndex((l) => l.id === id);
  const meta = LESSONS[index];
  const next = LESSONS[index + 1];
  const current = Math.min(steps.length - 1, Math.max(0, step));
  const { Body } = steps[current];

  const snap = useProgress((s) => s.snap);
  const setSnap = useProgress((s) => s.setSnap);
  const showNumbers = useProgress((s) => s.showNumbers);
  const setShowNumbers = useProgress((s) => s.setShowNumbers);
  const passed = useProgress((s) => s.passed[id] === true);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-4">
      <header className="mb-4">
        <a href="#/" className="text-sm text-muted hover:text-ink">
          ← All lessons
        </a>
        <h1 className="mt-1 text-2xl font-bold">
          <span className="text-muted">Lesson {lessonLabel(meta.number)}</span> {meta.title}{' '}
          {passed && <span title="Quiz passed">⭐</span>}
        </h1>
        <p className="text-muted">
          <strong className="text-ink">Goal:</strong> {meta.goal}
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <nav aria-label="Steps in this lesson" className="flex flex-wrap gap-1">
          {steps.map((s, i) => (
            <a
              key={s.title}
              href={lessonHref(id, i)}
              aria-current={i === current ? 'step' : undefined}
              className={`rounded-full border px-3 py-1 text-sm no-underline ${
                i === current
                  ? 'border-accent bg-accent font-semibold text-white'
                  : 'border-line bg-panel text-muted hover:text-ink'
              }`}
            >
              {i + 1}. {s.title}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Toggle label="Snap to grid" checked={snap} onChange={setSnap} />
          <Toggle label="Show me the numbers" checked={showNumbers} onChange={setShowNumbers} />
          <Button onClick={onReset}>Reset</Button>
          <Button onClick={onSurprise}>Surprise me</Button>
        </div>
      </div>

      <h2 className="mb-3 text-xl font-semibold">{steps[current].title}</h2>
      {/* The key remounts the step so local state (guesses, hints) starts fresh. */}
      <Body key={current} />

      <footer className="mt-6 flex justify-between">
        {current > 0 ? (
          <a className={linkClass} href={lessonHref(id, current - 1)}>
            ← Back
          </a>
        ) : (
          <span />
        )}
        {current < steps.length - 1 ? (
          <a className={`${linkClass} border-accent`} href={lessonHref(id, current + 1)}>
            Next: {steps[current + 1].title} →
          </a>
        ) : next?.ready ? (
          <a className={`${linkClass} border-accent`} href={lessonHref(next.id)}>
            Next lesson: {next.title} →
          </a>
        ) : (
          <a className={linkClass} href="#/">
            Back to all lessons
          </a>
        )}
      </footer>
    </main>
  );
}
