import type { ReactNode } from 'react';

/** The card that ends every lesson: where does this idea live inside an AI model? */
export function AiPanel({ points, scaleNote }: { points: ReactNode[]; scaleNote?: ReactNode }) {
  return (
    <details open className="rounded-xl border border-u/50 bg-u/5 p-4" data-testid="ai-panel">
      <summary className="cursor-pointer text-base font-semibold">🤖 Where is this in AI?</summary>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px]">
        {points.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
      {scaleNote && (
        <p className="mt-3 rounded-lg bg-panel2 px-3 py-2 text-sm text-muted">
          <strong>Honest about size:</strong> {scaleNote}
        </p>
      )}
    </details>
  );
}
