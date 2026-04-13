import Container from '../components/Container';
import PageFade from '../components/PageFade';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiRequest } from '../admin/api';
import useLiveContent from '../hooks/useLiveContent';

export default function Contests() {
  const location = useLocation();
  const adminMode = location.pathname === '/admin/contests' || location.pathname.startsWith('/admin/contests/');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const cms = useLiveContent('contests', {
    heading: 'Contests',
    paragraphs: ['Competitions and challenges hosted by Valmiki Ashram.'],
  });

  useEffect(() => {
    apiRequest('/api/contests')
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">{cms.heading || 'Contests'}</h1>
        <div className="mt-4 max-w-3xl space-y-2">
          {(Array.isArray(cms.paragraphs) ? cms.paragraphs : [])
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={`contests-intro-${index}`} className="text-prose">
                {paragraph}
              </p>
            ))}
        </div>
        {loading ? <p className="mt-6 text-prose-muted">Loading contests...</p> : null}
        {!loading && items.length === 0 ? <p className="mt-6 text-prose-muted">No contests yet.</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((contest) => {
            const detailPath = adminMode ? `/admin/contests/${contest._id}` : `/contests/${contest._id}`;
            return (
              <article
                key={contest._id}
                className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-nav ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-nav-dark dark:ring-white/10"
              >
                {contest.heroImages?.[0] ? (
                  <img
                    src={contest.heroImages[0]}
                    alt={contest.title}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-secondary/80 text-sm text-prose-muted dark:bg-neutral-800/70">
                    Contest image not added
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <h2
                      className="min-w-0 flex-1 truncate text-lg font-semibold text-accent dark:text-emerald-200"
                      title={contest.title || ''}
                    >
                      {contest.title}
                    </h2>
                    {contest.registrationOpen === false ? (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                        Registration closed
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                        Registration open
                      </span>
                    )}
                  </div>
                  <div className="mt-2 min-w-0 space-y-1 text-sm text-prose-muted">
                    {contest.submitDate ? (
                      <p className="truncate" title={`Submit Date: ${new Date(contest.submitDate).toLocaleDateString()}`}>
                        Submit Date: {new Date(contest.submitDate).toLocaleDateString()}
                      </p>
                    ) : null}
                    {contest.resultDate ? (
                      <p className="truncate" title={`Result Date: ${new Date(contest.resultDate).toLocaleDateString()}`}>
                        Result Date: {new Date(contest.resultDate).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-auto pt-4">
                    <Link
                      to={detailPath}
                      className="inline-flex rounded-lg bg-accent px-3 py-1.5 text-sm text-white hover:opacity-90 dark:bg-emerald-700"
                    >
                      View contest
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </PageFade>
  );
}
