import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import PageFade from '../components/PageFade';

const tabs = [
  { id: 'about', label: 'About Camp' },
  { id: 'batches', label: 'Batches' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'checklist', label: 'Camp Checklist' },
];

const checklistTabs = [
  { id: 'checklist', label: 'Checklist' },
  { id: 'reminders', label: 'Reminders' },
];

const aboutCampImages = [
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
];

const highlightImages = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
];

export default function SummerCamp() {
  const [activeTab, setActiveTab] = useState('about');
  const [activeChecklistTab, setActiveChecklistTab] = useState('checklist');

  const content = useMemo(() => {
    if (activeTab === 'batches') {
      return (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div>
            <h3 className="text-2xl font-semibold text-prose">
              Weekly Camp Batches
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-prose-muted">
              <li>Batch 1: April 19th - April 25th</li>
              <li>Batch 2: April 26th - May 2nd</li>
              <li>Batch 3: May 3rd - May 9th</li>
              <li>Batch 4: May 10th - May 16th</li>
              <li>Batch 5: May 17th - May 23rd</li>
              <li>Batch 6: May 24th - May 31st</li>
              <li>NRI Batch 1: June 14th - June 20th</li>
              <li>NRI Batch 2: June 21st - June 27th</li>
              <li>NRI Batch 3: June 28th - July 4th</li>
              <li>NRI Batch 4: July 5th - July 11th</li>
              <li>NRI Batch 5: July 12th - July 18th</li>
              <li>NRI Batch 6: July 19th - July 25th</li>
              <li>NRI Batch 7: July 26th - August 1st</li>
              <li>NRI Batch 8: August 2nd - August 8th</li>
              <li>NRI Batch 9: August 9th - August 15th</li>
            </ul>
            <p className="mt-6 text-base leading-8 text-prose-muted">
              You can choose multiple weeks if you would like to stay longer.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-primary/50 p-6 dark:border-neutral-700 dark:bg-neutral-800/80">
            <p className="text-base leading-8 text-prose-muted">
              Set amidst the vast 70-acre Forest Ridge campus in Hyderabad, this
              immersive program combines traditional learning with modern
              activities, promoting personal development, creativity, and
              unforgettable experiences.
            </p>
          </div>
        </div>
      );
    }

    if (activeTab === 'highlights') {
      return (
        <div>
          <h3 className="text-2xl font-semibold text-prose">Camp Highlights</h3>
          <p className="mt-4 text-base leading-8 text-prose-muted">
            The summer camp serves as an introduction to our full-time
            residential Gurukulam, launching in June 2026. It offers
            homeschooling families a unique opportunity to experience a
            comprehensive learning environment, where diverse educational
            opportunities are seamlessly integrated within a single campus.
          </p>
          <p className="mt-5 text-lg font-semibold text-prose">
            Embark on an Unforgettable Summer Family Adventure!
          </p>
          <p className="mt-2 text-base leading-8 text-prose-muted">
            Experience an enriching 14-day residential family summer camp
            tailored for children aged 7 to 15 and parents.
          </p>
          <ul className="mt-5 list-disc space-y-2 pl-6 text-prose-muted">
            <li>Traditional Indian games and Mallakhamb sessions</li>
            <li>Yoga, meditation, and mindful daily routines</li>
            <li>Farming, nature exposure, and activity-based learning</li>
            <li>Arts, storytelling, and team-building experiences</li>
          </ul>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlightImages.map((image, index) => (
              <div
                key={image}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              >
                <img
                  src={image}
                  alt={`Summer camp highlight ${index + 1}`}
                  className="h-52 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'checklist') {
      return (
        <div>
          <div className="grid grid-cols-2 border border-neutral-200 dark:border-neutral-700">
            {checklistTabs.map((item) => {
              const isActive = activeChecklistTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveChecklistTab(item.id)}
                  className={`px-4 py-3 text-sm font-medium transition sm:text-base ${
                    isActive
                      ? 'bg-primary/70 text-prose dark:bg-emerald-950/50 dark:text-emerald-100'
                      : 'bg-white text-prose-muted hover:bg-primary/40 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="border-x border-b border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900 sm:p-8">
            {activeChecklistTab === 'checklist' ? (
              <div className="space-y-7">
                <div>
                  <h4 className="text-xl font-semibold text-prose">Clothing</h4>
                  <ol className="mt-3 list-decimal space-y-2 pl-6 text-prose-muted">
                    <li>
                      <span className="font-medium text-prose">
                        Traditional Attire (Gurukul dress code):
                      </span>{' '}
                      Two sets of cotton outfits (Salwar Kameez with sleeves and
                      Lehenga for girls; Kurta Pyjama with track pants for
                      boys).
                    </li>
                    <li>
                      <span className="font-medium text-prose">Casual Wear:</span>{' '}
                      Five sets of everyday clothing, preferably lightweight and
                      breathable fabrics like cotton.
                    </li>
                    <li>
                      <span className="font-medium text-prose">Sports Wear:</span>{' '}
                      Four sets of athletic apparel suitable for physical
                      activities.
                    </li>
                    <li>
                      <span className="font-medium text-prose">
                        MallaKhamb Wear:
                      </span>{' '}
                      Shorts for boys and leggings or caprice for girls.
                    </li>
                    <li>
                      <span className="font-medium text-prose">Undergarments:</span>{' '}
                      Sufficient quantity (approximately ten pairs).
                    </li>
                    <li>
                      <span className="font-medium text-prose">Swim Wear:</span>{' '}
                      Two sets of swim dresses, swim short for boys and full
                      swimsuit for girls.
                    </li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-prose">Toiletries</h4>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-prose-muted">
                    <li>
                      <span className="font-medium text-prose">
                        Personal Hygiene Kit:
                      </span>{' '}
                      Includes toothbrush, toothpaste, tongue cleaner, soap,
                      shampoo and coconut oil.
                    </li>
                    <li>
                      <span className="font-medium text-prose">Laundry Bag:</span>{' '}
                      For storing used garments.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-prose">
                    Miscellaneous Items
                  </h4>
                  <ol className="mt-3 list-decimal space-y-2 pl-6 text-prose-muted">
                    <li>
                      <span className="font-medium text-prose">Stationary:</span>
                      <ul className="mt-2 list-disc space-y-1 pl-6 text-prose-muted">
                        <li>Art supplies</li>
                        <li>Sketch pens</li>
                        <li>Color pencils</li>
                        <li>Crayons</li>
                        <li>Watercolors</li>
                        <li>Paints</li>
                        <li>Watercolor papers</li>
                        <li>Art book</li>
                        <li>Paint brushes</li>
                      </ul>
                    </li>
                    <li>Daypack: A small backpack suitable for excursions.</li>
                    <li>
                      Bed pack: Two bed sheets, thick blanket (as it may get
                      cold in the night) and two pillow covers.
                    </li>
                    <li>Yoga mat</li>
                    <li>Raincoat / Umbrella</li>
                    <li>
                      <span className="font-medium text-prose">Footwear:</span>
                      <ul className="mt-2 list-disc space-y-1 pl-6 text-prose-muted">
                        <li>Sports shoes: Comfortable pairs for activities.</li>
                        <li>Socks: Around five pairs.</li>
                        <li>Slippers: For casual wear.</li>
                      </ul>
                    </li>
                    <li>
                      <span className="font-medium text-prose">
                        Hydration Supplies:
                      </span>
                      <ul className="mt-2 list-disc space-y-1 pl-6 text-prose-muted">
                        <li>Insulated flask: For hot beverages.</li>
                        <li>Water bottle: Durable and refillable.</li>
                      </ul>
                    </li>
                    <li>Locks: Number lock small size - 1.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-xl font-semibold text-prose">
                  Important Reminders
                </h4>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-prose-muted">
                  <li>
                    <span className="font-medium text-prose">Labeling:</span>{' '}
                    Clearly mark all personal items with a permanent marker
                    using your child&apos;s unique admission number to prevent
                    mix-ups.
                  </li>
                  <li>
                    <span className="font-medium text-prose">
                      Inventory List:
                    </span>{' '}
                    Provide a detailed checklist of all belongings accompanying
                    your child to the camp.
                  </li>
                </ul>
                <p className="mt-5 text-base leading-8 text-prose-muted">
                  By ensuring your child is equipped with these essentials, they
                  will be well-prepared to fully engage in all the enriching
                  activities the summer camp offers.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-2xl font-semibold text-prose">Summer Camp</h3>
        <p className="mt-4 text-base leading-8 text-prose-muted">
          The summer camp serves as an introduction to our full-time residential
          Gurukulam, launching in June 2025. It offers homeschooling families a
          unique opportunity to experience a comprehensive learning environment,
          where diverse educational opportunities are seamlessly integrated
          within a single campus.
        </p>
        <p className="mt-6 text-lg font-semibold text-prose">
          Embark on an Unforgettable Summer Family Adventure!
        </p>
        <p className="mt-2 text-base leading-8 text-prose-muted">
          Experience an enriching weekly residential family summer camp tailored
          for children aged 7 to 15 and parents. We recommend 2 weeks to get
          better experience.
        </p>
        <ul className="mt-5 list-disc space-y-2 pl-6 text-prose-muted">
          <li>
            <span className="font-medium text-prose">Age Guidelines:</span>
          </li>
          <li>5-8 years: Parent/guardian required</li>
          <li>9-15 years: Independent participation allowed</li>
        </ul>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aboutCampImages.map((image, index) => (
            <div
              key={image}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
            >
              <img
                src={image}
                alt={`Summer camp activity ${index + 1}`}
                className="h-52 w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }, [activeChecklistTab, activeTab]);

  return (
    <PageFade>
      <section className="border-b border-neutral-200 bg-secondary/35 py-10 dark:border-neutral-700 dark:bg-neutral-950/70 md:py-14">
        <Container>
          <h1 className="heading-page">Summer Camp Details</h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register/summer-camp"
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              Registration
            </Link>
            <Link
              to="/summer-camp/schedule"
              className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-prose transition hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Camp Schedule
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-8 md:py-12">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {tabs.map((tab) => {
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
            {content}
          </div>
        </div>
      </Container>
    </PageFade>
  );
}
