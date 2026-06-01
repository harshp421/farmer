// Shared domain types — mirror the backend data model (spac/001_poc.md §4).
// The farmer panel only reads/writes the slice of the model it owns: its own
// plots, and a derived wallet figure. Credits live on the platform/org side.

export type Role = 'farmer' | 'platform' | 'org';

export type PlotStatus = 'submitted' | 'verified' | 'rejected';

/** Onward state of the credit a verified plot produced. */
export type CreditStatus = 'issued' | 'listed' | 'sold' | 'retired' | 'reversed';

/** A species the carbon formula knows how to price (spac/001_poc.md §5). */
export type Species = 'acacia' | 'teak' | 'eucalyptus' | 'mango' | 'bamboo';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** Bare plot row, as returned by POST /plots. Dates are ISO strings. */
export interface PlotBase {
  id: string;
  farmer_id: string;
  species: Species;
  tree_count: number;
  planting_date: string;
  /** Gross estimate from the calc; the platform issues this minus the buffer. */
  estimate_tonnes: number;
  status: PlotStatus;
  created_at: string;
}

/**
 * A plot as returned by GET /plots/mine — enriched with the lifecycle of the
 * credit this plot produced and what it earned. The credit/earned fields are
 * null until the plot is verified (credit issued) / its credit is sold.
 */
export interface Plot extends PlotBase {
  credit_id: string | null;
  credit_status: CreditStatus | null;
  tonnes_issued: number | null;
  price_per_tonne: number | null;
  certificate_id: string | null;
  /** Farmer's 70% payout for this plot — set once its credit is sold. */
  earned: number | null;
}

/**
 * Wallet = sum of `farmer_amount` from payouts for this farmer (spec §7).
 * The backend returns `{ farmer_amount_total }`; `api.wallet()` normalizes it to
 * `{ balance }` so the UI has a stable, panel-agnostic name.
 */
export interface Wallet {
  balance: number;
}

/** Raw shape returned by GET /wallet on the backend. */
export interface WalletResponse {
  farmer_amount_total: number;
}

export interface NewPlotInput {
  species: Species;
  tree_count: number;
  planting_date: string;
}
