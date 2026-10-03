export interface LessonMeta {
  id: string;
  number: number;
  title: string;
  goal: string;
  /** False for lessons that are planned but not built yet. */
  ready: boolean;
}

export const LESSONS: LessonMeta[] = [
  {
    id: '01-vectors',
    number: 1,
    title: 'Vectors',
    goal: 'See one vector three ways: an arrow, a list of numbers, and walking steps.',
    ready: true,
  },
  {
    id: '02-add-scale-flip',
    number: 2,
    title: 'Add, scale, flip',
    goal: 'Add two arrows tip to tail. Stretch, shrink, and flip an arrow with one number.',
    ready: true,
  },
  {
    id: '03-span-and-combinations',
    number: 3,
    title: 'Span and combinations',
    goal: 'Mix two vectors and find every point you can reach.',
    ready: true,
  },
  {
    id: '04-basis-and-coordinates',
    number: 4,
    title: 'Basis and coordinates',
    goal: 'Change the measuring sticks. The point stays; its numbers change.',
    ready: true,
  },
  {
    id: '05-matrices-as-transformations',
    number: 5,
    title: 'Matrices as transformations',
    goal: 'Use four numbers to move the whole plane: flip it, turn it, squash it.',
    ready: true,
  },
  {
    id: '06-matrix-multiplication',
    number: 6,
    title: 'Matrix multiplication',
    goal: 'Do one transformation after another.',
    ready: false,
  },
  {
    id: '07-determinant',
    number: 7,
    title: 'Determinant',
    goal: 'Measure how a matrix changes area.',
    ready: false,
  },
  {
    id: '08-inverse-rank-solving',
    number: 8,
    title: 'Inverse, rank, solving',
    goal: 'Undo a transformation and solve equations.',
    ready: false,
  },
  {
    id: '09-dot-product-and-similarity',
    number: 9,
    title: 'Dot product and similarity',
    goal: 'Measure how alike two vectors are.',
    ready: false,
  },
  {
    id: '10-eigenvectors',
    number: 10,
    title: 'Eigenvectors',
    goal: 'Find the arrows that stay on their own line.',
    ready: false,
  },
  {
    id: '11-svd-and-compression',
    number: 11,
    title: 'SVD and compression',
    goal: 'Rotate, stretch, rotate. Keep only what matters.',
    ready: false,
  },
  {
    id: '12-high-dimensions-and-embeddings',
    number: 12,
    title: 'High dimensions and embeddings',
    goal: 'Words as vectors with many numbers.',
    ready: false,
  },
  {
    id: '13-inside-an-llm',
    number: 13,
    title: 'Inside an LLM',
    goal: 'Follow every number from your prompt to the next word.',
    ready: false,
  },
];

export function lessonLabel(n: number): string {
  return String(n).padStart(2, '0');
}
