import Container from '../components/Container';
import PageFade from '../components/PageFade';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiRequest } from '../admin/api';

export default function Contests() {
  const location = useLocation();
  const adminMode = location.pathname === '/admin/contests' || location.pathname.startsWith('/admin/contests/');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/contests')
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Contests</h1>
        <p className="mt-4 max-w-2xl text-prose">Competitions and challenges hosted by Valmiki Ashram.</p>
        {loading ? <p className="mt-6 text-prose-muted">Loading contests...</p> : null}
        {!loading && items.length === 0 ? <p className="mt-6 text-prose-muted">No contests published yet.</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((contest) => {
            const detailPath = adminMode ? `/admin/contests/${contest._id}` : `/contests/${contest._id}`;
            return (
              <article
                key={contest._id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-nav ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-nav-dark dark:ring-white/10"
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
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-lg font-semibold text-accent dark:text-emerald-200">{contest.title}</h2>
                  <div className="mt-2 space-y-1 text-sm text-prose-muted">
                    {contest.submitDate ? <p>Submit Date: {new Date(contest.submitDate).toLocaleDateString()}</p> : null}
                    {contest.resultDate ? <p>Result Date: {new Date(contest.resultDate).toLocaleDateString()}</p> : null}
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
