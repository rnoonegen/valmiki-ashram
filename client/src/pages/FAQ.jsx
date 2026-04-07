import Container from '../components/Container';
import { FaqCategorySection } from '../components/FaqAccordion';
import PageFade from '../components/PageFade';
import { faqCategories } from '../data/faqData';

export default function FAQ() {
  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <header className="max-w-3xl">
          <h1 className="heading-page">Frequently Asked Questions</h1>
          <p className="mt-4 text-base leading-relaxed text-prose md:text-lg">
            Find answers about alternative education, Gurukulam, homeschooling,
            colonized education, NIOS, and how we approach learning at Valmiki
            Ashram. Open a section below to explore each topic.
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-8 md:mt-12 md:gap-10">
          {faqCategories.map((category) => (
            <FaqCategorySection key={category.id} category={category} />
          ))}
        </div>
      </Container>
    </PageFade>
  );
}
