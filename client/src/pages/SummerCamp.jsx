import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function SummerCamp() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Summer Camp</h1>
        <p className="mt-4 max-w-2xl text-prose">
          Outdoor learning, skills, and community during the summer season.
        </p>
      </Container>
    </PageFade>
  );
}
