import { ArrowDown, ArrowUp, Briefcase, ChevronDown, Dumbbell, Leaf, Palette, Plus, Save, ScrollText, Sprout, Trash2, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import { defaultCurriculum } from '../data/defaultCurriculum';
import useLiveCurriculum from '../hooks/useLiveCurriculum';

function move(arr, from, to) {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const categoryTones = [
  'border-emerald-200 bg-emerald-50 dark:border-emerald-800/55 dark:bg-emerald-950/25',
  'border-sky-200 bg-sky-50 dark:border-sky-800/55 dark:bg-sky-950/20',
  'border-amber-200 bg-amber-50 dark:border-amber-800/55 dark:bg-amber-950/20',
  'border-rose-200 bg-rose-50 dark:border-rose-800/55 dark:bg-rose-950/20',
  'border-violet-200 bg-violet-50 dark:border-violet-800/55 dark:bg-violet-950/20',
  'border-teal-200 bg-teal-50 dark:border-teal-800/55 dark:bg-teal-950/20',
];

const categoryLeftBorders = [
  'border-l-8 border-l-emerald-400 dark:border-l-emerald-500',
  'border-l-8 border-l-sky-400 dark:border-l-sky-500',
  'border-l-8 border-l-amber-400 dark:border-l-amber-500',
  'border-l-8 border-l-rose-400 dark:border-l-rose-500',
  'border-l-8 border-l-violet-400 dark:border-l-violet-500',
  'border-l-8 border-l-teal-400 dark:border-l-teal-500',
];

const subjectTones = [
  'border-emerald-200/80 bg-white/90 dark:border-emerald-900/60 dark:bg-neutral-900/70',
  'border-sky-200/80 bg-white/90 dark:border-sky-900/60 dark:bg-neutral-900/70',
  'border-amber-200/80 bg-white/90 dark:border-amber-900/60 dark:bg-neutral-900/70',
  'border-rose-200/80 bg-white/90 dark:border-rose-900/60 dark:bg-neutral-900/70',
  'border-violet-200/80 bg-white/90 dark:border-violet-900/60 dark:bg-neutral-900/70',
  'border-teal-200/80 bg-white/90 dark:border-teal-900/60 dark:bg-neutral-900/70',
];

const categoryIcons = [ScrollText, Leaf, Dumbbell, Palette, Sprout, Briefcase];

function normalizeCurriculum(list = []) {
  return (Array.isArray(list) ? list : []).map((category) => ({
    title: category?.title || '',
    description: category?.description || '',
    subjects: (Array.isArray(category?.subjects) ? category.subjects : []).map((subject) => ({
      title: subject?.title || '',
      children: (Array.isArray(subject?.children) ? subject.children : []).map((child) => ({
        title: child?.title || '',
      })),
    })),
  }));
}

export default function Curriculum() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/curriculum';
  const liveCategories = useLiveCurriculum();
  const categories = useMemo(
    () => (Array.isArray(liveCategories) && liveCategories.length ? liveCategories : defaultCurriculum),
    [liveCategories]
  );
  const [draft, setDraft] = useState(categories);
  const [openIndexes, setOpenIndexes] = useState([0]);
  const toggleOpen = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [hasLocalEdits, setHasLocalEdits] = useState(false);
  const normalizedDraft = useMemo(() => JSON.stringify(normalizeCurriculum(draft)), [draft]);
  const normalizedCategories = useMemo(
    () => JSON.stringify(normalizeCurriculum(categories)),
    [categories]
  );
  const isDirty = useMemo(
    () => isAdmin && normalizedDraft !== normalizedCategories,
    [isAdmin, normalizedDraft, normalizedCategories]
  );

  const working = isAdmin ? draft : categories;

  useEffect(() => {
    if (!isAdmin) return;
    if (!hasLocalEdits) {
      setDraft(categories);
    }
  }, [categories, hasLocalEdits, isAdmin]);

  useEffect(() => {
    if (!isAdmin || saving) return;
    if (hasLocalEdits && isDirty) {
      setStatus('Unsaved changes');
    } else if (status === 'Unsaved changes') {
      setStatus('');
    }
  }, [isAdmin, isDirty, hasLocalEdits, saving, status]);

  const persist = (next) => {
    setDraft(next);
    if (isAdmin) setHasLocalEdits(true);
  };

  const saveChanges = async () => {
    if (!isAdmin || !isDirty) return;
    try {
      setSaving(true);
      await adminRequest('/api/curriculum/admin', {
        method: 'PUT',
        body: JSON.stringify({ categories: draft }),
      });
      setHasLocalEdits(false);
      setStatus('Saved');
      setTimeout(() => setStatus(''), 1500);
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setDraft(categories);
    setHasLocalEdits(false);
    setStatus('Changes discarded');
    setTimeout(() => setStatus(''), 1200);
  };

  const addCategory = () => persist([...working, { title: 'New Category', description: '', subjects: [] }]);
  const updateCategory = (index, patch) =>
    persist(working.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  const deleteCategory = (index) => persist(working.filter((_, i) => i !== index));
  const reorderCategory = (index, dir) => {
    const to = index + dir;
    if (to < 0 || to >= working.length) return;
    persist(move(working, index, to));
  };

  const addSubject = (catIndex) =>
    {
      const nextSubjectIndex = (working?.[catIndex]?.subjects || []).length;
      const next = working.map((c, i) =>
        i === catIndex
          ? { ...c, subjects: [...(c.subjects || []), { title: 'New Subject', children: [] }] }
          : c
      );
      persist(next);
      if (!openIndexes.includes(catIndex)) {
        setOpenIndexes((prev) => [...prev, catIndex]);
      }
      setTimeout(() => {
        const el = document.querySelector(
          `[data-subject-input="${catIndex}-${nextSubjectIndex}"]`
        );
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 80);
    };
  const updateSubject = (catIndex, subIndex, patch) =>
    persist(
      working.map((c, i) => {
        if (i !== catIndex) return c;
        return {
          ...c,
          subjects: (c.subjects || []).map((s, si) => (si === subIndex ? { ...s, ...patch } : s)),
        };
      })
    );
  const deleteSubject = (catIndex, subIndex) =>
    persist(
      working.map((c, i) => {
        if (i !== catIndex) return c;
        return { ...c, subjects: (c.subjects || []).filter((_, si) => si !== subIndex) };
      })
    );
  const addChild = (catIndex, subIndex) =>
    persist(
      working.map((c, i) => {
        if (i !== catIndex) return c;
        return {
          ...c,
          subjects: (c.subjects || []).map((s, si) =>
            si === subIndex ? { ...s, children: [...(s.children || []), { title: 'New Sub-topic' }] } : s
          ),
        };
      })
    );
  const updateChild = (catIndex, subIndex, childIndex, title) =>
    persist(
      working.map((c, i) => {
        if (i !== catIndex) return c;
        return {
          ...c,
          subjects: (c.subjects || []).map((s, si) => {
            if (si !== subIndex) return s;
            return {
              ...s,
              children: (s.children || []).map((ch, ci) => (ci === childIndex ? { ...ch, title } : ch)),
            };
          }),
        };
      })
    );
  const deleteChild = (catIndex, subIndex, childIndex) =>
    persist(
      working.map((c, i) => {
        if (i !== catIndex) return c;
        return {
          ...c,
          subjects: (c.subjects || []).map((s, si) =>
            si === subIndex ? { ...s, children: (s.children || []).filter((_, ci) => ci !== childIndex) } : s
          ),
        };
      })
    );

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="heading-page">Curriculum</h1>
            <p className="mt-3 max-w-3xl text-prose">
              Structured learning across academics, IKS, physical fitness, arts, nature, and life skills.
            </p>
            {!isAdmin ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-theme bg-white/80 px-3 py-1 text-xs font-medium text-prose-muted dark:bg-neutral-900/80">
                  {working.length} Categories
                </span>
                <span className="rounded-full border border-theme bg-white/80 px-3 py-1 text-xs font-medium text-prose-muted dark:bg-neutral-900/80">
                  {(working || []).reduce((acc, c) => acc + (c.subjects?.length || 0), 0)} Subjects
                </span>
              </div>
            ) : null}
          </div>
          {isAdmin ? (
            <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
              <span
                className={`inline-flex min-h-6 min-w-[120px] items-center text-sm ${
                  status
                    ? isDirty
                      ? 'text-amber-600 dark:text-amber-300'
                      : 'text-emerald-600 dark:text-emerald-300'
                    : 'text-transparent'
                }`}
                aria-live="polite"
              >
                {status || 'Status'}
              </span>
              <button
                type="button"
                onClick={discardChanges}
                disabled={!isDirty || saving}
                className="inline-flex items-center gap-1 rounded-lg border border-theme bg-white px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <Undo2 className="h-4 w-4" /> Discard
              </button>
              <button
                type="button"
                onClick={saveChanges}
                disabled={!isDirty || saving}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Category
              </button>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          {working.map((category, i) => (
            (() => {
              const Icon = categoryIcons[i % categoryIcons.length];
              return (
            <section
              key={`${category.title}-${i}`}
              className={`overflow-hidden rounded-2xl border shadow-sm ring-1 ring-black/5 dark:ring-white/5 ${categoryTones[i % categoryTones.length]}`}
            >
              <button
                type="button"
                onClick={() => toggleOpen(i)}
                className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left ${
                  'backdrop-blur-sm'
                } ${categoryLeftBorders[i % categoryLeftBorders.length]}`}
              >
                <div className="flex items-start gap-3">
                  {!isAdmin ? (
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/75 text-accent ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-emerald-200 dark:ring-white/10">
                      <Icon className="h-5 w-5" />
                    </div>
                  ) : null}
                  <div>
                    <h2 className="heading-card text-xl">{category.title}</h2>
                    {!isAdmin ? (
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-prose-muted">
                        {(category.subjects || []).length} subjects
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="ml-auto">
                  {!isAdmin && category.description ? (
                    <p className="mt-1 text-sm text-prose-muted">{category.description}</p>
                  ) : null}
                </div>
                <ChevronDown className={`h-5 w-5 text-accent transition-transform dark:text-emerald-300 ${openIndexes.includes(i) ? 'rotate-180' : ''}`} />
              </button>

              {isAdmin ? (
                <div className="border-t border-theme px-5 py-3">
                  <div className="flex flex-col gap-2">
                  <input
                    className="min-w-[220px] flex-1 rounded-lg border border-theme bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={category.title}
                    onChange={(e) => updateCategory(i, { title: e.target.value })}
                    placeholder="Category title"
                  />
                  <input
                    className="min-w-[220px] flex-1 rounded-lg border border-theme bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={category.description || ''}
                    onChange={(e) => updateCategory(i, { description: e.target.value })}
                    placeholder="Optional category description"
                  />
                  </div>
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => reorderCategory(i, -1)}
                      disabled={i === 0}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-200/80 bg-neutral-100 px-2 py-1 text-xs text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:disabled:border-neutral-700 dark:disabled:bg-neutral-900/90 dark:disabled:text-neutral-500 dark:disabled:opacity-100"
                    >
                      <ArrowUp className="h-3.5 w-3.5 shrink-0" /> Up
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderCategory(i, 1)}
                      disabled={i === working.length - 1}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-200/80 bg-neutral-100 px-2 py-1 text-xs text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:disabled:border-neutral-700 dark:disabled:bg-neutral-900/90 dark:disabled:text-neutral-500 dark:disabled:opacity-100"
                    >
                      <ArrowDown className="h-3.5 w-3.5 shrink-0" /> Down
                    </button>
                    <button type="button" onClick={() => addSubject(i)} className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"><Plus className="h-3.5 w-3.5" />Subject</button>
                    <button type="button" onClick={() => deleteCategory(i)} className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-1 text-xs text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                  </div>
                </div>
              ) : null}

              {openIndexes.includes(i) ? (
                <div className="border-t border-theme px-5 py-4">
                  <ul className={isAdmin ? 'space-y-3' : 'grid gap-3 md:grid-cols-2'}>
                    {(category.subjects || []).map((subject, si) => (
                      <li
                        key={`${subject.title}-${si}`}
                        className={`rounded-xl border p-3 ${
                          subjectTones[i % subjectTones.length]
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {isAdmin ? (
                            <input
                              className="w-full rounded-lg border border-theme bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-500 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                              value={subject.title}
                              onChange={(e) => updateSubject(i, si, { title: e.target.value })}
                              data-subject-input={`${i}-${si}`}
                            />
                          ) : (
                            <div>
                              <p className="font-semibold text-neutral-900 dark:text-neutral-100">{subject.title}</p>
                              {(subject.children || []).length ? (
                                <p className="mt-1 text-xs text-prose-muted">{subject.children.length} sub-topics</p>
                              ) : null}
                            </div>
                          )}
                          {isAdmin ? (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => addChild(i, si)}
                                className="whitespace-nowrap rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              >
                                + Sub
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSubject(i, si)}
                                className="inline-flex items-center rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                aria-label="Delete subject"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                        {(subject.children || []).length ? (
                          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                            {subject.children.map((child, ci) => (
                              <li
                                key={`${child.title}-${ci}`}
                                className="rounded-md bg-white px-2 py-1.5 text-sm text-prose-muted ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
                              >
                                {isAdmin ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      className="w-full rounded border border-theme bg-white px-2 py-1 text-xs text-neutral-900 placeholder:text-neutral-500 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                                      value={child.title}
                                      onChange={(e) => updateChild(i, si, ci, e.target.value)}
                                    />
                                    <button type="button" onClick={() => deleteChild(i, si, ci)} className="rounded bg-rose-100 px-1.5 py-1 text-[10px] text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">X</button>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-accent/70 dark:bg-emerald-400/80" />
                                    {child.title}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
              );
            })()
          ))}
        </div>
      </Container>
    </PageFade>
  );
}
