// Carbon calculation — MVP formula (spac/001_poc.md §5).
//
// This is a *client-side preview* so the farmer sees an estimate live while
// filling the form. The backend is the source of truth and re-runs the same
// formula on POST /plots; the number shown here must match what it stores.
//
// Constants live here (config, not inline in logic) — mirror the backend config.

import type { Species } from './types.ts';

/** 15% reserve held back at issuance. */
export const BUFFER = 0.15;

/** $ per tonne CO2e (display only — farmers don't set price). */
export const PRICE = 18;

/** Farmer's cut of a sale. The platform keeps the remaining 30%. */
export const FARMER_SHARE = 0.7;

/** Sequestration is capped at this many years. */
export const AGE_CAP = 12;
const DAYS_PER_YEAR = 365.25;

/**
 * Trees must be at least this old before they can be registered for credits.
 * Mirrors the backend gate (MIN_PLOT_AGE_DAYS): carbon accrues from planting,
 * so a brand-new plot is rejected until it has grown ~12 months.
 */
export const MIN_PLOT_AGE_DAYS = 365;

/** Tonnes CO2e sequestered per tree per year, by species. */
export const SPECIES_FACTOR: Record<Species, number> = {
  acacia: 0.041,
  teak: 0.06,
  eucalyptus: 0.052,
  mango: 0.038,
  bamboo: 0.03,
};

export const SPECIES_OPTIONS: { value: Species; label: string }[] = [
  { value: 'acacia', label: 'Acacia' },
  { value: 'teak', label: 'Teak' },
  { value: 'eucalyptus', label: 'Eucalyptus' },
  { value: 'mango', label: 'Mango' },
  { value: 'bamboo', label: 'Bamboo' },
];

/** Whole days elapsed since planting. Negative for future-dated plots. */
export function plotAgeDays(plantingDate: string, now = new Date()): number {
  const planted = new Date(plantingDate);
  if (Number.isNaN(planted.getTime())) return 0;
  return (now.getTime() - planted.getTime()) / 86_400_000;
}

/**
 * Age in years for the formula: real elapsed time (day-precise), clamped to
 * [0, 12]. A plot planted today is ~0 years old → ~0 tonnes; it accrues daily.
 */
export function ageFromPlantingDate(plantingDate: string, now = new Date()): number {
  const years = plotAgeDays(plantingDate, now) / DAYS_PER_YEAR;
  return Math.min(AGE_CAP, Math.max(0, years));
}

/** Is the plot old enough to register for credits (≥ 12 months)? */
export function isPlotMature(plantingDate: string, now = new Date()): boolean {
  return plotAgeDays(plantingDate, now) >= MIN_PLOT_AGE_DAYS;
}

export interface CarbonEstimate {
  age: number;
  speciesFactor: number;
  /** tree_count × factor × age — before the buffer is held back. */
  grossTonnes: number;
  /** round(gross × (1 − BUFFER)) — what the platform would issue. */
  issuedTonnes: number;
  /** issuedTonnes × PRICE — indicative gross sale value at list price. */
  estimatedValue: number;
  /** The farmer's 70% slice of that value. */
  farmerValue: number;
}

/**
 * Run the MVP carbon formula for a live preview.
 * Returns zeros for incomplete/invalid input so the UI can render safely.
 */
export function estimateCarbon(input: {
  species: Species | '';
  treeCount: number;
  plantingDate: string;
  now?: Date;
}): CarbonEstimate {
  const { species, treeCount, plantingDate } = input;
  const empty: CarbonEstimate = {
    age: 0,
    speciesFactor: 0,
    grossTonnes: 0,
    issuedTonnes: 0,
    estimatedValue: 0,
    farmerValue: 0,
  };
  if (!species || !plantingDate || !Number.isFinite(treeCount) || treeCount <= 0) {
    return empty;
  }

  const age = ageFromPlantingDate(plantingDate, input.now);
  const speciesFactor = SPECIES_FACTOR[species];
  const grossTonnes = treeCount * speciesFactor * age;
  const issuedTonnes = Math.round(grossTonnes * (1 - BUFFER));
  const estimatedValue = issuedTonnes * PRICE;

  return {
    age,
    speciesFactor,
    grossTonnes,
    issuedTonnes,
    estimatedValue,
    farmerValue: estimatedValue * FARMER_SHARE,
  };
}
