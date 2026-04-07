import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function ValmikiAshram() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Valmiki Ashram</h1>
        <p className="mt-4 max-w-2xl text-prose">
          Our campus, values, and the everyday rhythm of the Ashram community.
        </p>
      </Container>
    </PageFade>
  );
}
