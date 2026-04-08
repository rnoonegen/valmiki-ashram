import Button from '../components/Button';
import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function OnlinePrograms() {
  return (
    <PageFade>
      <section className="border-b border-neutral-200 bg-secondary/35 py-10 dark:border-neutral-700 dark:bg-neutral-950/70 md:py-14">
        <Container>
          <h1 className="heading-page">Online Classes</h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-prose-muted md:text-lg">
            Learning beyond the classroom for all age groups. Live and guided
            sessions in Samskrutham and other traditional disciplines with
            global batch timings.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button to="/register/online-course" variant="primary">
              Register Now
            </Button>
            <Button to="/contact" variant="outline">
              Contact Us
            </Button>
          </div>

          <p className="mt-6 max-w-5xl text-base leading-8 text-prose md:text-lg">
            At Valmiki Ashram, we believe learning does not end with school or
            begin with age. Whether you are 9 or 90, learning is a lifelong
            journey, and you are always welcome to begin.
          </p>
        </Container>
      </section>

      <Container className="py-8 md:py-12">
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:p-8">
            <h2 className="text-2xl font-semibold text-prose">Time Zones</h2>
            <p className="mt-4 text-base font-medium text-prose">
              Courses available in the below time zones:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-base text-prose-muted">
              <li>India time zone (IST)</li>
              <li>USA time zone (EST / CST / PST)</li>
              <li>Australia time zone</li>
              <li>Europe time zone</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:p-8">
            <h2 className="text-2xl font-semibold text-prose">
              Traditional Courses
            </h2>
            <h3 className="mt-4 text-xl font-semibold text-prose">
              Traditional Disciplines
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-base text-prose-muted">
              <li>Samskrutham (Sanskrit)</li>
              <li>Ganitam (Leelavathi / Aryabhatiyam)</li>
              <li>Itihaasa (History)</li>
              <li>Astronomy</li>
              <li>
                Kantasthikaranam (Memorization Techniques) from Ashtadhyayi,
                Amarakosha, Shabda Manjari, and Dhatu Manjari
                <ul className="mt-2 list-disc space-y-2 pl-6">
                  <li>
                    Ashtadhyayi: A foundational text in Samskritam grammar that
                    gradually introduces students to language structure and
                    syntax.
                  </li>
                  <li>
                    Amarakosha: A Sanskrit thesaurus that enriches vocabulary
                    and helps learners understand synonyms and usage.
                  </li>
                  <li>
                    Shabda Manjari: A practical guide to noun and verb forms for
                    better fluency in Samskritam.
                  </li>
                </ul>
              </li>
              <li>
                Mathrubhasha (Mother Tongue - Telugu/Tamil/Kannada/Malayalam/
                Gujarati/Marati/Odiya/Bengali/etc.)
              </li>
              <li>Hindi</li>
              <li>English</li>
              <li>Bhoogolam (Geography)</li>
              <li>Shastras (Ancient Sciences)</li>
              <li>Bhagavad Gita / Rama Katha</li>
              <li>Contemporary Mathematics</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:p-8">
            <h2 className="text-2xl font-semibold text-prose">Online Fitness</h2>
            <h3 className="mt-4 text-xl font-semibold text-prose">
              Physical &amp; Mental Fitness
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-base text-prose-muted">
              <li>Yoga</li>
              <li>Ayurveda</li>
              <li>Kalaripayattu (traditional martial arts)</li>
              <li>Dhanurvidya (archery)</li>
              <li>Ghatka (weapon-based martial arts)</li>
              <li>Chess</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-primary/50 p-5 dark:border-neutral-700 dark:bg-neutral-900/80 sm:p-8">
            <h2 className="text-2xl font-semibold text-prose">
              Online Samskrutham Classes
            </h2>
            <p className="mt-3 text-base leading-8 text-prose-muted">
              Our first online Samskrutham classes start from Nov 23rd, 2025.
              We welcome learners from all age groups.
            </p>
            <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80"
                alt="Online registration form preview"
                className="h-72 w-full object-cover sm:h-80 md:h-[28rem]"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button to="/register/online-course" variant="primary">
                Register Now
              </Button>
              <Button to="/contact" variant="outline">
                Contact Us
              </Button>
            </div>
          </section>
        </div>
      </Container>
    </PageFade>
  );
}
