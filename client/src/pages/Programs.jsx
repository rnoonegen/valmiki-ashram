import { Link } from 'react-router-dom';
import Container from '../components/Container';
import PageFade from '../components/PageFade';

const items = [
  { to: '/winter-camp', title: 'Winter Camp', desc: 'Seasonal immersion programs.' },
  { to: '/summer-camp', title: 'Summer Camp', desc: 'Summer camps and intensives.' },
  {
    to: '/online-programs',
    title: 'Online Programs',
    desc: 'Learn from anywhere, all ages.',
  },
];

export default function Programs() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Our Programs</h1>
        <p className="mt-4 max-w-2xl text-prose">
          Explore camps, online offerings, and pathways into the Gurukulam.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="block rounded-2xl border border-neutral-200 bg-secondary/70 p-6 shadow-sm ring-1 ring-black/5 transition-colors hover:border-accent dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-nav-dark dark:ring-white/10 dark:hover:border-emerald-600/60"
              >
                <h2 className="heading-card">{item.title}</h2>
                <p className="mt-2 text-sm text-prose-muted">{item.desc}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </PageFade>
  );
}
