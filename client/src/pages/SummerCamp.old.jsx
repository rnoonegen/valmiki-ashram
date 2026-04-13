import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import Container from '../components/Container';
import ImageUploader from '../components/admin/ImageUploader';
import PageFade from '../components/PageFade';
import useLiveContent from '../hooks/useLiveContent';

const fallbackContent = {
  title: 'Summer Camp',
  subtitle: 'Outdoor learning, skills, and community during the summer season.',
  intro:
    'Our summer camp blends traditional Bharatiya values with hands-on activities, nature, and creative expression.',
  infoCards: [
    { title: 'Camp Duration', body: 'Weekly batches with optional residential stay.' },
    { title: 'Age Group', body: 'Designed for children between 5 and 15 years.' },
    { title: 'Core Focus', body: 'Discipline, fitness, culture, storytelling, and practical learning.' },
  ],
  previousGalleries: [
    {
      id: 'gallery-1',
      title: 'Summer Camp 2025',
      description: 'Snapshots from yoga sessions, nature walks, and teamwork activities.',
      longDescription: '',
      contentBlocks: [],
      images: [],
    },
  ],
};

export default function SummerCamp() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/summer-camp';
  const cms = useLiveContent('summer-camp', fallbackContent);
  const registrationCms = useLiveContent('summer-camp-registration', { registrationCamps: [] });
  const registrationCamps = Array.isArray(registrationCms?.registrationCamps)
    ? registrationCms.registrationCamps
    : [];
  const display = useMemo(
    () => ({
      ...fallbackContent,
      ...(cms || {}),
      infoCards: Array.isArray(cms?.infoCards) ? cms.infoCards : fallbackContent.infoCards,
      previousGalleries: Array.isArray(cms?.previousGalleries)
        ? cms.previousGalleries
        : fallbackContent.previousGalleries,
    }),
    [cms]
  );
  const [draft, setDraft] = useState(display);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [textEditor, setTextEditor] = useState(null);
  const [infoEditor, setInfoEditor] = useState(null);
  const [galleryEditor, setGalleryEditor] = useState(null);
  const usedRegistrationCampIds = useMemo(
    () =>
      new Set(
        (draft.previousGalleries || [])
          .map((gallery) => gallery.registrationCampId)
          .filter(Boolean)
      ),
    [draft.previousGalleries]
  );

  useEffect(() => setDraft(display), [display]);

  const save = async (next = draft) => {
    try {
      await adminRequest('/api/admin/content/summer-camp', {
        method: 'PUT',
        body: JSON.stringify({ content: next }),
      });
      setStatus({ type: 'success', message: 'Summer Camp content updated.' });
      return true;
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Save failed.' });
      return false;
    }
  };

  const openTextEditor = (key, label) => setTextEditor({ key, label, value: draft[key] || '' });
  const saveTextEditor = async () => {
    if (!textEditor) return;
    const next = { ...draft, [textEditor.key]: textEditor.value };
    setDraft(next);
    const ok = await save(next);
    if (ok) setTextEditor(null);
  };

  const openInfoEditor = (index) => {
    const item = draft.infoCards?.[index];
    setInfoEditor({
      index,
      isNew: !item,
      title: item?.title || '',
      body: item?.body || '',
    });
  };
  const saveInfoEditor = async () => {
    if (!infoEditor) return;
    if (!String(infoEditor.title || '').trim() || !String(infoEditor.body || '').trim()) {
      setStatus({ type: 'error', message: 'Info title and description are required.' });
      return;
    }
    const cards = [...(draft.infoCards || [])];
    const item = { title: infoEditor.title.trim(), body: infoEditor.body.trim() };
    if (infoEditor.isNew) cards.unshift(item);
    else cards[infoEditor.index] = item;
    const next = { ...draft, infoCards: cards };
    setDraft(next);
    const ok = await save(next);
    if (ok) setInfoEditor(null);
  };
  const deleteInfo = async (index) => {
    const next = { ...draft, infoCards: draft.infoCards.filter((_, i) => i !== index) };
    setDraft(next);
    await save(next);
  };

  const openGalleryEditor = (index) => {
    const item = draft.previousGalleries?.[index];
    setGalleryEditor({
      index,
      isNew: !item,
      id: item?.id || `gallery-${Date.now()}`,
      registrationCampId: item?.registrationCampId || '',
      registrationCampYear:
        item?.registrationCampYear ||
        registrationCamps.find((camp) => camp.id === item?.registrationCampId)?.year ||
        '',
      title: item?.title || '',
      description: item?.description || '',
      longDescription: item?.longDescription || '',
      contentBlocksText: Array.isArray(item?.contentBlocks) ? item.contentBlocks.join('\n') : '',
      images: Array.isArray(item?.images) ? item.images : [],
    });
  };
  const saveGalleryEditor = async () => {
    if (!galleryEditor) return;
    if (galleryEditor.isNew && !galleryEditor.registrationCampId) {
      setStatus({ type: 'error', message: 'Please select a summer camp.' });
      return;
    }
    if (!String(galleryEditor.title || '').trim()) {
      setStatus({ type: 'error', message: 'Gallery title is required.' });
      return;
    }
    const galleries = [...(draft.previousGalleries || [])];
    const item = {
      id: galleryEditor.id,
      registrationCampId: galleryEditor.registrationCampId || '',
      registrationCampYear:
        galleryEditor.registrationCampYear ||
        registrationCamps.find((camp) => camp.id === galleryEditor.registrationCampId)?.year ||
        '',
      title: galleryEditor.title.trim(),
      description: galleryEditor.description.trim(),
      longDescription: String(galleryEditor.longDescription || '').trim(),
      contentBlocks: String(galleryEditor.contentBlocksText || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
      images: galleryEditor.images || [],
    };
    if (galleryEditor.isNew) galleries.unshift(item);
    else galleries[galleryEditor.index] = item;
    const next = { ...draft, previousGalleries: galleries };
    setDraft(next);
    const ok = await save(next);
    if (ok) setGalleryEditor(null);
  };
  const deleteGallery = async (index) => {
    const next = { ...draft, previousGalleries: draft.previousGalleries.filter((_, i) => i !== index) };
    setDraft(next);
    await save(next);
  };

  const page = isAdmin ? draft : display;

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <div className="flex items-start justify-between gap-3">
          <h1 className="heading-page">{page.title}</h1>
          {isAdmin ? (
            <button type="button" onClick={() => openTextEditor('title', 'Page Title')} className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-3 py-1.5 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"><Pencil className="h-4 w-4" /> Edit</button>
          ) : null}
        </div>
        <p className="mt-4 max-w-3xl text-prose">{page.subtitle}</p>
        {isAdmin ? <div className="mt-2"><button type="button" onClick={() => openTextEditor('subtitle', 'Subtitle')} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs text-accent dark:bg-neutral-800 dark:text-emerald-200"><Pencil className="h-3.5 w-3.5" /> Edit Subtitle</button></div> : null}

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-start justify-between gap-3">
            <h2 className="heading-section">About The Camp</h2>
            {isAdmin ? <button type="button" onClick={() => openTextEditor('intro', 'Intro')} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs text-accent dark:bg-neutral-800 dark:text-emerald-200"><Pencil className="h-3.5 w-3.5" /> Edit</button> : null}
          </div>
          <p className="mt-3 text-prose">{page.intro}</p>
        </div>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="heading-section">Camp Info</h2>
            {isAdmin ? (
              <button type="button" onClick={() => openInfoEditor()} className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"><Plus className="h-4 w-4" /> Add Info</button>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {(page.infoCards || []).map((item, index) => (
              <article key={`${item.title}-${index}`} className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-accent dark:text-emerald-200">{item.title}</h3>
                  {isAdmin ? (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openInfoEditor(index)} className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => deleteInfo(index)} className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ) : null}
                </div>
                <p className="mt-2 text-prose">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="heading-section">Previous Summer Camp Galleries</h2>
            {isAdmin ? (
              <button type="button" onClick={() => openGalleryEditor()} className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"><Plus className="h-4 w-4" /> Add Gallery</button>
            ) : null}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {(page.previousGalleries || []).map((gallery, index) => {
              const detailPath = isAdmin
                ? `/admin/summer-camp/${gallery.id}`
                : `/summer-camp/${gallery.id}`;
              const cover = gallery.images?.[0] || '';
              const stack = (gallery.images || []).slice(1, 3);
              return (
                <article key={gallery.id || index} className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={detailPath} className="min-w-0 flex-1">
                      <h3 className="font-semibold text-accent dark:text-emerald-200">{gallery.title}</h3>
                      <p className="mt-1 text-xs text-prose-muted">
                        Summer:{' '}
                        {gallery.registrationCampYear ||
                          registrationCamps.find((camp) => camp.id === gallery.registrationCampId)?.year ||
                          '-'}
                      </p>
                      <p className="mt-1 text-sm text-prose-muted">{gallery.description}</p>
                    </Link>
                    {isAdmin ? (
                      <div className="flex gap-1">
                        <button type="button" onClick={() => openGalleryEditor(index)} className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"><Pencil className="h-4 w-4" /></button>
                        <button type="button" onClick={() => deleteGallery(index)} className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ) : null}
                  </div>
                  <Link to={detailPath} className="mt-3 block">
                    <div className="relative h-48 rounded-xl bg-neutral-100 p-2 dark:bg-neutral-800">
                      {stack.map((img, i) => (
                        <img
                          key={`${img}-${i}`}
                          src={img}
                          alt={`${gallery.title} stacked ${i + 1}`}
                          className="absolute h-[calc(100%-16px)] w-[calc(100%-16px)] rounded-lg object-cover opacity-60"
                          style={{ top: 8 + (i + 1) * 6, left: 8 + (i + 1) * 6, zIndex: 10 + i }}
                        />
                      ))}
                      {cover ? (
                        <img
                          src={cover}
                          alt={gallery.title}
                          className="relative z-30 h-full w-full rounded-lg object-contain bg-white dark:bg-neutral-900"
                        />
                      ) : (
                        <div className="relative z-30 flex h-full w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 text-sm text-prose-muted dark:border-neutral-600">
                          No cover image
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {status.message ? (
          <div className={`fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-lg px-3 py-2 text-sm shadow-lg ${status.type === 'error' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
            {status.message}
          </div>
        ) : null}
      </Container>

      {textEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">Edit {textEditor.label}</h3>
            <label className="mt-4 block text-sm font-medium text-neutral-700 dark:text-neutral-200">{textEditor.label}</label>
            <textarea className="mt-2 h-28 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={textEditor.value} onChange={(e) => setTextEditor((p) => ({ ...p, value: e.target.value }))} />
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={saveTextEditor} className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"><Save className="h-4 w-4" /> Save</button>
              <button type="button" onClick={() => setTextEditor(null)} className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"><X className="h-4 w-4" /> Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {infoEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">{infoEditor.isNew ? 'Add' : 'Edit'} Info Card</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">Title<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={infoEditor.title} onChange={(e) => setInfoEditor((p) => ({ ...p, title: e.target.value }))} /></label>
              <label className="block text-sm">Description<textarea className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={infoEditor.body} onChange={(e) => setInfoEditor((p) => ({ ...p, body: e.target.value }))} /></label>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={saveInfoEditor} className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"><Save className="h-4 w-4" /> Save</button>
              <button type="button" onClick={() => setInfoEditor(null)} className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"><X className="h-4 w-4" /> Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {galleryEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">{galleryEditor.isNew ? 'Add' : 'Edit'} Gallery</h3>
            <div className="mt-4 space-y-3">
              {galleryEditor.isNew ? (
                <label className="block text-sm">
                  Select Summer Camp
                  <select
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                    value={galleryEditor.registrationCampId}
                    onChange={(e) => {
                      const selectedCampId = e.target.value;
                      const selectedCamp = registrationCamps.find((camp) => camp.id === selectedCampId);
                      setGalleryEditor((p) => ({
                        ...p,
                        registrationCampId: selectedCampId,
                        registrationCampYear: selectedCamp?.year || '',
                        id: selectedCampId ? `gallery-${selectedCampId}` : p.id,
                        title: selectedCamp?.title || p.title,
                        description: selectedCamp?.subtitle || p.description,
                      }));
                    }}
                  >
                    <option value="">Choose summer camp</option>
                    {registrationCamps.map((camp) => {
                      const alreadyUsed = usedRegistrationCampIds.has(camp.id);
                      return (
                        <option key={camp.id} value={camp.id} disabled={alreadyUsed}>
                          {camp.title} {camp.year ? `(${camp.year})` : ''}{alreadyUsed ? ' - already added' : ''}
                        </option>
                      );
                    })}
                  </select>
                </label>
              ) : null}
              <label className="block text-sm">Title<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={galleryEditor.title} onChange={(e) => setGalleryEditor((p) => ({ ...p, title: e.target.value }))} /></label>
              <label className="block text-sm">Description<textarea className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={galleryEditor.description} onChange={(e) => setGalleryEditor((p) => ({ ...p, description: e.target.value }))} /></label>
              <label className="block text-sm">Detailed Intro<textarea className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={galleryEditor.longDescription} onChange={(e) => setGalleryEditor((p) => ({ ...p, longDescription: e.target.value }))} /></label>
              <label className="block text-sm">Content Points (one per line)<textarea className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={galleryEditor.contentBlocksText} onChange={(e) => setGalleryEditor((p) => ({ ...p, contentBlocksText: e.target.value }))} /></label>
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">Gallery Images</p>
                <ImageUploader
                  folder="summer-camp"
                  buttonText="Add Images"
                  multiple
                  onUploaded={(asset) =>
                    setGalleryEditor((p) => ({ ...p, images: [...(p.images || []), asset.url] }))
                  }
                />
                {(galleryEditor.images || []).length ? (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {galleryEditor.images.map((img, i) => (
                      <div key={`${img}-${i}`} className="relative shrink-0">
                        <img src={img} alt="Gallery preview" className="h-20 w-36 rounded-lg object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryEditor((p) => ({
                              ...p,
                              images: p.images.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="absolute right-1 top-1 rounded bg-black/60 px-1 text-xs text-white"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={saveGalleryEditor} className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"><Save className="h-4 w-4" /> Save</button>
              <button type="button" onClick={() => setGalleryEditor(null)} className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"><X className="h-4 w-4" /> Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </PageFade>
  );
}