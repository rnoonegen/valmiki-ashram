import Container from '../components/Container';
import PageFade from '../components/PageFade';
import Button from '../components/Button';

const pillars = [
  {
    title: 'Gurushishya Parampara (Teacher-Student Lineage)',
    body: 'Direct mentorship from scholars, thinkers, and experts, ensuring in-depth knowledge transfer.',
  },
  {
    title: 'Kanthasthikaranam (Memorization)',
    body: 'Specialized training in memory techniques, enabling students to retain vast amounts of knowledge effortlessly.',
  },
  {
    title: 'Tarka & Vada (Logical Debates & Discussions)',
    body: 'Encouraging students to analyze, debate, and articulate their thoughts effectively, fostering sharp reasoning skills.',
  },
  {
    title: 'Adhyayanam & Anushthanam (Experiential & Applied Learning)',
    body: 'Integrating theoretical learning with real-world applications and daily practice.',
  },
  {
    title: 'Prakriti-based Learning (Nature-Centric Education)',
    body: 'Emphasizing outdoor experiential learning, observational sciences, and alignment with natural cycles.',
  },
  {
    title: 'Shishya-Shishya Parampara (Peer-Learning Gurukulam Method)',
    body: 'Senior students mentor younger students, fostering peer learning, leadership, and responsibility while encouraging self-learning and collaboration.',
  },
];

export default function Gurukulam() {
  return (
    <PageFade>

      <section className="border-b border-neutral-200 bg-secondary/30 py-8 dark:border-neutral-700 dark:bg-neutral-950 md:py-12">
        <Container>
          <h1 className="heading-page">What is the Gurukulam Program?</h1>
          <p className="mt-5 max-w-4xl text-base leading-relaxed text-prose md:text-lg">
            The Gurukulam Program at Valmiki Ashram is a full-time, residential
            family Gurukulam. Children learn at their own pace, through
            real-world projects, stories, memory training, and hands-on
            challenges.
          </p>
        </Container>
      </section>

      <section className="bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12">
        <Container>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-8">
            <h2 className="heading-section">Curriculum Overview</h2>
            <p className="mt-4 text-base leading-relaxed text-prose md:text-lg">
              Most schools teach 5-6 subjects. At Valmiki Ashram, children
              explore over 20. The curriculum at Valmiki Ashram blends
              traditional Indian knowledge with modern subjects and practical
              life skills.
            </p>
            <p className="mt-4 text-base leading-relaxed text-prose md:text-lg">
              Children do not just sit in classrooms - they build, chant,
              create, debate, and explore.
            </p>
            <div className="mt-6">
              <Button to="/curriculam" className="rounded-full px-6">
                View Full Curriculum
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-neutral-200 bg-secondary/40 py-12 dark:border-neutral-700 dark:bg-neutral-900/55 md:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-8">
              <h2 className="heading-card text-2xl md:text-3xl">
                Academics &amp; Certifications
              </h2>
              <p className="mt-4 text-prose">
                Valmiki Ashram is a Gurukulam, not a conventional school.
              </p>
              <p className="mt-3 text-prose">
                We are not affiliated with any single education board - but we
                ensure that children are fully prepared for modern academic
                requirements alongside traditional learning.
              </p>
            </article>

            <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-8">
              <h2 className="heading-card text-2xl md:text-3xl">
                NIOS: Flexible, Recognized, and Student-Centric
              </h2>
              <p className="mt-4 text-prose">
                Students at Valmiki Ashram are guided and supported through the
                NIOS (National Institute of Open Schooling) program - an
                autonomous institution under the Ministry of Education,
                Government of India.
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section className="bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12">
        <Container>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-8">
            <h2 className="heading-section">How NIOS Supports Students</h2>
            <p className="mt-4 text-prose">NIOS allows students to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-prose marker:text-accent dark:marker:text-emerald-500">
              <li>Choose subjects based on interest and future goals.</li>
              <li>Learn at their own pace with no rigid class schedules.</li>
              <li>Take on-demand exams when they are ready.</li>
              <li>
                Earn a government-recognized certification equivalent to
                CBSE/ICSE.
              </li>
            </ul>
            <p className="mt-4 text-prose">
              NIOS students are eligible for college admissions and competitive
              exams including JEE, NEET, UPSC, and international applications.
            </p>
            <p className="mt-4 text-prose">
              We provide structured academic guidance, study support, and
              mentorship to help children navigate the NIOS curriculum
              confidently - while leaving room for deep cultural and practical
              learning.
            </p>
            <p className="mt-4 text-sm text-prose-muted md:text-base">
              For more details about NIOS:{' '}
              <a
                href="https://www.nios.ac.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-app"
              >
                https://www.nios.ac.in/
              </a>
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-neutral-200 bg-secondary/35 py-8 dark:border-neutral-700 dark:bg-neutral-900/45 md:py-12">
        <Container>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-8">
            <h2 className="heading-section">Traditional Examinations</h2>
            <p className="mt-4 text-prose">
              For families who seek to continue in the path of traditional
              Indian education, students are also prepared for Samskrutha
              Bharati&apos;s traditional exams such as:
            </p>
            <ul className="mt-3 list-disc pl-5 text-prose marker:text-accent dark:marker:text-emerald-500">
              <li>Chittoor Pariksha</li>
            </ul>
            <p className="mt-4 text-prose">
              These exams cover Samskrutham grammar, literature,
              shastra-based understanding, and memorization disciplines aligned
              with ancient Gurukula methods.
            </p>
            <p className="mt-4 text-prose">
              Our curriculum naturally integrates the material needed for these
              assessments through chanting, shastra study, and daily recitation
              practice.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12">
        <Container>
          <h1 className="heading-page max-w-5xl">
            Empowering Future Generations Through Decolonized, Traditional
            Learning
          </h1>
          <p className="mt-5 max-w-5xl text-base leading-relaxed text-prose md:text-[1.35rem]">
            Valmiki Gurukulam follows the time-honored Gurukulam system, where
            students learn under the direct guidance of Acharyas (teachers).
            This personalized learning approach fosters intellectual growth and
            moral development.
          </p>

          <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2">
            {pillars.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                <h2 className="text-lg font-semibold text-accent dark:text-emerald-200">
                  {item.title}
                </h2>
                <p className="mt-3 leading-relaxed text-prose">{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </PageFade>
  );
}
