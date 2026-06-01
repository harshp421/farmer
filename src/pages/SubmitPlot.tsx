import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api.ts';
import {
  BUFFER,
  FARMER_SHARE,
  PRICE,
  SPECIES_OPTIONS,
  estimateCarbon,
  isPlotMature,
} from '../lib/carbon.ts';
import type { Species } from '../lib/types.ts';
import { money, tonnes } from '../lib/format.ts';
import { PageHeader } from '../components/PageHeader.tsx';
import { SelectField, TextField } from '../components/Field.tsx';
import { Button } from '../components/Button.tsx';
import { Alert } from '../components/Alert.tsx';
import { Icon } from '../components/icons.tsx';

// Trees must be ≥ 12 months old to register (matches the backend gate), so the
// latest selectable planting date is one year ago today.
const maxPlantingIso = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
})();

export function SubmitPlot() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState<Species | ''>('');
  const [treeCount, setTreeCount] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trees = Number(treeCount);

  // Live preview — recomputed as the farmer types. Mirrors the backend formula.
  const est = useMemo(
    () => estimateCarbon({ species, treeCount: trees, plantingDate }),
    [species, trees, plantingDate],
  );

  // A picked date that's too recent (trees < 12 months old) is invalid.
  const immature = plantingDate !== '' && !isPlotMature(plantingDate);
  const ready = species !== '' && trees > 0 && plantingDate !== '' && !immature;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (species === '' || trees <= 0 || plantingDate === '') {
      setError('Fill in species, tree count, and planting date.');
      return;
    }
    if (immature) {
      setError('Trees must be at least 12 months old to register for credits.');
      return;
    }
    setLoading(true);
    try {
      const plot = await api.createPlot({
        species: species as Species,
        tree_count: trees,
        planting_date: plantingDate,
      });
      navigate('/plots', {
        replace: true,
        state: { justSubmitted: plot.id },
      });
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Submit a plot"
        subtitle="Tell us what you planted. We'll estimate the carbon it captures."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(20rem,24rem)]">
        {/* Form */}
        <form onSubmit={onSubmit} className="card animate-fade-up p-6 sm:p-7" noValidate>
          <div className="space-y-5">
            {error && <Alert tone="error">{error}</Alert>}

            <SelectField
              label="Tree species"
              value={species}
              onChange={(e) => setSpecies(e.target.value as Species)}
              hint="Species determines the carbon factor we apply."
              required
            >
              <option value="" disabled>
                Select a species…
              </option>
              {SPECIES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectField>

            <TextField
              label="Number of trees"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={treeCount}
              onChange={(e) => setTreeCount(e.target.value)}
              placeholder="e.g. 1200"
              hint="How many trees are growing on this plot."
              required
            />

            <TextField
              label="Planting date"
              type="date"
              max={maxPlantingIso}
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              hint="Carbon accrues from planting. Trees must be at least 12 months old; age is capped at 12 years."
              error={immature ? 'Trees must be at least 12 months old to register.' : undefined}
              required
            />

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" variant="cta" loading={loading} disabled={!ready}>
                <Icon.Leaf width={18} height={18} />
                Submit for review
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted">
              Submitting creates a plot in <span className="text-state-submitted">Awaiting review</span>.
              The platform verifies it before any credits are issued.
            </p>
          </div>
        </form>

        {/* Live estimate */}
        <EstimatePanel est={est} ready={ready} />
      </div>
    </div>
  );
}

function EstimatePanel({
  est,
  ready,
}: {
  est: ReturnType<typeof estimateCarbon>;
  ready: boolean;
}) {
  return (
    <aside className="card h-fit animate-fade-up overflow-hidden lg:sticky lg:top-10">
      <div className="border-b border-ink-600/60 bg-gradient-to-br from-primary/10 to-cta/10 px-6 py-5">
        <div className="flex items-center gap-2 text-primary">
          <Icon.Spark width={18} height={18} />
          <span className="text-xs font-semibold uppercase tracking-wider">Live estimate</span>
        </div>
        <p className="num mt-3 text-4xl font-semibold text-body">
          {ready ? tonnes(est.issuedTonnes, 0) : '—'}
        </p>
        <p className="mt-1 text-sm text-muted">
          estimated credits issued{' '}
          <span className="text-muted/70">(after {Math.round(BUFFER * 100)}% buffer)</span>
        </p>
      </div>

      <dl className="divide-y divide-ink-600/50 px-6 py-2 text-sm">
        <Row label="Tree age (capped 12y)" value={ready ? `${est.age.toFixed(1)} yr` : '—'} />
        <Row
          label="Species factor"
          value={ready ? `${est.speciesFactor} t/tree·yr` : '—'}
        />
        <Row label="Gross tonnes" value={ready ? tonnes(est.grossTonnes) : '—'} />
        <Row
          label={`Buffer held (${Math.round(BUFFER * 100)}%)`}
          value={ready ? `−${tonnes(est.grossTonnes - est.issuedTonnes)}` : '—'}
        />
      </dl>

      <div className="mx-6 mb-6 mt-2 rounded-xl border border-state-verified/20 bg-state-verified/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Your share at sale</span>
          <span className="rounded-full bg-state-verified/15 px-2 py-0.5 text-xs font-medium text-state-verified">
            {Math.round(FARMER_SHARE * 100)}%
          </span>
        </div>
        <p className="num mt-1 text-2xl font-semibold text-state-verified">
          {ready ? money(est.farmerValue) : '—'}
        </p>
        <p className="mt-1 text-xs text-muted">
          if sold at {money(PRICE)}/tonne · indicative, not guaranteed
        </p>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="num font-medium text-body">{value}</dd>
    </div>
  );
}
