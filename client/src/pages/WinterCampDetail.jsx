import { ChevronLeft, ChevronRight, Pause, Pencil, Play, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import Container from '../components/Container';
import ImageUploader from '../components/admin/ImageUploader';
import PageFade from '../components/PageFade';
import useLiveContent from '../hooks/useLiveContent';

const fallbackContent = {
  previousGalleries: [],
};

export default function WinterCampDetail() {
  const { galleryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin/');
  const cms = useLiveContent('winter-camp', fallbackContent);
  const registrationCms = useLiveContent('winter-camp-registration', { registrationCamps: [] });
  const registrationCamps = Array.isArray(registrationCms?.registrationCamps)
    ? registrationCms.registrationCamps
    : [];
  const galleries = Array.isArray(cms?.previousGalleries) ? cms.previousGalleries : [];
  const galleryIndex = galleries.findIndex((g) => String(g?.id) === String(galleryId));
  const gallery = galleryIndex >= 0 ? galleries[galleryIndex] : null;
  const galleryYear =
    gallery?.registrationCampYear ||
    registrationCamps.find((camp) => camp.id === gallery?.registrationCampId)?.year ||
    '';

  const [status, setStatus] = useState({ type: '', message: '' });
  const [metaEditor, setMetaEditor] = useState(null);
  const [blockEditor, setBlockEditor] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const backPath = isAdmin ? '/admin/winter-camp' : '/winter-camp';

  const saveGallery = async (nextGallery) => {
    if (!gallery) return;
    const nextGalleries = [...galleries];
    nextGalleries[galleryIndex] = nextGallery;
    try {
      await adminRequest('/api/admin/content/winter-camp', {
        method: 'PUT',
        body: JSON.stringify({ content: { ...cms, previousGalleries: nextGalleries } }),
      });
      setStatus({ type: 'success', message: 'Winter camp details updated.' });
      return true;
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to save changes.' });
      return false;
    }
  };

  const contentBlocks = useMemo(
    () => (Array.isArray(gallery?.contentBlocks) ? gallery.contentBlocks : []),
    [gallery]
  );
  const images = Array.isArray(gallery?.images) ? gallery.images : [];

  const showPrev = () => {
    if (!images.length) return;
    setPreviewIndex((idx) => (idx === null ? 0 : (idx - 1 + images.length) % images.length));
  };
  const showNext = () => {
    if (!images.length) return;
    setPreviewIndex((idx) => (idx === null ? 0 : (idx + 1) % images.length));
  };

  useEffect(() => {
    if (!isPlaying || previewIndex === null || images.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setPreviewIndex((idx) => ((idx + 1) % images.length));
    }, 2500);
    return () => window.clearInterval(timer);
  }, [isPlaying, previewIndex, images.length]);

  if (!gallery) {
    return (
      <PageFade>
        <Container className="py-12 md:py-16">
          <h1 className="heading-page">Camp Not Found</h1>
          <p className="mt-3 text-prose">The selected winter camp folder does not exist.</p>
          <Link to={backPath} className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700">
            Back to Winter Camp
          </Link>
        </Container>
      </PageFade>
    );
  }

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="rounded-lg bg-neutral-200 px-3 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
          >
            Back
          </button>
          {isAdmin ? (
            <button
              type="button"
              onClick={() =>
                setMetaEditor({
                  title: gallery.title || '',
                  description: gallery.description || '',
                  longDescription: gallery.longDescription || '',
                  images: Array.isArray(gallery.images) ? gallery.images : [],
                })
              }
              className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
            >
              <Pencil className="h-4 w-4" /> Edit Details
            </button>
          ) : null}
        </div>

        <h1 className="heading-page">{gallery.title}</h1>
        <p className="mt-2 text-sm text-prose-muted">Winter: {galleryYear || '-'}</p>
        <p className="mt-3 max-w-4xl text-prose">{gallery.description}</p>
        {gallery.longDescription ? <p className="mt-3 max-w-4xl text-prose">{gallery.longDescription}</p> : null}

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="heading-section">Camp Gallery</h2>
            {(images || []).length > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setPreviewIndex(0);
                  setIsPlaying(true);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Play className="h-4 w-4" /> Play Gallery
              </button>
            ) : null}
          </div>
          {images.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, i) => (
                <button
                  type="button"
                  key={`${img}-${i}`}
                  onClick={() => {
                    setPreviewIndex(i);
                    setIsPlaying(false);
                  }}
                  className="flex h-56 w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 p-2 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <img
                    src={img}
                    alt={`${gallery.title} ${i + 1}`}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-300 p-5 text-sm text-prose-muted dark:border-neutral-700">
              No images added yet.
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="heading-section">About This Winter Camp</h2>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setBlockEditor({ index: -1, isNew: true, value: '' })}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Content
              </button>
            ) : null}
          </div>
          <div className="space-y-3">
            {contentBlocks.map((block, index) => (
              <article key={`${block}-${index}`} className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-prose">{block}</p>
                  {isAdmin ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setBlockEditor({ index, isNew: false, value: block })}
                        className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const next = {
                            ...gallery,
                            contentBlocks: contentBlocks.filter((_, i) => i !== index),
                          };
                          await saveGallery(next);
                        }}
                        className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
            {!contentBlocks.length ? (
              <p className="text-sm text-prose-muted">No additional content blocks yet.</p>
            ) : null}
          </div>
        </section>

        {status.message ? (
          <div className={`fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-lg px-3 py-2 text-sm shadow-lg ${status.type === 'error' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
            {status.message}
          </div>
        ) : null}
      </Container>

      {metaEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">Edit Winter Camp Details</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">Title
                <input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={metaEditor.title} onChange={(e) => setMetaEditor((p) => ({ ...p, title: e.target.value }))} />
              </label>
              <label className="block text-sm">Description
                <textarea className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={metaEditor.description} onChange={(e) => setMetaEditor((p) => ({ ...p, description: e.target.value }))} />
              </label>
              <label className="block text-sm">Detailed Intro
                <textarea className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={metaEditor.longDescription} onChange={(e) => setMetaEditor((p) => ({ ...p, longDescription: e.target.value }))} />
              </label>
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">Images</p>
                <ImageUploader
                  folder="winter-camp"
                  buttonText="Add Image"
                  onUploaded={(asset) => setMetaEditor((p) => ({ ...p, images: [...(p.images || []), asset.url] }))}
                />
                {(metaEditor.images || []).length ? (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {metaEditor.images.map((img, idx) => (
                      <div key={`${img}-${idx}`} className="relative shrink-0">
                        <img src={img} alt="camp preview" className="h-20 w-36 rounded-lg object-cover" />
                        <button
                          type="button"
                          onClick={() => setMetaEditor((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
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
              <button
                type="button"
                onClick={async () => {
                  const ok = await saveGallery({ ...gallery, ...metaEditor });
                  if (ok) setMetaEditor(null);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setMetaEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {blockEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {blockEditor.isNew ? 'Add Content Block' : 'Edit Content Block'}
            </h3>
            <label className="mt-4 block text-sm">Content
              <textarea className="mt-1 h-28 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={blockEditor.value} onChange={(e) => setBlockEditor((p) => ({ ...p, value: e.target.value }))} />
            </label>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  const text = String(blockEditor.value || '').trim();
                  if (!text) return;
                  const nextBlocks = [...contentBlocks];
                  if (blockEditor.isNew) nextBlocks.unshift(text);
                  else nextBlocks[blockEditor.index] = text;
                  const ok = await saveGallery({ ...gallery, contentBlocks: nextBlocks });
                  if (ok) setBlockEditor(null);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setBlockEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => {
            setPreviewIndex(null);
            setIsPlaying(false);
          }}
          role="presentation"
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              onClick={() => {
                setPreviewIndex(null);
                setIsPlaying(false);
              }}
              className="absolute right-2 top-2 z-20 rounded-full bg-black/70 p-2 text-white hover:bg-black/85"
              aria-label="Close gallery preview"
            >
              <X className="h-5 w-5" />
            </button>
            {images.length > 1 ? (
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="absolute left-2 top-2 z-20 inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-2 text-sm text-white hover:bg-black/85"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            ) : null}
            {images.length > 1 ? (
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black/85"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}
            <img
              src={images[previewIndex]}
              alt={`${gallery.title} preview ${previewIndex + 1}`}
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />
            {images.length > 1 ? (
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black/85"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : null}
            <div className="mt-3 text-center text-sm text-white/90">
              {previewIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      ) : null}
    </PageFade>
  );
}
