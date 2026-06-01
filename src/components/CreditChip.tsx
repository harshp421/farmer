import type { CreditStatus } from '../lib/types.ts';
import { Icon } from './icons.tsx';

// Onward state of the credit a verified plot produced, from the farmer's view.
// Lifecycle: issued → listed → sold → retired (| reversed). "sold" and beyond
// mean the farmer has been paid.

const MAP: Record<
  CreditStatus,
  { label: string; text: string; ring: string; Glyph: typeof Icon.Check }
> = {
  issued: {
    label: 'Issued',
    text: 'text-secondary',
    ring: 'border-secondary/30 bg-secondary/10',
    Glyph: Icon.Spark,
  },
  listed: {
    label: 'On the market',
    text: 'text-state-verified',
    ring: 'border-state-verified/30 bg-state-verified/10',
    Glyph: Icon.Spark,
  },
  sold: {
    label: 'Sold — you got paid',
    text: 'text-state-verified',
    ring: 'border-state-verified/40 bg-state-verified/10',
    Glyph: Icon.Coins,
  },
  retired: {
    label: 'Retired',
    text: 'text-state-verified',
    ring: 'border-state-verified/40 bg-state-verified/10',
    Glyph: Icon.Check,
  },
  reversed: {
    label: 'Reversed',
    text: 'text-state-rejected',
    ring: 'border-state-rejected/30 bg-state-rejected/10',
    Glyph: Icon.X,
  },
};

export function CreditChip({ status }: { status: CreditStatus }) {
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
