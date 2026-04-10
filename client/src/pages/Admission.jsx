import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import useLiveContent from '../hooks/useLiveContent';

export default function Admission() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/admission';
  const defaultContent = {
    title: 'Admission',
    subtitle:
      'Choose the path that fits your family: Summer Camp, Winter Camp, or Online Courses. Each option has a dedicated registration flow with program-specific details.',
    cards: [
      {
        id: 'summer-camp',
        title: 'Summer Camp',
        description:
          'A residential family camp designed to build discipline, creativity, and cultural grounding through immersive activities.',
        points: [
          'Weekly camp batches with guided routines',
          'Traditional games, yoga, arts, and storytelling',
          'Best fit for families who want a short immersive camp',
        ],
        ctaLabel: 'Register for Summer Camp',
        to: '/register/summer-camp',
      },
      {
        id: 'winter-camp',
        title: 'Winter Camp',
        description:
          'A focused winter residential camp with structured learning, physical activities, and value-based community experience.',
        points: [
          'Compact winter format for deeper engagement',
          'Balanced schedule of learning and wellness',
          'Ideal for families exploring Gurukulam-style immersion',
        ],
        ctaLabel: 'Register for Winter Camp',
        to: '/register/winter-camp',
      },
      {
        id: 'online-courses',
        title: 'Online Courses',
        description:
          'Flexible online learning options for students and parents who want guided Bharateeya learning from home.',
        points: [
          'Course-based enrollments with selectable time slots',
          'Supports families across countries and time zones',
          'Great starting point before residential programs',
        ],
        ctaLabel: 'Register for Online Courses',
        to: '/register/online-course',
      },
    ],
  };
  const cms = useLiveContent('admission', defaultContent);
  const [draft, setDraft] = useState(defaultContent);
  const [heroEditor, setHeroEditor] = useState(null);
  const [cardEditor, setCardEditor] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    setDraft({
      ...defaultContent,
      ...(cms || {}),
      cards: Array.isArray(cms?.cards) && cms.cards.length ? cms.cards : defaultContent.cards,
    });
  }, [cms]);

  const display = isAdmin ? draft : {
    ...defaultContent,
    ...(cms || {}),
    cards: Array.isArray(cms?.cards) && cms.cards.length ? cms.cards : defaultContent.cards,
  };

  const saveAdmissionContent = async (next) => {
    setDraft(next);
    await adminRequest('/api/admin/content/admission', {
      method: 'PUT',
      body: JSON.stringify({ content: next }),
    });
  };

  const openCardEditor = (index) => {
    const card = display.cards[index];
    setCardEditor(
      card
        ? {
            index,
            isNew: false,
            id: card.id || `card-${Date.now()}`,
            title: card.title || '',
            description: card.description || '',
            pointsText: Array.isArray(card.points) ? card.points.join('\n') : '',
            ctaLabel: card.ctaLabel || '',
            to: card.to || '',
          }
        : {
            index: -1,
            isNew: true,
            id: `card-${Date.now()}`,
            title: '',
            description: '',
            pointsText: '',
            ctaLabel: '',
            to: '',
          }
    );
  };

  const saveCardEditor = async () => {
    if (!cardEditor) return;
    if (!cardEditor.title.trim() || !cardEditor.ctaLabel.trim() || !cardEditor.to.trim()) {
      setStatus({ type: 'error', message: 'Card title, CTA label, and link are required.' });
      return;
    }
    const nextCards = [...(display.cards || [])];
    const nextCard = {
      id: cardEditor.id,
      title: cardEditor.title.trim(),
      description: cardEditor.description.trim(),
      points: String(cardEditor.pointsText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      ctaLabel: cardEditor.ctaLabel.trim(),
      to: cardEditor.to.trim(),
    };
    if (cardEditor.isNew) nextCards.push(nextCard);
    else nextCards[cardEditor.index] = nextCard;
    const next = { ...display, cards: nextCards };
    try {
      await saveAdmissionContent(next);
      setCardEditor(null);
      setStatus({ type: 'success', message: 'Admission card updated.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to save card.' });
    }
  };

  const deleteCard = async (index) => {
    const next = {
      ...display,
      cards: (display.cards || []).filter((_, i) => i !== index),
    };
    try {
      await saveAdmissionContent(next);
      setStatus({ type: 'success', message: 'Admission card deleted.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to delete card.' });
    }
  };

  const admissionCards = useMemo(() => display.cards || [], [display.cards]);

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <div className="flex items-start justify-between gap-3">
          <h1 className="heading-page">{display.title}</h1>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setHeroEditor({ title: display.title, subtitle: display.subtitle })}
              className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
              aria-label="Edit admission heading"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <p className="mt-4 max-w-3xl text-prose">
          {display.subtitle}
        </p>
        {isAdmin ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => openCardEditor(-1)}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Add Card
            </button>
          </div>
        ) : null}

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {admissionCards.map((card, index) => (
            <article
              key={card.id || card.title}
              className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              {isAdmin ? (
                <div className="mb-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openCardEditor(index)}
                    className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                    aria-label={`Edit ${card.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCard(index)}
                    className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    aria-label={`Delete ${card.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
              <h2 className="text-xl font-semibold text-accent dark:text-emerald-200">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-prose-muted">{card.description}</p>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-prose-muted">
                {card.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="mt-auto pt-5">
                <Link
                  to={card.to}
                  className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light dark:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                  {card.ctaLabel}
                </Link>
              </div>
            </article>
          ))}
        </section>
        {status.message ? (
          <div
            className={`fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-lg px-3 py-2 text-sm shadow-lg ${
              status.type === 'error'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            }`}
          >
            {status.message}
          </div>
        ) : null}
      </Container>
      {isAdmin && heroEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">Edit Admission Hero</h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                Title
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={heroEditor.title}
                  onChange={(e) => setHeroEditor((p) => ({ ...p, title: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Subtitle
                <textarea
                  className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={heroEditor.subtitle}
                  onChange={(e) => setHeroEditor((p) => ({ ...p, subtitle: e.target.value }))}
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  const next = { ...display, title: heroEditor.title, subtitle: heroEditor.subtitle };
                  try {
                    await saveAdmissionContent(next);
                    setHeroEditor(null);
                    setStatus({ type: 'success', message: 'Admission heading updated.' });
                  } catch (error) {
                    setStatus({ type: 'error', message: error.message || 'Unable to save heading.' });
                  }
                }}
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
      {isAdmin && cardEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {cardEditor.isNew ? 'Add' : 'Edit'} Admission Card
            </h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                Card Title
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={cardEditor.title}
                  onChange={(e) => setCardEditor((p) => ({ ...p, title: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Description
                <textarea
                  className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={cardEditor.description}
                  onChange={(e) => setCardEditor((p) => ({ ...p, description: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Points (one per line)
                <textarea
                  className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={cardEditor.pointsText}
                  onChange={(e) => setCardEditor((p) => ({ ...p, pointsText: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Button Label
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={cardEditor.ctaLabel}
                  onChange={(e) => setCardEditor((p) => ({ ...p, ctaLabel: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Button Link
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={cardEditor.to}
                  onChange={(e) => setCardEditor((p) => ({ ...p, to: e.target.value }))}
                />
              </label>
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
    </PageFade>
  );
}
