import { useState } from 'react';
import { fmt } from '../../format';

interface NumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  /** Text colour of the number, to match the arrow or matrix column it belongs to. */
  color?: string;
  step?: number;
  min?: number;
  max?: number;
  testId?: string;
  className?: string;
}

/**
 * A number box that is linked to the store.
 * While you type, it keeps your text (so "-" or "1." are allowed).
 * When you are not typing, it shows the live value.
 */
export function NumberField({
  value,
  onChange,
  label,
  color,
  step = 1,
  min = -20,
  max = 20,
  testId,
  className = 'w-20',
}: NumberFieldProps) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <input
      type="number"
      aria-label={label}
      data-testid={testId}
      className={`rounded-md border border-line bg-bg px-2 py-1 text-center font-mono text-base ${className}`}
      style={{ color }}
      step={step}
      value={focused ? text : fmt(value)}
      onFocus={() => {
        setText(fmt(value));
        setFocused(true);
      }}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value.trim() !== '' && Number.isFinite(n)) {
          onChange(Math.min(max, Math.max(min, n)));
        }
      }}
    />
  );
}
