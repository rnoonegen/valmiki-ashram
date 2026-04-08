import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import PageFade from '../components/PageFade';

const scheduleTabs = [
  { id: 'morning', label: 'Morning Routine' },
  { id: 'activity', label: 'Activity Sessions' },
  { id: 'evening', label: 'Evening Routine' },
  { id: 'dietary', label: 'Dietary Schedule' },
];

export default function WinterCampSchedule() {
  const [activeTab, setActiveTab] = useState('morning');

  const tabContent = useMemo(() => {
    if (activeTab === 'activity') {
      return (
        <div>
          <p className="text-base leading-8 text-prose-muted">
            Engage in group activities with peers. Each session lasts 45-60
            minutes and takes place in a combination of outdoors and
            air-conditioned indoor halls.
          </p>
          <h3 className="mt-6 text-xl font-semibold text-prose">
            Activities include (9:00 AM - 1:00 PM and 2:00 PM - 5:00 PM)
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-prose-muted">
            <li>Robotics (12 to 15 year age group)</li>
            <li>Puzzles</li>
            <li>Swimming</li>
            <li>Dhanurvidya</li>
            <li>Astronomy (Bharatiya Panchangam)</li>
            <li>Ayurvedha and lifestyle practices</li>
            <li>Indian Martial Arts (Kalari Payattu / Gatka)</li>
            <li>Yoga / Mallakhambh</li>
            <li>Theater workshops</li>
            <li>Ithihaasa</li>
            <li>Samskrutha Sambhashanam</li>
            <li>Nature exploration and trekking</li>
          </ul>
        </div>
      );
    }

    if (activeTab === 'evening') {
      return (
        <div>
          <h3 className="text-xl font-semibold text-prose">Evening Routine</h3>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-prose-muted">
            <li>5:00 PM - 6:30 PM: Outdoor games and sports.</li>
            <li>6:30 PM - 7:00 PM: Sandya and Upasana meditation.</li>
            <li>7:00 PM - 7:30 PM: Entertainment period.</li>
            <li>
              7:30 PM - 8:00 PM: Dinner break with North and South Indian
              cuisine.
            </li>
            <li>8:00 PM - 8:30 PM: Prayer and Sayanakala Mantras.</li>
            <li>
              8:30 PM - 8:45 PM: Evening walk (Bramanam) with discussions on
              Chanakya Neeti, Bartruhari Neethi, and Slokas.
            </li>
            <li>8:45 PM - 6:00 AM: Sleep and rest period.</li>
          </ul>
        </div>
      );
    }

    if (activeTab === 'dietary') {
      return (
        <div>
          <h3 className="text-xl font-semibold text-prose">Dietary Schedule</h3>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-prose-muted">
            <li>8:30 AM - 9:30 AM: Breakfast with two varieties daily.</li>
            <li>11:00 AM: Fresh fruit juice.</li>
            <li>
              1:00 PM: Nutritious vegetarian lunch featuring both North and
              South Indian dishes.
            </li>
            <li>4:30 PM: Snacks, including special items like chat.</li>
            <li>
              7:30 PM: Dinner serving a delectable vegetarian meal with North
              and South Indian cuisine.
            </li>
          </ul>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-xl font-semibold text-prose">Morning Routine</h3>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-prose-muted">
          <li>
            6:00 AM: Rise with Pratahkal Mantras, observing a vow of silence.
          </li>
          <li>
            6:30 AM: Personal hygiene activities with guidance to maintain a
            healthy lifestyle, including drinking warm water and attending
            nature&apos;s call.
          </li>
          <li>7:00 AM: Physical fitness - Yoga / Indian Martial Arts.</li>
          <li>8:00 AM: Bath.</li>
          <li>8:30 AM: Breakfast.</li>
        </ul>
      </div>
    );
  }, [activeTab]);

  return (
    <PageFade>
      <section className="border-b border-neutral-200 bg-secondary/35 py-10 dark:border-neutral-700 dark:bg-neutral-950/70 md:py-14">
        <Container>
          <h1 className="heading-page">Winter Camp Schedule</h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register/winter-camp"
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              Registration
            </Link>
            <Link
              to="/winter-camp"
              className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-prose transition hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Winter Camp Details
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-8 md:py-12">
        <p className="max-w-5xl text-base leading-8 text-prose-muted sm:text-lg sm:leading-8 md:text-xl md:leading-9">
          This structured routine is designed to provide a balanced blend of
          physical activity, educational enrichment, and personal development,
          ensuring a fulfilling and memorable camp experience.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {scheduleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b border-r border-neutral-200 px-4 py-3 text-sm font-medium transition last:border-r-0 md:text-base dark:border-neutral-700 ${
                    isActive
                      ? 'bg-primary/70 text-prose dark:bg-emerald-950/50 dark:text-emerald-100'
                      : 'bg-white text-prose-muted hover:bg-primary/40 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-neutral-50 p-5 sm:p-8 dark:bg-neutral-950/70">
            {tabContent}
          </div>
        </div>
      </Container>
    </PageFade>
  );
};
