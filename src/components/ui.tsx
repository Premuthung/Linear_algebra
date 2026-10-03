import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import katex from 'katex';
import { useProgress } from '../store/progress';

/** A formula. Always shown next to the picture, with live numbers filled in. */
export function Tex({ children, block = false }: { children: string; block?: boolean }) {
  const html = katex.renderToString(children, { throwOnError: false, displayMode: block });
  return (
    <span
      className={block ? 'block overflow-x-auto py-1' : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function Card({
  title,
  children,
  className = '',
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-panel p-4 ${className}`}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div className="space-y-3 text-[15px]">{children}</div>
    </section>
  );
}

/** Picture on one side, controls on the other. On a phone the picture sits on top. */
export function Stage({ plane, children }: { plane: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-4 lg:self-start">{plane}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'plain' | 'primary' };

export function Button({ tone = 'plain', className = '', ...rest }: ButtonProps) {
  const tones = {
    plain: 'border-line bg-panel2 text-ink hover:border-muted',
    primary: 'border-accent bg-accent text-white font-semibold hover:brightness-110',
  };
  return (
    <button
      type="button"
      className={`rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 ${tones[tone]} ${className}`}
      {...rest}
    />
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  testId,
}: {
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  testId?: string;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0">{label}</span>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        data-testid={testId}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

/** The arithmetic behind a picture. Hidden when "Show me the numbers" is off. */
export function Numbers({ children }: { children: ReactNode }) {
  const show = useProgress((s) => s.showNumbers);
  if (!show) return null;
  return <div className="rounded-lg bg-panel2 px-3 py-2">{children}</div>;
}

/** A nudge to try something odd and see what happens. */
export function BreakIt({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-warn/60 px-3 py-2 text-sm text-warn">
      <strong>Try to break it:</strong> {children}
    </p>
  );
}

/**
 * A task that checks itself from the live state.
 * Hint ladder: hint 1 (nudge), hint 2 (bigger clue), then the answer.
 */
export function Challenge({
  title,
  done,
  hints,
  answer,
  solvedNote,
  children,
}: {
  title: ReactNode;
  done: boolean;
  hints: [string, string];
  answer: ReactNode;
  /** Extra explanation shown once the task is solved. */
  solvedNote?: ReactNode;
  children?: ReactNode;
}) {
  const [shown, setShown] = useState(0);
  const [solved, setSolved] = useState(false);
  if (done && !solved) setSolved(true);

  const labels = ['Give me a hint', 'Give me a bigger hint', 'Show the answer'];
  return (
    <section
      className={`rounded-xl border p-4 ${solved ? 'border-good/70 bg-good/5' : 'border-line bg-panel'}`}
      data-solved={solved}
    >
      <h3 className="flex items-start gap-2 text-base font-semibold">
        <span aria-hidden="true">{solved ? '✅' : '🎯'}</span>
        <span>{title}</span>
      </h3>
      {children && <div className="mt-2 space-y-2 text-[15px]">{children}</div>}
      {solved && (
        <p className="mt-2 text-sm text-good" role="status">
          Solved. Well done! {solvedNote}
        </p>
      )}
      <div className="mt-2 space-y-1 text-sm text-muted">
        {shown >= 1 && <p>Hint 1: {hints[0]}</p>}
        {shown >= 2 && <p>Hint 2: {hints[1]}</p>}
        {shown >= 3 && <p className="text-ink">Answer: {answer}</p>}
      </div>
      {shown < 3 && !solved && (
        <Button className="mt-2" onClick={() => setShown(shown + 1)}>
          {labels[shown]}
        </Button>
      )}
    </section>
  );
}
