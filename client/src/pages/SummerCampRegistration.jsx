import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function SummerCampRegistration() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Summer Camp Registration</h1>
        <p className="mt-4 text-prose">
          Registration details for Summer Camp will be published here.
        </p>
      </Container>
    </PageFade>
  );
}
