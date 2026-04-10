import { BookOpen, Flower2, Orbit, Sparkles, Target, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import Button from '../components/Button';
import ImageUploader from '../components/admin/ImageUploader';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import useLiveContent from '../hooks/useLiveContent';

const founderImg =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80';
const founderImg2 =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80';

const whyCards = [
  {
    icon: BookOpen,
    title: 'Ancient Wisdom',
    text: 'Learn ancient arts and traditions in an engaging and interactive environment.',
  },
  {
    icon: Flower2,
    title: 'Cultural Immersion',
    text: 'The camp provides a unique opportunity to dive deep into Indian traditions, heritage, culture, itihaasa, and spirituality.',
  },
  {
    icon: Orbit,
    title: 'Decolonized Education',
    text: 'Understand the true foundations of Math, Science, and original History.',
  },
  {
    icon: Users,
    title: 'Internships',
    text: 'Provide internship opportunities from 8th grade onwards, fostering practical learning through hands-on experience in alignment with the true spirit of NEP 2020, and equipping the next generation of entrepreneurs with real-world skills.',
  },
];

const aboutHighlights = [
  {
    icon: Sparkles,
    title: 'What is Valmiki Ashram?',
    body: "Located near BITS Pilani-Hyderabad Campus, Valmiki Ashram is a one-of-a-kind Residential Family Gurukulam dedicated to reviving the Bharateeya Shiksha Paddhati (Indian Education System) and reclaiming India's rich scientific and intellectual heritage through a Holistic, De-Colonized approach to Education.",
    tone: 'from-sky-50 via-slate-50 to-primary/35 dark:from-slate-900 dark:via-neutral-900 dark:to-emerald-950/30',
  },
  {
    icon: Target,
    title: 'What do we do?',
    body: 'We are dedicated to reviving the Bharateeya education system through a decolonized Indian curriculum that nurtures students from Pre-School to 12th Grade. By seamlessly integrating traditional knowledge with modern advancements, the Prathishtan shapes future thought leaders, entrepreneurs, and innovators who remain deeply rooted in their cultural heritage while excelling in a rapidly evolving world.',
    tone: 'from-white via-secondary/35 to-amber-50/70 dark:from-neutral-900 dark:via-neutral-900 dark:to-emerald-950/20',
  },
  {
    icon: Flower2,
    title: "Why are we called 'Valmiki Ashram'?",
    body: "Sri Rama dedicated 40 years to mastering various vidyas (sciences and arts) under the guidance of multiple gurus. In contrast, Lava and Kusha, mentored by Sage Valmiki, attained proficiency in all vidyas within just 12 years. Despite their shorter training period, they demonstrated exceptional prowess, defeating formidable warriors like Lakshmana, Bharata, Shatrughna, and Hanuman. Furthermore, it was within the sacred Valmiki Ashram that Sage Valmiki composed the Ramayana, immortalizing the epic journey and legacy of Sri Rama.",
    tone: 'from-primary/35 via-emerald-50/70 to-lime-50/60 dark:from-emerald-950/35 dark:via-neutral-900 dark:to-neutral-900',
  },
];

export default function About() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/about';
  const cms = useLiveContent('about', {});
  const [draft, setDraft] = useState(cms);
  useEffect(() => setDraft(cms), [cms]);
  const hasUnsavedPhotoChanges =
    (draft.founderImage1 || '') !== (cms.founderImage1 || '') ||
    (draft.founderImage2 || '') !== (cms.founderImage2 || '');
  const founderOne = cms.founderImage1 || founderImg;
  const founderTwo = cms.founderImage2 || founderImg2;
  const displayOne = isAdmin ? draft.founderImage1 || founderImg : founderOne;
  const displayTwo = isAdmin ? draft.founderImage2 || founderImg2 : founderTwo;

  const save = async () => {
    await adminRequest('/api/admin/content/about', {
      method: 'PUT',
      body: JSON.stringify({ content: draft }),
    });
  };

  return (
    <PageFade>
      <h1 className="sr-only">About Valmiki Ashram</h1>
      <section className="border-y border-neutral-200 bg-secondary/30 py-8 dark:border-neutral-700 dark:bg-neutral-950 md:py-12">
        <Container>
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent/80 dark:text-emerald-300/80">
              About Valmiki Ashram
            </p>
            <h2 className="mt-2 text-2xl font-bold text-accent dark:text-emerald-200 md:text-3xl">
              Rooted in tradition, designed for the future
            </h2>
          </div>
          <div className="grid gap-5 md:gap-6">
            {aboutHighlights.map((item, i) => (
              <article
                key={item.title}
                className={`overflow-hidden rounded-2xl border p-6 shadow-sm ring-1 md:p-8 ${
                  i % 2 === 0
                    ? 'border-primary-muted/70 bg-primary/25 ring-primary-muted/25 dark:border-emerald-800/50 dark:bg-emerald-950/25 dark:ring-emerald-800/20'
                    : 'border-neutral-200 bg-white ring-black/5 dark:border-neutral-700 dark:bg-neutral-900 dark:ring-white/10'
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary-muted/60 bg-white/70 text-accent dark:border-emerald-800/50 dark:bg-neutral-900/80 dark:text-emerald-200">
                      <item.icon className="h-6 w-6" strokeWidth={1.9} />
                    </div>
                    <h2 className="text-2xl font-bold leading-tight text-accent dark:text-emerald-200 md:text-3xl">
                      {item.title}
                    </h2>
                  </div>
                  <p className="text-base leading-relaxed text-neutral-800 dark:text-neutral-200 md:text-[1.03rem]">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-neutral-200 bg-secondary/45 py-8 dark:border-neutral-700 dark:bg-neutral-900/55 md:py-12">
        <Container>
          <h2 className="heading-section mb-4 text-center">
            Our Founders
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-prose">
            Visionaries reviving Bharateeya wisdom with a practical, future-ready
            model of learning.
          </p>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:p-7">
            <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:max-w-xl lg:max-w-none">
              <figure className="group relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm dark:border-neutral-700">
                <img
                  src={displayOne}
                  alt="Sri Ramesh Kumar"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {isAdmin ? (
                  <div className="absolute inset-x-2 top-2 z-10 flex justify-end">
                    <ImageUploader
                      folder="about"
                      buttonText="Change"
                      onUploaded={(asset) => setDraft((p) => ({ ...p, founderImage1: asset.url }))}
                    />
                  </div>
                ) : null}
                <figcaption className="bg-white/90 px-3 py-2 text-center text-sm font-medium text-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-100">
                  Sri Ramesh Kumar
                </figcaption>
              </figure>
              <figure className="group relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm dark:border-neutral-700">
                <img
                  src={displayTwo}
                  alt="Srimathi Swapna"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {isAdmin ? (
                  <div className="absolute inset-x-2 top-2 z-10 flex justify-end">
                    <ImageUploader
                      folder="about"
                      buttonText="Change"
                      onUploaded={(asset) => setDraft((p) => ({ ...p, founderImage2: asset.url }))}
                    />
                  </div>
                ) : null}
                <figcaption className="bg-white/90 px-3 py-2 text-center text-sm font-medium text-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-100">
                  Srimathi Swapna
                </figcaption>
              </figure>
              </div>
              <div className="flex max-w-xl flex-col gap-6 lg:max-w-md">
                <p className="text-prose leading-relaxed">
                  The founders of Valmiki Ashram are dedicated to reviving
                  India&apos;s rich educational heritage by integrating ancient
                  Indic wisdom with modern learning, creating a transformative
                  Samskrutham immersion Gurukulam.
                </p>
                <div className="rounded-xl border border-neutral-200 bg-secondary/50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <p className="text-sm leading-relaxed text-prose-muted">
                    Discover their full journey, mission, and educational
                    philosophy on the dedicated founders page.
                  </p>
                </div>
                <Button to="/founders" className="w-fit rounded-full px-6">
                  Read more
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="mt-3 bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12">
        <Container>
          <h2 className="heading-section mb-10 text-center">
            Why Choose Us?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyCards.map((card, i) => (
              <article
                key={card.title}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/50 text-accent dark:bg-emerald-950/60 dark:text-emerald-200">
                  <card.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-prose-muted">
                  {card.text}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>
      {isAdmin && hasUnsavedPhotoChanges ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
              Save photo changes to the server when you are done editing.
            </p>
            <button
              type="button"
              onClick={save}
              className="w-full rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700 sm:w-auto"
            >
              Save About Photos
            </button>
          </div>
        </div>
      ) : null}
    </PageFade>
  );
}
