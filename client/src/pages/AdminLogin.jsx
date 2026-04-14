import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import { apiRequest, getAdminToken, setAdminToken } from '../admin/api';
import RequiredStar from '../components/forms/RequiredStar';
import PageFade from '../components/PageFade';
import ThemeToggle from '../components/ThemeToggle';

export default function AdminLogin() {
  const navigate = useNavigate();
  const token = getAdminToken();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    const missing = [];
    if (!String(username || '').trim()) missing.push('Username');
    if (!String(password || '').trim()) missing.push('Password');
    if (missing.length) {
      setError(`Required fields: ${missing.join(', ')}.`);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setAdminToken(data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageFade>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Container className="py-16">
          <div className="mb-4 flex justify-end">
            <ThemeToggle
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white/90 shadow-sm backdrop-blur hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/90 dark:hover:bg-neutral-800"
            />
          </div>
          <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h1 className="heading-section">Admin Login</h1>
            <p className="mt-2 text-sm text-prose-muted">
              Sign in to edit content and media in real time.
            </p>
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <p className="text-xs text-prose-muted">
                Required fields are marked with <span className="font-medium text-red-500">*</span>.
              </p>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                Username
                <RequiredStar />
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  placeholder="Username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                Password
                <RequiredStar />
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-11 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent px-4 py-2 text-white dark:bg-emerald-700"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          </div>
        </Container>
      </div>
    </PageFade>
  );
}
