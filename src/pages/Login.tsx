import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.tsx';
import { ApiError } from '../lib/api.ts';
import { AuthShell } from './AuthShell.tsx';
import { TextField } from '../components/Field.tsx';
import { Button } from '../components/Button.tsx';
import { Alert } from '../components/Alert.tsx';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.code === 'UNAUTHORIZED'
            ? 'Email or password is incorrect.'
            : err.message
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <h2 className="text-2xl font-semibold text-body">Welcome back</h2>
      <p className="mt-1 text-sm text-muted">Sign in to manage your plots and earnings.</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@farm.example"
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Button type="submit" variant="cta" block loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to Canopy?{' '}
        <Link to="/register" className="font-medium text-primary hover:text-primary-soft">
          Create a farmer account
        </Link>
      </p>
    </AuthShell>
  );
}
