import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.tsx';
import { ApiError } from '../lib/api.ts';
import { AuthShell } from './AuthShell.tsx';
import { TextField } from '../components/Field.tsx';
import { Button } from '../components/Button.tsx';
import { Alert } from '../components/Alert.tsx';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < 8;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.code === 'CONFLICT'
            ? 'An account with that email already exists.'
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
      <h2 className="text-2xl font-semibold text-body">Create your farmer account</h2>
      <p className="mt-1 text-sm text-muted">Start registering plots and earning from carbon.</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField
          label="Full name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Amara Okeke"
        />
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
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          error={passwordTooShort ? 'At least 8 characters.' : undefined}
          hint={passwordTooShort ? undefined : 'Use 8 or more characters.'}
        />
        <Button type="submit" variant="cta" block loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-soft">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
