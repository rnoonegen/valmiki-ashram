import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionLink = motion.create(Link);

const baseClass =
  'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors';

const variants = {
  primary:
    'border border-accent bg-accent text-white hover:bg-accent-light dark:border-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-700',
  outline:
    'border border-neutral-800 bg-white/60 text-neutral-900 hover:bg-neutral-100 dark:border-emerald-500/45 dark:bg-neutral-900/60 dark:text-emerald-50 dark:hover:border-emerald-400/55 dark:hover:bg-neutral-800',
  ghost:
    'border border-transparent text-neutral-800 hover:bg-primary/40 dark:text-neutral-200 dark:hover:bg-neutral-800',
};

const motionProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

export default function Button({
  children,
  className,
  variant = 'outline',
  to,
  href,
  ...props
}) {
  const classes = clsx(baseClass, variants[variant] ?? variants.outline, className);

  if (to) {
    return (
      <MotionLink to={to} className={classes} {...motionProps} {...props}>
        {children}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        rel="noopener noreferrer"
        target="_blank"
        {...motionProps}
        {...props}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      className={classes}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  );
}
