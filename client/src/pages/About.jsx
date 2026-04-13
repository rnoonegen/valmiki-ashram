import { BookOpen, Building2, Flower2, Leaf, Orbit, Pencil, Sparkles, Target, Trash2, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import Button from '../components/Button';
import ImageUploader from '../components/admin/ImageUploader';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import useLiveContent from '../hooks/useLiveContent';

const founderImg =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80';
const founderImg2 =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80';

const iconMap = { BookOpen, Flower2, Orbit, Users, Building2, Leaf, Sparkles, Target };
const iconNames = Object.keys(iconMap);

const defaultContent = {
  introLabel: 'About Valmiki Ashram',
  introTitle: 'Rooted in tradition, designed for the future',
  foundersTitle: 'Our Founders',
  foundersSubtitle: 'Visionaries reviving Bharateeya wisdom with a practical, future-ready model of learning.',
  foundersDescription:
    "The founders of Valmiki Ashram are dedicated to reviving India's rich educational heritage by integrating ancient Indic wisdom with modern learning, creating a transformative Samskrutham immersion Gurukulam.",
  foundersNote: 'Discover their full journey, mission, and educational philosophy on the dedicated founders page.',
  foundersButtonLabel: 'Read more',
  foundersButtonLink: '/founders',
  aboutHighlights: [
    { id: 'h1', icon: 'Sparkles', title: 'What is Valmiki Ashram?', body: "Located near BITS Pilani-Hyderabad Campus, Valmiki Ashram is a one-of-a-kind Residential Family Gurukulam dedicated to reviving the Bharateeya Shiksha Paddhati (Indian Education System) and reclaiming India's rich scientific and intellectual heritage through a Holistic, De-Colonized approach to Education." },
    { id: 'h2', icon: 'Target', title: 'What do we do?', body: 'We are dedicated to reviving the Bharateeya education system through a decolonized Indian curriculum that nurtures students from Pre-School to 12th Grade. By seamlessly integrating traditional knowledge with modern advancements, the Prathishtan shapes future thought leaders, entrepreneurs, and innovators who remain deeply rooted in their cultural heritage while excelling in a rapidly evolving world.' },
    { id: 'h3', icon: 'Flower2', title: "Why are we called 'Valmiki Ashram'?", body: "Sri Rama dedicated 40 years to mastering various vidyas (sciences and arts) under the guidance of multiple gurus. In contrast, Lava and Kusha, mentored by Sage Valmiki, attained proficiency in all vidyas within just 12 years. Despite their shorter training period, they demonstrated exceptional prowess, defeating formidable warriors like Lakshmana, Bharata, Shatrughna, and Hanuman. Furthermore, it was within the sacred Valmiki Ashram that Sage Valmiki composed the Ramayana, immortalizing the epic journey and legacy of Sri Rama." },
  ],
  whyTitle: 'Why Choose Us?',
  whyCards: [
    { id: 'w1', icon: 'BookOpen', title: 'Ancient Wisdom', text: 'Learn ancient arts and traditions in an engaging and interactive environment.' },
    { id: 'w2', icon: 'Flower2', title: 'Cultural Immersion', text: 'The camp provides a unique opportunity to dive deep into Indian traditions, heritage, culture, itihaasa, and spirituality.' },
    { id: 'w3', icon: 'Orbit', title: 'Decolonized Education', text: 'Understand the true foundations of Math, Science, and original History.' },
    { id: 'w4', icon: 'Users', title: 'Internships', text: 'Provide internship opportunities from 8th grade onwards, fostering practical learning through hands-on experience in alignment with the true spirit of NEP 2020, and equipping the next generation of entrepreneurs with real-world skills.' },
    { id: 'w5', icon: 'Building2', title: 'Luxury Living in Forest Setting', text: 'Live and learn in harmony with nature while enjoying modern conveniences, just moments from the city.' },
    { id: 'w6', icon: 'Orbit', title: 'Suitable for NRIs returning to Bharat', text: 'Ideal for NRIs returning to Bharat, offering a seamless transition with a culturally immersive and academically enriching environment.' },
    { id: 'w7', icon: 'Leaf', title: 'Organic Living', text: 'Enjoy organic milk from desi cows, freshly grown organic vegetables, and a thriving food forest, embracing a healthy lifestyle in harmony with nature.' },
    { id: 'w8', icon: 'BookOpen', title: 'Samskrutham Expert', text: 'Children can attain profound proficiency in Samskrutham, paving the way to becoming scholars and conducting in-depth research on ancient scriptures.' },
  ],
};

const normalize = (content = {}) => ({
  ...defaultContent,
  ...content,
  aboutHighlights: Array.isArray(content.aboutHighlights) && content.aboutHighlights.length ? content.aboutHighlights : defaultContent.aboutHighlights,
  whyCards: Array.isArray(content.whyCards) && content.whyCards.length ? content.whyCards : defaultContent.whyCards,
});

export default function About() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/about';
  const cms = useLiveContent('about', defaultContent);
  const normalized = useMemo(() => normalize(cms), [cms]);
  const [draft, setDraft] = useState(normalized);
  const [editor, setEditor] = useState(null);
  useEffect(() => setDraft(normalized), [normalized]);
  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(normalized);
  const display = isAdmin ? draft : normalized;
  const displayOne = display.founderImage1 || founderImg;
  const displayTwo = display.founderImage2 || founderImg2;

  const save = async () => {
    await adminRequest('/api/admin/content/about', {
      method: 'PUT',
      body: JSON.stringify({ content: draft }),
    });
  };

  const applyEditor = () => {
    if (!editor) return;
    setDraft((prev) => {
      if (editor.type === 'intro') return { ...prev, introLabel: editor.introLabel, introTitle: editor.introTitle };
      if (editor.type === 'founders') {
        return {
          ...prev,
          foundersTitle: editor.foundersTitle,
          foundersSubtitle: editor.foundersSubtitle,
          founder1Name: editor.founder1Name,
          founder2Name: editor.founder2Name,
          foundersDescription: editor.foundersDescription,
          foundersNote: editor.foundersNote,
          foundersButtonLabel: editor.foundersButtonLabel,
          foundersButtonLink: editor.foundersButtonLink,
        };
      }
      if (editor.type === 'whyTitle') return { ...prev, whyTitle: editor.whyTitle };
      if (editor.type === 'highlight') {
        const next = [...prev.aboutHighlights];
        next[editor.index] = { ...next[editor.index], icon: editor.icon, title: editor.title, body: editor.body };
        return { ...prev, aboutHighlights: next };
      }
      if (editor.type === 'whyCard') {
        const next = [...prev.whyCards];
        next[editor.index] = { ...next[editor.index], icon: editor.icon, title: editor.title, text: editor.text };
        return { ...prev, whyCards: next };
      }
      return prev;
    });
    setEditor(null);
  };

  return (
    <PageFade>
      <h1 className="sr-only">About Valmiki Ashram</h1>
      <section className="border-y border-neutral-200 bg-secondary/30 py-8 dark:border-neutral-700 dark:bg-neutral-950 md:py-12">
        <Container>
          <div className="mb-8">
            {isAdmin ? (
              <button type="button" onClick={() => setEditor({ type: 'intro', introLabel: display.introLabel, introTitle: display.introTitle })} className="mb-2 rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200">
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent/80 dark:text-emerald-300/80">
              {display.introLabel}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-accent dark:text-emerald-200 md:text-3xl">
              {display.introTitle}
            </h2>
          </div>
          <div className="grid gap-5 md:gap-6">
            {display.aboutHighlights.map((item, i) => {
              const Icon = iconMap[item.icon] || Sparkles;
              return (
              <article
                key={item.id || item.title}
                className={`overflow-hidden rounded-2xl border p-6 shadow-sm ring-1 md:p-8 ${
                  i % 2 === 0
                    ? 'border-primary-muted/70 bg-primary/25 ring-primary-muted/25 dark:border-emerald-800/50 dark:bg-emerald-950/25 dark:ring-emerald-800/20'
                    : 'border-neutral-200 bg-white ring-black/5 dark:border-neutral-700 dark:bg-neutral-900 dark:ring-white/10'
                }`}
              >
                {isAdmin ? (
                  <div className="mb-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setEditor({ type: 'highlight', index: i, icon: item.icon, title: item.title, body: item.body })} className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDraft((p) => ({ ...p, aboutHighlights: p.aboutHighlights.filter((_, idx) => idx !== i) }))} className="rounded-md bg-rose-100 p-1 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary-muted/60 bg-white/70 text-accent dark:border-emerald-800/50 dark:bg-neutral-900/80 dark:text-emerald-200">
                      <Icon className="h-6 w-6" strokeWidth={1.9} />
                    </div>
                    <h2 className="text-2xl font-bold leading-tight text-accent dark:text-emerald-200 md:text-3xl">
                      {item.title}
                    </h2>
                  </div>
                  <p className="text-base leading-relaxed text-neutral-800 dark:text-neutral-200 md:text-[1.03rem]">
                    {item.body}
                  </p>
                </div>
              </article>
            )})}
            {isAdmin ? (
              <button type="button" onClick={() => setDraft((p) => ({ ...p, aboutHighlights: [...p.aboutHighlights, { id: `h-${Date.now()}`, icon: 'Sparkles', title: 'New highlight', body: 'Update this text.' }] }))} className="rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
                + Add Highlight Card
              </button>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="border-b border-neutral-200 bg-secondary/45 py-8 dark:border-neutral-700 dark:bg-neutral-900/55 md:py-12">
        <Container>
          {isAdmin ? (
            <button type="button" onClick={() => setEditor({ type: 'founders', foundersTitle: display.foundersTitle, foundersSubtitle: display.foundersSubtitle, founder1Name: display.founder1Name, founder2Name: display.founder2Name, foundersDescription: display.foundersDescription, foundersNote: display.foundersNote, foundersButtonLabel: display.foundersButtonLabel, foundersButtonLink: display.foundersButtonLink })} className="mb-2 rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200">
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
          <h2 className="heading-section mb-4 text-center">{display.foundersTitle}</h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-prose">{display.foundersSubtitle}</p>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:p-7">
            <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:max-w-xl lg:max-w-none">
              <figure className="group relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm dark:border-neutral-700">
                <img
                  src={displayOne}
                  alt="Sri Ramesh Kumar"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {isAdmin ? (
                  <div className="absolute inset-x-2 top-2 z-10 flex justify-end">
                    <ImageUploader
                      folder="about"
                      buttonText="Change"
                      onUploaded={(asset) => setDraft((p) => ({ ...p, founderImage1: asset.url }))}
                    />
                  </div>
                ) : null}
                <figcaption className="bg-white/90 px-3 py-2 text-center text-sm font-medium text-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-100">
                  {display.founder1Name}
                </figcaption>
              </figure>
              <figure className="group relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm dark:border-neutral-700">
                <img
                  src={displayTwo}
                  alt="Srimathi Swapna"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {isAdmin ? (
                  <div className="absolute inset-x-2 top-2 z-10 flex justify-end">
                    <ImageUploader
                      folder="about"
                      buttonText="Change"
                      onUploaded={(asset) => setDraft((p) => ({ ...p, founderImage2: asset.url }))}
                    />
                  </div>
                ) : null}
                <figcaption className="bg-white/90 px-3 py-2 text-center text-sm font-medium text-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-100">
                  {display.founder2Name}
                </figcaption>
              </figure>
              </div>
              <div className="flex max-w-xl flex-col gap-6 lg:max-w-md">
                <p className="text-prose leading-relaxed">{display.foundersDescription}</p>
                <div className="rounded-xl border border-neutral-200 bg-secondary/50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <p className="text-sm leading-relaxed text-prose-muted">{display.foundersNote}</p>
                </div>
                <Button to={display.foundersButtonLink || '/founders'} className="w-fit rounded-full px-6">
                  {display.foundersButtonLabel || 'Read more'}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="mt-3 bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12">
        <Container>
          {isAdmin ? (
            <button type="button" onClick={() => setEditor({ type: 'whyTitle', whyTitle: display.whyTitle })} className="mb-2 rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200">
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
          <h2 className="heading-section mb-10 text-center">{display.whyTitle}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {display.whyCards.map((card, i) => {
              const Icon = iconMap[card.icon] || BookOpen;
              return (
              <article
                key={card.id || card.title}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80"
              >
                {isAdmin ? (
                  <div className="mb-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setEditor({ type: 'whyCard', index: i, icon: card.icon, title: card.title, text: card.text })} className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDraft((p) => ({ ...p, whyCards: p.whyCards.filter((_, idx) => idx !== i) }))} className="rounded-md bg-rose-100 p-1 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/50 text-accent dark:bg-emerald-950/60 dark:text-emerald-200">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-prose-muted">
                  {card.text}
                </p>
              </article>
            )})}
            {isAdmin ? (
              <button type="button" onClick={() => setDraft((p) => ({ ...p, whyCards: [...p.whyCards, { id: `w-${Date.now()}`, icon: 'BookOpen', title: 'New card', text: 'Update this text.' }] }))} className="rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
                + Add Why Card
              </button>
            ) : null}
          </div>
        </Container>
      </section>
      {editor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Edit Content</h3>
              <button type="button" onClick={() => setEditor(null)} className="rounded-md p-1 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            {editor.type === 'intro' ? (
              <div className="space-y-3">
                <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.introLabel} onChange={(e) => setEditor((p) => ({ ...p, introLabel: e.target.value }))} />
                <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.introTitle} onChange={(e) => setEditor((p) => ({ ...p, introTitle: e.target.value }))} />
              </div>
            ) : null}
            {editor.type === 'founders' ? (
              <div className="space-y-2">
                <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.foundersTitle} onChange={(e) => setEditor((p) => ({ ...p, foundersTitle: e.target.value }))} />
                <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.foundersSubtitle} onChange={(e) => setEditor((p) => ({ ...p, foundersSubtitle: e.target.value }))} />
                <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.founder1Name} onChange={(e) => setEditor((p) => ({ ...p, founder1Name: e.target.value }))} />
                <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.founder2Name} onChange={(e) => setEditor((p) => ({ ...p, founder2Name: e.target.value }))} />
                <textarea className="h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.foundersDescription} onChange={(e) => setEditor((p) => ({ ...p, foundersDescription: e.target.value }))} />
                <textarea className="h-16 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.foundersNote} onChange={(e) => setEditor((p) => ({ ...p, foundersNote: e.target.value }))} />
                <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.foundersButtonLabel} onChange={(e) => setEditor((p) => ({ ...p, foundersButtonLabel: e.target.value }))} />
                <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.foundersButtonLink} onChange={(e) => setEditor((p) => ({ ...p, foundersButtonLink: e.target.value }))} />
              </div>
            ) : null}
            {(editor.type === 'highlight' || editor.type === 'whyCard') ? (
              <div className="space-y-3">
                <select className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.icon} onChange={(e) => setEditor((p) => ({ ...p, icon: e.target.value }))}>
                  {iconNames.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
                <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.title} onChange={(e) => setEditor((p) => ({ ...p, title: e.target.value }))} />
                <textarea className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.body ?? editor.text} onChange={(e) => setEditor((p) => ({ ...p, [editor.type === 'highlight' ? 'body' : 'text']: e.target.value }))} />
              </div>
            ) : null}
            {editor.type === 'whyTitle' ? (
              <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" value={editor.whyTitle} onChange={(e) => setEditor((p) => ({ ...p, whyTitle: e.target.value }))} />
            ) : null}
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={applyEditor} className="rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700">Apply</button>
              <button type="button" onClick={() => setEditor(null)} className="rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100">Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
      {isAdmin && hasUnsavedChanges ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
              Save page changes to the server when you are done editing.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={save} className="w-full rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700 sm:w-auto">Save Changes</button>
              <button type="button" onClick={() => setDraft(normalized)} className="w-full rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100 sm:w-auto">Reset</button>
            </div>
          </div>
        </div>
      ) : null}
    </PageFade>
  );
}
