import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { adminRequest } from '../admin/api';
import Button from '../components/Button';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import ImageUploader from '../components/admin/ImageUploader';
import useLiveContent from '../hooks/useLiveContent';

const defaultContent = {
  hero: {
    title: 'Online Classes',
    lead:
      'Learning beyond the classroom for all age groups. Live and guided sessions in Samskrutham and other traditional disciplines with global batch timings.',
    body:
      'At Valmiki Ashram, we believe learning does not end with school or begin with age. Whether you are 9 or 90, learning is a lifelong journey, and you are always welcome to begin.',
    extraParagraphs: [],
  },
  sections: [
    {
      key: 'time-zones',
      title: 'Time Zones',
      subtitle: '',
      intro: 'Courses available in the below time zones:',
      style: 'default',
      items: [
        { text: 'India time zone (IST)', subItems: [] },
        { text: 'USA time zone (EST / CST / PST)', subItems: [] },
        { text: 'Australia time zone', subItems: [] },
        { text: 'Europe time zone', subItems: [] },
      ],
    },
    {
      key: 'traditional-courses',
      title: 'Traditional Courses',
      subtitle: 'Traditional Disciplines',
      intro: '',
      style: 'default',
      items: [
        { text: 'Samskrutham (Sanskrit)', subItems: [] },
        { text: 'Ganitam (Leelavathi / Aryabhatiyam)', subItems: [] },
        { text: 'Itihaasa (History)', subItems: [] },
        { text: 'Astronomy', subItems: [] },
        {
          text: 'Kantasthikaranam (Memorization Techniques) from Ashtadhyayi, Amarakosha, Shabda Manjari, and Dhatu Manjari',
          subItems: [
            'Ashtadhyayi: A foundational text in Samskritam grammar, Ashtadhyayi systematically introduces students to the structure and rules of the language. Beginning with the first chapter, students gradually progress through well-structured lessons, enabling a deep understanding of linguistic principles and syntax.',
            'Amarakosha: A renowned Sanskrit thesaurus, Amarakosha enriches students vocabulary by categorizing words thematically. Memorizing its verses enhances language comprehension, making it easier to grasp synonyms, word usage, and poetic expressions.',
            'Shabdamanjari: A comprehensive guide to noun and verb forms, Shabdamanjari helps students master declensions and conjugations. By committing these grammatical structures to memory, learners develop greater fluency and confidence in Samskritam.',
          ],
        },
        {
          text: 'Mathrubhasha (Mother Tongue - Telugu/Tamil/Kannada/Malayalam/Gujarathi/Marati/Odiya/Bengali/etc..)',
          subItems: [],
        },
        { text: 'Hindi', subItems: [] },
        { text: 'English', subItems: [] },
        { text: 'Bhoogolam (Geography)', subItems: [] },
        { text: 'Shastras (Ancient Sciences)', subItems: [] },
        { text: 'Bhagavad Gita / Rama Katha', subItems: [] },
        { text: 'Contemporary Mathematics', subItems: [] },
      ],
    },
    {
      key: 'online-fitness',
      title: 'Online Fitness',
      subtitle: 'Physical & Mental Fitness',
      intro: '',
      style: 'default',
      items: [
        { text: 'Yoga', subItems: [] },
        { text: 'Ayurveda', subItems: [] },
        { text: 'Kalaripayattu (traditional martial arts)', subItems: [] },
        { text: 'Dhanurvidya (archery)', subItems: [] },
        { text: 'Ghatka (weapon-based martial arts)', subItems: [] },
        { text: 'Chess', subItems: [] },
      ],
    },
  ],
  cta: {
    title: 'Online Samskrutham Classes',
    description:
      'Our first online Samskrutham classes start from Nov 23rd, 2025. We welcome learners from all age groups.',
    extraParagraphs: [],
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Online registration form preview',
  },
};

function getSectionClass(style) {
  if (style === 'highlight') {
    return 'rounded-2xl border border-neutral-200 bg-primary/50 p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80 sm:p-8';
  }
  if (style === 'muted') {
    return 'rounded-2xl border border-neutral-200 bg-secondary/35 p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/70 sm:p-8';
  }
  return 'rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:p-8';
}

