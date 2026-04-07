import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, matchPath, useLocation } from 'react-router-dom';

export default function Dropdown({
  label,
  items,
  desktopOpen,
  onDesktopOpenChange,
  mobileControlled,
  mobileOpen,
  onMobileToggle,
  onItemClick,
}) {
  const location = useLocation();
  const [hoverOpen, setHoverOpen] = useState(false);
  const closeTimer = useRef(null);

  const clearTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = useCallback(() => {
    clearTimer();
    closeTimer.current = window.setTimeout(() => {
      onDesktopOpenChange?.(false);
      setHoverOpen(false);
    }, 120);
  }, [onDesktopOpenChange]);

  useEffect(() => () => clearTimer(), []);

  const handleEnter = () => {
    if (mobileControlled) return;
    clearTimer();
    onDesktopOpenChange?.(true);
    setHoverOpen(true);
  };

  const handleLeave = () => {
    if (mobileControlled) return;
    scheduleClose();
  };

  const isOpen = mobileControlled
    ? mobileOpen
    : desktopOpen !== undefined
      ? desktopOpen
      : hoverOpen;

  const hasActiveChild = items.some((item) => {
    const pattern = item.end ? item.to : `${item.to}/*`;
    return !!matchPath({ path: pattern, end: !!item.end }, location.pathname);
  });

  const toggleMobile = () => {
    if (!mobileControlled) return;
    onMobileToggle?.();
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className={clsx(
          'flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors',
          hasActiveChild
            ? 'bg-white/80 text-accent shadow-sm dark:bg-emerald-950/95 dark:text-emerald-50 dark:shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]'
            : 'text-accent hover:text-accent-light dark:text-emerald-200 dark:hover:text-emerald-100',
          mobileControlled &&
            'w-full justify-between rounded-xl text-left hover:bg-primary/40 dark:hover:bg-neutral-800'
        )}
        aria-expanded={isOpen}
        onClick={mobileControlled ? toggleMobile : undefined}
      >
        {label}
        <ChevronDown
          className={clsx(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className={clsx(
              'z-50 min-w-[200px] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-nav dark:border-neutral-700 dark:bg-neutral-900',
              mobileControlled
                ? 'relative mt-1 w-full'
                : 'absolute left-0 top-full mt-1'
            )}
          >
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'block px-4 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/60 font-semibold text-accent dark:bg-emerald-950/90 dark:text-emerald-50 dark:shadow-[inset_0_0_0_1px_rgba(52,211,153,0.35)]'
                      : 'text-neutral-700 hover:bg-primary/40 dark:text-neutral-200 dark:hover:bg-neutral-800'
                  )
                }
                onClick={() => {
                  onItemClick?.();
                  onDesktopOpenChange?.(false);
                  setHoverOpen(false);
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
