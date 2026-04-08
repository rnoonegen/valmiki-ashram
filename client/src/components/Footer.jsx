import clsx from 'clsx';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import Container from './Container';
import useLiveContent from '../hooks/useLiveContent';
import LotusMark from './LotusMark';

const social = [
  {
    href: process.env.REACT_APP_INSTAGRAM_LINK,
    label: 'Instagram',
    Icon: FaInstagram,
  },
  {
    href: process.env.REACT_APP_FACEBOOK_LINK,
    label: 'Facebook',
    Icon: FaFacebook,
  },
  {
    href: process.env.REACT_APP_X_LINK,
    label: 'X',
    Icon: FaXTwitter,
  },
  {
    href: process.env.REACT_APP_LINKEDIN_LINK,
    label: 'LinkedIn',
    Icon: FaLinkedin,
  },
  {
    href: process.env.REACT_APP_YOUTUBE_LINK,
    label: 'YouTube',
    Icon: FaYoutube,
  },
];

const navLinks = [
  { to: '/faq', label: 'FAQ' },
  { to: '/terms', label: 'Terms' },
];

const linkClass =
  'w-fit text-accent underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent-light dark:text-emerald-200 dark:decoration-emerald-500/40 dark:hover:text-emerald-100';

export default function Footer({ className }) {
  const siteContent = useLiveContent('site', {});
  const logoUrl = siteContent.logoUrl || '';
  const email = process.env.REACT_APP_EMAIL || '';
  const phone = process.env.REACT_APP_PHONE || '';
  const digits = phone.replace(/\D/g, '');
  const telHref =
    digits.length > 0
      ? digits.startsWith('91')
        ? `+${digits}`
        : `+91${digits}`
      : '';
  const displayPhone = phone.startsWith('+')
    ? phone
    : digits
      ? `+91 ${phone.trim()}`
      : '';

  return (
    <footer
      className={clsx(
        'mt-auto border-t border-neutral-200/80 dark:border-neutral-800',
        className
      )}
    >
      <div className="border-b border-neutral-200/80 bg-[#e2e8e1] pt-10 pb-5 dark:border-neutral-700 dark:bg-neutral-900">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/80 p-1 ring-1 ring-black/10 dark:bg-neutral-900 dark:ring-white/10">
                    <img
                      src={logoUrl}
                      alt="Valmiki Ashram logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <LotusMark className="h-10 w-10 shrink-0 text-accent dark:text-emerald-200" />
                )}
                <span className="text-2xl font-medium text-accent dark:text-emerald-200 md:text-3xl">
                  Valmiki Ashram
                </span>
              </div>
              <p className="max-w-md text-sm text-neutral-600 dark:text-neutral-400">
                Reconnect with Bharat through Samskrutham, Soil, and Stories.
              </p>
              <div className="flex flex-wrap gap-2">
                {social.map(({ href, label, Icon }) =>
                  href ? (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-sm ring-1 ring-black/10 transition-transform hover:scale-105 hover:bg-neutral-900 dark:bg-emerald-950 dark:text-emerald-100 dark:ring-emerald-500/40 dark:hover:bg-emerald-900 dark:hover:ring-emerald-400/50"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ) : null
                )}
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={linkClass}>
                  {label}
                </Link>
              ))}
              <a
                href={process.env.REACT_APP_WHATSAPP_COMMUNITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Join the WhatsApp Community
              </a>
            </nav>

            <div className="space-y-3 text-sm text-neutral-800 md:text-base dark:text-neutral-200">
              {email ? (
                <p>
                  <span className="font-medium text-accent dark:text-emerald-200">
                    Email:{' '}
                  </span>
                  <a href={`mailto:${email}`} className="link-app">
                    {email}
                  </a>
                </p>
              ) : null}
              <p>
                <span className="font-medium text-accent dark:text-emerald-200">
                  Phone Number:{' '}
                </span>
                {telHref ? (
                  <a href={`tel:${telHref}`} className="link-app">
                    {displayPhone}
                  </a>
                ) : (
                  <span className="text-prose">{displayPhone}</span>
                )}
              </p>
              <p>
                <span className="font-medium text-accent dark:text-emerald-200">
                  Location:{' '}
                </span>
                {process.env.REACT_APP_GOOGLE_MAPS_LINK ? (
                  <a
                    href={process.env.REACT_APP_GOOGLE_MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-app"
                  >
                    {process.env.REACT_APP_ADDRESS}
                  </a>
                ) : (
                  <span className="text-prose">
                    {process.env.REACT_APP_ADDRESS}
                  </span>
                )}
              </p>
            </div>
          </div>

          <p className="mt-5 border-t border-neutral-300/80 pt-5 text-center text-xs text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} Valmiki Ashram. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
