// Colours used inside the SVG plane. Keep in sync with the @theme block in index.css.
// The same meaning has the same colour in every lesson.
export const COLORS = {
  bg: '#fbfcff',
  grid: '#e8ebf4',
  gridStrong: '#cdd3e4',
  axis: '#6b7491',
  ink: '#1c2033',
  muted: '#5b6480',
  /** î, the first basis vector, and the first matrix column. */
  ihat: '#16a34a',
  /** ĵ, the second basis vector, and the second matrix column. */
  jhat: '#dc2626',
  /** Input vectors. */
  u: '#0284c7',
  v: '#334155',
  w: '#d97706',
  /** Results and transformed things. */
  accent: '#6d28d9',
  /** The bent grid drawn by a matrix. */
  warped: '#93b4f0',
  flipped: '#ec4899',
} as const;

// Colours of the explainer on the home page: grey text flows into blue, indigo, then purple.
export const FLOW = {
  token: '#e5e7eb',
  blue: '#60a5fa',
  indigo: '#818cf8',
  purple: '#a78bfa',
  pink: '#f472b6',
  /** Positive and negative numbers inside a vector or matrix cell. */
  positive: '#6d28d9',
  negative: '#e11d48',
} as const;
