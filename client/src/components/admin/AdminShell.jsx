import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Container from '../Container';
import { clearAdminToken } from '../../admin/api';

const links = [
  { to: '/admin', label: 'Home', end: true },
  { to: '/admin/about', label: 'About' },
  { to: '/admin/founders', label: 'Founders' },
  { to: '/admin/faq', label: 'FAQ' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/programs', label: 'Programs' },
  { to: '/admin/online-programs', label: 'Online Programs' },
  { to: '/admin/winter-camp', label: 'Winter Camp' },
  { to: '/admin/summer-camp', label: 'Summer Camp' },
];

export default function AdminShell() {
  const navigate = useNavigate();

  const logout = () => {
    clearAdminToken();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
        <Container className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-accent dark:text-emerald-200">
              Admin Panel
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    clsx(
                      'rounded-full px-3 py-1.5 text-sm',
                      isActive
                        ? 'bg-accent text-white dark:bg-emerald-700'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <button
                type="button"
                className="rounded-full bg-rose-100 px-3 py-1.5 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </Container>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
