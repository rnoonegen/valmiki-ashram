import { Compass } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function NotFound() {
  const location = useLocation();
  const adminMode = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const homePath = adminMode ? '/admin' : '/';

  return (
    <PageFade>
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-12">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-accent dark:bg-emerald-950/50 dark:text-emerald-200">
              <Compass className="h-7 w-7" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent/80 dark:text-emerald-300/80">
              Error 404
            </p>
            <h1 className="mt-3 text-3xl font-bold text-accent dark:text-emerald-200 md:text-4xl">
              Page not found
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-prose">
              The path you entered does not exist. Please check the URL or return to the home page.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button to={homePath} variant="primary">
                Go to Home
              </Button>
              <Button to="/contact" variant="outline">
                Contact Us
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </PageFade>
  );
}
