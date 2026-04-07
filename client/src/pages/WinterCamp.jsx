import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function WinterCamp() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Winter Camp</h1>
        <p className="mt-4 max-w-2xl text-prose">
          Martial arts, robotics, yoga, gamified math, and more in a winter
          cohort.
        </p>
      </Container>
    </PageFade>
  );
}
