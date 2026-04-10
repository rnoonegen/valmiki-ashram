import { useEffect, useMemo, useState } from 'react';
import Container from '../components/Container';
import { adminRequest } from '../admin/api';
import ImageUploader from '../components/admin/ImageUploader';

const createBlankBlock = () => ({ subHeading: '', paragraphs: [''], bulletPoints: [''] });
const createBlankSection = () => ({ heading: '', blocks: [createBlankBlock()] });
const createBlankContest = () => ({
  title: '',
  description: '',
  submitDate: '',
  resultDate: '',
  heroImages: [],
  heroVideoLinks: [''],
  registerButtonText: 'Register Now',
  registerMode: 'internal',
  googleFormUrl: '',
  isPublished: true,
  sections: [createBlankSection()],
});

function mapServerToForm(contest) {
  const sections = (contest.sections || []).map((section) => {
    if (Array.isArray(section.blocks) && section.blocks.length > 0) {
      return {
        heading: section.heading || '',
        blocks: section.blocks.map((block) => ({
          subHeading: block.subHeading || '',
          paragraphs: Array.isArray(block.paragraphs) && block.paragraphs.length > 0 ? block.paragraphs : [''],
          bulletPoints: Array.isArray(block.bulletPoints) && block.bulletPoints.length > 0 ? block.bulletPoints : [''],
        })),
      };
    }
    // Backward compatibility for old saved section shape.
    return {
      heading: section.heading || '',
      blocks: [
        {
          subHeading: section.subHeading || '',
          paragraphs: section.paragraph ? [section.paragraph] : [''],
          bulletPoints:
            Array.isArray(section.bulletPoints) && section.bulletPoints.length > 0
              ? section.bulletPoints
              : [''],
        },
      ],
    };
  });

  return {
    ...contest,
    description: contest.description || contest.cardDescription || '',
    submitDate: contest.submitDate ? new Date(contest.submitDate).toISOString().slice(0, 10) : '',
    resultDate: contest.resultDate ? new Date(contest.resultDate).toISOString().slice(0, 10) : '',
    heroImages: Array.isArray(contest.heroImages) ? contest.heroImages : [],
    heroVideoLinks:
      Array.isArray(contest.heroVideoLinks) && contest.heroVideoLinks.length > 0
        ? contest.heroVideoLinks
        : [''],
    sections: sections.length > 0 ? sections : [createBlankSection()],
  };
}

function mapFormToPayload(form) {
  return {
    title: form.title || '',
    description: form.description || '',
    submitDate: form.submitDate || null,
    resultDate: form.resultDate || null,
    heroImages: Array.isArray(form.heroImages) ? form.heroImages.filter(Boolean) : [],
    heroVideoLinks: Array.isArray(form.heroVideoLinks)
      ? form.heroVideoLinks.map((item) => String(item || '').trim()).filter(Boolean)
      : [],
    registerButtonText: form.registerButtonText || 'Register Now',
    registerMode: form.registerMode === 'google' ? 'google' : 'internal',
    googleFormUrl: form.googleFormUrl || '',
    isPublished: form.isPublished !== false,
    sections: (form.sections || []).map((section) => ({
      heading: section.heading || '',
      blocks: (section.blocks || []).map((block) => ({
        subHeading: block.subHeading || '',
        paragraphs: (block.paragraphs || []).map((text) => String(text || '').trim()).filter(Boolean),
        bulletPoints: (block.bulletPoints || []).map((text) => String(text || '').trim()).filter(Boolean),
      })),
    })),
  };
}

function hasSectionContent(sections = []) {
  return sections.some((section) =>
    (section.blocks || []).some((block) => {
      const hasSubHeading = Boolean(String(block.subHeading || '').trim());
      const hasParagraph = (block.paragraphs || []).some((text) => Boolean(String(text || '').trim()));
      const hasBullet = (block.bulletPoints || []).some((text) => Boolean(String(text || '').trim()));
      return hasSubHeading || hasParagraph || hasBullet;
    })
  );
}

