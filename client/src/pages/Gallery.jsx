import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function Gallery() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Gallery</h1>
        <p className="mt-4 text-prose">
          Moments from programs, campus life, and celebrations.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-xl bg-primary/50 dark:bg-neutral-800"
            />
          ))}
        </div>
      </Container>
    </PageFade>
  );
}
