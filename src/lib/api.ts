// Typed client for the Canopy backend (spac/001_poc.md §7).
// The farmer panel only calls the Auth + Farmer endpoints; everything else is
// owned by the platform/org panels.
//
// All errors leave the server in a single envelope (backend skill convention):
//   { error: { code, message, details? } }
// We unwrap that into an `ApiError` so UI can show `message` and branch on `code`.

import type {
  AuthResponse,
  NewPlotInput,
  Plot,
  PlotBase,
  Role,
  Wallet,
  WalletResponse,
} from './types.ts';

const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api';

const TOKEN_KEY = 'canopy.farmer.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Set false for auth calls that must not carry a stale token. */
  auth?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = opts;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network / CORS / backend-not-running.
    throw new ApiError('NETWORK', 'Could not reach the Canopy server. Is the backend running?', 0);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const payload = text ? safeJson(text) : null;

  if (!res.ok) {
    const env = (payload as { error?: { code?: string; message?: string; details?: unknown } } | null)
      ?.error;
    throw new ApiError(
      env?.code ?? 'ERROR',
      env?.message ?? `Request failed (${res.status})`,
      res.status,
      env?.details,
    );
  }
  return payload as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const api = {
  // Auth
  register: (input: { email: string; password: string; name: string; role: Role }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: input, auth: false }),

  login: (input: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: input, auth: false }),

  // Farmer
  createPlot: (input: NewPlotInput) =>
    request<PlotBase>('/plots', { method: 'POST', body: input }),

  myPlots: () => request<Plot[]>('/plots/mine'),

  // Normalize the backend's `{ farmer_amount_total }` into `{ balance }`.
  wallet: async (): Promise<Wallet> => {
    const res = await request<WalletResponse>('/wallet');
    return { balance: res.farmer_amount_total };
  },
};
