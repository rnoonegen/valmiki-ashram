import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function Curriculam() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Full Curriculum</h1>
        <p className="mt-4 max-w-3xl text-prose">
          A detailed curriculum view will be published here. This section will
          include age-wise progression, subject pathways, Samskrutham modules,
          practical life skills, and integrated modern academics.
        </p>
      </Container>
    </PageFade>
  );
}
