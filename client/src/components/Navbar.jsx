import { LogOut, Menu, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { adminRequest, clearAdminToken } from '../admin/api';
import ImageUploader from './admin/ImageUploader';
import Container from './Container';
import Dropdown from './Dropdown';
import useLiveContent from '../hooks/useLiveContent';
import LotusMark from './LotusMark';
import MobileMenu from './MobileMenu';
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
  { to: '/register/winter-camp', label: 'Winter Camp Registration' },
  { to: '/register/summer-camp', label: 'Summer Camp Registration' },
  { to: '/register/online-course', label: 'Online Course Registration' },
];

const morePool = [
  { to: '/gallery', label: 'Gallery' },
  { to: '/curriculum', label: 'Curriculum' },
  { to: '/faq', label: 'FAQ' },
  { to: '/admission', label: 'Admission' },
  { to: '/contests', label: 'Contests' },
  { to: '/contact', label: 'Contact Us' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const adminMode = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const siteContent = useLiveContent('site', {});
  const logoUrl = siteContent.logoUrl || '';
  const p = (path) => {
    if (!adminMode) return path;
    if (path === '/') return '/admin';
    return `/admin${path}`;
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoPreviewOpen, setLogoPreviewOpen] = useState(false);
  const aboutItemsMapped = aboutItems.map((i) => ({ ...i, to: p(i.to) }));
  const programItemsMapped = programItems.map((i) => ({ ...i, to: p(i.to) }));
  const registrationItemsMapped = registrationItems.map((i) => ({ ...i, to: p(i.to) }));
  const morePoolMapped = morePool.map((i) => ({ ...i, to: p(i.to) }));
  const saveLogo = async (url) => {
    await adminRequest('/api/admin/content/site', {
      method: 'PUT',
      body: JSON.stringify({ content: { ...siteContent, logoUrl: url } }),
    });
  };
  const logout = () => {
    clearAdminToken();
    navigate('/admin-login');
  };

  return (
    <>
      <motion.header
        className="sticky top-0 z-30 border-b border-neutral-200/40 bg-neutral-50/85 py-3 backdrop-blur-md dark:border-emerald-950/50 dark:bg-neutral-950/90 dark:backdrop-blur-xl"
        initial={false}
      >
        <Container>
          <div className="flex items-center justify-between gap-3 rounded-full border border-neutral-200/80 bg-primary/90 px-3 py-2 shadow-nav backdrop-blur-md dark:border-emerald-800/45 dark:bg-emerald-950/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] dark:backdrop-blur-md">
            <Link
              to={p('/')}
              className="group flex shrink-0 items-center gap-2 rounded-full px-2 py-1 text-accent dark:text-emerald-200"
            >
              {logoUrl ? (
                <button
                  type="button"
                  onClick={(event) => {
                    if (adminMode) {
                      event.preventDefault();
                      setLogoPreviewOpen(true);
                    }
                  }}
                  className="relative h-9 w-9 overflow-hidden rounded-full bg-white/70 p-1 ring-1 ring-black/10 dark:bg-neutral-900/80 dark:ring-white/10"
                  aria-label={adminMode ? 'Preview logo' : 'Logo'}
                >
                  <img
                    src={logoUrl}
                    alt="Valmiki Ashram logo"
                    className="h-full w-full object-contain"
                  />
                </button>
              ) : (
                <LotusMark className="h-9 w-9 text-accent dark:text-emerald-200" />
              )}
              <span className="text-sm font-semibold tracking-tight sm:text-base">
                Valmiki Ashram
              </span>
            </Link>
            {adminMode ? (
              <div className="hidden sm:block">
                <ImageUploader
                  folder="branding"
                  buttonText={logoUrl ? 'Change Logo' : 'Upload Logo'}
                  onUploaded={(asset) => saveLogo(asset.url)}
                />
              </div>
            ) : null}

            <nav
              className="hidden items-center gap-1 lg:flex"
              aria-label="Primary"
            >
              <NavLink
                to={p('/')}
                end
                className={({ isActive }) =>
                  clsx(
                    'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/80 text-accent shadow-sm dark:bg-emerald-950/95 dark:text-emerald-50 dark:shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]'
                      : 'text-accent hover:bg-white/50 dark:text-emerald-200 dark:hover:bg-neutral-800/80'
                  )
                }
              >
                Home
              </NavLink>

              <Dropdown label="About" items={aboutItemsMapped} />

              <Dropdown label="Programs" items={programItemsMapped} />
              <Dropdown label="Registrations" items={registrationItemsMapped} />

              <NavLink
                to={p('/gurukulam')}
                className={({ isActive }) =>
                  clsx(
                    'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/80 text-accent shadow-sm dark:bg-emerald-950/95 dark:text-emerald-50 dark:shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]'
                      : 'text-accent hover:bg-white/50 dark:text-emerald-200 dark:hover:bg-neutral-800/80'
                  )
                }
              >
                Gurukulam
              </NavLink>

              <Dropdown label="More" items={morePoolMapped} />
            </nav>

            <div className="flex items-center gap-1">
              {adminMode ? (
                <button
                  type="button"
                  onClick={logout}
                  className="hidden items-center gap-1 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/55 lg:inline-flex sm:text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : null}
              <ThemeToggle className="hidden rounded-full p-2 hover:bg-white/50 dark:hover:bg-neutral-800 lg:inline-flex" />
              {adminMode ? (
                <Link
                  to="/admin/settings"
                  aria-label="Admin settings"
                  title="Settings"
                  className="hidden rounded-full p-2 text-accent hover:bg-white/50 dark:text-emerald-200 dark:hover:bg-neutral-800 lg:inline-flex"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              ) : null}
              <button
                type="button"
                className="inline-flex rounded-full p-2 hover:bg-white/50 dark:hover:bg-neutral-800 lg:hidden"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-6 w-6 text-accent dark:text-emerald-200" />
              </button>
            </div>
          </div>
        </Container>
      </motion.header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      {adminMode && logoPreviewOpen && logoUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="presentation"
          onClick={() => setLogoPreviewOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-900"
            role="presentation"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={logoUrl}
              alt="Logo preview"
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
