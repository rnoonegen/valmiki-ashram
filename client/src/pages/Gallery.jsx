import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import ImageUploader from '../components/admin/ImageUploader';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import useLiveGallery from '../hooks/useLiveGallery';

export default function Gallery() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/gallery';
  const items = useLiveGallery();
  const [previewIndex, setPreviewIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPreviewIndex(null);
        setIsPlaying(false);
      } else if (event.key === 'ArrowLeft' && previewIndex !== null) {
        setPreviewIndex((idx) => (idx - 1 + items.length) % items.length);
      } else if (event.key === 'ArrowRight' && previewIndex !== null) {
        setPreviewIndex((idx) => (idx + 1) % items.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewIndex, items.length]);

  useEffect(() => {
    if (!isPlaying || previewIndex === null || items.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setPreviewIndex((idx) => (idx + 1) % items.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [isPlaying, previewIndex, items.length]);

  const removeImage = async (id) => {
    await adminRequest(`/api/admin/media/${id}`, { method: 'DELETE' });
  };

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Gallery</h1>
        <p className="mt-4 text-prose">
          Moments from programs, campus life, and celebrations.
        </p>
        {isAdmin ? (
          <div className="mt-4">
            <ImageUploader folder="gallery" buttonText="Upload New Gallery Image" />
          </div>
        ) : null}
        {items.length > 1 ? (
          <div className="mt-4">
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
          </div>
        ) : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.length > 0
            ? items.map((item, index) => (
                <div key={item._id} className="group relative">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewIndex(index);
                      setIsPlaying(false);
                    }}
                    className="w-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-emerald-400"
                    aria-label={`Preview ${item.originalName || 'gallery image'}`}
                  >
                    <img
                      src={item.url}
                      alt={item.originalName || 'Gallery item'}
                      className="aspect-[4/3] w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </button>
                  {isAdmin ? (
                    <div className="absolute inset-x-2 top-2 z-10 flex justify-end">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeImage(item._id);
                        }}
                        className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            : [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-xl bg-primary/50 dark:bg-neutral-800"
                />
              ))}
        </div>
      </Container>
      {previewIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
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
              className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black/85"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>
            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-2 text-sm text-white hover:bg-black/85"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            ) : null}
            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => setPreviewIndex((idx) => (idx - 1 + items.length) % items.length)}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black/85"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}
            <img
              src={items[previewIndex]?.url}
              alt={items[previewIndex]?.originalName || 'Gallery preview'}
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />
            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => setPreviewIndex((idx) => (idx + 1) % items.length)}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black/85"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : null}
            <div className="mt-3 text-center text-sm text-white/90">
              {previewIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      ) : null}
    </PageFade>
  );
}
