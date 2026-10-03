import { apply, type Mat } from '../core/mat';
import { softmax } from '../core/softmax';
import { add, dot, scale, type Vec } from '../core/vec';

// A toy next-word model for the explainer on the home page.
// Every number here is picked by hand so the steps are easy to follow.
// A real model learns its numbers and uses thousands of dimensions.

/** What each of the four numbers in a word vector stands for. */
export const FEATURES = ['living', 'place', 'data', 'math'] as const;
export const DIM = FEATURES.length;

/** Embedding table: one row (a vector) for every word the model can read. */
export const EMBEDDING: Record<string, Vec> = {
  the: [0.1, 0.1, 0.1, 0.1],
  a: [0.1, 0.1, 0.1, 0.1],
  an: [0.1, 0.1, 0.1, 0.1],
  is: [0.1, 0.1, 0.1, 0.1],
  and: [0.1, 0.1, 0.1, 0.2],
  cat: [1, 0.1, 0, 0],
  sat: [0.5, 0.6, 0, 0],
  on: [0, 0.7, 0, 0],
  data: [0, 0.1, 1, 0.2],
  new: [0, 0.3, 0.6, 0],
  matrix: [0, 0, 0.3, 1],
  times: [0, 0, 0.1, 0.8],
  arrow: [0, 0.2, 0, 0.9],
  has: [0.1, 0.2, 0, 0.3],
  length: [0, 0.2, 0, 0.8],
};

/** The weight matrix. It turns "what the sentence is about" into "what should come next". */
export const W: Mat = [
  [0.2, 0, 0, 0],
  [1, 0.9, 0, 0],
  [0, 0, 1.2, 0],
  [0, 0, 0.2, 1.2],
];

/** Words the model can answer with, each with its own vector. */
export const CANDIDATES: { word: string; v: Vec }[] = [
  { word: 'mat', v: [0.1, 1, 0, 0] },
  { word: 'floor', v: [0, 0.9, 0, 0] },
  { word: 'dog', v: [1, 0.1, 0, 0] },
  { word: 'oil', v: [0, 0.4, 1, 0] },
  { word: 'gold', v: [0, 0.6, 0.7, 0] },
  { word: 'vector', v: [0, 0, 0.2, 1] },
  { word: 'direction', v: [0, 0.1, 0, 1] },
  { word: 'number', v: [0, 0, 0.5, 0.7] },
];

export const EXAMPLES = [
  'the cat sat on the',
  'data is the new',
  'a matrix times a',
  'an arrow has length and',
] as const;

/** Sharpens the attention scores and the final scores, so the toy model is not too unsure. */
export const ATTENTION_SCALE = 8;
export const LOGIT_SCALE = 4;

export interface ModelRun {
  tokens: string[];
  /** One vector per token, looked up in the embedding table. */
  vectors: Vec[];
  /** Dot product of the last token's vector with every token's vector. */
  scores: number[];
  /** The scores turned into weights that add up to 1. */
  attention: number[];
  /** Weighted sum of the token vectors. */
  context: number[];
  /** W times the context vector. */
  hidden: number[];
  /** Dot product of the hidden vector with every candidate word. */
  logits: number[];
  probs: number[];
  /** Index of the most likely candidate. */
  best: number;
}

export function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

export function run(text: string, temperature = 1): ModelRun {
  const tokens = tokenize(text).filter((t) => t in EMBEDDING);
  if (tokens.length === 0) throw new Error('No known words in the text');
  const vectors = tokens.map((t) => EMBEDDING[t]);
  const query = vectors[vectors.length - 1];

  const scores = vectors.map((x) => dot(query, x));
  const attention = softmax(scores.map((s) => s * ATTENTION_SCALE));
  const context = vectors.reduce<number[]>(
    (sum, x, i) => add(sum, scale([...x], attention[i])),
    new Array<number>(DIM).fill(0),
  );

  const hidden = apply(W, context);
  const logits = CANDIDATES.map((c) => dot(c.v, hidden));
  const probs = softmax(
    logits.map((z) => z * LOGIT_SCALE),
    temperature,
  );
  const best = probs.indexOf(Math.max(...probs));
  return { tokens, vectors, scores, attention, context, hidden, logits, probs, best };
}
