import type { Vec2 } from '../../core/vec';
import { NumberField } from './NumberField';

interface VectorInputProps {
  /** Short name of the vector, e.g. "v". */
  name: string;
  value: Vec2;
  onChange: (v: Vec2) => void;
  color?: string;
  step?: number;
}

/** Two number boxes for x and y. They write to the same state as the arrow on the plane. */
export function VectorInput({ name, value, onChange, color, step }: VectorInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-6 font-semibold" style={{ color }}>
        {name} =
      </span>
      <span className="text-xl text-muted" aria-hidden="true">
        [
      </span>
      <label className="flex items-center gap-1 text-sm text-muted">
        x
        <NumberField
          label={`${name} x`}
          testId={`${name}-x`}
          value={value[0]}
          color={color}
          step={step}
          onChange={(x) => onChange([x, value[1]])}
        />
      </label>
      <label className="flex items-center gap-1 text-sm text-muted">
        y
        <NumberField
          label={`${name} y`}
          testId={`${name}-y`}
          value={value[1]}
          color={color}
          step={step}
          onChange={(y) => onChange([value[0], y])}
        />
      </label>
      <span className="text-xl text-muted" aria-hidden="true">
        ]
      </span>
    </div>
  );
}
