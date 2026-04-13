import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Pencil, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import { adminRequest, apiRequest } from '../admin/api';
import Container from '../components/Container';
import ChildCard from '../components/forms/ChildCard';
import AddButton from '../components/forms/AddButton';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import PhoneInput from '../components/forms/PhoneInput';
import SectionCard from '../components/forms/SectionCard';
import PageFade from '../components/PageFade';
import { useTheme } from '../context/ThemeContext';
import { COUNTRY_OPTIONS, COURSE_OPTIONS } from '../data/registrationOptions';
import useLiveContent from '../hooks/useLiveContent';
import { IST_TIME_SLOTS, convertIstSlotToTimezone } from '../utils/timeSlots';
import 'react-phone-input-2/lib/style.css';

const optionalEmail = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((v) => !v || z.string().email().safeParse(v).success, {
    message: 'Enter a valid email',
  });

const schema = z.object({
  parents: z.object({
    parent1: z.object({
      name: z.string().min(1, 'Parent 1 name is required'),
      email: z.string().email('Enter a valid email'),
      phone: z.string().min(7, 'Parent 1 phone is required'),
    }),
    parent2: z.object({
      name: z.string().optional(),
      email: optionalEmail,
      phone: z.string().optional(),
    }),
  }),
  address: z.object({
    country: z.string().min(1, 'Country is required'),
    city: z.string().min(1, 'City is required'),
    address: z.string().min(1, 'Address is required'),
    zipcode: z.string().min(1, 'Zipcode is required'),
  }),
  occupation: z.object({
    role: z.string().min(1, 'Occupation is required'),
    type: z.string().min(1, 'Type of work is required'),
  }),
  children: z
    .array(
      z.object({
        name: z.string().min(1, 'Child name is required'),
        age: z.coerce.number().min(1, 'Age is required'),
        gender: z.string().min(1, 'Gender is required'),
        dob: z.string().min(1, 'DOB is required'),
        school: z.string().min(1, 'Current school is required'),
        class: z.string().min(1, 'Current class is required'),
        courses: z
          .array(
            z.object({
              courseName: z.string().min(1, 'Course is required'),
              timeSlotIST: z.string().min(1, 'Time slot is required'),
              localTime: z.string().optional(),
            })
          )
          .min(1, 'At least one course is required'),
      })
    )
    .min(1, 'Add at least one child'),
});

const defaultValues = {
  parents: {
    parent1: { name: '', email: '', phone: '' },
    parent2: { name: '', email: '', phone: '' },
  },
  address: {
    country: '',
    city: '',
    address: '',
    zipcode: '',
  },
  occupation: {
    role: '',
    type: '',
  },
  children: [
    {
      name: '',
      age: '',
      gender: '',
      dob: '',
      school: '',
      class: '',
      courses: [{ courseName: '', timeSlotIST: '', localTime: '' }],
    },
  ],
};

const defaultCmsContent = {
  title: 'Online Course Registration',
  subtitle:
    'Fill in parent details, add children, and assign courses with IST slots. Local time is auto-calculated from the selected country.',
  formTitle: 'Registration Form',
  formNote: '',
  submitButtonText: 'Submit Registration',
  successMessage: 'Registration submitted successfully.',
  countryOptions: COUNTRY_OPTIONS,
  courseOptions: COURSE_OPTIONS,
  slotOptions: IST_TIME_SLOTS,
};

function normalizeSimpleOptions(list, fallback) {
  if (!Array.isArray(list) || !list.length) return fallback;
  const rows = list
    .map((item) => ({
      value: String(item?.value || '').trim(),
      label: String(item?.label || '').trim(),
    }))
    .filter((item) => item.value && item.label);
  return rows.length ? rows : fallback;
}

function normalizeCountryOptions(list) {
  const fallback = COUNTRY_OPTIONS;
  if (!Array.isArray(list) || !list.length) return fallback;
  const rows = list
    .map((item) => ({
      value: String(item?.value || '').trim(),
      label: String(item?.label || '').trim(),
      timezone: String(item?.timezone || '').trim(),
    }))
    .filter((item) => item.value && item.label && item.timezone);
  return rows.length ? rows : fallback;
}

function toSimpleOptionsText(list) {
  return list.map((item) => `${item.value}|${item.label}`).join('\n');
}

