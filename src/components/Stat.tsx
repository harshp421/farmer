import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: 'amber' | 'green' | 'emerald' | 'muted';
}

const accents = {
  amber: 'text-secondary bg-secondary/10 ring-secondary/20', // warm gold accent
  green: 'text-cta bg-cta/10 ring-cta/20',
  emerald: 'text-state-verified bg-state-verified/10 ring-state-verified/20',
  muted: 'text-muted bg-ink-800 ring-ink-600',
};

export function Stat({ label, value, hint, icon, accent = 'amber' }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
        {icon && (
          <span className={`grid h-9 w-9 place-items-center rounded-xl ring-1 ${accents[accent]}`}>
            {icon}
          </span>
        )}
      </div>
      {/* Reserve height so async values don't jump the layout. */}
      <div className="num mt-3 min-h-[2.25rem] text-3xl font-semibold text-body">{value}</div>
      {hint && <div className="mt-1 text-sm text-muted">{hint}</div>}
    </div>
  );
}
