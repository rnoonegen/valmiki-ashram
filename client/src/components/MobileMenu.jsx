import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
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
  { to: '/admission', label: 'Admission' },
  { to: '/contests', label: 'Contests' },
  { to: '/contact', label: 'Contact Us' },
];

export default function MobileMenu({ open, onClose }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const closeAll = () => {
    setOpenDropdown(null);
    onClose();
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
                to="/"
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
                  items={aboutItems}
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
                  items={programItems}
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
                  items={registrationItems}
                  mobileControlled
                  mobileOpen={openDropdown === 'registrations'}
                  onMobileToggle={() =>
                    setOpenDropdown((k) => (k === 'registrations' ? null : 'registrations'))
                  }
                  onItemClick={closeAll}
                />
              </div>

              {tailLinks.map((link) => (
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
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
