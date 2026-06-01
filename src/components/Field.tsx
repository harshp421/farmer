import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from 'react';
import { useId } from 'react';

interface Wrap {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string) => ReactNode;
}

// Always pairs a <label htmlFor> with its control (a11y: form-labels).
function FieldShell({ label, hint, error, children }: Wrap) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-body">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p className="text-xs text-state-rejected">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, ...input }: InputProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {(id) => (
        <input
          id={id}
          className="field-input"
          aria-invalid={error ? true : undefined}
          {...input}
        />
      )}
    </FieldShell>
  );
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function SelectField({ label, hint, error, children, ...select }: SelectProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {(id) => (
        <select id={id} className="field-input cursor-pointer" {...select}>
          {children}
        </select>
      )}
    </FieldShell>
  );
}