function sanitizeSections(rawSections = []) {
  if (!Array.isArray(rawSections)) return [];
  return rawSections
    .map((section, index) => ({
      key: section?.key || `section-${index + 1}`,
      title: section?.title || '',
      subtitle: section?.subtitle || '',
      intro: section?.intro || '',
      style: section?.style || 'default',
      items: Array.isArray(section?.items)
        ? section.items.map((item) => ({
            text: typeof item === 'string' ? item : item?.text || '',
            subItems: Array.isArray(item?.subItems) ? item.subItems : [],
          }))
        : [],
    }))
    .filter((section) => section.title || section.items.length);
}

function buildContentWithDefaultSections(rawContent = {}) {
  const sanitizedRaw = sanitizeSections(rawContent.sections || []);

  return {
    sections: sanitizedRaw.length ? sanitizedRaw : sanitizeSections(defaultContent.sections),
    hero: { ...defaultContent.hero, ...(rawContent.hero || {}) },
    cta: { ...defaultContent.cta, ...(rawContent.cta || {}) },
  };
}

function cloneSectionForEditor(section) {
  return {
    key: section.key || `section-${Date.now()}`,
    title: section.title || '',
    subtitle: section.subtitle || '',
    intro: section.intro || '',
    style: section.style || 'default',
    items: (section.items || []).map((item) => ({
      text: item.text || '',
      subItems: item.subItems || [],
    })),
  };
}