export default function AdminContests() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(createBlankContest);
  const [showEditor, setShowEditor] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const data = await adminRequest('/api/admin/contests');
    setItems(data.items || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const selectedContest = useMemo(
    () => items.find((item) => String(item._id) === String(selectedId)),
    [items, selectedId]
  );

  const selectContest = (id) => {
    setSelectedId(id);
    const contest = items.find((item) => String(item._id) === String(id));
    if (contest) {
      setForm(mapServerToForm(contest));
      setShowEditor(true);
    }
  };

  const addSection = () => {
    setForm((prev) => ({ ...prev, sections: [...(prev.sections || []), createBlankSection()] }));
  };

  const removeHeroImage = (index) => {
    setForm((prev) => ({
      ...prev,
      heroImages: (prev.heroImages || []).filter((_, i) => i !== index),
    }));
  };

  const updateHeroVideoLink = (index, value) => {
    setForm((prev) => ({
      ...prev,
      heroVideoLinks: (prev.heroVideoLinks || []).map((item, i) => (i === index ? value : item)),
    }));
  };

  const addHeroVideoLink = () => {
    setForm((prev) => ({ ...prev, heroVideoLinks: [...(prev.heroVideoLinks || []), ''] }));
  };

  const removeHeroVideoLink = (index) => {
    setForm((prev) => {
      const next = (prev.heroVideoLinks || []).filter((_, i) => i !== index);
      return { ...prev, heroVideoLinks: next.length > 0 ? next : [''] };
    });
  };

  const updateSection = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  };

  const addBlock = (sectionIndex) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              blocks: [...(section.blocks || []), createBlankBlock()],
            }
          : section
      ),
    }));
  };

  const removeBlock = (sectionIndex, blockIndex) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, idx) => {
        if (idx !== sectionIndex) return section;
        const nextBlocks = (section.blocks || []).filter((_, i) => i !== blockIndex);
        return {
          ...section,
          blocks:
            nextBlocks.length > 0
              ? nextBlocks
              : [createBlankBlock()],
        };
      }),
    }));
  };

  const updateBlock = (sectionIndex, blockIndex, patch) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              blocks: (section.blocks || []).map((block, bIdx) => (bIdx === blockIndex ? { ...block, ...patch } : block)),
            }
          : section
      ),
    }));
  };

  const addParagraph = (sectionIndex, blockIndex) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              blocks: (section.blocks || []).map((block, bIdx) =>
                bIdx === blockIndex ? { ...block, paragraphs: [...(block.paragraphs || []), ''] } : block
              ),
            }
          : section
      ),
    }));
  };

  const updateParagraph = (sectionIndex, blockIndex, paragraphIndex, value) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              blocks: (section.blocks || []).map((block, bIdx) =>
                bIdx === blockIndex
                  ? {
                      ...block,
                      paragraphs: (block.paragraphs || []).map((text, pIdx) => (pIdx === paragraphIndex ? value : text)),
                    }
                  : block
              ),
            }
          : section
      ),
    }));
  };

  const removeParagraph = (sectionIndex, blockIndex, paragraphIndex) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              blocks: (section.blocks || []).map((block, bIdx) => {
                if (bIdx !== blockIndex) return block;
                const next = (block.paragraphs || []).filter((_, pIdx) => pIdx !== paragraphIndex);
                return { ...block, paragraphs: next.length > 0 ? next : [''] };
              }),
            }
          : section
      ),
    }));
  };

  const addBulletPoint = (sectionIndex, blockIndex) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              blocks: (section.blocks || []).map((block, bIdx) =>
                bIdx === blockIndex ? { ...block, bulletPoints: [...(block.bulletPoints || []), ''] } : block
              ),
            }
          : section
      ),
    }));
  };

  const updateBulletPoint = (sectionIndex, blockIndex, bulletIndex, value) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              blocks: (section.blocks || []).map((block, bIdx) =>
                bIdx === blockIndex
                  ? {
                      ...block,
                      bulletPoints: (block.bulletPoints || []).map((text, pIdx) => (pIdx === bulletIndex ? value : text)),
                    }
                  : block
              ),
            }
          : section
      ),
    }));
  };

  const removeBulletPoint = (sectionIndex, blockIndex, bulletIndex) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...section,
              blocks: (section.blocks || []).map((block, bIdx) => {
                if (bIdx !== blockIndex) return block;
                const next = (block.bulletPoints || []).filter((_, pIdx) => pIdx !== bulletIndex);
                return { ...block, bulletPoints: next.length > 0 ? next : [''] };
              }),
            }
          : section
      ),
    }));
  };

  const removeSection = (index) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const createContest = async () => {
    setError('');
    setMessage('');
    if (!hasSectionContent(form.sections || [])) {
      setError('Please add at least one Sub Section content (sub heading, paragraph, or bullet point).');
      return;
    }
    try {
      await adminRequest('/api/admin/contests', {
        method: 'POST',
        body: JSON.stringify(mapFormToPayload(form)),
      });
      setMessage('Contest created.');
      setForm(createBlankContest());
      setSelectedId('');
      setShowEditor(false);
      await load();
    } catch (err) {
      setError(err.message || 'Unable to create contest');
    }
  };

  const saveContest = async () => {
    if (!selectedId) return;
    setError('');
    setMessage('');
    if (!hasSectionContent(form.sections || [])) {
      setError('Please add at least one Sub Section content (sub heading, paragraph, or bullet point).');
      return;
    }
    try {
      await adminRequest(`/api/admin/contests/${selectedId}`, {
        method: 'PUT',
        body: JSON.stringify(mapFormToPayload(form)),
      });
      setMessage('Contest updated.');
      await load();
    } catch (err) {
      setError(err.message || 'Unable to update contest');
    }
  };

  return (
    <Container className="py-10">
      <h1 className="heading-page">Admin: Contests</h1>
      <p className="mt-3 max-w-3xl text-prose">
        Create reusable contest templates with heading, image/video highlights, and rich section content with nested
        subheadings, paragraphs, and bullet points.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <button
            type="button"
            onClick={() => {
              setSelectedId('');
              setForm(createBlankContest());
              setMessage('');
              setError('');
              setShowEditor(true);
            }}
            className="w-full rounded-lg bg-accent px-4 py-2 text-white dark:bg-emerald-700"
          >
            New Contest
          </button>
          <div className="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700">
            Total contests created: <span className="font-semibold">{items.length}</span>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => selectContest(String(item._id))}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-left text-sm dark:border-neutral-700"
              >
                <div className="font-semibold">{item.title}</div>
                <div className="text-xs text-prose-muted">
                  Registrations: {item.registrationCount || 0}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {showEditor ? (
        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
          <input
            placeholder="Contest title"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <textarea
            placeholder="Description"
            rows={2}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Submit Date
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                value={form.submitDate || ''}
                onChange={(e) => setForm((p) => ({ ...p, submitDate: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              Result Date
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                value={form.resultDate || ''}
                onChange={(e) => setForm((p) => ({ ...p, resultDate: e.target.value }))}
              />
            </label>
          </div>
          <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Contest Images</p>
              <ImageUploader
                folder="contests"
                buttonText="Upload Image"
                onUploaded={(asset) =>
                  setForm((prev) => ({
                    ...prev,
                    heroImages: [...(prev.heroImages || []), asset.url],
                  }))
                }
              />
            </div>
            {form.heroImages?.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {form.heroImages.map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700"
                  >
                    <img src={imageUrl} alt={`Contest ${index + 1}`} className="h-36 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeHeroImage(index)}
                      className="w-full border-t border-neutral-200 px-2 py-1 text-sm text-rose-700 dark:border-neutral-700"
                    >
                      Delete image
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-prose-muted">No images added yet.</p>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">YouTube Links</p>
              <button
                type="button"
                onClick={addHeroVideoLink}
                className="rounded-lg border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700"
              >
                Add Link
              </button>
            </div>
            {(form.heroVideoLinks || []).map((videoLink, index) => (
              <div key={`hero-video-${index}`} className="flex gap-2">
                <input
                  placeholder={`YouTube link ${index + 1}`}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={videoLink}
                  onChange={(e) => updateHeroVideoLink(index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeHeroVideoLink(index)}
                  className="rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <input
            placeholder="Register button text"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            value={form.registerButtonText}
            onChange={(e) => setForm((p) => ({ ...p, registerButtonText: e.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Registration mode
              <select
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                value={form.registerMode}
                onChange={(e) => setForm((p) => ({ ...p, registerMode: e.target.value }))}
              >
                <option value="internal">Website Form (store in DB)</option>
                <option value="google">Google Form Link</option>
              </select>
            </label>
            <label className="text-sm">
              Published
              <select
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                value={String(form.isPublished)}
                onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.value === 'true' }))}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
          </div>
          {form.registerMode === 'google' ? (
            <input
              placeholder="Google form URL"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
              value={form.googleFormUrl}
              onChange={(e) => setForm((p) => ({ ...p, googleFormUrl: e.target.value }))}
            />
          ) : null}

          <div className="space-y-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Template Sections</h2>
              <button type="button" onClick={addSection} className="rounded-lg border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700">
                Add Section
              </button>
            </div>
            {form.sections.map((section, index) => (
              <div key={`section-${index}`} className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Section {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
                  >
                    Remove
                  </button>
                </div>
                <input
                  placeholder="Section heading"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                  value={section.heading}
                  onChange={(e) => updateSection(index, { heading: e.target.value })}
                />
                <div className="space-y-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Sub Sections</p>
                    <button
                      type="button"
                      onClick={() => addBlock(index)}
                      className="rounded-lg border border-neutral-300 px-3 py-1 text-xs dark:border-neutral-700"
                    >
                      Add Sub Heading
                    </button>
                  </div>
                  {(section.blocks || []).map((block, blockIndex) => (
                    <div key={`block-${blockIndex}`} className="space-y-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-prose-muted">Sub Section {blockIndex + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeBlock(index, blockIndex)}
                          className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        placeholder="Sub heading"
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                        value={block.subHeading}
                        onChange={(e) => updateBlock(index, blockIndex, { subHeading: e.target.value })}
                      />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-prose-muted">Paragraphs</p>
                          <button
                            type="button"
                            onClick={() => addParagraph(index, blockIndex)}
                            className="rounded border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
                          >
                            Add Paragraph
                          </button>
                        </div>
                        {(block.paragraphs || []).map((paragraph, paragraphIndex) => (
                          <div key={`paragraph-${paragraphIndex}`} className="flex gap-2">
                            <textarea
                              rows={2}
                              placeholder={`Paragraph ${paragraphIndex + 1}`}
                              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                              value={paragraph}
                              onChange={(e) => updateParagraph(index, blockIndex, paragraphIndex, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => removeParagraph(index, blockIndex, paragraphIndex)}
                              className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-prose-muted">Bullet Points</p>
                          <button
                            type="button"
                            onClick={() => addBulletPoint(index, blockIndex)}
                            className="rounded border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
                          >
                            Add Bullet
                          </button>
                        </div>
                        {(block.bulletPoints || []).map((point, pointIndex) => (
                          <div key={`bullet-${pointIndex}`} className="flex gap-2">
                            <input
                              placeholder={`Bullet point ${pointIndex + 1}`}
                              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                              value={point}
                              onChange={(e) => updateBulletPoint(index, blockIndex, pointIndex, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => removeBulletPoint(index, blockIndex, pointIndex)}
                              className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <div className="flex gap-3">
            {selectedContest ? (
              <button type="button" onClick={saveContest} className="rounded-lg bg-accent px-4 py-2 text-white dark:bg-emerald-700">
                Save Contest
              </button>
            ) : (
              <button type="button" onClick={createContest} className="rounded-lg bg-accent px-4 py-2 text-white dark:bg-emerald-700">
                Create Contest
              </button>
            )}
          </div>
        </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-prose-muted dark:border-neutral-700 dark:bg-neutral-900">
            Click <span className="font-semibold text-accent dark:text-emerald-200">New Contest</span> to create a contest,
            or select an existing contest from the left list to edit.
          </section>
        )}
      </div>
    </Container>
  );
}
