import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../../auth/useSession';
import styles from './LoginPage.module.css';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { status, expired, signIn } = useSession();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [credential, setCredential] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'bootstrapping') {
    return <p className={styles.loading}>Loading session…</p>;
  }

  if (status === 'authenticated') {
    const state = location.state as LocationState | null;
    return <Navigate to={state?.from ?? '/'} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signIn(identifier, credential);
    } catch (cause) {
      const message =
        cause instanceof Error && cause.message.length > 0
          ? cause.message
          : 'Could not sign in.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <p className={styles.wordmark}>Kanban</p>
          <p className={styles.tagline}>Three columns. Your desk. Nothing else.</p>
        </div>

        {expired ? (
          <p className={styles.notice} role="status">
            Your session expired. Sign in again to continue.
          </p>
        ) : null}

        {error === null ? null : (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field} htmlFor="email">
            Email
            <input
              id="email"
              className="control"
              type="email"
              name="email"
              autoComplete="username"
              disabled={submitting}
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.currentTarget.value);
              }}
            />
          </label>

          <label className={styles.field} htmlFor="password">
            Password
            <input
              id="password"
              className="control"
              type="password"
              name="password"
              autoComplete="current-password"
              disabled={submitting}
              value={credential}
              onChange={(event) => {
                setCredential(event.currentTarget.value);
              }}
            />
          </label>

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className={styles.note}>Accounts are provisioned. There is no public signup.</p>
      </div>
    </main>
  );
}
