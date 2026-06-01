import type { ReactNode } from 'react';
import { Logo } from '../components/Logo.tsx';
import { Icon } from '../components/icons.tsx';

// Split auth shell: brand/story panel on the left, form on the right.
// The left panel carries the trust story without greenwashing kitsch.
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(40rem 40rem at 20% 10%, rgba(245,158,11,0.16), transparent 55%),' +
              'radial-gradient(36rem 36rem at 90% 90%, rgba(5,150,105,0.2), transparent 55%)',
          }}
        />
        <Logo />
        <div className="space-y-6">
          <h1 className="max-w-md font-heading text-4xl font-semibold leading-tight text-body">
            Turn the trees you grow into verified carbon credits.
          </h1>
          <p className="max-w-md text-muted">
            Register a plot, watch Canopy estimate the carbon it captures, and get paid your{' '}
            <span className="text-primary">70% share</span> when a buyer retires the credit.
          </p>
          <ul className="space-y-3 text-sm text-body/90">
            {[
              'Submit a plot in under a minute',
              'See a live tonnage estimate before you commit',
              'Track every plot from review to payout',
            ].map((line) => (
              <li key={line} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-state-verified/15 text-state-verified">
                  <Icon.Check width={14} height={14} />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted">Canopy · carbon credit marketplace</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
