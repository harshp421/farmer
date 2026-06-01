import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { useAsync } from '../lib/useAsync.ts';
import type { Plot } from '../lib/types.ts';
import { dateLabel, money, relativeTime, tonnes } from '../lib/format.ts';
import { PageHeader } from '../components/PageHeader.tsx';
import { Button } from '../components/Button.tsx';
import { StatusChip } from '../components/StatusChip.tsx';
import { CreditChip } from '../components/CreditChip.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { Alert } from '../components/Alert.tsx';
import { SkeletonRow } from '../components/Skeleton.tsx';
import { Icon } from '../components/icons.tsx';

const SPECIES_LABEL: Record<string, string> = {
  acacia: 'Acacia',
  teak: 'Teak',
  eucalyptus: 'Eucalyptus',
  mango: 'Mango',
  bamboo: 'Bamboo',
};

/**
 * One chip per plot that follows the whole journey: the plot status until it's
 * verified, then the onward state of the credit it produced (listed → sold → …).
 */
function StageChip({ plot }: { plot: Plot }) {
  if (plot.status === 'verified' && plot.credit_status) {
    return <CreditChip status={plot.credit_status} />;
  }
  return <StatusChip status={plot.status} />;
}

/** Earnings cell: the farmer's payout once the plot's credit sells; else a hint. */
function earnedLabel(plot: Plot): { text: string; paid: boolean } {
  if (plot.earned != null && plot.earned > 0) return { text: money(plot.earned, { cents: true }), paid: true };
  if (plot.credit_status === 'listed') return { text: 'Awaiting buyer', paid: false };
  if (plot.status === 'submitted') return { text: 'In review', paid: false };
  return { text: '—', paid: false };
}

export function MyPlots() {
  const navigate = useNavigate();
  const location = useLocation();
  const justSubmitted = (location.state as { justSubmitted?: string } | null)?.justSubmitted;

  const { data: plots, error, loading, reload } = useAsync<Plot[]>(() => api.myPlots());

  return (
    <div>
      <PageHeader
        title="My plots"
        subtitle="Track each plot from review to sale — and see which one earned you money."
        action={
          <Button variant="cta" onClick={() => navigate('/plots/new')}>
            <Icon.Plus width={18} height={18} />
            Submit a plot
          </Button>
        }
      />

      {justSubmitted && (
        <div className="mb-5">
          <Alert tone="success">
            Plot submitted. It's now awaiting review by the platform — we'll update the status here.
          </Alert>
        </div>
      )}

      {error && (
        <div className="mb-5">
          <Alert tone="error">
            {error}{' '}
            <button onClick={reload} className="font-medium text-primary hover:underline cursor-pointer">
              Retry
            </button>
          </Alert>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : !plots || plots.length === 0 ? (
        <EmptyState
          icon={<Icon.Trees width={26} height={26} />}
          title="No plots yet"
          description="Register your first plot to get a carbon estimate and start earning when it sells."
          action={
            <Button variant="cta" onClick={() => navigate('/plots/new')}>
              <Icon.Plus width={18} height={18} />
              Submit your first plot
            </Button>
          }
        />
      ) : (
        <PlotsTable plots={plots} highlightId={justSubmitted} />
      )}
    </div>
  );
}

function PlotsTable({ plots, highlightId }: { plots: Plot[]; highlightId?: string }) {
  return (
    <>
      {/* Desktop: table. Wrapped for horizontal scroll on narrow viewports. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-2 font-medium">Plot</th>
              <th className="px-4 py-2 font-medium">Trees</th>
              <th className="px-4 py-2 font-medium">Planted</th>
              <th className="px-4 py-2 font-medium">Est. carbon</th>
              <th className="px-4 py-2 font-medium">Stage</th>
              <th className="px-4 py-2 font-medium">Earned</th>
            </tr>
          </thead>
          <tbody>
            {plots.map((p) => {
              const earned = earnedLabel(p);
              return (
                <tr
                  key={p.id}
                  className={`bg-ink-700/60 transition-colors hover:bg-ink-700 ${
                    p.id === highlightId ? 'ring-1 ring-primary/40' : ''
                  }`}
                >
                  <td className="rounded-l-xl px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon.Leaf width={18} height={18} />
                      </span>
                      <div>
                        <p className="font-medium text-body">
                          {SPECIES_LABEL[p.species] ?? p.species}
                        </p>
                        <p className="font-heading text-xs text-muted">#{p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="num px-4 py-3.5 text-body">{p.tree_count.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-body">{dateLabel(p.planting_date)}</p>
                    <p className="text-xs text-muted">{relativeTime(p.created_at)}</p>
                  </td>
                  <td className="num px-4 py-3.5 text-body">{tonnes(p.estimate_tonnes)}</td>
                  <td className="px-4 py-3.5">
                    <StageChip plot={p} />
                  </td>
                  <td className="rounded-r-xl px-4 py-3.5">
                    <span
                      className={`num font-medium ${earned.paid ? 'text-state-verified' : 'text-muted'}`}
                    >
                      {earned.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list. */}
      <div className="space-y-3 md:hidden">
        {plots.map((p) => {
          const earned = earnedLabel(p);
          return (
            <div
              key={p.id}
              className={`card p-4 ${p.id === highlightId ? 'ring-1 ring-primary/40' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon.Leaf width={20} height={20} />
                  </span>
                  <div>
                    <p className="font-medium text-body">{SPECIES_LABEL[p.species] ?? p.species}</p>
                    <p className="font-heading text-xs text-muted">#{p.id.slice(0, 8)}</p>
                  </div>
                </div>
                <StageChip plot={p} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <Cell label="Trees" value={p.tree_count.toLocaleString()} />
                <Cell label="Est. carbon" value={tonnes(p.estimate_tonnes)} />
                <Cell
                  label="Earned"
                  value={earned.text}
                  valueClass={earned.paid ? 'text-state-verified' : 'text-muted'}
                />
              </dl>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Cell({
  label,
  value,
  valueClass = 'text-body',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`num mt-0.5 font-medium ${valueClass}`}>{value}</dd>
    </div>
  );
}
