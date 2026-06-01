import { api } from '../lib/api.ts';
import { useAsync } from '../lib/useAsync.ts';
import type { Plot, Wallet as WalletType } from '../lib/types.ts';
import { BUFFER, FARMER_SHARE, PRICE } from '../lib/carbon.ts';
import { money, tonnes } from '../lib/format.ts';
import { PageHeader } from '../components/PageHeader.tsx';
import { Stat } from '../components/Stat.tsx';
import { CreditChip } from '../components/CreditChip.tsx';
import { Alert } from '../components/Alert.tsx';
import { SkeletonCard } from '../components/Skeleton.tsx';
import { Icon } from '../components/icons.tsx';

const SPECIES_LABEL: Record<string, string> = {
  acacia: 'Acacia',
  teak: 'Teak',
  eucalyptus: 'Eucalyptus',
  mango: 'Mango',
  bamboo: 'Bamboo',
};

/** The farmer's would-be share for a credited-but-unsold plot. */
function potential(plot: Plot): number {
  const issued = plot.tonnes_issued ?? Math.round(plot.estimate_tonnes * (1 - BUFFER));
  return issued * PRICE * FARMER_SHARE;
}

export function Wallet() {
  const wallet = useAsync<WalletType>(() => api.wallet());
  const plots = useAsync<Plot[]>(() => api.myPlots());

  const all = plots.data ?? [];
  // Plots whose credit has been issued (verified) — these are the ones that can
  // earn. Paid = the credit sold and a payout landed for this plot.
  const credited = all.filter((p) => p.credit_status != null);
  const paid = credited.filter((p) => p.earned != null && p.earned > 0);
  const awaiting = credited.filter((p) => p.credit_status === 'listed');
  const pipeline = awaiting.reduce((sum, p) => sum + potential(p), 0);

  const balance = wallet.data?.balance ?? 0;

  return (
    <div>
      <PageHeader
        title="Wallet"
        subtitle="Your earnings, and exactly which plot each payment came from."
      />

      {wallet.error && (
        <div className="mb-5">
          <Alert tone="error">
            {wallet.error}{' '}
            <button
              onClick={wallet.reload}
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              Retry
            </button>
          </Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wallet.loading ? (
          <SkeletonCard />
        ) : (
          <Stat
            label="Available balance"
            value={money(balance, { cents: true })}
            hint={`Your ${Math.round(FARMER_SHARE * 100)}% share, paid out`}
            icon={<Icon.Wallet width={18} height={18} />}
            accent="emerald"
          />
        )}
        {plots.loading ? (
          <SkeletonCard />
        ) : (
          <Stat
            label="Plots that earned"
            value={paid.length}
            hint={`of ${credited.length} with credits issued`}
            icon={<Icon.Coins width={18} height={18} />}
            accent="amber"
          />
        )}
        {plots.loading ? (
          <SkeletonCard />
        ) : (
          <Stat
            label="In the pipeline"
            value={money(pipeline)}
            hint={`${awaiting.length} credit${awaiting.length === 1 ? '' : 's'} on the market`}
            icon={<Icon.Spark width={18} height={18} />}
            accent="green"
          />
        )}
      </div>

      {/* Which land got the money — per-plot earnings. */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-body">Earnings by plot</h2>

        {plots.loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : credited.length === 0 ? (
          <div className="card flex items-start gap-3 p-5 text-sm text-muted">
            <Icon.Info width={18} height={18} className="mt-0.5 shrink-0 text-primary" />
            <p>
              No credits issued yet. Once the platform verifies a plot, its credit appears here —
              and you'll see the payout the moment a buyer purchases it.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {credited.map((p) => {
              const isPaid = p.earned != null && p.earned > 0;
              const amount = isPaid ? (p.earned as number) : potential(p);
              return (
                <div key={p.id} className="card flex items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon.Leaf width={20} height={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-body">
                        {SPECIES_LABEL[p.species] ?? p.species} ·{' '}
                        {tonnes(p.tonnes_issued ?? 0, 0)} credits
                      </p>
                      <p className="font-heading text-xs text-muted">#{p.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    {p.credit_status && <CreditChip status={p.credit_status} />}
                    <div className="text-right">
                      <p
                        className={`num font-semibold ${isPaid ? 'text-state-verified' : 'text-muted'}`}
                      >
                        {money(amount, { cents: isPaid })}
                      </p>
                      <p className="text-[11px] uppercase tracking-wide text-muted">
                        {isPaid ? 'paid to you' : 'potential'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="card mt-6 flex items-start gap-3 p-5 text-sm text-muted">
        <Icon.Info width={18} height={18} className="mt-0.5 shrink-0 text-primary" />
        <p>
          You earn when an organization <span className="text-body">buys</span> a credit issued from
          your plot. The sale splits{' '}
          <span className="text-state-verified">{Math.round(FARMER_SHARE * 100)}% to you</span> and{' '}
          {100 - Math.round(FARMER_SHARE * 100)}% to the platform, at {money(PRICE)} per tonne.
          "Potential" figures are indicative until the credit actually sells.
        </p>
      </div>
    </div>
  );
}
