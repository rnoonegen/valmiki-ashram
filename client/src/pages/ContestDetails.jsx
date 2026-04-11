import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import { adminRequest, apiRequest } from '../admin/api';
import VideoPlayer from '../components/VideoPlayer';

function ContentSection({ section }) {
  const blocks =
    Array.isArray(section.blocks) && section.blocks.length > 0
      ? section.blocks
      : [
          {
            subHeading: section.subHeading || '',
            paragraphs: section.paragraph ? [section.paragraph] : [],
            bulletPoints: Array.isArray(section.bulletPoints) ? section.bulletPoints : [],
          },
        ];

  return (
    <section className="space-y-3">
      {section.heading ? <h2 className="heading-section">{section.heading}</h2> : null}
      {blocks.map((block, blockIdx) => (
        <div key={`block-${blockIdx}`} className="space-y-2">
          {block.subHeading ? <h3 className="text-xl font-semibold text-accent dark:text-emerald-200">{block.subHeading}</h3> : null}
          {Array.isArray(block.paragraphs)
            ? block.paragraphs.map((paragraph, idx) =>
                paragraph ? (
                  <p key={`paragraph-${idx}`} className="break-words [overflow-wrap:anywhere] text-prose">
                    {paragraph}
                  </p>
                ) : null
              )
            : null}
          {Array.isArray(block.bulletPoints) && block.bulletPoints.length > 0 ? (
            <ul className="list-disc space-y-1 pl-6 text-prose">
              {block.bulletPoints.map((point, idx) => (
                <li key={`${point}-${idx}`} className="break-words [overflow-wrap:anywhere]">
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </section>
  );
}

function ArrowButton({ direction = 'left', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-accent shadow-sm hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-emerald-200 dark:hover:bg-neutral-800"
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
    >
      {direction === 'left' ? '←' : '→'}
    </button>
  );
}

export default function ContestDetails() {
  const { contestId } = useParams();
  const location = useLocation();
  const adminMode = location.pathname.startsWith('/admin/');
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageIndex, setImageIndex] = useState(0);
  const videoTrackRef = useRef(null);

  useEffect(() => {
    if (!contestId) return;
    setLoading(true);
    setError('');
    const request = adminMode
      ? adminRequest(`/api/admin/contests/${contestId}`)
      : apiRequest(`/api/contests/${contestId}`);
    request
      .then((data) => setContest(data.contest || null))
      .catch((err) => setError(err.message || 'Unable to load contest'))
      .finally(() => setLoading(false));
  }, [contestId, adminMode]);

  const registerPath = adminMode ? `/admin/contests/${contestId}/register` : `/contests/${contestId}/register`;
  const images = Array.isArray(contest?.heroImages) ? contest.heroImages : [];
  const videos = Array.isArray(contest?.heroVideoLinks) ? contest.heroVideoLinks : [];
  const scrollByAmount = 360;

  const scrollTrack = (ref, direction) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: direction === 'left' ? -scrollByAmount : scrollByAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    setImageIndex(0);
  }, [contestId, images.length]);

  const prevImage = () => {
    if (!images.length) return;
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    if (!images.length) return;
    setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        {loading ? <p className="text-prose-muted">Loading contest...</p> : null}
        {!loading && error ? <p className="text-rose-600 dark:text-rose-400">{error}</p> : null}
        {!loading && !error && contest ? (
          <div className="space-y-10">
            <header className="rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/90">
              <h1 className="heading-page">{contest.title}</h1>
              {contest.description || contest.cardDescription ? (
                <p className="mt-3 w-full break-words [overflow-wrap:anywhere] text-prose">
                  {contest.description || contest.cardDescription}
                </p>
              ) : null}
              <div className="mt-3 space-y-1 text-sm text-prose-muted">
                {contest.submitDate ? <p>Submit Date: {new Date(contest.submitDate).toLocaleDateString()}</p> : null}
                {contest.resultDate ? <p>Result Date: {new Date(contest.resultDate).toLocaleDateString()}</p> : null}
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                {contest.registrationOpen === false ? (
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Registration is closed.</p>
                ) : null}
                <div>
                  {contest.registerMode === 'google' ? (
                    contest.registrationOpen !== false ? (
                      <a
                        href={contest.googleFormUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-white hover:opacity-90 dark:bg-emerald-700"
                      >
                        {contest.registerButtonText || 'Register Now'}
                      </a>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="inline-flex cursor-not-allowed rounded-lg bg-neutral-400 px-5 py-2.5 text-white opacity-90 dark:bg-neutral-600"
                      >
                        {contest.registerButtonText || 'Register Now'}
                      </span>
                    )
                  ) : contest.registrationOpen !== false ? (
                    <Link
                      to={registerPath}
                      className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-white hover:opacity-90 dark:bg-emerald-700"
                    >
                      {contest.registerButtonText || 'Register Now'}
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex cursor-not-allowed rounded-lg bg-neutral-400 px-5 py-2.5 text-white opacity-90 dark:bg-neutral-600"
                    >
                      {contest.registerButtonText || 'Register Now'}
                    </span>
                  )}
                </div>
              </div>
            </header>

            <div className="space-y-10">
              {images.length > 0 ? (
                <section className="rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/90">
                  <h2 className="heading-section">Contest Images</h2>
                  <div className="mx-auto mt-4 max-w-3xl space-y-3">
                    <img
                      src={images[imageIndex]}
                      alt={`${contest.title} ${imageIndex + 1}`}
                      className="h-[250px] w-full rounded-2xl border border-neutral-200 object-cover shadow-sm sm:h-[320px] dark:border-neutral-700"
                    />
                    {images.length > 1 ? (
                      <div className="flex items-center justify-center gap-3">
                        <ArrowButton direction="left" onClick={prevImage} />
                        <span className="text-sm text-prose-muted">
                          {imageIndex + 1} / {images.length}
                        </span>
                        <ArrowButton direction="right" onClick={nextImage} />
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {videos.length > 0 ? (
                <section className="rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/90">
                  <h2 className="heading-section">Contest Videos</h2>
                  {videos.length === 1 ? (
                    <div className="mx-auto mt-4 max-w-3xl">
                      <VideoPlayer
                        url={videos[0]}
                        title={`${contest.title} video 1`}
                        className="mx-auto max-w-3xl"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-end gap-2">
                        <ArrowButton direction="left" onClick={() => scrollTrack(videoTrackRef, 'left')} />
                        <ArrowButton direction="right" onClick={() => scrollTrack(videoTrackRef, 'right')} />
                      </div>
                      <div
                        ref={videoTrackRef}
                        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        {videos.map((videoUrl, idx) => (
                          <VideoPlayer
                            key={`${videoUrl}-${idx}`}
                            url={videoUrl}
                            title={`${contest.title} video ${idx + 1}`}
                            className="w-[85vw] max-w-[360px] flex-none"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ) : null}

              <section className="rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/90">
                <h2 className="heading-section">Contest Content</h2>
                <div className="mt-4 space-y-8">
                  {(contest.sections || []).map((section, idx) => {
                    return <ContentSection key={`section-${idx}`} section={section} />;
                  })}
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </Container>
    </PageFade>
  );
}
