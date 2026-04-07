import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function OnlinePrograms() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Online Programs</h1>
        <p className="mt-4 max-w-2xl text-prose">
          Samskrutham, Ayurveda, astronomy, video editing, and other live and
          self-paced courses.
        </p>
      </Container>
    </PageFade>
  );
}
