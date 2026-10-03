import type { ReactNode } from 'react';

// Plain-words meanings. Shown when a learner hovers or focuses a term.
export const GLOSSARY = {
  vector: 'An arrow from the origin. Also a list of numbers, like [3, 2].',
  origin: 'The centre of the plane, the point [0, 0].',
  coordinates: 'The numbers that say how far to walk: first along x, then along y.',
  scalar: 'A plain number. It scales (stretches, shrinks, or flips) a vector.',
  magnitude: 'The length of the arrow.',
  'linear combination': 'Scale some vectors and add them: a·u + b·v.',
  span: 'Every point you can reach by scaling and adding your vectors.',
  'linearly independent': 'No vector lies on the line of the other. Each one adds a new direction.',
  basis: 'A set of vectors used as the measuring sticks for coordinates.',
  matrix: 'A grid of numbers that moves every point of the plane in one go.',
  transformation: 'A rule that moves every point of the plane to a new place.',
  determinant: 'How much a matrix scales area. Negative means the plane was flipped.',
  embedding: 'The list of numbers an AI model uses to store a word, image, or user.',
  weight: 'One learned number inside an AI model. Weight matrices are grids of them.',
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;

/** A word with a dotted underline. Hover or focus it to read its meaning. */
export function Term({ k, children }: { k: GlossaryKey; children?: ReactNode }) {
  return (
    <span className="group relative inline-block">
      <span
        tabIndex={0}
        aria-describedby={`term-${k.replace(/ /g, '-')}`}
        className="cursor-help border-b border-dotted border-muted"
      >
        {children ?? k}
      </span>
      <span
        id={`term-${k.replace(/ /g, '-')}`}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-20 mb-1 hidden w-60 rounded-lg border border-line bg-panel2 p-2 text-sm font-normal text-ink shadow-lg group-focus-within:block group-hover:block"
      >
        {GLOSSARY[k]}
      </span>
    </span>
  );
}
