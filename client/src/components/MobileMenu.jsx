import { AnimatePresence, motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { clearAdminToken } from '../admin/api';
import Dropdown from './Dropdown';
import ThemeToggle from './ThemeToggle';

const aboutItems = [
  { to: '/about', label: 'Overview', end: true },
  { to: '/founders', label: 'Founders' },
  { to: '/valmiki-ashram', label: 'Valmiki Ashram' },
];

const programItems = [
  { to: '/programs', label: 'Our Programs', end: true },
  { to: '/winter-camp', label: 'Winter Camp' },
  { to: '/summer-camp', label: 'Summer Camp' },
  { to: '/online-programs', label: 'Online Programs' },
];

const registrationItems = [
  { to: '/winter-camp/register', label: 'Winter Camp Registration' },
  { to: '/summer-camp/register', label: 'Summer Camp Registration' },
  { to: '/online-course/register', label: 'Online Course Registration' },
];

const tailLinks = [
  { to: '/gallery', label: 'Gallery' },
  { to: '/gurukulam', label: 'Gurukulam' },
  { to: '/curriculum', label: 'Curriculum' },
  { to: '/faq', label: 'FAQ' },
  { to: '/admission', label: 'Admission' },
  { to: '/contests', label: 'Contests' },
  { to: '/contact', label: 'Contact Us' },
];

export default function MobileMenu({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const adminMode = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const p = (path) => {
    if (!adminMode) return path;
    if (path === '/') return '/admin';
    return `/admin${path}`;
  };

  const [openDropdown, setOpenDropdown] = useState(null);
  const aboutItemsMapped = aboutItems.map((i) => ({ ...i, to: p(i.to) }));
  const programItemsMapped = programItems.map((i) => ({ ...i, to: p(i.to) }));
  const registrationItemsMapped = registrationItems.map((i) => ({ ...i, to: p(i.to) }));
  const tailLinksMapped = tailLinks.map((i) => ({ ...i, to: p(i.to) }));

  const closeAll = () => {
    setOpenDropdown(null);
    onClose();
  };
  const logout = () => {
    clearAdminToken();
    closeAll();
    navigate('/admin-login');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black lg:hidden"
            aria-label="Close menu"
            onClick={closeAll}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-[min(100%,360px)] flex-col bg-white shadow-nav dark:bg-neutral-900 lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-700">
              <span className="text-lg font-semibold text-accent dark:text-emerald-200">
                Menu
              </span>
              <div className="flex items-center gap-2">
                <ThemeToggle className="rounded-full p-2 hover:bg-primary/50 dark:hover:bg-neutral-800" />
                <button
                  type="button"
                  onClick={closeAll}
                  className="rounded-full p-2 hover:bg-primary/50 dark:hover:bg-neutral-800"
                  aria-label="Close"
                >
                  <X className="h-6 w-6 text-neutral-800 dark:text-neutral-200" />
                </button>
              </div>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              <NavLink
                to={p('/')}
                end
                onClick={closeAll}
                className={({ isActive }) =>
                  clsx(
                    'rounded-xl px-4 py-3 text-base font-medium',
                    isActive
                      ? 'bg-primary text-accent dark:bg-emerald-950/95 dark:text-emerald-50 dark:shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]'
                      : 'text-neutral-800 hover:bg-primary/40 dark:text-neutral-200 dark:hover:bg-neutral-800'
                  )
                }
              >
                Home
              </NavLink>

              <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                <Dropdown
                  label="About"
                  items={aboutItemsMapped}
                  mobileControlled
                  mobileOpen={openDropdown === 'about'}
                  onMobileToggle={() =>
                    setOpenDropdown((k) => (k === 'about' ? null : 'about'))
                  }
                  onItemClick={closeAll}
                />
              </div>

              <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                <Dropdown
                  label="Programs"
                  items={programItemsMapped}
                  mobileControlled
                  mobileOpen={openDropdown === 'programs'}
                  onMobileToggle={() =>
                    setOpenDropdown((k) => (k === 'programs' ? null : 'programs'))
                  }
                  onItemClick={closeAll}
                />
              </div>

              <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                <Dropdown
                  label="Registrations"
                  items={registrationItemsMapped}
                  mobileControlled
                  mobileOpen={openDropdown === 'registrations'}
                  onMobileToggle={() =>
                    setOpenDropdown((k) => (k === 'registrations' ? null : 'registrations'))
                  }
                  onItemClick={closeAll}
                />
              </div>

              {tailLinksMapped.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeAll}
                  className={({ isActive }) =>
                    clsx(
                      'rounded-xl px-4 py-3 text-base font-medium',
                      isActive
                        ? 'bg-primary text-accent dark:bg-emerald-950/95 dark:text-emerald-50 dark:shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]'
                        : 'text-neutral-800 hover:bg-primary/40 dark:text-neutral-200 dark:hover:bg-neutral-800'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {adminMode ? (
                <NavLink
                  to="/admin/settings"
                  onClick={closeAll}
                  className={({ isActive }) =>
                    clsx(
                      'inline-flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium',
                      isActive
                        ? 'bg-primary text-accent dark:bg-emerald-950/95 dark:text-emerald-50 dark:shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]'
                        : 'text-neutral-800 hover:bg-primary/40 dark:text-neutral-200 dark:hover:bg-neutral-800'
                    )
                  }
                >
                  <Settings className="h-4 w-4" /> Settings
                </NavLink>
              ) : null}
              {adminMode ? (
                <button
                  type="button"
                  onClick={logout}
                  className="mt-2 rounded-xl bg-rose-100 px-4 py-3 text-left text-base font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/55"
                >
                  Logout
                </button>
              ) : null}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
