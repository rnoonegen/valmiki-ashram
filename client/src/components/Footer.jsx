import clsx from 'clsx';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import useLiveContent from '../hooks/useLiveContent';
import Container from './Container';
import LotusMark from './LotusMark';

const iconMap = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  x: FaXTwitter,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
};

const iconOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'x', label: 'X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
];

const defaultSocialLinks = [
  { id: 'instagram', href: process.env.REACT_APP_INSTAGRAM_LINK || '', label: 'Instagram', icon: 'instagram' },
  { id: 'facebook', href: process.env.REACT_APP_FACEBOOK_LINK || '', label: 'Facebook', icon: 'facebook' },
  { id: 'x', href: process.env.REACT_APP_X_LINK || '', label: 'X', icon: 'x' },
  { id: 'linkedin', href: process.env.REACT_APP_LINKEDIN_LINK || '', label: 'LinkedIn', icon: 'linkedin' },
  { id: 'youtube', href: process.env.REACT_APP_YOUTUBE_LINK || '', label: 'YouTube', icon: 'youtube' },
].filter((item) => item.href);

const defaultNavLinks = [
  { id: 'faq', label: 'FAQ', href: '/faq', external: false },
  { id: 'terms', label: 'Terms', href: '/terms', external: false },
];

const linkClass =
  'w-fit text-accent underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent-light dark:text-emerald-200 dark:decoration-emerald-500/40 dark:hover:text-emerald-100';

function normalizePhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('91') ? `+${digits}` : `+91${digits}`;
}

function findDetail(details, label) {
  const key = String(label || '').trim().toLowerCase();
  return details.find((item) => String(item?.label || '').trim().toLowerCase() === key)?.value || '';
}

