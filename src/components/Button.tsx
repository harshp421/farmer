import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'cta' | 'primary' | 'ghost' | 'subtle';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  block?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-sans font-medium ' +
  'px-4 py-2.5 text-sm transition-colors duration-200 cursor-pointer select-none ' +
  'disabled:cursor-not-allowed disabled:opacity-55';

const variants: Record<Variant, string> = {
  // Conversion actions (Submit a plot) — green CTA per the design tokens.
  cta: 'bg-cta text-white hover:bg-cta-hover shadow-soft',
  primary: 'bg-primary text-white hover:bg-primary-soft font-semibold',
  ghost: 'border border-ink-600 text-body hover:border-primary/50 hover:bg-ink-700/60',
  subtle: 'text-muted hover:text-body hover:bg-ink-700/60',
};

export function Button({
  variant = 'primary',
  loading = false,
  block = false,
  disabled,
  children,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      className={`${base} ${variants[variant]} ${block ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