export default function OnlinePrograms() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/online-programs';
  const registerPath = isAdmin ? '/admin/register/online-course' : '/register/online-course';
  const cms = useLiveContent('online-programs', defaultContent);
  const [draft, setDraft] = useState(defaultContent);
  const [sectionEditor, setSectionEditor] = useState(null);
  const [heroEditor, setHeroEditor] = useState(null);
  const [ctaEditor, setCtaEditor] = useState(null);

  useEffect(() => {
    setDraft(buildContentWithDefaultSections(cms));
  }, [cms]);

  const saveOnlineProgramsContent = async (nextContent) => {
    await adminRequest('/api/admin/content/online-programs', {
      method: 'PUT',
      body: JSON.stringify({ content: nextContent }),
    });
  };

  const openHeroEditor = () => {
    setHeroEditor({
      title: display.hero?.title || defaultContent.hero.title,
      lead: display.hero?.lead || defaultContent.hero.lead,
      body: display.hero?.body || defaultContent.hero.body,
      extraParagraphs: Array.isArray(display.hero?.extraParagraphs)
        ? display.hero.extraParagraphs
        : [],
    });
  };

  const saveHero = async () => {
    if (!heroEditor) return;
    const next = {
      ...draft,
      hero: {
        title: (heroEditor.title || '').trim(),
        lead: (heroEditor.lead || '').trim(),
        body: (heroEditor.body || '').trim(),
        extraParagraphs: (heroEditor.extraParagraphs || [])
          .map((paragraph) => (paragraph || '').trim())
          .filter(Boolean),
      },
    };
    setDraft(next);
    await saveOnlineProgramsContent(next);
    setHeroEditor(null);
  };

  const openCtaEditor = () => {
    setCtaEditor({
      title: display.cta?.title || defaultContent.cta.title,
      description: display.cta?.description || defaultContent.cta.description,
      extraParagraphs: Array.isArray(display.cta?.extraParagraphs)
        ? display.cta.extraParagraphs
        : [],
    });
  };

  const saveCta = async () => {
    if (!ctaEditor) return;
    const next = {
      ...draft,
      cta: {
        title: (ctaEditor.title || '').trim(),
        description: (ctaEditor.description || '').trim(),
        extraParagraphs: (ctaEditor.extraParagraphs || [])
          .map((paragraph) => (paragraph || '').trim())
          .filter(Boolean),
        image: display.cta?.image || '',
        imageAlt: display.cta?.imageAlt || defaultContent.cta.imageAlt,
      },
    };
    setDraft(next);
    await saveOnlineProgramsContent(next);
    setCtaEditor(null);
  };

  const updateCtaImage = async (image, imageAlt = defaultContent.cta.imageAlt) => {
    const next = {
      ...draft,
      cta: {
        ...(draft.cta || {}),
        image,
        imageAlt,
      },
    };
    setDraft(next);
    await saveOnlineProgramsContent(next);
  };

  const display = isAdmin ? draft : buildContentWithDefaultSections(cms);

  const openSectionEditor = (index) => {
    const section = display.sections[index];
    if (!section) return;
    setSectionEditor({
      index,
      isNew: false,
      ...cloneSectionForEditor(section),
    });
  };

  const addSection = () => {
    setSectionEditor({
      index: -1,
      isNew: true,
      key: `section-${Date.now()}`,
      title: '',
      subtitle: '',
      intro: '',
      style: 'default',
      items: [{ text: '', subItems: [] }],
    });
  };

  const saveSection = async () => {
    if (!sectionEditor) return;
    const cleaned = cloneSectionForEditor(sectionEditor);
    cleaned.items = cleaned.items
      .map((item) => ({
        text: (item.text || '').trim(),
        subItems: (item.subItems || []).map((line) => (line || '').trim()).filter(Boolean),
      }))
      .filter((item) => item.text);

    const nextSections = [...draft.sections];
    if (sectionEditor.isNew) {
      nextSections.push(cleaned);
    } else {
      nextSections[sectionEditor.index] = cleaned;
    }

    const next = { ...draft, sections: nextSections };
    setDraft(next);
    await saveOnlineProgramsContent(next);
    setSectionEditor(null);
  };

  const deleteSection = async (index) => {
    const next = {
      ...draft,
      sections: draft.sections.filter((_, currentIndex) => currentIndex !== index),
    };
    setDraft(next);
    await saveOnlineProgramsContent(next);
  };

  return (
    <PageFade>
      <Container className="py-8 md:py-12">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:p-8">
          {isAdmin ? (
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={openHeroEditor}
                className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                aria-label="Edit hero section"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          <h1 className="heading-page">{display.hero.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-prose-muted md:text-lg">
            {display.hero.lead}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button to={registerPath} variant="primary">
              Register Now
            </Button>
            <Button to="/contact" variant="outline">
              Contact Us
            </Button>
          </div>

          <p className="mt-6 max-w-5xl text-base leading-8 text-prose md:text-lg">
            {display.hero.body}
          </p>
          {(display.hero.extraParagraphs || []).map((paragraph, index) => (
            <p
              key={`hero-extra-paragraph-${index}`}
              className="mt-4 max-w-5xl text-base leading-8 text-prose md:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </section>
      </Container>

      <Container className="pb-8 pt-0 md:pb-12 md:pt-0">
        {isAdmin ? (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-white dark:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Add Section
            </button>
          </div>
        ) : null}
        <div className="space-y-6">
          {display.sections.map((section, sectionIndex) => (
            <section key={section.key || sectionIndex} className={getSectionClass(section.style)}>
              {isAdmin ? (
                <div className="mb-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openSectionEditor(sectionIndex)}
                    className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                    aria-label={`Edit ${section.title || 'section'}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(sectionIndex)}
                    className="rounded-md bg-rose-600 p-1 text-white shadow"
                    aria-label={`Delete ${section.title || 'section'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
              <h2 className="text-2xl font-semibold text-prose">{section.title}</h2>
              {section.subtitle ? (
                <h3 className="mt-4 text-xl font-semibold text-prose">{section.subtitle}</h3>
              ) : null}
              {section.intro ? (
                <p className="mt-4 text-base font-medium text-prose">{section.intro}</p>
              ) : null}
              <ul className="mt-3 list-disc space-y-2 pl-6 text-base text-prose-muted">
                {section.items.map((item, itemIndex) => (
                  <li key={`${section.key || sectionIndex}-item-${itemIndex}`}>
                    {item.text}
                    {item.subItems?.length ? (
                      <ul className="mt-2 list-disc space-y-2 pl-6">
                        {item.subItems.map((subItem, subIndex) => (
                          <li key={`${section.key || sectionIndex}-sub-${itemIndex}-${subIndex}`}>{subItem}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="rounded-2xl border border-neutral-200 bg-primary/50 p-5 dark:border-neutral-700 dark:bg-neutral-900/80 sm:p-8">
            {isAdmin ? (
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={openCtaEditor}
                  className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                  aria-label="Edit online samskrutham section"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            ) : null}
            <h2 className="text-2xl font-semibold text-prose">{display.cta.title}</h2>
            <p className="mt-3 text-base leading-8 text-prose-muted">{display.cta.description}</p>
            {(display.cta.extraParagraphs || []).map((paragraph, index) => (
              <p
                key={`cta-extra-paragraph-${index}`}
                className="mt-3 text-base leading-8 text-prose-muted"
              >
                {paragraph}
              </p>
            ))}
            <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
              <div className="group relative">
                {display.cta.image ? (
                  <img
                    src={display.cta.image}
                    alt={display.cta.imageAlt || 'Online registration form preview'}
                    className="h-72 w-full object-cover sm:h-80 md:h-[28rem]"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="h-72 w-full bg-neutral-100 sm:h-80 md:h-[28rem] dark:bg-neutral-800" />
                )}
                {isAdmin ? (
                  <div className="absolute inset-x-2 bottom-2 flex flex-wrap justify-end gap-2">
                    <ImageUploader
                      folder="online-programs"
                      buttonText={display.cta.image ? 'Change Image' : 'Add Image'}
                      onUploaded={(asset) =>
                        updateCtaImage(
                          asset.url,
                          display.cta.imageAlt || defaultContent.cta.imageAlt
                        )
                      }
                    />
                    {display.cta.image ? (
                      <button
                        type="button"
                        onClick={() =>
                          updateCtaImage('', display.cta.imageAlt || defaultContent.cta.imageAlt)
                        }
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        Delete Image
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button to={registerPath} variant="primary">
                Register Now
              </Button>
              <Button to="/contact" variant="outline">
                Contact Us
              </Button>
            </div>
          </section>
        </div>
      </Container>

      {isAdmin && sectionEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {sectionEditor.isNew ? 'Add Online Programs Section' : 'Edit Online Programs Section'}
            </h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Section title"
                value={sectionEditor.title}
                onChange={(e) => setSectionEditor((prev) => ({ ...prev, title: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Section subtitle (optional)"
                value={sectionEditor.subtitle}
                onChange={(e) => setSectionEditor((prev) => ({ ...prev, subtitle: e.target.value }))}
              />
              <textarea
                className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Intro text (optional)"
                value={sectionEditor.intro}
                onChange={(e) => setSectionEditor((prev) => ({ ...prev, intro: e.target.value }))}
              />
              <select
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                value={sectionEditor.style}
                onChange={(e) => setSectionEditor((prev) => ({ ...prev, style: e.target.value }))}
              >
                <option value="default">Default (white)</option>
                <option value="highlight">Highlight (primary)</option>
                <option value="muted">Muted (secondary)</option>
              </select>

              <div className="space-y-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">List Items</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-2 py-1 text-xs text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                    onClick={() =>
                      setSectionEditor((prev) => ({
                        ...prev,
                        items: [...prev.items, { text: '', subItems: [] }],
                      }))
                    }
                  >
                    <Plus className="h-3 w-3" /> Add Item
                  </button>
                </div>
                {sectionEditor.items.map((item, itemIndex) => (
                  <div key={`editor-item-${itemIndex}`} className="space-y-2 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/70">
                    <div className="flex gap-2">
                      <input
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                        placeholder="Item text"
                        value={item.text}
                        onChange={(e) =>
                          setSectionEditor((prev) => {
                            const items = [...prev.items];
                            items[itemIndex] = { ...items[itemIndex], text: e.target.value };
                            return { ...prev, items };
                          })
                        }
                      />
                      <button
                        type="button"
                        className="rounded-md bg-rose-600 p-2 text-white"
                        onClick={() =>
                          setSectionEditor((prev) => ({
                            ...prev,
                            items: prev.items.filter((_, i) => i !== itemIndex),
                          }))
                        }
                        aria-label="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 rounded-lg border border-neutral-200 p-2 dark:border-neutral-700">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                          Sub Items
                        </p>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-2 py-1 text-xs text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                          onClick={() =>
                            setSectionEditor((prev) => {
                              const items = [...prev.items];
                              const nextSubItems = [...(items[itemIndex].subItems || []), ''];
                              items[itemIndex] = { ...items[itemIndex], subItems: nextSubItems };
                              return { ...prev, items };
                            })
                          }
                        >
                          <Plus className="h-3 w-3" /> Add Sub Item
                        </button>
                      </div>
                      {(item.subItems || []).map((subItem, subIndex) => (
                        <div key={`sub-item-${itemIndex}-${subIndex}`} className="flex gap-2">
                          <input
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                            placeholder="Sub item text"
                            value={subItem}
                            onChange={(e) =>
                              setSectionEditor((prev) => {
                                const items = [...prev.items];
                                const nextSubItems = [...(items[itemIndex].subItems || [])];
                                nextSubItems[subIndex] = e.target.value;
                                items[itemIndex] = { ...items[itemIndex], subItems: nextSubItems };
                                return { ...prev, items };
                              })
                            }
                          />
                          <button
                            type="button"
                            className="rounded-md bg-rose-600 p-2 text-white"
                            onClick={() =>
                              setSectionEditor((prev) => {
                                const items = [...prev.items];
                                const nextSubItems = (items[itemIndex].subItems || []).filter(
                                  (_, i) => i !== subIndex
                                );
                                items[itemIndex] = { ...items[itemIndex], subItems: nextSubItems };
                                return { ...prev, items };
                              })
                            }
                            aria-label="Delete sub item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveSection}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setSectionEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && heroEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit Online Hero Section
            </h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Heading"
                value={heroEditor.title}
                onChange={(e) => setHeroEditor((prev) => ({ ...prev, title: e.target.value }))}
              />
              <textarea
                className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Lead paragraph"
                value={heroEditor.lead}
                onChange={(e) => setHeroEditor((prev) => ({ ...prev, lead: e.target.value }))}
              />
              <textarea
                className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Second paragraph"
                value={heroEditor.body}
                onChange={(e) => setHeroEditor((prev) => ({ ...prev, body: e.target.value }))}
              />
              <div className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Additional Paragraphs
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-2 py-1 text-xs text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                    onClick={() =>
                      setHeroEditor((prev) => ({
                        ...prev,
                        extraParagraphs: [...(prev.extraParagraphs || []), ''],
                      }))
                    }
                  >
                    <Plus className="h-3 w-3" /> Add Paragraph
                  </button>
                </div>
                {(heroEditor.extraParagraphs || []).map((paragraph, index) => (
                  <div key={`hero-editor-extra-paragraph-${index}`} className="flex gap-2">
                    <textarea
                      className="h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                      placeholder={`Additional paragraph ${index + 1}`}
                      value={paragraph}
                      onChange={(e) =>
                        setHeroEditor((prev) => {
                          const nextParagraphs = [...(prev.extraParagraphs || [])];
                          nextParagraphs[index] = e.target.value;
                          return { ...prev, extraParagraphs: nextParagraphs };
                        })
                      }
                    />
                    <button
                      type="button"
                      className="rounded-md bg-rose-600 p-2 text-white"
                      onClick={() =>
                        setHeroEditor((prev) => ({
                          ...prev,
                          extraParagraphs: (prev.extraParagraphs || []).filter(
                            (_, paragraphIndex) => paragraphIndex !== index
                          ),
                        }))
                      }
                      aria-label="Delete paragraph"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveHero}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setHeroEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && ctaEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit Online Samskrutham Section
            </h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Heading"
                value={ctaEditor.title}
                onChange={(e) => setCtaEditor((prev) => ({ ...prev, title: e.target.value }))}
              />
              <textarea
                className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Paragraph"
                value={ctaEditor.description}
                onChange={(e) => setCtaEditor((prev) => ({ ...prev, description: e.target.value }))}
              />
              <div className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Additional Paragraphs
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-2 py-1 text-xs text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                    onClick={() =>
                      setCtaEditor((prev) => ({
                        ...prev,
                        extraParagraphs: [...(prev.extraParagraphs || []), ''],
                      }))
                    }
                  >
                    <Plus className="h-3 w-3" /> Add Paragraph
                  </button>
                </div>
                {(ctaEditor.extraParagraphs || []).map((paragraph, index) => (
                  <div key={`cta-editor-extra-paragraph-${index}`} className="flex gap-2">
                    <textarea
                      className="h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                      placeholder={`Additional paragraph ${index + 1}`}
                      value={paragraph}
                      onChange={(e) =>
                        setCtaEditor((prev) => {
                          const nextParagraphs = [...(prev.extraParagraphs || [])];
                          nextParagraphs[index] = e.target.value;
                          return { ...prev, extraParagraphs: nextParagraphs };
                        })
                      }
                    />
                    <button
                      type="button"
                      className="rounded-md bg-rose-600 p-2 text-white"
                      onClick={() =>
                        setCtaEditor((prev) => ({
                          ...prev,
                          extraParagraphs: (prev.extraParagraphs || []).filter(
                            (_, paragraphIndex) => paragraphIndex !== index
                          ),
                        }))
                      }
                      aria-label="Delete paragraph"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveCta}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setCtaEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageFade>
  );
}
