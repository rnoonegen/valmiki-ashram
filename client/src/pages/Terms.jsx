import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function Terms() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Terms</h1>
        <p className="mt-4 text-prose">
          Terms of use and policies will be published here.
        </p>
      </Container>
    </PageFade>
  );
}
