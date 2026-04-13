import { useEffect, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { adminRequest } from '../admin/api';
import Button from '../components/Button';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import useLiveContent from '../hooks/useLiveContent';

const fallbackContent = {
  heroTitle: 'What is the Gurukulam Program?',
  heroBody:
    'The Gurukulam Program at Valmiki Ashram is a full-time, residential family Gurukulam. Children learn at their own pace, through real-world projects, stories, memory training, and hands-on challenges.',
  curriculumTitle: 'Curriculum Overview',
  curriculumPara1:
    'Most schools teach 5-6 subjects. At Valmiki Ashram, children explore over 20. The curriculum at Valmiki Ashram blends traditional Indian knowledge with modern subjects and practical life skills.',
  curriculumPara2:
    'Children do not just sit in classrooms - they build, chant, create, debate, and explore.',
  academicsTitle: 'Academics & Certifications',
  academicsPara1: 'Valmiki Ashram is a Gurukulam, not a conventional school.',
  academicsPara2:
    'We are not affiliated with any single education board - but we ensure that children are fully prepared for modern academic requirements alongside traditional learning.',
  niosTitle: 'NIOS: Flexible, Recognized, and Student-Centric',
  niosPara:
    'Students at Valmiki Ashram are guided and supported through the NIOS (National Institute of Open Schooling) program - an autonomous institution under the Ministry of Education, Government of India.',
  supportTitle: 'How NIOS Supports Students',
  supportList: [
    'Choose subjects based on interest and future goals.',
    'Learn at their own pace with no rigid class schedules.',
    'Take on-demand exams when they are ready.',
    'Earn a government-recognized certification equivalent to CBSE/ICSE.',
  ],
  supportPara1:
    'NIOS students are eligible for college admissions and competitive exams including JEE, NEET, UPSC, and international applications.',
  supportPara2:
    'We provide structured academic guidance, study support, and mentorship to help children navigate the NIOS curriculum confidently - while leaving room for deep cultural and practical learning.',
  supportLink: 'https://www.nios.ac.in/',
  traditionalTitle: 'Traditional Examinations',
  traditionalIntro:
    "For families who seek to continue in the path of traditional Indian education, students are also prepared for Samskrutha Bharati's traditional exams such as:",
  traditionalExams: ['Chittoor Pariksha'],
  traditionalPara1:
    'These exams cover Samskrutham grammar, literature, shastra-based understanding, and memorization disciplines aligned with ancient Gurukula methods.',
  traditionalPara2:
    'Our curriculum naturally integrates the material needed for these assessments through chanting, shastra study, and daily recitation practice.',
  empowerTitle:
    'Empowering Future Generations Through Decolonized, Traditional Learning',
  empowerPara:
    'Valmiki Gurukulam follows the time-honored Gurukulam system, where students learn under the direct guidance of Acharyas (teachers). This personalized learning approach fosters intellectual growth and moral development.',
  pillars: [
    {
      title: 'Gurushishya Parampara (Teacher-Student Lineage)',
      body: 'Direct mentorship from scholars, thinkers, and experts, ensuring in-depth knowledge transfer.',
    },
    {
      title: 'Kanthasthikaranam (Memorization)',
      body: 'Specialized training in memory techniques, enabling students to retain vast amounts of knowledge effortlessly.',
    },
    {
      title: 'Tarka & Vada (Logical Debates & Discussions)',
      body: 'Encouraging students to analyze, debate, and articulate their thoughts effectively, fostering sharp reasoning skills.',
    },
    {
      title: 'Adhyayanam & Anushthanam (Experiential & Applied Learning)',
      body: 'Integrating theoretical learning with real-world applications and daily practice.',
    },
    {
      title: 'Prakriti-based Learning (Nature-Centric Education)',
      body: 'Emphasizing outdoor experiential learning, observational sciences, and alignment with natural cycles.',
    },
    {
      title: 'Shishya-Shishya Parampara (Peer-Learning Gurukulam Method)',
      body: 'Senior students mentor younger students, fostering peer learning, leadership, and responsibility while encouraging self-learning and collaboration.',
    },
  ],
};

const listFields = new Set(['supportList', 'traditionalExams']);

export default function Gurukulam() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/gurukulam';
  const cms = useLiveContent('gurukulam', fallbackContent);
  const [draft, setDraft] = useState(fallbackContent);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [fieldEditor, setFieldEditor] = useState(null);
  const [pillarEditor, setPillarEditor] = useState(null);

  useEffect(() => {
    setDraft({
      ...fallbackContent,
      ...(cms || {}),
      supportList: Array.isArray(cms?.supportList) ? cms.supportList : fallbackContent.supportList,
      traditionalExams: Array.isArray(cms?.traditionalExams)
        ? cms.traditionalExams
        : fallbackContent.traditionalExams,
      pillars: Array.isArray(cms?.pillars) ? cms.pillars : fallbackContent.pillars,
    });
  }, [cms]);

  const display = isAdmin ? draft : {
    ...fallbackContent,
    ...(cms || {}),
    supportList: Array.isArray(cms?.supportList) ? cms.supportList : fallbackContent.supportList,
    traditionalExams: Array.isArray(cms?.traditionalExams)
      ? cms.traditionalExams
      : fallbackContent.traditionalExams,
    pillars: Array.isArray(cms?.pillars) ? cms.pillars : fallbackContent.pillars,
  };

  const save = async (nextDraft = draft) => {
    try {
      await adminRequest('/api/admin/content/gurukulam', {
        method: 'PUT',
        body: JSON.stringify({ content: nextDraft }),
      });
      setStatus({ type: 'success', message: 'Gurukulam page updated.' });
      return true;
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Save failed. Please login again.' });
      return false;
    }
  };

  const openFieldEditor = (key, label) => {
    const value = draft[key];
    setFieldEditor({
      key,
      label,
      value: listFields.has(key) ? (Array.isArray(value) ? value.join('\n') : '') : String(value || ''),
    });
  };

  const saveFieldEditor = async () => {
    if (!fieldEditor) return;
    const nextValue = listFields.has(fieldEditor.key)
      ? String(fieldEditor.value || '')
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean)
      : fieldEditor.value;
    const nextDraft = { ...draft, [fieldEditor.key]: nextValue };
    setDraft(nextDraft);
    const ok = await save(nextDraft);
    if (ok) setFieldEditor(null);
  };

  const openPillarEditor = (index) => {
    const item = draft.pillars?.[index];
    setPillarEditor({
      index,
      isNew: !item,
      title: item?.title || '',
      body: item?.body || '',
    });
  };

  const savePillarEditor = async () => {
    if (!pillarEditor) return;
    if (!String(pillarEditor.title || '').trim() || !String(pillarEditor.body || '').trim()) {
      setStatus({ type: 'error', message: 'Pillar title and body are required.' });
      return;
    }
    const nextItem = { title: pillarEditor.title.trim(), body: pillarEditor.body.trim() };
    let nextPillars = [...(draft.pillars || [])];
    if (pillarEditor.isNew) {
      nextPillars = [nextItem, ...nextPillars];
    } else {
      nextPillars[pillarEditor.index] = nextItem;
    }
    const nextDraft = { ...draft, pillars: nextPillars };
    setDraft(nextDraft);
    const ok = await save(nextDraft);
    if (ok) setPillarEditor(null);
  };

  const deletePillar = async (index) => {
    const nextDraft = {
      ...draft,
      pillars: (draft.pillars || []).filter((_, i) => i !== index),
    };
    setDraft(nextDraft);
    await save(nextDraft);
  };

  const editBtn = (onClick) =>
    isAdmin ? (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-accent hover:bg-neutral-200 dark:bg-neutral-800 dark:text-emerald-200 dark:hover:bg-neutral-700"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit
      </button>
    ) : null;

  return (
    <PageFade>
      <section className="border-b border-neutral-200 bg-secondary/30 py-8 dark:border-neutral-700 dark:bg-neutral-950 md:py-12">
        <Container>
          <div className="flex items-start justify-between gap-3">
            <h1 className="heading-page">{display.heroTitle}</h1>
            {editBtn(() => openFieldEditor('heroTitle', 'Hero Title'))}
          </div>
          <p className="mt-5 max-w-4xl text-base leading-relaxed text-prose md:text-lg">
            {display.heroBody}
          </p>
          {isAdmin ? (
            <div className="mt-3">{editBtn(() => openFieldEditor('heroBody', 'Hero Description'))}</div>
          ) : null}
        </Container>
      </section>

      <section className="bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12">
        <Container>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-8">
            <div className="flex items-start justify-between gap-3">
              <h2 className="heading-section">{display.curriculumTitle}</h2>
              {editBtn(() => openFieldEditor('curriculumTitle', 'Curriculum Section Title'))}
            </div>
            <p className="mt-4 text-base leading-relaxed text-prose md:text-lg">
              {display.curriculumPara1}
            </p>
            <p className="mt-4 text-base leading-relaxed text-prose md:text-lg">
              {display.curriculumPara2}
            </p>
            {isAdmin ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {editBtn(() => openFieldEditor('curriculumPara1', 'Curriculum Paragraph 1'))}
                {editBtn(() => openFieldEditor('curriculumPara2', 'Curriculum Paragraph 2'))}
              </div>
            ) : null}
            <div className="mt-6">
              <Button to="/curriculum" className="rounded-full px-6">
                View Full Curriculum
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-neutral-200 bg-secondary/40 py-12 dark:border-neutral-700 dark:bg-neutral-900/55 md:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-8">
              <div className="flex items-start justify-between gap-3">
                <h2 className="heading-card text-2xl md:text-3xl">{display.academicsTitle}</h2>
                {editBtn(() => openFieldEditor('academicsTitle', 'Academics Title'))}
              </div>
              <p className="mt-4 text-prose">
                {display.academicsPara1}
              </p>
              <p className="mt-3 text-prose">
                {display.academicsPara2}
              </p>
              {isAdmin ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {editBtn(() => openFieldEditor('academicsPara1', 'Academics Paragraph 1'))}
                  {editBtn(() => openFieldEditor('academicsPara2', 'Academics Paragraph 2'))}
                </div>
              ) : null}
            </article>

            <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-8">
              <div className="flex items-start justify-between gap-3">
                <h2 className="heading-card text-2xl md:text-3xl">{display.niosTitle}</h2>
                {editBtn(() => openFieldEditor('niosTitle', 'NIOS Title'))}
              </div>
              <p className="mt-4 text-prose">
                {display.niosPara}
              </p>
              {isAdmin ? <div className="mt-3">{editBtn(() => openFieldEditor('niosPara', 'NIOS Paragraph'))}</div> : null}
            </article>
          </div>
        </Container>
      </section>

      <section className="bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12">
        <Container>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-8">
            <div className="flex items-start justify-between gap-3">
              <h2 className="heading-section">{display.supportTitle}</h2>
              {editBtn(() => openFieldEditor('supportTitle', 'Support Section Title'))}
            </div>
            <p className="mt-4 text-prose">NIOS allows students to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-prose marker:text-accent dark:marker:text-emerald-500">
              {(display.supportList || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 text-prose">
              {display.supportPara1}
            </p>
            <p className="mt-4 text-prose">
              {display.supportPara2}
            </p>
            <p className="mt-4 text-sm text-prose-muted md:text-base">
              For more details about NIOS:{' '}
              <a
                href={display.supportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="link-app"
              >
                {display.supportLink}
              </a>
            </p>
            {isAdmin ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {editBtn(() => openFieldEditor('supportList', 'Support Bullet List (one item per line)'))}
                {editBtn(() => openFieldEditor('supportPara1', 'Support Paragraph 1'))}
                {editBtn(() => openFieldEditor('supportPara2', 'Support Paragraph 2'))}
                {editBtn(() => openFieldEditor('supportLink', 'NIOS Link URL'))}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="border-y border-neutral-200 bg-secondary/35 py-8 dark:border-neutral-700 dark:bg-neutral-900/45 md:py-12">
        <Container>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-8">
            <div className="flex items-start justify-between gap-3">
              <h2 className="heading-section">{display.traditionalTitle}</h2>
              {editBtn(() => openFieldEditor('traditionalTitle', 'Traditional Section Title'))}
            </div>
            <p className="mt-4 text-prose">
              {display.traditionalIntro}
            </p>
            <ul className="mt-3 list-disc pl-5 text-prose marker:text-accent dark:marker:text-emerald-500">
              {(display.traditionalExams || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 text-prose">
              {display.traditionalPara1}
            </p>
            <p className="mt-4 text-prose">
              {display.traditionalPara2}
            </p>
            {isAdmin ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {editBtn(() => openFieldEditor('traditionalIntro', 'Traditional Intro'))}
                {editBtn(() => openFieldEditor('traditionalExams', 'Traditional Exams (one item per line)'))}
                {editBtn(() => openFieldEditor('traditionalPara1', 'Traditional Paragraph 1'))}
                {editBtn(() => openFieldEditor('traditionalPara2', 'Traditional Paragraph 2'))}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12">
        <Container>
          <div className="flex items-start justify-between gap-3">
            <h1 className="heading-page max-w-5xl">{display.empowerTitle}</h1>
            {editBtn(() => openFieldEditor('empowerTitle', 'Final Section Title'))}
          </div>
          <p className="mt-5 max-w-5xl text-base leading-relaxed text-prose md:text-[1.35rem]">
            {display.empowerPara}
          </p>
          {isAdmin ? (
            <div className="mt-3">{editBtn(() => openFieldEditor('empowerPara', 'Final Section Paragraph'))}</div>
          ) : null}

          <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2">
            {(display.pillars || []).map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-accent dark:text-emerald-200">
                    {item.title}
                  </h2>
                  {isAdmin ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openPillarEditor(index)}
                        className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePillar(index)}
                        className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
                <p className="mt-3 leading-relaxed text-prose">{item.body}</p>
              </article>
            ))}
          </div>
          {isAdmin ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => openPillarEditor()}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Pillar
              </button>
            </div>
          ) : null}
        </Container>
      </section>

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

          {fieldEditor ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
                  Edit {fieldEditor.label}
                </h3>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {fieldEditor.label}
                  </label>
                  {listFields.has(fieldEditor.key) ? (
                    <textarea
                      className="h-32 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={fieldEditor.value}
                      onChange={(e) => setFieldEditor((p) => ({ ...p, value: e.target.value }))}
                    />
                  ) : (
                    <textarea
                      className="h-28 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={fieldEditor.value}
                      onChange={(e) => setFieldEditor((p) => ({ ...p, value: e.target.value }))}
                    />
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={saveFieldEditor}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setFieldEditor(null)}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {pillarEditor ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
                  {pillarEditor.isNew ? 'Add' : 'Edit'} Pillar
                </h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      Title
                    </label>
                    <input
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={pillarEditor.title}
                      onChange={(e) => setPillarEditor((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      Description
                    </label>
                    <textarea
                      className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={pillarEditor.body}
                      onChange={(e) => setPillarEditor((p) => ({ ...p, body: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={savePillarEditor}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setPillarEditor(null)}
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
