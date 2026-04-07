import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function WinterCampRegistration() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Winter Camp Registration</h1>
        <p className="mt-4 text-prose">
          Registration details for Winter Camp will be published here.
        </p>
      </Container>
    </PageFade>
  );
}
