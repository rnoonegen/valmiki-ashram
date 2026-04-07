import clsx from 'clsx';

/**
 * Lightweight embed player (iframe-based).
 */
export default function VideoPlayer({ url, className, title }) {
  if (!url || !String(url).trim()) {
    return (
      <div
        className={clsx(
          'flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-secondary/60 text-prose-muted dark:border-neutral-600 dark:bg-neutral-900',
          className
        )}
      >
        <p className="px-4 text-center text-sm">
          Add REACT_APP_INTRO_VIDEO_URL to show the video.
        </p>
      </div>
    );
  }

  const src = getEmbedUrl(String(url).trim());

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-2xl border border-neutral-200 shadow-nav ring-1 ring-black/5 dark:border-neutral-700 dark:shadow-nav-dark dark:ring-white/10',
        className
      )}
    >
      {title && <span className="sr-only">{title}</span>}
      <div className="relative aspect-video w-full bg-black">
        <iframe
          title={title || 'Embedded video player'}
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function getEmbedUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }

    if (host.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return rawUrl;
      const fromWatch = parsed.searchParams.get('v');
      const fromShorts = parsed.pathname.startsWith('/shorts/')
        ? parsed.pathname.split('/')[2]
        : null;
      const id = fromWatch || fromShorts;
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    // Fallback to raw URL if parsing fails.
  }
  return rawUrl;
}
