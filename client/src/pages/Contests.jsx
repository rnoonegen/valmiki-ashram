import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function Contests() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Contests</h1>
        <p className="mt-4 max-w-2xl text-prose">
          Competitions and challenges hosted by Valmiki Ashram.
        </p>
      </Container>
    </PageFade>
  );
}
