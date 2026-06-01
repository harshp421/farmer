# Canopy — Farmer panel

One of the three Canopy frontends (farmer · organization · platform). This app is
the **supply side**: a farmer registers plots, sees a live carbon estimate, tracks
each plot from review to verification, and watches their wallet.

Built per `spac/001_poc.md` and the design system in `CLAUDE.md` (Organic Biophilic —
dark `#0F172A` base, amber `#F59E0B` accents, violet `#8B5CF6` CTAs, Fira Code / Fira Sans).

## Stack

- **Vite + React 18 + TypeScript** (strict)
- **Tailwind CSS** — design tokens live in `tailwind.config.js`; never hardcode colors per screen
- **react-router-dom** for routing, JWT held in `localStorage`
- No state/query libraries — the MVP doesn't need them

## Run it

```bash
cd farmer
npm install
cp .env.example .env      # defaults are fine for local dev
npm run dev               # http://localhost:5173
```

The dev server proxies `/api/*` to the backend at `VITE_API_TARGET`
(default `http://localhost:3000`). Start the Canopy backend there, or point
`VITE_API_TARGET` at wherever it runs.

```bash
npm run build       # typecheck + production build → dist/
npm run typecheck   # types only
```

## What it talks to (backend, spac/001_poc.md §7)

Only the farmer-relevant endpoints:

| Action            | Call                                            |
| ----------------- | ----------------------------------------------- |
| Register / login  | `POST /auth/register`, `POST /auth/login`       |
| Submit a plot     | `POST /plots` (backend re-runs the §5 calc)     |
| List my plots     | `GET /plots/mine`                               |
| Wallet balance    | `GET /wallet` (sum of `farmer_amount` payouts)  |

The register form always creates a `farmer` role; sign-ins with another role are
rejected client-side (the matching panel handles those).

## Structure

```
src/
  lib/
    api.ts         typed fetch client + error envelope unwrap
    auth.tsx       AuthProvider, JWT/session persistence
    carbon.ts      MVP carbon formula + constants (mirrors backend §5)
    types.ts       domain types mirroring the data model (§4)
    format.ts      money / tonnes / date helpers
    useAsync.ts    tiny fetch-on-mount hook
  components/      Layout, Button, Field, StatusChip, Stat, icons, …
  pages/
    Login, Register
    Dashboard      overview: stats + recent plots
    SubmitPlot     form with live carbon estimate panel
    MyPlots        responsive table / card list with status chips
    Wallet         earnings + pipeline
```

## Carbon estimate

`src/lib/carbon.ts` runs the spec §5 formula client-side so the farmer sees a number
while typing. **The backend is the source of truth** and recomputes on submit — keep
the constants here in sync with the backend config (`BUFFER`, `PRICE`, shares,
`species_factor`). The farmer never sets price or buffer.

## Design checklist (kept honest)

SVG icons only (no emoji), `cursor-pointer` on every control, 150–300ms hover
transitions with no layout shift, visible focus rings, `prefers-reduced-motion`
respected, responsive at 375 / 768 / 1024 / 1440, async surfaces reserve space
(skeletons) so the layout doesn't jump.