function toCountryOptionsText(list) {
  return list.map((item) => `${item.value}|${item.label}|${item.timezone}`).join('\n');
}

function parseSimpleOptionsText(text, fallback) {
  const rows = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, label] = line.split('|').map((part) => String(part || '').trim());
      return { value, label };
    })
    .filter((item) => item.value && item.label);
  return rows.length ? rows : fallback;
}

function parseCountryOptionsText(text) {
  const rows = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, label, timezone] = line.split('|').map((part) => String(part || '').trim());
      return { value, label, timezone };
    })
    .filter((item) => item.value && item.label && item.timezone);
  return rows.length ? rows : COUNTRY_OPTIONS;
}

export default function OnlineCourseRegistration() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin/register/online-course';
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cms = useLiveContent('online-course-registration', defaultCmsContent);
  const content = useMemo(
    () => ({
      ...defaultCmsContent,
      ...(cms || {}),
      countryOptions: normalizeCountryOptions(cms?.countryOptions),
      courseOptions: normalizeSimpleOptions(cms?.courseOptions, COURSE_OPTIONS),
      slotOptions: normalizeSimpleOptions(cms?.slotOptions, IST_TIME_SLOTS),
    }),
    [cms]
  );
  const [editor, setEditor] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [adminEditMode, setAdminEditMode] = useState(false);
  const [adminPreviewExpanded, setAdminPreviewExpanded] = useState(true);
  const [adminTab, setAdminTab] = useState('registration-form');
  const [adminItems, setAdminItems] = useState([]);
  const [adminPage, setAdminPage] = useState(1);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [genderFilter, setGenderFilter] = useState('');
  const [ageFilterMode, setAgeFilterMode] = useState('range');
  const [ageSingle, setAgeSingle] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'children',
  });

  const countryValue = useWatch({ control, name: 'address.country' });
  const countryTimezone =
    content.countryOptions.find((c) => c.value === countryValue)?.timezone || '';

  useEffect(() => {
    setEditor({
      title: content.title || '',
      subtitle: content.subtitle || '',
      formTitle: content.formTitle || '',
      formNote: content.formNote || '',
      submitButtonText: content.submitButtonText || '',
      successMessage: content.successMessage || '',
      countryOptionsText: toCountryOptionsText(content.countryOptions),
      courseOptionsText: toSimpleOptionsText(content.courseOptions),
      slotOptionsText: toSimpleOptionsText(content.slotOptions),
    });
  }, [content]);

  const buildPayloadFromEditor = () => {
    if (!editor) return content;
    return {
      title: String(editor.title || '').trim() || defaultCmsContent.title,
      subtitle: String(editor.subtitle || '').trim() || defaultCmsContent.subtitle,
      formTitle: String(editor.formTitle || '').trim() || defaultCmsContent.formTitle,
      formNote: String(editor.formNote || '').trim(),
      submitButtonText:
        String(editor.submitButtonText || '').trim() || defaultCmsContent.submitButtonText,
      successMessage:
        String(editor.successMessage || '').trim() || defaultCmsContent.successMessage,
      countryOptions: parseCountryOptionsText(editor.countryOptionsText),
      courseOptions: parseSimpleOptionsText(editor.courseOptionsText, COURSE_OPTIONS),
      slotOptions: parseSimpleOptionsText(editor.slotOptionsText, IST_TIME_SLOTS),
    };
  };

  const hasUnsavedAdminChanges = useMemo(() => {
    if (!isAdmin || !editor) return false;
    const nextPayload = buildPayloadFromEditor();
    return JSON.stringify(nextPayload) !== JSON.stringify(content);
  }, [isAdmin, editor, content]);

  const allCourseOptions = useMemo(() => {
    const set = new Set();
    adminItems.forEach((item) => {
      (item.children || []).forEach((child) => {
        (child.courses || []).forEach((course) => {
          if (course?.courseName) set.add(course.courseName);
        });
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [adminItems]);

  const allSlotOptions = useMemo(() => {
    const set = new Set();
    adminItems.forEach((item) => {
      (item.children || []).forEach((child) => {
        (child.courses || []).forEach((course) => {
          if (course?.timeSlotIST) set.add(course.timeSlotIST);
        });
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [adminItems]);

  const allGenderOptions = useMemo(() => {
    const set = new Set();
    adminItems.forEach((item) => {
      (item.children || []).forEach((child) => {
        if (child?.gender) set.add(String(child.gender));
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [adminItems]);

  const filteredAdminItems = useMemo(() => {
    return adminItems.filter((item) => {
      const children = Array.isArray(item.children) ? item.children : [];
      const allCourses = children.flatMap((child) => (child.courses || []).map((c) => c.courseName).filter(Boolean));
      const allSlots = children.flatMap((child) => (child.courses || []).map((c) => c.timeSlotIST).filter(Boolean));
      const allAges = children.map((child) => Number(child.age)).filter((age) => Number.isFinite(age));
      const allGenders = children.map((child) => String(child.gender || '').trim()).filter(Boolean);

      if (genderFilter && !allGenders.includes(genderFilter)) return false;
      if (selectedCourses.length && !selectedCourses.some((course) => allCourses.includes(course))) {
        return false;
      }
      if (selectedSlots.length && !selectedSlots.some((slot) => allSlots.includes(slot))) {
        return false;
      }

      if (ageFilterMode === 'single' && String(ageSingle).trim()) {
        const target = Number(ageSingle);
        if (!Number.isFinite(target) || !allAges.includes(target)) return false;
      }

      if (ageFilterMode === 'range') {
        const min = String(ageMin).trim() === '' ? null : Number(ageMin);
        const max = String(ageMax).trim() === '' ? null : Number(ageMax);
        if (min !== null && !Number.isFinite(min)) return false;
        if (max !== null && !Number.isFinite(max)) return false;
        if (min !== null || max !== null) {
          const hasAgeInRange = allAges.some((age) => {
            if (min !== null && age < min) return false;
            if (max !== null && age > max) return false;
            return true;
          });
          if (!hasAgeInRange) return false;
        }
      }

      return true;
    });
  }, [adminItems, genderFilter, selectedCourses, selectedSlots, ageFilterMode, ageSingle, ageMin, ageMax]);

  const hasAnyFilterApplied =
    Boolean(genderFilter) ||
    Boolean(String(ageSingle).trim()) ||
    Boolean(String(ageMin).trim()) ||
    Boolean(String(ageMax).trim()) ||
    selectedCourses.length > 0 ||
    selectedSlots.length > 0;

  const adminItemsPerPage = 10;
  const adminTotalPages = Math.max(1, Math.ceil(filteredAdminItems.length / adminItemsPerPage));
  const paginatedAdminItems = useMemo(() => {
    const start = (adminPage - 1) * adminItemsPerPage;
    return filteredAdminItems.slice(start, start + adminItemsPerPage);
  }, [filteredAdminItems, adminPage]);

  useEffect(() => {
    if (!isAdmin) return;
    adminRequest('/api/registrations/admin/online-course')
      .then((res) => setAdminItems(Array.isArray(res?.items) ? res.items : []))
      .catch((error) => {
        setStatus({ type: 'error', message: error.message || 'Unable to load registrations.' });
      });
  }, [isAdmin]);

  useEffect(() => {
    if (adminPage > adminTotalPages) setAdminPage(adminTotalPages);
  }, [adminPage, adminTotalPages]);

  useEffect(() => {
    setAdminPage(1);
  }, [adminTab, genderFilter, ageFilterMode, ageSingle, ageMin, ageMax, selectedCourses, selectedSlots]);

  const onSubmit = async (values) => {
    const enriched = {
      ...values,
      children: values.children.map((child) => ({
        ...child,
        courses: child.courses.map((course) => ({
          ...course,
          localTime: convertIstSlotToTimezone(course.timeSlotIST, countryTimezone),
        })),
      })),
    };
    try {
      const res = await apiRequest('/api/registrations/online-course', {
        method: 'POST',
        body: JSON.stringify(enriched),
      });
      setStatus({
        type: 'success',
        message: content.successMessage || defaultCmsContent.successMessage,
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to submit registration.' });
    }
  };

  const saveAdminContent = async () => {
    const payload = buildPayloadFromEditor();
    try {
      await adminRequest('/api/admin/content/online-course-registration', {
        method: 'PUT',
        body: JSON.stringify({ content: payload }),
      });
      setStatus({ type: 'success', message: 'Online course page content updated.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to save online course content.' });
    }
  };

  return (
    <PageFade>
      <Container className="pb-24 pt-10 md:pb-28 md:pt-14">
        {isAdmin ? (
          <section className="mb-4 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAdminTab('registration-form')}
                className={`rounded-full px-4 py-2 text-sm ${
                  adminTab === 'registration-form'
                    ? 'bg-accent text-white dark:bg-emerald-700'
                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                Registration Form
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('all-registrations')}
                className={`rounded-full px-4 py-2 text-sm ${
                  adminTab === 'all-registrations'
                    ? 'bg-accent text-white dark:bg-emerald-700'
                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                All Registrations
              </button>
            </div>
          </section>
        ) : null}
        {isAdmin && adminTab === 'registration-form' ? (
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-prose-muted">
              Admin preview mode: matches user page. Submit stays disabled.
            </p>
            <div className="flex items-center gap-2">
              {!adminEditMode ? (
                <button
                  type="button"
                  onClick={() => setAdminEditMode(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-1.5 text-base font-medium text-accent shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-emerald-200 dark:hover:bg-neutral-800"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                  Editing form content
                </span>
              )}
            </div>
          </div>
        ) : null}
        {isAdmin && adminTab === 'registration-form' && adminEditMode ? (
          <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="heading-card">Admin: Online Course Registration CMS</h2>
            <p className="mt-2 text-sm text-prose-muted">
              Customize what users see and how they can register. Use format:
              <code className="mx-1">value|label</code> (or <code>value|label|timezone</code> for countries), one per line.
            </p>
            {editor ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm md:col-span-2 text-neutral-800 dark:text-neutral-200">
                  Page Title
                  <input
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={editor.title}
                    onChange={(e) => setEditor((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </label>
                <label className="text-sm md:col-span-2 text-neutral-800 dark:text-neutral-200">
                  Page Subtitle
                  <textarea
                    className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={editor.subtitle}
                    onChange={(e) => setEditor((prev) => ({ ...prev, subtitle: e.target.value }))}
                  />
                </label>
                <label className="text-sm text-neutral-800 dark:text-neutral-200">
                  Form Title
                  <input
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={editor.formTitle}
                    onChange={(e) => setEditor((prev) => ({ ...prev, formTitle: e.target.value }))}
                  />
                </label>
                <label className="text-sm text-neutral-800 dark:text-neutral-200">
                  Submit Button Text
                  <input
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={editor.submitButtonText}
                    onChange={(e) => setEditor((prev) => ({ ...prev, submitButtonText: e.target.value }))}
                  />
                </label>
                <label className="text-sm md:col-span-2 text-neutral-800 dark:text-neutral-200">
                  Form Note
                  <textarea
                    className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={editor.formNote}
                    onChange={(e) => setEditor((prev) => ({ ...prev, formNote: e.target.value }))}
                  />
                </label>
                <label className="text-sm md:col-span-2 text-neutral-800 dark:text-neutral-200">
                  Success Message
                  <input
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={editor.successMessage}
                    onChange={(e) => setEditor((prev) => ({ ...prev, successMessage: e.target.value }))}
                  />
                </label>
                <label className="text-sm text-neutral-800 dark:text-neutral-200">
                  Countries (value|label|timezone)
                  <textarea
                    className="mt-1 h-28 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={editor.countryOptionsText}
                    onChange={(e) => setEditor((prev) => ({ ...prev, countryOptionsText: e.target.value }))}
                  />
                </label>
                <label className="text-sm text-neutral-800 dark:text-neutral-200">
                  Courses (value|label)
                  <textarea
                    className="mt-1 h-28 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={editor.courseOptionsText}
                    onChange={(e) => setEditor((prev) => ({ ...prev, courseOptionsText: e.target.value }))}
                  />
                </label>
                <label className="text-sm text-neutral-800 dark:text-neutral-200">
                  IST Time Slots (value|label)
                  <textarea
                    className="mt-1 h-28 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={editor.slotOptionsText}
                    onChange={(e) => setEditor((prev) => ({ ...prev, slotOptionsText: e.target.value }))}
                  />
                </label>
              </div>
            ) : null}
            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditor({
                    title: content.title || '',
                    subtitle: content.subtitle || '',
                    formTitle: content.formTitle || '',
                    formNote: content.formNote || '',
                    submitButtonText: content.submitButtonText || '',
                    successMessage: content.successMessage || '',
                    countryOptionsText: toCountryOptionsText(content.countryOptions),
                    courseOptionsText: toSimpleOptionsText(content.courseOptions),
                    slotOptionsText: toSimpleOptionsText(content.slotOptions),
                  });
                  setAdminEditMode(false);
                  setAdminPreviewExpanded(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAdminContent}
                disabled={!hasUnsavedAdminChanges}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <Save className="h-4 w-4" />
                Save Form Content
              </button>
            </div>
          </section>
        ) : null}
        {isAdmin && adminTab === 'all-registrations' ? (
          <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="heading-card">All Registrations</h2>
              <p className="text-xs text-prose-muted">
                Showing <span className="font-semibold">{filteredAdminItems.length}</span> of{' '}
                <span className="font-semibold">{adminItems.length}</span>
              </p>
            </div>
            <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/40">
              <button
                type="button"
                onClick={() => setFiltersExpanded((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent dark:border-emerald-500/30 dark:bg-emerald-900/30 dark:text-emerald-200"
              >
                {filtersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Filters
              </button>
              {!filtersExpanded ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {genderFilter ? (
                    <button
                      type="button"
                      onClick={() => setGenderFilter('')}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      Gender: {genderFilter}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                  {ageFilterMode === 'single' && String(ageSingle).trim() ? (
                    <button
                      type="button"
                      onClick={() => setAgeSingle('')}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      Age: {ageSingle}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                  {ageFilterMode === 'range' && (String(ageMin).trim() || String(ageMax).trim()) ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAgeMin('');
                        setAgeMax('');
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      Age: {ageMin || '-'} to {ageMax || '-'}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                  {selectedCourses.map((course) => (
                    <button
                      key={`chip-course-${course}`}
                      type="button"
                      onClick={() =>
                        setSelectedCourses((prev) => prev.filter((value) => value !== course))
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      Course: {course}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                  {selectedSlots.map((slot) => (
                    <button
                      key={`chip-slot-${slot}`}
                      type="button"
                      onClick={() =>
                        setSelectedSlots((prev) => prev.filter((value) => value !== slot))
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      Slot: {slot}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                  {!hasAnyFilterApplied ? (
                    <p className="text-xs text-prose-muted">No filters applied.</p>
                  ) : null}
                </div>
              ) : null}
              {filtersExpanded ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    Gender
                    <select
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                    >
                      <option value="">All</option>
                      {allGenderOptions.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="text-sm text-neutral-800 dark:text-neutral-200">
                    Age
                    <div className="mt-1 flex items-center gap-2">
                      <select
                        className="w-28 rounded-lg border border-neutral-300 px-2 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                        value={ageFilterMode}
                        onChange={(e) => setAgeFilterMode(e.target.value)}
                      >
                        <option value="range">Range</option>
                        <option value="single">Single</option>
                      </select>
                      {ageFilterMode === 'single' ? (
                        <input
                          type="number"
                          min="1"
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                          placeholder="Age"
                          value={ageSingle}
                          onChange={(e) => setAgeSingle(e.target.value)}
                        />
                      ) : (
                        <>
                          <input
                            type="number"
                            min="1"
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                            placeholder="Min"
                            value={ageMin}
                            onChange={(e) => setAgeMin(e.target.value)}
                          />
                          <input
                            type="number"
                            min="1"
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                            placeholder="Max"
                            value={ageMax}
                            onChange={(e) => setAgeMax(e.target.value)}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    Courses (multi)
                    <select
                      multiple
                      className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-2 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={selectedCourses}
                      onChange={(e) =>
                        setSelectedCourses(Array.from(e.target.selectedOptions).map((opt) => opt.value))
                      }
                    >
                      {allCourseOptions.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    Time Slots (multi)
                    <select
                      multiple
                      className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-2 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={selectedSlots}
                      onChange={(e) =>
                        setSelectedSlots(Array.from(e.target.selectedOptions).map((opt) => opt.value))
                      }
                    >
                      {allSlotOptions.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="md:col-span-2 lg:col-span-4">
                    <button
                      type="button"
                      onClick={() => {
                        setGenderFilter('');
                        setAgeFilterMode('range');
                        setAgeSingle('');
                        setAgeMin('');
                        setAgeMax('');
                        setSelectedCourses([]);
                        setSelectedSlots([]);
                      }}
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="space-y-3">
              {paginatedAdminItems.map((item) => {
                const children = Array.isArray(item.children) ? item.children : [];
                const genders = Array.from(
                  new Set(children.map((child) => String(child?.gender || '').trim()).filter(Boolean))
                );
                const ages = children
                  .map((child) => Number(child?.age))
                  .filter((age) => Number.isFinite(age));
                const ageSummary = ages.length
                  ? `${Math.min(...ages)}-${Math.max(...ages)}`
                  : '-';
                const courseList = Array.from(
                  new Set(
                    children.flatMap((child) =>
                      (child.courses || []).map((course) => String(course?.courseName || '').trim())
                    ).filter(Boolean)
                  )
                );
                const slotList = Array.from(
                  new Set(
                    children.flatMap((child) =>
                      (child.courses || []).map((course) => String(course?.timeSlotIST || '').trim())
                    ).filter(Boolean)
                  )
                );
                return (
                  <article
                    key={item._id}
                    className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.parents?.parent1?.name || 'Parent'} ({item.parents?.parent1?.email || '-'})
                        </p>
                        <p className="text-sm text-prose-muted">
                          Parent 1 Phone: {item.parents?.parent1?.phone || '-'} | Children: {children.length} | Country: {item.address?.country || '-'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                            Gender: {genders.length ? genders.join(', ') : '-'}
                          </span>
                          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                            Age: {ageSummary}
                          </span>
                          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                            Courses: {courseList.length ? courseList.join(', ') : '-'}
                          </span>
                          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                            Slots: {slotList.length ? slotList.join(', ') : '-'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-prose-muted">
                          Submitted: {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedRegistration(item)}
                        className="rounded-md bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                );
              })}
              {!filteredAdminItems.length ? (
                <p className="text-sm text-prose-muted">No online course registrations yet.</p>
              ) : null}
            </div>
            {filteredAdminItems.length > adminItemsPerPage ? (
              <div className="mt-4 flex items-center justify-between text-xs text-prose-muted">
                <p>
                  Page {adminPage} of {adminTotalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminPage((p) => Math.max(1, p - 1))}
                    disabled={adminPage === 1}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminPage((p) => Math.min(adminTotalPages, p + 1))}
                    disabled={adminPage === adminTotalPages}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : (
          <section
            className={
              isAdmin
                ? 'mb-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900'
                : ''
            }
          >
            {adminEditMode ? (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setAdminPreviewExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/15 dark:border-emerald-500/30 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                >
                  {adminPreviewExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Preview
                </button>
              </div>
            ) : null}
            {adminPreviewExpanded ? (
              <>
                <header className="mb-8">
                  <h1 className="heading-page">{content.title}</h1>
                  <p className="mt-3 max-w-3xl text-prose">
                    {content.subtitle}
                  </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SectionCard
            title="1. Parent Details"
            subtitle="Primary parent is mandatory. Secondary parent is optional."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <FormInput
                label="Parent 1 Name"
                required
                {...register('parents.parent1.name')}
                error={errors?.parents?.parent1?.name?.message}
              />
              <FormInput
                label="Parent 1 Email"
                required
                type="email"
                {...register('parents.parent1.email')}
                error={errors?.parents?.parent1?.email?.message}
              />
              <PhoneInput
                label="Parent 1 Phone"
                required
                name="parents.parent1.phone"
                control={control}
                error={errors?.parents?.parent1?.phone?.message}
                isDark={isDark}
              />
              <FormInput
                label="Parent 2 Name"
                {...register('parents.parent2.name')}
                error={errors?.parents?.parent2?.name?.message}
              />
              <FormInput
                label="Parent 2 Email"
                type="email"
                {...register('parents.parent2.email')}
                error={errors?.parents?.parent2?.email?.message}
              />
              <PhoneInput
                label="Parent 2 Phone"
                name="parents.parent2.phone"
                control={control}
                error={errors?.parents?.parent2?.phone?.message}
                isDark={isDark}
              />
            </div>
          </SectionCard>

          <SectionCard title="2. Address Details">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormSelect
                name="address.country"
                control={control}
                label="Country"
                required
                options={content.countryOptions}
                placeholder="Select country"
                error={errors?.address?.country?.message}
                isDark={isDark}
              />
              <FormInput
                label="City"
                required
                {...register('address.city')}
                error={errors?.address?.city?.message}
              />
              <FormInput
                label="Zipcode"
                required
                {...register('address.zipcode')}
                error={errors?.address?.zipcode?.message}
              />
            </div>
            <div className="mt-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Address <span className="text-red-500">*</span>
                </span>
                <textarea
                  rows={3}
                  {...register('address.address')}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-500 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                />
              </label>
              {errors?.address?.address?.message ? (
                <p className="mt-1 text-xs text-red-500">
                  {errors.address.address.message}
                </p>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard title="3. Occupation Details">
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Occupation"
                required
                {...register('occupation.role')}
                error={errors?.occupation?.role?.message}
              />
              <FormInput
                label="Type of Work"
                required
                {...register('occupation.type')}
                error={errors?.occupation?.type?.message}
              />
            </div>
          </SectionCard>

          <SectionCard
            title={`4. Children (${fields.length})`}
            subtitle="Add one or more children and assign at least one course per child."
          >
            <div className="space-y-4">
              {fields.map((field, childIndex) => (
                <ChildCard
                  key={field.id}
                  control={control}
                  register={register}
                  errors={errors}
                  childIndex={childIndex}
                  onRemoveChild={() => remove(childIndex)}
                  countryTimezone={countryTimezone}
                  isDark={isDark}
                  courseOptions={content.courseOptions}
                  slotOptions={content.slotOptions}
                />
              ))}
            </div>
            <div className="mt-4">
              <AddButton
                onClick={() =>
                  append({
                    name: '',
                    age: '',
                    gender: '',
                    dob: '',
                    school: '',
                    class: '',
                    courses: [
                      { courseName: '', timeSlotIST: '', localTime: '' },
                    ],
                  })
                }
              >
                Add Child
              </AddButton>
            </div>
          </SectionCard>

          <motion.div
            className="sticky bottom-4 z-10 rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-nav backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/95 dark:shadow-nav-dark"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
              <p className="text-sm text-prose-muted">
                Review all sections before submission. Errors will be shown inline.
              </p>
              <button
                type="submit"
                disabled={isSubmitting || isAdmin}
                className="w-full rounded-xl border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-700 md:w-auto"
              >
                {isSubmitting ? 'Submitting...' : content.submitButtonText}
              </button>
            </div>
          </motion.div>
                </form>
                <p className="mt-3 text-xs text-prose-muted">
                  Submit is disabled for admin preview. Use Edit to customize what users see.
                </p>
              </>
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-prose-muted dark:border-neutral-700 dark:bg-neutral-900/70">
                Preview is collapsed while editing. Click <span className="font-medium">Preview</span> to expand and view the user-facing form.
              </div>
            )}
          </section>
        )}
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
      {selectedRegistration ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Registration Details
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Parent 1</p>
                <p className="mt-1">{selectedRegistration.parents?.parent1?.name || '-'}</p>
                <p>{selectedRegistration.parents?.parent1?.email || '-'}</p>
                <p>{selectedRegistration.parents?.parent1?.phone || '-'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Parent 2</p>
                <p className="mt-1">{selectedRegistration.parents?.parent2?.name || '-'}</p>
                <p>{selectedRegistration.parents?.parent2?.email || '-'}</p>
                <p>{selectedRegistration.parents?.parent2?.phone || '-'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Address</p>
                <p className="mt-1">{selectedRegistration.address?.address || '-'}</p>
                <p>{selectedRegistration.address?.city || '-'}, {selectedRegistration.address?.country || '-'}</p>
                <p>{selectedRegistration.address?.zipcode || '-'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Occupation</p>
                <p className="mt-1">{selectedRegistration.occupation?.role || '-'}</p>
                <p>{selectedRegistration.occupation?.type || '-'}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Children</p>
              {(selectedRegistration.children || []).map((child, idx) => (
                <div
                  key={`${child.name || 'child'}-${idx}`}
                  className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-700"
                >
                  <p className="font-medium">{child.name || '-'} | Age: {child.age || '-'}</p>
                  <p className="text-prose-muted">DOB: {child.dob || '-'} | School: {child.school || '-'} | Class: {child.class || '-'}</p>
                  <ul className="mt-2 list-disc pl-5 text-prose-muted">
                    {(child.courses || []).map((course, cIdx) => (
                      <li key={`${course.courseName || 'course'}-${cIdx}`}>
                        {course.courseName || '-'} | IST: {course.timeSlotIST || '-'} | Local: {course.localTime || '-'}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRegistration(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageFade>
  );
}
