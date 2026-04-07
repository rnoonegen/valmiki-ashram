import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import Button from '../components/Button';
import Container from '../components/Container';
import VideoPlayer from '../components/VideoPlayer';

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.4 },
};

const programCards = [
  {
    title: 'Residential Gurukulam',
    body: 'Shatpatha Shiksha blending academics, IKS, and life skills.',
  },
  {
    title: 'Seasonal Camps',
    body: 'Summer & winter immersions in martial arts, robotics, yoga, and more.',
  },
  {
    title: 'Online & Weekend',
    body: 'Samskrutham, Ayurveda, astronomy, and skill workshops for all ages.',
  },
];

export default function Home() {
  const videoUrl = process.env.REACT_APP_INTRO_VIDEO_URL;

  return (
    <>
      <motion.section
        className="bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12"
        {...sectionMotion}
      >
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              className="overflow-hidden rounded-2xl border border-neutral-200 shadow-nav ring-1 ring-black/5 dark:border-neutral-700 dark:shadow-nav-dark dark:ring-white/10"
              {...fade}
            >
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
                alt="Campus preview placeholder"
                className="aspect-[4/3] w-full object-cover"
              />
            </motion.div>
            <div className="space-y-6">
              <motion.h1 className="heading-hero" {...fade}>
                Valmiki International Gurukulam Residential Family Admissions Open
                Now
              </motion.h1>
              <motion.h2 className="text-lg font-semibold text-prose md:text-xl" {...fade}>
                World&apos;s First Skill Based Technology Gurukulam
              </motion.h2>
              <motion.div className="flex flex-wrap gap-3" {...fade}>
                <Button to="/contact">Enquiry</Button>
                <Button to="/gurukulam">Learn More</Button>
              </motion.div>
              <motion.p className="text-prose-muted" {...fade}>
                Reconnect with Bharat through Samskrutham, Soil, and Stories.
              </motion.p>
              <motion.a
                href={process.env.REACT_APP_WHATSAPP_COMMUNITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="link-app inline-flex items-center gap-2"
                {...fade}
              >
                <FaWhatsapp className="h-5 w-5 shrink-0 text-[#25D366]" aria-hidden />
                Join the WhatsApp Community to stay updated
              </motion.a>
            </div>
          </div>
        </Container>
      </motion.section>

      <motion.section
        className="bg-secondary/50 py-8 dark:bg-neutral-900/60 md:py-12"
        {...sectionMotion}
      >
        <Container>
          <motion.h2 className="heading-section mb-8 text-center" {...fade}>
            Who are we?
          </motion.h2>
          <motion.div {...fade}>
            <VideoPlayer url={videoUrl} title="Who are we introductory video" />
          </motion.div>
        </Container>
      </motion.section>

      <motion.section
        className="surface-muted py-8 md:py-12"
        {...sectionMotion}
      >
        <Container>
          <motion.h2 className="heading-section mb-10 text-center" {...fade}>
            Valmiki International Gurukulam
          </motion.h2>
          <div className="grid gap-6 md:grid-cols-3">
            {programCards.map((card, index) => (
              <motion.article
                key={card.title}
                className="rounded-2xl border-2 border-accent/35 bg-secondary/90 p-6 shadow-sm dark:border-emerald-700/40 dark:bg-neutral-900 dark:shadow-nav-dark"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="mb-4 h-24 rounded-xl bg-primary/60 dark:bg-neutral-800" />
                <h3 className="heading-card">{card.title}</h3>
                <p className="mt-2 text-sm text-prose-muted">{card.body}</p>
              </motion.article>
            ))}
          </div>
        </Container>
      </motion.section>
    </>
  );
}
