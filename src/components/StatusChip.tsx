import type { PlotStatus } from '../lib/types.ts';
import { Icon } from './icons.tsx';

// Plot-state visual language — derived from the design tokens (state.*), never
// hardcoded per screen. Farmer plots move: submitted → verified | rejected.

const MAP: Record<
  PlotStatus,
  { label: string; dot: string; text: string; ring: string; Glyph: typeof Icon.Clock }
> = {
  submitted: {
    label: 'Awaiting review',
    dot: 'bg-state-submitted',
    text: 'text-state-submitted',
    ring: 'border-state-submitted/30 bg-state-submitted/10',
    Glyph: Icon.Clock,
  },
  verified: {
    label: 'Verified',
    dot: 'bg-state-verified',
    text: 'text-state-verified',
    ring: 'border-state-verified/30 bg-state-verified/10',
    Glyph: Icon.Check,
  },
  rejected: {
    label: 'Rejected',
    dot: 'bg-state-rejected',
    text: 'text-state-rejected',
    ring: 'border-state-rejected/30 bg-state-rejected/10',
    Glyph: Icon.X,
  },
};

export function StatusChip({ status }: { status: PlotStatus }) {
  const s = MAP[status];
  const { Glyph } = s;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.ring} ${s.text}`}
    >
      <Glyph width={13} height={13} />
      {s.label}
    </span>
  );
}
