import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function Admission() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Admission</h1>
        <p className="mt-4 max-w-2xl text-prose">
          Steps to apply, timelines, and how to reach the admissions team.
        </p>
      </Container>
    </PageFade>
  );
}
