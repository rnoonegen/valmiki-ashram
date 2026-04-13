import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import ImageUploader from '../components/admin/ImageUploader';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import useLiveContent from '../hooks/useLiveContent';

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45 },
};

const imgRamesh =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80';
const imgSwapna =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80';

export default function Founders() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/founders';
  const cms = useLiveContent('founders', {});
  const [draft, setDraft] = useState(cms);
  useEffect(() => setDraft(cms), [cms]);
  const hasUnsavedPhotoChanges =
    (draft.rameshImage || '') !== (cms.rameshImage || '') ||
    (draft.swapnaImage || '') !== (cms.swapnaImage || '');
  const rameshImage = cms.rameshImage || imgRamesh;
  const swapnaImage = cms.swapnaImage || imgSwapna;
  const displayRamesh = isAdmin ? draft.rameshImage || imgRamesh : rameshImage;
  const displaySwapna = isAdmin ? draft.swapnaImage || imgSwapna : swapnaImage;

  const save = async () => {
    await adminRequest('/api/admin/content/founders', {
      method: 'PUT',
      body: JSON.stringify({ content: draft }),
    });
  };

  return (
    <PageFade>
      <Container className="py-8 md:py-12">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="heading-page">Our Founders</h1>
          <p className="mt-4 text-prose">
            Meet the people guiding Valmiki Ashram and the Gurukulam vision.
          </p>
        </header>

        <div className="mt-14 space-y-20 md:mt-20 md:space-y-24">
          {/* Ramesh Noone — text left, image right */}
          <motion.section
            className="grid items-center gap-10 md:grid-cols-2 md:gap-14"
            {...fade}
          >
            <div className="order-2 space-y-5 md:order-1">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-emerald-100 md:text-3xl">
                Ramesh Noone
              </h2>
              <p className="text-sm font-semibold text-accent dark:text-emerald-300 md:text-base">
                Mechanical Engineer | Post Diploma in Tool Design (CITD) | Post
                Diploma in Plastics Mold Design
              </p>
              <div className="space-y-4 text-prose">
                <p>
                  With over 24 years of experience in USA and three decades of
                  overall global experience in automotive vehicle and home
                  appliance design, engineering, and Oracle R12 ERP
                  implementation, Ramesh brings a wealth of technical and
                  managerial expertise.
                </p>
                <p>
                  A dedicated scholar of Indic Knowledge Systems, he has
                  completed multiple courses from the Hindu University of
                  America and is passionately working towards reviving the
                  Sanatana Eco-System. His mission is to:
                </p>
              </div>
              <div>
                <ul className="list-disc space-y-2 pl-5 text-prose marker:text-accent dark:marker:text-emerald-500">
                  <li>
                    De-colonize Indian education by challenging Western academic
                    frameworks.
                  </li>
                  <li>
                    Revive Bharateeya Shiksha Paddhati, India&apos;s time-tested
                    traditional education system.
                  </li>
                  <li>
                    Reignite India&apos;s scientific acumen through a Shastra and
                    Samskrutham-based approach to learning.
                  </li>
                </ul>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="group relative overflow-hidden rounded-[2rem] shadow-lg ring-1 ring-black/10 dark:ring-white/10">
                <img
                  src={displayRamesh}
                  alt="Ramesh Noone"
                  className="aspect-[4/5] w-full object-cover md:aspect-[3/4]"
                />
                {isAdmin ? (
                  <div className="absolute inset-x-3 top-3 z-10 flex justify-end">
                    <ImageUploader
                      folder="founders"
                      buttonText="Change Photo"
                      onUploaded={(asset) => setDraft((p) => ({ ...p, rameshImage: asset.url }))}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </motion.section>

          {/* Swapna Makam — image left, text right */}
          <motion.section
            className="grid items-center gap-10 md:grid-cols-2 md:gap-14"
            {...fade}
          >
            <div className="group relative overflow-hidden rounded-[2rem] shadow-lg ring-1 ring-black/10 dark:ring-white/10">
              <img
                src={displaySwapna}
                alt="Swapna Makam"
                className="aspect-[4/5] w-full object-cover md:aspect-[3/4]"
              />
              {isAdmin ? (
                <div className="absolute inset-x-3 top-3 z-10 flex justify-end">
                  <ImageUploader
                    folder="founders"
                    buttonText="Change Photo"
                    onUploaded={(asset) => setDraft((p) => ({ ...p, swapnaImage: asset.url }))}
                  />
                </div>
              ) : null}
            </div>
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-emerald-100 md:text-3xl">
                Swapna Makam
              </h2>
              <p className="text-sm font-semibold text-accent dark:text-emerald-300 md:text-base">
                MS in Business Intelligence, Saint Joseph&apos;s University, USA
                | BS in Computer &amp; Electrical Engineering, University of
                Michigan-Dearborn, USA.
              </p>
              <div className="space-y-4 text-prose">
                <p>
                  With over 22 years of experience in the USA, Swapna has worked
                  as an Automotive Embedded Engineer, Business Analyst for ERP
                  implementation, and Data Migration Specialist.
                </p>
                <p>
                  A passionate educator, she has been homeschooling her child for
                  the past four years with a focus on Indic Knowledge Systems,
                  including:
                </p>
              </div>
              <div>
                <ul className="list-disc space-y-2 pl-5 text-prose marker:text-accent dark:marker:text-emerald-500">
                  <li>Ganitham (Mathematics)</li>
                  <li>Vignyanam (Science)</li>
                  <li>Ithihasa (History &amp; Epics)</li>
                  <li>Bhoogolam (Geography)</li>
                  <li>
                    Kantasthikaranam (Memorization of Sanskrit Texts —
                    Ashtadhyayi, Amarakosha, Dhatu Pata)
                  </li>
                </ul>
              </div>
              <p className="text-prose">
                She has also led a Sanskrutham-based homeschooling group in
                Bengaluru, pioneering a curriculum that integrates traditional
                Indian pedagogy with modern scientific learning.
              </p>
            </div>
          </motion.section>
        </div>
      </Container>
      {isAdmin && hasUnsavedPhotoChanges ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
              Save photo changes to the server when you are done editing.
            </p>
            <button
              type="button"
              onClick={save}
              className="w-full rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700 sm:w-auto"
            >
              Save Founder Photos
            </button>
          </div>
        </div>
      ) : null}
    </PageFade>
  );
}
