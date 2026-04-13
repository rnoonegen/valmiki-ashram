import { Eye, EyeOff, Save } from 'lucide-react';
import { useState } from 'react';
import { adminRequest } from '../admin/api';
import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function AdminSettings() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const res = await adminRequest('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage({ type: 'success', text: res?.message || 'Password changed successfully.' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to change password.' });
    } finally {
      setLoading(false);
    }
  };

  const passwordField = (name, label, placeholder) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
        {label}
      </label>
      <div className="relative">
        <input
          type={show[name] ? 'text' : 'password'}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-11 dark:border-neutral-700 dark:bg-neutral-950"
          placeholder={placeholder}
          value={form[name]}
          onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => ({ ...prev, [name]: !prev[name] }))}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          aria-label={show[name] ? `Hide ${label}` : `Show ${label}`}
        >
          {show[name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <h1 className="heading-section">Admin Settings</h1>
          <p className="mt-2 text-sm text-prose-muted">
            Update your admin password securely.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {passwordField('currentPassword', 'Current Password', 'Enter current password')}
            {passwordField('newPassword', 'New Password', 'Enter new password')}
            {passwordField('confirmPassword', 'Confirm Password', 'Re-enter new password')}

            {message.text ? (
              <p
                className={`text-sm ${
                  message.type === 'error'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {message.text}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-white disabled:opacity-70 dark:bg-emerald-700"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Password'}
            </button>
          </form>
        </div>
      </Container>
    </PageFade>
  );
}
