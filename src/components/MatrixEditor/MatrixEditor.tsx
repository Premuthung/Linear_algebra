import { useState } from 'react';
import type { Mat2 } from '../../core/mat';
import { IDENTITY, flipX, flipY, projectX, rotate, scale, shear, swapXY } from '../../core/presets';
import { round1 } from '../../format';
import { COLORS } from '../../theme';
import { NumberField } from '../VectorInput/NumberField';
import { Button, Slider } from '../ui';

interface MatrixEditorProps {
  value: Mat2;
  onChange: (m: Mat2) => void;
  showPresets?: boolean;
}

const PRESETS: { name: string; make: () => Mat2 }[] = [
  { name: 'Identity', make: () => IDENTITY },
  { name: 'Flip over x-axis', make: () => flipX },
  { name: 'Flip over y-axis', make: () => flipY },
  { name: 'Swap x and y', make: () => swapXY },
  { name: 'Scale', make: () => scale(2, 1.5) },
  { name: 'Shear', make: () => shear(1) },
  { name: 'Squash onto x-axis', make: () => projectX },
  {
    name: 'Random',
    make: () => {
      const r = (): number => round1(Math.random() * 4 - 2);
      return [
        [r(), r()],
        [r(), r()],
      ];
    },
  },
];

/**
 * An editable 2x2 matrix.
 * Column 1 has the colour of î and column 2 the colour of ĵ:
 * the columns are where î and ĵ land.
 */
export function MatrixEditor({ value, onChange, showPresets = true }: MatrixEditorProps) {
  const [theta, setTheta] = useState(0);

  const setCell = (row: 0 | 1, col: 0 | 1, x: number): void => {
    const next = [
      [value[0][0], value[0][1]],
      [value[1][0], value[1][1]],
    ];
    next[row][col] = x;
    onChange([
      [next[0][0], next[0][1]],
      [next[1][0], next[1][1]],
    ]);
  };

  const colors = [COLORS.ihat, COLORS.jhat];
  const names = [
    ['a', 'b'],
    ['c', 'd'],
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="inline-grid grid-cols-2 gap-x-2 gap-y-1 rounded-md border-x-2 border-muted px-2 py-1"
          role="group"
          aria-label="Matrix"
        >
          <span className="text-center text-xs" style={{ color: COLORS.ihat }}>
            î lands at
          </span>
          <span className="text-center text-xs" style={{ color: COLORS.jhat }}>
            ĵ lands at
          </span>
          {([0, 1] as const).map((row) =>
            ([0, 1] as const).map((col) => (
              <NumberField
                key={`${row}${col}`}
                label={`Matrix entry ${names[row][col]}`}
                testId={`m-${names[row][col]}`}
                value={value[row][col]}
                color={colors[col]}
                step={0.5}
                onChange={(x) => setCell(row, col, x)}
              />
            )),
          )}
        </div>
      </div>

      {showPresets && (
        <>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.name}
                onClick={() => {
                  setTheta(0);
                  onChange(p.make());
                }}
              >
                {p.name}
              </Button>
            ))}
          </div>
          <Slider
            label={`Rotate ${theta}°`}
            min={-180}
            max={180}
            step={5}
            value={theta}
            testId="rotate-slider"
            onChange={(deg) => {
              setTheta(deg);
              const m = rotate((deg * Math.PI) / 180);
              // Round away tiny float noise such as 6e-17.
              const tidy = (x: number): number => Math.round(x * 1000) / 1000 + 0;
              onChange([
                [tidy(m[0][0]), tidy(m[0][1])],
                [tidy(m[1][0]), tidy(m[1][1])],
              ]);
            }}
          />
        </>
      )}
    </div>
  );
}
