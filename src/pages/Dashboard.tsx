import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { useAuth } from '../lib/auth.tsx';
import { useAsync } from '../lib/useAsync.ts';
import type { Plot, Wallet as WalletType } from '../lib/types.ts';
import { dateLabel, money, tonnes } from '../lib/format.ts';
import { PageHeader } from '../components/PageHeader.tsx';
import { Stat } from '../components/Stat.tsx';
import { Button } from '../components/Button.tsx';
import { StatusChip } from '../components/StatusChip.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { SkeletonCard } from '../components/Skeleton.tsx';
import { Alert } from '../components/Alert.tsx';
import { Icon } from '../components/icons.tsx';

const SPECIES_LABEL: Record<string, string> = {
  acacia: 'Acacia',
  teak: 'Teak',
  eucalyptus: 'Eucalyptus',
  mango: 'Mango',
  bamboo: 'Bamboo',
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const plotsState = useAsync<Plot[]>(() => api.myPlots());
  const walletState = useAsync<WalletType>(() => api.wallet());

  const plots = plotsState.data ?? [];
  const awaiting = plots.filter((p) => p.status === 'submitted').length;
  const verified = plots.filter((p) => p.status === 'verified').length;
  const totalEstimate = plots.reduce((s, p) => s + p.estimate_tonnes, 0);
  const recent = [...plots]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 4);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's how your plots and earnings are doing."
        action={
          <Button variant="cta" onClick={() => navigate('/plots/new')}>
            <Icon.Plus width={18} height={18} />
            Submit a plot
          </Button>
        }
      />

      {plotsState.error && (
        <div className="mb-5">
          <Alert tone="error">
            {plotsState.error}{' '}
            <button
              onClick={plotsState.reload}
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              Retry
            </button>
          </Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plotsState.loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Stat
              label="Total plots"
              value={plots.length}
              hint={`${tonnes(totalEstimate)} estimated`}
              icon={<Icon.Trees width={18} height={18} />}
              accent="amber"
            />
            <Stat
              label="Awaiting review"
              value={awaiting}
              hint="With the platform"
              icon={<Icon.Clock width={18} height={18} />}
              accent="muted"
            />
            <Stat
              label="Verified"
              value={verified}
              hint="Credits issued"
              icon={<Icon.Check width={18} height={18} />}
              accent="emerald"
            />
            <Stat
              label="Balance"
              value={
                walletState.loading
                  ? '—'
                  : money(walletState.data?.balance ?? 0, { cents: true })
              }
              hint="Paid to you"
              icon={<Icon.Wallet width={18} height={18} />}
              accent="green"
            />
          </>
        )}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-body">Recent plots</h2>
          {plots.length > 0 && (
            <Link
              to="/plots"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-soft"
            >
              View all
              <Icon.Arrow width={16} height={16} />
            </Link>
          )}
        </div>

        {plotsState.loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<Icon.Leaf width={26} height={26} />}
            title="Register your first plot"
            description="Submit a plot and Canopy estimates the carbon it captures. Verified plots become sellable credits."
            action={
              <Button variant="cta" onClick={() => navigate('/plots/new')}>
                <Icon.Plus width={18} height={18} />
                Submit a plot
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {recent.map((p) => (
              <Link
                key={p.id}
                to="/plots"
                className="card flex items-center justify-between gap-4 p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon.Leaf width={20} height={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-body">
                      {SPECIES_LABEL[p.species] ?? p.species} ·{' '}
                      {p.tree_count.toLocaleString()} trees
                    </p>
                    <p className="text-xs text-muted">
                      Planted {dateLabel(p.planting_date)} · {tonnes(p.estimate_tonnes)} est.
                    </p>
                  </div>
                </div>
                <StatusChip status={p.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
