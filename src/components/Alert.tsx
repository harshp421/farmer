import type { ReactNode } from 'react';
import { Icon } from './icons.tsx';

type Tone = 'error' | 'success' | 'info';

const tones: Record<Tone, { ring: string; text: string; Glyph: typeof Icon.Info }> = {
  error: { ring: 'border-state-rejected/30 bg-state-rejected/10', text: 'text-state-rejected', Glyph: Icon.X },
  success: { ring: 'border-state-verified/30 bg-state-verified/10', text: 'text-state-verified', Glyph: Icon.Check },
  info: { ring: 'border-ink-600 bg-ink-700/60', text: 'text-muted', Glyph: Icon.Info },
};

export function Alert({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  const t = tones[tone];
  const { Glyph } = t;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${t.ring} ${t.text}`}
    >
      <Glyph width={16} height={16} className="mt-0.5 shrink-0" />
      <div className="text-body/90">{children}</div>
    </div>
  );
}
