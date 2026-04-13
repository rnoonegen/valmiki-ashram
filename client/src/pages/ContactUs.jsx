import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import useLiveContent from '../hooks/useLiveContent';

function normalizePhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('91') ? `+${digits}` : `+91${digits}`;
}

function getDetailHref(detail) {
  const value = String(detail?.value || '').trim();
  if (!value) return '';
  if (detail?.type === 'email') return `mailto:${value}`;
  if (detail?.type === 'phone') {
    const normalized = normalizePhone(value);
    return normalized ? `tel:${normalized}` : '';
  }
  if (detail?.type === 'link') return value;
  return '';
}

const DETAIL_TYPES = [
  { value: 'text', label: 'Plain Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'link', label: 'Link' },
];

export default function ContactUs() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/contact';

  const email = process.env.REACT_APP_EMAIL || '';
  const phone = process.env.REACT_APP_PHONE || '';
  const address = process.env.REACT_APP_ADDRESS || '';
  const maps = process.env.REACT_APP_GOOGLE_MAPS_LINK || '';
  const embedFromEnv = process.env.REACT_APP_GOOGLE_MAPS_EMBED_URL?.trim() || '';

  const fallbackDetails = useMemo(
    () =>
      [
        email ? { id: 'email', label: 'Email', value: email, type: 'email' } : null,
        phone ? { id: 'phone', label: 'Phone', value: phone, type: 'phone' } : null,
        address ? { id: 'address', label: 'Address', value: address, type: maps ? 'link' : 'text' } : null,
      ].filter(Boolean),
    [address, email, maps, phone]
  );

  const fallbackContent = useMemo(
    () => ({
      details: fallbackDetails,
      mapLink: maps,
      mapEmbedUrl:
        embedFromEnv ||
        (address
          ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
          : ''),
    }),
    [address, embedFromEnv, fallbackDetails, maps]
  );

  const cms = useLiveContent('contact', fallbackContent);
  const [draft, setDraft] = useState(fallbackContent);
  const [detailEditor, setDetailEditor] = useState(null);
  const [mapEditor, setMapEditor] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const nextDetails =
      cms?.details?.length > 0
        ? cms.details
        : fallbackContent.details;

    setDraft({
      details: nextDetails,
      mapLink: cms?.mapLink ?? fallbackContent.mapLink,
      mapEmbedUrl: cms?.mapEmbedUrl ?? fallbackContent.mapEmbedUrl,
    });
  }, [cms, fallbackContent]);

  const display = isAdmin ? draft : {
    details: cms?.details?.length ? cms.details : fallbackContent.details,
    mapLink: cms?.mapLink ?? fallbackContent.mapLink,
    mapEmbedUrl: cms?.mapEmbedUrl ?? fallbackContent.mapEmbedUrl,
  };

  const save = async (nextDraft = draft) => {
    try {
      await adminRequest('/api/admin/content/contact', {
        method: 'PUT',
        body: JSON.stringify({ content: nextDraft }),
      });
      setStatus({ type: 'success', message: 'Contact page updated.' });
      return true;
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Save failed. Please login again.' });
      return false;
    }
  };

  const openDetailEditor = (index) => {
    const item = draft.details?.[index];
    const isNew = !item;
    setDetailEditor({
      index,
      isNew,
      id: item?.id || `contact-${Date.now()}`,
      label: item?.label || '',
      value: item?.value || '',
      type: item?.type || 'text',
    });
  };

  const saveDetailEditor = async () => {
    if (!detailEditor) return;
    if (!String(detailEditor.label || '').trim() || !String(detailEditor.value || '').trim()) {
      setStatus({ type: 'error', message: 'Label and value are required.' });
      return;
    }

    const nextItem = {
      id: detailEditor.id,
      label: detailEditor.label.trim(),
      value: detailEditor.value.trim(),
      type: detailEditor.type,
    };

    const prev = draft;
    let nextDetails = [...(draft.details || [])];
    if (detailEditor.isNew) {
      nextDetails = [nextItem, ...nextDetails];
    } else {
      nextDetails[detailEditor.index] = nextItem;
    }

    const nextDraft = { ...draft, details: nextDetails };
    setDraft(nextDraft);
    const ok = await save(nextDraft);
    if (ok) {
      setDetailEditor(null);
    } else {
      setDraft(prev);
    }
  };

  const deleteDetail = async (index) => {
    const nextDraft = {
      ...draft,
      details: (draft.details || []).filter((_, i) => i !== index),
    };
    setDraft(nextDraft);
    await save(nextDraft);
  };

  const openMapEditor = () => {
    setMapEditor({
      mapLink: draft.mapLink || '',
      mapEmbedUrl: draft.mapEmbedUrl || '',
    });
  };

  const saveMapEditor = async () => {
    if (!mapEditor) return;
    const nextDraft = {
      ...draft,
      mapLink: String(mapEditor.mapLink || '').trim(),
      mapEmbedUrl: String(mapEditor.mapEmbedUrl || '').trim(),
    };
    setDraft(nextDraft);
    const ok = await save(nextDraft);
    if (ok) setMapEditor(null);
  };

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="heading-page">Let&apos;s Connect</h1>
            <section className="mt-5 max-w-2xl">
              <p className="mt-4 text-base leading-relaxed text-prose md:text-lg">
                Reach out to us to know more about our camps, curriculum, or admissions
                process. Whether you&apos;re a parent, educator, or just someone exploring
                a different kind of learning, we&apos;re here.
              </p>
            </section>
          </div>
          {isAdmin ? (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-200 px-4 py-2 text-sm text-neutral-800 shadow-md dark:bg-neutral-700 dark:text-neutral-100"
                onClick={openMapEditor}
              >
                <Pencil className="h-4 w-4" /> Edit Map
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-white shadow-md dark:bg-emerald-700"
                onClick={() => openDetailEditor()}
              >
                <Plus className="h-4 w-4" /> Add Detail
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-10 space-y-3 text-prose">
          {(display.details || []).map((detail, index) => {
            const href = getDetailHref(detail);
            const valueText =
              detail.type === 'phone'
                ? normalizePhone(detail.value) || detail.value
                : detail.value;

            return (
              <div
                key={detail.id || `${detail.label}-${index}`}
                className={isAdmin ? 'flex items-start justify-between gap-2 rounded-lg border border-neutral-200 bg-white/70 p-3 dark:border-neutral-700 dark:bg-neutral-900/60' : ''}
              >
                <p>
                  <span className="font-medium text-accent dark:text-emerald-200">
                    {detail.label}:{' '}
                  </span>
                  {href ? (
                    <a
                      href={href}
                      className="link-app"
                      target={detail.type === 'link' ? '_blank' : undefined}
                      rel={detail.type === 'link' ? 'noopener noreferrer' : undefined}
                    >
                      {valueText}
                    </a>
                  ) : (
                    valueText
                  )}
                </p>
                {isAdmin ? (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                      onClick={() => openDetailEditor(index)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                      onClick={() => deleteDetail(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {display.mapEmbedUrl ? (
          <div className="mt-10">
            <h2 className="heading-card mb-4">Location</h2>
            <div className="map-frame">
              <div className="relative aspect-[16/10] w-full min-h-[280px] bg-neutral-200 dark:bg-neutral-800">
                <iframe
                  title="Valmiki Ashram on Google Maps"
                  src={display.mapEmbedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
            {display.mapLink ? (
              <p className="mt-3 text-sm text-prose-muted">
                <a href={display.mapLink} target="_blank" rel="noopener noreferrer" className="link-app">
                  Open in Google Maps
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
      </Container>

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

          {detailEditor ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
                  {detailEditor.isNew ? 'Add' : 'Edit'} Contact Detail
                </h3>
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Label
                  </label>
                  <input
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    placeholder="Label (e.g. Email, Phone, Address)"
                    value={detailEditor.label}
                    onChange={(e) => setDetailEditor((p) => ({ ...p, label: e.target.value }))}
                  />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Value
                  </label>
                  <input
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    placeholder="Value"
                    value={detailEditor.value}
                    onChange={(e) => setDetailEditor((p) => ({ ...p, value: e.target.value }))}
                  />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Type
                  </label>
                  <select
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={detailEditor.type}
                    onChange={(e) => setDetailEditor((p) => ({ ...p, type: e.target.value }))}
                  >
                    {DETAIL_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={saveDetailEditor}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailEditor(null)}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {mapEditor ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
                  Edit Map Settings
                </h3>
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Google Maps Page Link
                  </label>
                  <input
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    placeholder="Google Maps page link (optional)"
                    value={mapEditor.mapLink}
                    onChange={(e) => setMapEditor((p) => ({ ...p, mapLink: e.target.value }))}
                  />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Google Maps Embed URL
                  </label>
                  <textarea
                    className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    placeholder="Google Maps embed URL"
                    value={mapEditor.mapEmbedUrl}
                    onChange={(e) => setMapEditor((p) => ({ ...p, mapEmbedUrl: e.target.value }))}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={saveMapEditor}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapEditor(null)}
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
    </PageFade>
  );
}
