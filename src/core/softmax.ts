/**
 * Turn any list of scores into probabilities that add up to 1.
 * Subtracting the max first keeps the numbers small, so exp() never overflows.
 * A higher temperature makes the result flatter; a lower one makes it sharper.
 */
export function softmax(xs: readonly number[], temperature = 1): number[] {
  if (xs.length === 0) return [];
  if (!(temperature > 0)) throw new Error('Temperature must be greater than 0');
  const max = Math.max(...xs);
  const exps = xs.map((x) => Math.exp((x - max) / temperature));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}
