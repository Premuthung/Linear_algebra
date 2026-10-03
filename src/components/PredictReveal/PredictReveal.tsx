import type { ReactNode } from 'react';
import type { Vec2 } from '../../core/vec';
import { fmtVec } from '../../format';
import { COLORS } from '../../theme';
import { VectorInput } from '../VectorInput/VectorInput';
import { Button } from '../ui';

interface PredictRevealProps {
  question: ReactNode;
  answer: Vec2;
  /** The learner's guess. The lesson owns it, so a click on the plane can set it too. */
  guess: Vec2;
  onGuess: (guess: Vec2) => void;
  revealed: boolean;
  onReveal: (revealed: boolean) => void;
  /** Shown after the reveal: why the answer is what it is. */
  why: ReactNode;
  /** A friendly tip for a wrong guess, e.g. "Check the sign of y." */
  tip?: (guess: Vec2) => string;
  /** Set when the answer is not a spot on the plane, so clicking makes no sense. */
  typedOnly?: boolean;
}

export function isCloseGuess(guess: Vec2, answer: Vec2, tolerance = 0.26): boolean {
  return Math.abs(guess[0] - answer[0]) < tolerance && Math.abs(guess[1] - answer[1]) < tolerance;
}

/** Ask "what will happen?" first. Show the result only after the learner commits to a guess. */
export function PredictReveal(props: PredictRevealProps) {
  const { question, answer, guess, onGuess, revealed, onReveal, why, tip, typedOnly } = props;
  const right = isCloseGuess(guess, answer);

  return (
    <div className="space-y-3">
      <p className="font-medium">{question}</p>
      <p className="text-sm text-muted">
        {typedOnly
          ? 'Type your guess. Then reveal.'
          : 'Click a spot on the plane, or type your guess. Then reveal.'}
      </p>
      <VectorInput name="guess" value={guess} onChange={onGuess} color={COLORS.v} />
      {!revealed ? (
        <Button tone="primary" onClick={() => onReveal(true)}>
          Reveal
        </Button>
      ) : (
        <div className="space-y-2" role="status">
          {right ? (
            <p className="font-semibold text-good">✓ Yes! The answer is {fmtVec(answer)}.</p>
          ) : (
            <p className="font-semibold text-warn">
              ✗ Close! You said {fmtVec(guess)}. The answer is {fmtVec(answer)}.{' '}
              {tip ? tip(guess) : ''}
            </p>
          )}
          <div className="text-sm">{why}</div>
          <Button onClick={() => onReveal(false)}>Try again</Button>
        </div>
      )}
    </div>
  );
}
