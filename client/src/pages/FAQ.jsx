import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import Container from '../components/Container';
import { FaqCategorySection } from '../components/FaqAccordion';
import PageFade from '../components/PageFade';
import { faqCategories } from '../data/faqData';
import useLiveContent from '../hooks/useLiveContent';

export default function FAQ() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/faq';
  const cms = useLiveContent('faq', { faqCategories });
  const categories = cms.faqCategories?.length ? cms.faqCategories : faqCategories;
  const [draft, setDraft] = useState(categories);
  const [editor, setEditor] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setDraft(categories);
  }, [cms]);

  const filteredCategories = useMemo(() => {
    const query = String(searchQuery || '').trim().toLowerCase();
    if (!query) return categories;
    return categories
      .map((category) => {
        const categoryTitle = String(category?.title || '').toLowerCase();
        if (categoryTitle.includes(query)) return category;
        const matchedItems = (category?.items || []).filter((item) => {
          const question = String(item?.question || '').toLowerCase();
          const answer = String(item?.answer || '').toLowerCase();
          return question.includes(query) || answer.includes(query);
        });
        return { ...category, items: matchedItems };
      })
      .filter((category) => Array.isArray(category?.items) && category.items.length);
  }, [categories, searchQuery]);

  const saveAll = async (nextDraft = draft) => {
    try {
      await adminRequest('/api/admin/content/faq', {
        method: 'PUT',
        body: JSON.stringify({ content: { faqCategories: nextDraft } }),
      });
      setStatus({ type: 'success', message: 'Changes saved.' });
      return true;
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Save failed. Please login again.' });
      return false;
    }
  };

  const openCategoryEditor = (index) => {
    const item = draft[index];
    const isNew = !item;
    setEditor({
      type: 'category',
      index,
      title: item?.title || (isNew ? 'New Category' : ''),
      id: item?.id || `category-${Date.now()}`,
      isNew,
    });
  };

  const openItemEditor = (categoryIndex, itemIndex) => {
    const item = draft?.[categoryIndex]?.items?.[itemIndex];
    setEditor({
      type: 'item',
      categoryIndex,
      itemIndex,
      question: item?.question || '',
      answer: item?.answer || '',
      id: item?.id || `faq-item-${Date.now()}`,
      isNew: !item,
    });
  };

  const deleteCategory = async (index) => {
    const next = draft.filter((_, i) => i !== index);
    setDraft(next);
    await saveAll(next);
  };

  const deleteItem = async (categoryIndex, itemIndex) => {
    const next = draft.map((c, i) =>
      i !== categoryIndex ? c : { ...c, items: c.items.filter((_, ii) => ii !== itemIndex) }
    );
    setDraft(next);
    await saveAll(next);
  };

  const saveEditor = async () => {
    if (!editor) return;
    if (editor.type === 'category' && !String(editor.title || '').trim()) {
      setStatus({ type: 'error', message: 'Category title is required.' });
      return;
    }
    if (editor.type === 'item' && !String(editor.question || '').trim()) {
      setStatus({ type: 'error', message: 'Question is required.' });
      return;
    }

    let next = [...draft];
    if (editor.type === 'category') {
      const payload = {
        id: editor.id,
        title: editor.title,
        items: editor.isNew ? [] : next[editor.index]?.items || [],
      };
      if (editor.isNew) {
        next = [payload, ...next];
      } else {
        next[editor.index] = payload;
      }
    } else {
      const payload = { id: editor.id, question: editor.question, answer: editor.answer };
      const cIndex = editor.categoryIndex;
      const c = next[cIndex];
      if (!c) return;
      const items = [...(c.items || [])];
      if (editor.isNew) {
        items.push(payload);
      } else {
        items[editor.itemIndex] = { ...(items[editor.itemIndex] || {}), ...payload };
      }
      next[cIndex] = { ...c, items };
    }
    const prev = draft;
    setDraft(next);
    const ok = await saveAll(next);
    if (ok) {
      setEditor(null);
    } else {
      setDraft(prev);
    }
  };

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <header className="max-w-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="heading-page">Frequently Asked Questions</h1>
              <p className="mt-4 text-base leading-relaxed text-prose md:text-lg">
                Find answers about alternative education, Gurukulam, homeschooling,
                colonized education, NIOS, and how we approach learning at Valmiki
                Ashram. Open a section below to explore each topic.
              </p>
            </div>
            {isAdmin ? (
              <button
                type="button"
                className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-accent px-4 py-2 text-sm text-white shadow-md dark:bg-emerald-700"
                onClick={() => openCategoryEditor()}
              >
                <Plus className="h-4 w-4" /> Add Category
              </button>
            ) : null}
          </div>
          {!isAdmin ? (
            <div className="mt-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Search FAQs
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type your question (e.g. NIOS, homeschool, Gurukulam)"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-500 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                />
              </label>
            </div>
          ) : null}
        </header>

        <div className="mt-10 flex flex-col gap-8 md:mt-12 md:gap-10">
          {(isAdmin ? draft : filteredCategories).map((category, categoryIndex) =>
            isAdmin ? (
              <section
                key={category.id}
                className="rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-white/5 md:p-6"
              >
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-theme pb-3">
                  <h2 className="heading-card text-xl md:text-2xl">{category.title}</h2>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                      onClick={() => openCategoryEditor(categoryIndex)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                      onClick={() => deleteCategory(categoryIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      onClick={() => openItemEditor(categoryIndex)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {category.items.map((item, itemIndex) => (
                    <div key={item.id} className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.question}</p>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                            onClick={() => openItemEditor(categoryIndex, itemIndex)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                            onClick={() => deleteItem(categoryIndex, itemIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {item.answer ? (
                        <p className="mt-2 text-sm leading-relaxed text-prose-muted">{item.answer}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <FaqCategorySection key={category.id} category={category} />
            )
          )}
          {!isAdmin && filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white/90 p-5 text-sm text-prose-muted shadow-sm ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-white/5">
              No FAQs match your search. Try a different keyword.
            </div>
          ) : null}
        </div>
      </Container>
      {isAdmin ? (
        <>
          {status.message ? (
            <div
              className={`fixed left-1/2 top-24 z-50 max-w-[min(92vw,28rem)] -translate-x-1/2 rounded-lg px-3 py-2 text-center text-sm shadow-lg ${
                status.type === 'error'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              }`}
            >
              {status.message}
            </div>
          ) : null}
          {editor ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
                  {editor.type === 'category'
                    ? `${editor.isNew ? 'Add' : 'Edit'} Category`
                    : `${editor.isNew ? 'Add' : 'Edit'} FAQ Item`}
                </h3>
                <div className="mt-4 space-y-3">
                  {editor.type === 'category' ? (
                    <input
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      placeholder="Category title"
                      value={editor.title}
                      onChange={(e) => setEditor((p) => ({ ...p, title: e.target.value }))}
                    />
                  ) : (
                    <>
                      <input
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                        placeholder="Question"
                        value={editor.question}
                        onChange={(e) => setEditor((p) => ({ ...p, question: e.target.value }))}
                      />
                      <textarea
                        className="h-32 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                        placeholder="Answer"
                        value={editor.answer}
                        onChange={(e) => setEditor((p) => ({ ...p, answer: e.target.value }))}
                      />
                    </>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={saveEditor}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditor(null)}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </PageFade>
  );
}