export default function Footer({ className }) {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  const siteContent = useLiveContent('site', {});
  const footerContent = useLiveContent('footer', {});
  const contactContent = useLiveContent('contact', {});

  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState({
    tagline: '',
    communityLink: '',
    socialLinks: [],
    navLinks: [],
  });
  const [itemEditor, setItemEditor] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    setDraft({
      tagline:
        footerContent?.tagline ||
        'Reconnect with Bharat through Samskrutham, Soil, and Stories.',
      communityLink:
        footerContent?.communityLink || process.env.REACT_APP_WHATSAPP_COMMUNITY_LINK || '',
      socialLinks:
        Array.isArray(footerContent?.socialLinks) && footerContent.socialLinks.length
          ? footerContent.socialLinks
          : defaultSocialLinks,
      navLinks:
        Array.isArray(footerContent?.navLinks) && footerContent.navLinks.length
          ? footerContent.navLinks
          : defaultNavLinks,
    });
  }, [footerContent]);

  const logoUrl = siteContent.logoUrl || '';
  const details = Array.isArray(contactContent?.details) ? contactContent.details : [];
  const email = String(findDetail(details, 'email') || process.env.REACT_APP_EMAIL || '').trim();
  const phone = String(findDetail(details, 'phone') || process.env.REACT_APP_PHONE || '').trim();
  const address = String(findDetail(details, 'address') || process.env.REACT_APP_ADDRESS || '').trim();
  const mapsLink = String(contactContent?.mapLink || process.env.REACT_APP_GOOGLE_MAPS_LINK || '').trim();

  const normalizedPhone = normalizePhone(phone);
  const telHref = normalizedPhone ? `tel:${normalizedPhone}` : '';
  const displayPhone = phone.startsWith('+')
    ? phone
    : normalizedPhone
      ? `+91 ${phone}`
      : '';

  const saveFooter = async (nextDraft = draft) => {
    try {
      await adminRequest('/api/admin/content/footer', {
        method: 'PUT',
        body: JSON.stringify({ content: nextDraft }),
      });
      setStatus({ type: 'success', message: 'Footer updated.' });
      return true;
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Save failed. Please login again.' });
      return false;
    }
  };

  const openEditor = () => {
    setEditor({
      tagline: draft.tagline,
      communityLink: draft.communityLink,
    });
  };

  const saveMeta = async () => {
    if (!editor) return;
    const nextDraft = {
      ...draft,
      tagline: String(editor.tagline || '').trim(),
      communityLink: String(editor.communityLink || '').trim(),
    };
    setDraft(nextDraft);
    const ok = await saveFooter(nextDraft);
    if (ok) setEditor(null);
  };

  const openItemEditor = (type, index) => {
    const list = type === 'social' ? draft.socialLinks : draft.navLinks;
    const item = list?.[index];
    const isNew = !item;
    setItemEditor(
      type === 'social'
        ? {
            type,
            index,
            isNew,
            id: item?.id || `social-${Date.now()}`,
            label: item?.label || '',
            href: item?.href || '',
            icon: item?.icon || 'instagram',
          }
        : {
            type,
            index,
            isNew,
            id: item?.id || `nav-${Date.now()}`,
            label: item?.label || '',
            href: item?.href || '',
            external: !!item?.external,
          }
    );
  };

  const saveItem = async () => {
    if (!itemEditor) return;
    if (!String(itemEditor.label || '').trim() || !String(itemEditor.href || '').trim()) {
      setStatus({ type: 'error', message: 'Label and link are required.' });
      return;
    }

    const key = itemEditor.type === 'social' ? 'socialLinks' : 'navLinks';
    const prev = draft;
    const list = [...(draft[key] || [])];
    const nextItem =
      itemEditor.type === 'social'
        ? {
            id: itemEditor.id,
            label: itemEditor.label.trim(),
            href: itemEditor.href.trim(),
            icon: itemEditor.icon,
          }
        : {
            id: itemEditor.id,
            label: itemEditor.label.trim(),
            href: itemEditor.href.trim(),
            external: !!itemEditor.external,
          };

    if (itemEditor.isNew) {
      list.push(nextItem);
    } else {
      list[itemEditor.index] = nextItem;
    }

    const nextDraft = { ...draft, [key]: list };
    setDraft(nextDraft);
    const ok = await saveFooter(nextDraft);
    if (ok) {
      setItemEditor(null);
    } else {
      setDraft(prev);
    }
  };

  const deleteItem = async (type, index) => {
    const key = type === 'social' ? 'socialLinks' : 'navLinks';
    const nextDraft = {
      ...draft,
      [key]: (draft[key] || []).filter((_, i) => i !== index),
    };
    setDraft(nextDraft);
    await saveFooter(nextDraft);
  };

  return (
    <footer
      className={clsx(
        'mt-auto border-t border-neutral-200/80 dark:border-neutral-800',
        className
      )}
    >
      <div className="border-b border-neutral-200/80 bg-[#e2e8e1] pt-10 pb-5 dark:border-neutral-700 dark:bg-neutral-900">
        <Container>
          {isAdmin ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={openEditor}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-white shadow-md dark:bg-emerald-700"
              >
                <Pencil className="h-4 w-4" /> Edit Footer
              </button>
            </div>
          ) : null}

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
                {draft.tagline}
              </p>
              <div className="flex flex-wrap gap-2">
                {(draft.socialLinks || []).map((item, index) => {
                  const Icon = iconMap[item.icon] || FaInstagram;
                  return item.href ? (
                    <div key={item.id || index} className="flex items-center gap-1">
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-sm ring-1 ring-black/10 transition-transform hover:scale-105 hover:bg-neutral-900 dark:bg-emerald-950 dark:text-emerald-100 dark:ring-emerald-500/40 dark:hover:bg-emerald-900 dark:hover:ring-emerald-400/50"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                      {isAdmin ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openItemEditor('social', index)}
                            className="rounded-md bg-neutral-100 p-1 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem('social', index)}
                            className="rounded-md bg-rose-100 p-1 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null;
                })}
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => openItemEditor('social')}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-200 px-3 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {(draft.navLinks || []).map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-2">
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  )}
                  {isAdmin ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openItemEditor('nav', index)}
                        className="rounded-md bg-neutral-100 p-1 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem('nav', index)}
                        className="rounded-md bg-rose-100 p-1 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
              {draft.communityLink ? (
                <a
                  href={draft.communityLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Join the WhatsApp Community
                </a>
              ) : null}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => openItemEditor('nav')}
                  className="inline-flex w-fit items-center gap-1 rounded-full bg-neutral-200 px-3 py-1.5 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                >
                  <Plus className="h-4 w-4" /> Add Link
                </button>
              ) : null}
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
                  <a href={telHref} className="link-app">
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
                {mapsLink ? (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-app"
                  >
                    {address}
                  </a>
                ) : (
                  <span className="text-prose">{address}</span>
                )}
              </p>
            </div>
          </div>

          <p className="mt-5 border-t border-neutral-300/80 pt-5 text-center text-xs text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} Valmiki Ashram. All rights reserved.
          </p>
        </Container>
      </div>

      {isAdmin ? (
        <>
          {status.message ? (
            <div
              className={`fixed left-1/2 top-24 z-50 max-w-[min(92vw,28rem)] -translate-x-1/2 rounded-lg px-3 py-2 text-center text-sm shadow-lg ${
                status.type === 'error'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              }`}
            >
              {status.message}
            </div>
          ) : null}

          {editor ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
                  Edit Footer Content
                </h3>
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Footer Tagline
                  </label>
                  <textarea
                    className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-400"
                    placeholder="Footer tagline"
                    value={editor.tagline}
                    onChange={(e) => setEditor((p) => ({ ...p, tagline: e.target.value }))}
                  />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    WhatsApp Community Link
                  </label>
                  <input
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-400"
                    placeholder="WhatsApp community link"
                    value={editor.communityLink}
                    onChange={(e) => setEditor((p) => ({ ...p, communityLink: e.target.value }))}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={saveMeta}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditor(null)}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {itemEditor ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
                  {itemEditor.isNew ? 'Add' : 'Edit'}{' '}
                  {itemEditor.type === 'social' ? 'Social Link' : 'Footer Link'}
                </h3>
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Label
                  </label>
                  <input
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-400"
                    placeholder="Label"
                    value={itemEditor.label}
                    onChange={(e) => setItemEditor((p) => ({ ...p, label: e.target.value }))}
                  />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {itemEditor.type === 'social' ? 'Social URL' : 'Path or URL'}
                  </label>
                  <input
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-400"
                    placeholder={itemEditor.type === 'social' ? 'Social URL' : 'Path or URL'}
                    value={itemEditor.href}
                    onChange={(e) => setItemEditor((p) => ({ ...p, href: e.target.value }))}
                  />
                  {itemEditor.type === 'social' ? (
                    <>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        Icon
                      </label>
                      <select
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-400"
                        value={itemEditor.icon}
                        onChange={(e) => setItemEditor((p) => ({ ...p, icon: e.target.value }))}
                      >
                        {iconOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                      <input
                        type="checkbox"
                        checked={itemEditor.external}
                        onChange={(e) => setItemEditor((p) => ({ ...p, external: e.target.checked }))}
                      />
                      External link
                    </label>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={saveItem}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemEditor(null)}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </footer>
  );
}
