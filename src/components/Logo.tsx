import { Icon } from './icons.tsx';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
        <Icon.Leaf width={20} height={20} />
      </span>
      {!compact && (
        <div className="leading-tight">
          <span className="block font-heading text-base font-semibold text-body">Canopy</span>
          <span className="block text-[11px] uppercase tracking-widest text-muted">Farmer</span>
        </div>
      )}
    </div>
  );
}
