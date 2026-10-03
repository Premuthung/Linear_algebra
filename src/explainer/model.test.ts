import { describe, expect, it } from 'vitest';
import { CANDIDATES, DIM, EMBEDDING, EXAMPLES, W, run, tokenize } from './model';

const sum = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0);

describe('toy model', () => {
  it('has vectors of the same size everywhere', () => {
    for (const v of Object.values(EMBEDDING)) expect(v).toHaveLength(DIM);
    for (const c of CANDIDATES) expect(c.v).toHaveLength(DIM);
    expect(W).toHaveLength(DIM);
    for (const row of W) expect(row).toHaveLength(DIM);
  });

  it('knows every word in the examples', () => {
    for (const text of EXAMPLES) {
      for (const t of tokenize(text)) expect(EMBEDDING[t], t).toBeDefined();
    }
  });

  it('gives attention weights and probabilities that add up to 1', () => {
    for (const text of EXAMPLES) {
      const r = run(text);
      expect(sum(r.attention)).toBeCloseTo(1);
      expect(sum(r.probs)).toBeCloseTo(1);
    }
  });

  it('builds the context as a weighted sum of the token vectors', () => {
    const r = run('data is the new');
    for (let d = 0; d < DIM; d++) {
      const expected = sum(r.vectors.map((x, i) => r.attention[i] * x[d]));
      expect(r.context[d]).toBeCloseTo(expected);
    }
  });

  it('predicts a sensible next word for each example', () => {
    const word = (text: string): string => CANDIDATES[run(text).best].word;
    expect(word('the cat sat on the')).toBe('mat');
    expect(word('data is the new')).toBe('oil');
    expect(word('a matrix times a')).toBe('vector');
    expect(word('an arrow has length and')).toBe('direction');
  });

  it('gets less sure when the temperature goes up', () => {
    const cold = run('the cat sat on the', 0.5);
    const hot = run('the cat sat on the', 2);
    expect(Math.max(...cold.probs)).toBeGreaterThan(Math.max(...hot.probs));
    expect(cold.best).toBe(hot.best);
  });

  it('rejects text with no known words', () => {
    expect(() => run('zzz qqq')).toThrow('No known words');
  });
});
