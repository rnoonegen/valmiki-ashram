import { motion } from 'framer-motion';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import Button from '../components/Button';
import ImageUploader from '../components/admin/ImageUploader';
import Container from '../components/Container';
import VideoPlayer from '../components/VideoPlayer';
import useLiveContent from '../hooks/useLiveContent';

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
    image:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80',
    path: '/gurukulam',
    buttonLabel: 'Explore',
  },
  {
    title: 'Seasonal Camps',
    body: 'Summer & winter immersions in martial arts, robotics, yoga, and more.',
    image:
      'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1000&q=80',
    path: '/programs',
    buttonLabel: 'View Camps',
  },
  {
    title: 'Online & Weekend',
    body: 'Samskrutham, Ayurveda, astronomy, and skill workshops for all ages.',
    image:
      'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1000&q=80',
    path: '/online-programs',
    buttonLabel: 'Join Online',
  },
];

export default function Home() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const cms = useLiveContent('home', {
    heroTitle: 'Valmiki International Gurukulam Residential Family Admissions Open Now',
    heroSubtitle: "World's First Skill Based Technology Gurukulam",
    heroImage:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    introVideoUrl: process.env.REACT_APP_INTRO_VIDEO_URL,
    programCards,
  });
  const [draft, setDraft] = useState(cms);
  const [editingField, setEditingField] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [cardEditor, setCardEditor] = useState(null);
  useEffect(() => setDraft(cms), [cms]);
  const videoUrl = cms.introVideoUrl || process.env.REACT_APP_INTRO_VIDEO_URL;
  const display = isAdmin ? draft : cms;
  const displayCards = (display.programCards?.length ? display.programCards : programCards).slice(0, 12);

  const saveHomeContent = async (nextContent) => {
    await adminRequest('/api/admin/content/home', {
      method: 'PUT',
      body: JSON.stringify({ content: nextContent }),
    });
  };

  const startEdit = (field) => {
    setEditingField(field);
    setFieldValue(draft?.[field] || '');
  };

  const saveField = async () => {
    if (!editingField) return;
    const next = { ...draft, [editingField]: fieldValue };
    setDraft(next);
    await saveHomeContent(next);
    setEditingField('');
  };

  const openCardEditor = (index) => {
    const card = displayCards[index];
    setCardEditor({
      index,
      isNew: !card,
      title: card?.title || '',
      body: card?.body || '',
      path: card?.path || '/programs',
      buttonLabel: card?.buttonLabel || 'Learn More',
      image: card?.image || '',
    });
  };

  const saveCardEditor = async () => {
    if (!cardEditor) return;
    const cards = [...displayCards];
    const payload = {
      title: cardEditor.title || 'Untitled Program',
      body: cardEditor.body || '',
      path: cardEditor.path || '/programs',
      buttonLabel: cardEditor.buttonLabel || 'Learn More',
      image: cardEditor.image || '',
    };
    if (cardEditor.isNew) {
      cards.push(payload);
    } else {
      cards[cardEditor.index] = payload;
    }
    const next = { ...draft, programCards: cards };
    setDraft(next);
    await saveHomeContent(next);
    setCardEditor(null);
  };

  const deleteCard = async (index) => {
    const cards = displayCards.filter((_, i) => i !== index);
    const next = { ...draft, programCards: cards };
    setDraft(next);
    await saveHomeContent(next);
  };

  return (
    <>
      <motion.section
        className="bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12"
        {...sectionMotion}
      >
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-neutral-200 shadow-nav ring-1 ring-black/5 dark:border-neutral-700 dark:shadow-nav-dark dark:ring-white/10"
              {...fade}
            >
              <img
                src={display.heroImage}
                alt="Campus preview placeholder"
                className="aspect-[4/3] w-full object-cover"
              />
              {isAdmin ? (
                <div className="absolute inset-x-3 top-3 z-10 flex justify-end">
                  <ImageUploader
                    folder="home"
                    buttonText="Change Image"
                    onUploaded={(asset) => setDraft((p) => ({ ...p, heroImage: asset.url }))}
                  />
                </div>
              ) : null}
            </motion.div>
            <div className="space-y-6">
              <motion.div className="flex items-start gap-2" {...fade}>
                <motion.h1 className="heading-hero">{display.heroTitle}</motion.h1>
                {isAdmin ? (
                  <button
                    type="button"
                    aria-label="Edit hero title"
                    className="mt-1 rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                    onClick={() => startEdit('heroTitle')}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : null}
              </motion.div>
              <motion.div className="flex items-start gap-2" {...fade}>
                <motion.h2 className="text-lg font-semibold text-prose md:text-xl">
                  {display.heroSubtitle}
                </motion.h2>
                {isAdmin ? (
                  <button
                    type="button"
                    aria-label="Edit hero subtitle"
                    className="mt-1 rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                    onClick={() => startEdit('heroSubtitle')}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : null}
              </motion.div>
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
          <motion.div className="mb-8 flex items-center justify-center gap-2" {...fade}>
            <motion.h2 className="heading-section text-center">Who are we?</motion.h2>
            {isAdmin ? (
              <button
                type="button"
                aria-label="Edit intro video URL"
                className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                onClick={() => startEdit('introVideoUrl')}
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
          </motion.div>
          <motion.div {...fade}>
            <VideoPlayer
              url={(isAdmin ? draft.introVideoUrl : videoUrl) || videoUrl}
              title="Who are we introductory video"
            />
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
          {isAdmin ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => openCardEditor()}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Card
              </button>
            </div>
          ) : null}
          <div className="grid gap-6 md:grid-cols-3">
            {displayCards.map((card, index) => (
              <motion.article
                key={`${card.title}-${index}`}
                className="relative rounded-2xl border-2 border-accent/35 bg-secondary/90 p-6 shadow-sm dark:border-emerald-700/40 dark:bg-neutral-900 dark:shadow-nav-dark"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
              >
                {isAdmin ? (
                  <div className="absolute right-3 top-3 z-10 flex gap-1">
                    <button
                      type="button"
                      onClick={() => openCardEditor(index)}
                      className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                      aria-label="Edit program card"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCard(index)}
                      className="rounded-md bg-rose-600 p-1 text-white shadow"
                      aria-label="Delete program card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
                <div className="group/image relative mb-4 overflow-hidden rounded-xl">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-24 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-24 rounded-xl bg-primary/60 dark:bg-neutral-800" />
                  )}
                  {isAdmin ? (
                    <div className="absolute inset-x-2 bottom-2 flex justify-end">
                      <ImageUploader
                        folder="home"
                        buttonText={card.image ? 'Change Image' : 'Add Image'}
                        onUploaded={(asset) =>
                          setDraft((p) => {
                            const cards = [...(p.programCards?.length ? p.programCards : displayCards)];
                            cards[index] = { ...cards[index], image: asset.url };
                            const next = { ...p, programCards: cards };
                            saveHomeContent(next);
                            return next;
                          })
                        }
                      />
                    </div>
                  ) : null}
                </div>
                <h3 className="heading-card">{card.title}</h3>
                <p className="mt-2 text-sm text-prose-muted">{card.body}</p>
                {card.path ? (
                  <Button to={card.path} className="mt-4">
                    {card.buttonLabel || 'Learn More'}
                  </Button>
                ) : null}
              </motion.article>
            ))}
          </div>
        </Container>
      </motion.section>
      {isAdmin && cardEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {cardEditor.isNew ? 'Add Program Card' : 'Edit Program Card'}
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Card Image
                </p>
                {cardEditor.image ? (
                  <img
                    src={cardEditor.image}
                    alt={cardEditor.title || 'Program card preview'}
                    className="mb-2 h-28 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-2 h-28 w-full rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                )}
                <ImageUploader
                  folder="home"
                  buttonText={cardEditor.image ? 'Change Image' : 'Add Image'}
                  onUploaded={(asset) => setCardEditor((p) => ({ ...p, image: asset.url }))}
                />
              </div>
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                placeholder="Title"
                value={cardEditor.title}
                onChange={(e) => setCardEditor((p) => ({ ...p, title: e.target.value }))}
              />
              <textarea
                className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                placeholder="Description"
                value={cardEditor.body}
                onChange={(e) => setCardEditor((p) => ({ ...p, body: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                placeholder="Route path (e.g. /gurukulam)"
                value={cardEditor.path}
                onChange={(e) => setCardEditor((p) => ({ ...p, path: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                placeholder="Button label"
                value={cardEditor.buttonLabel}
                onChange={(e) => setCardEditor((p) => ({ ...p, buttonLabel: e.target.value }))}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveCardEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setCardEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isAdmin && editingField ? (
        <div className="fixed bottom-20 left-4 z-40 w-[min(92vw,520px)] rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
          <p className="mb-2 text-sm font-semibold text-accent dark:text-emerald-200">
            Edit {editingField === 'introVideoUrl' ? 'Intro Video URL' : editingField === 'heroTitle' ? 'Hero Title' : 'Hero Subtitle'}
          </p>
          <textarea
            className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={saveField}
              className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
            >
              <Save className="h-4 w-4" /> Save
            </button>
            <button
              type="button"
              onClick={() => setEditingField('')}
              className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
