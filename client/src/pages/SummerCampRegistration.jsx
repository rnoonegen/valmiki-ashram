import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Pencil, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { z } from 'zod';
import { adminRequest, apiRequest, getApiBase } from '../admin/api';
import Container from '../components/Container';
import FormSelect from '../components/forms/FormSelect';
import PhoneInput from '../components/forms/PhoneInput';
import RequiredStar from '../components/forms/RequiredStar';
import PageFade from '../components/PageFade';
import { useTheme } from '../context/ThemeContext';
import { COUNTRY_OPTIONS } from '../data/registrationOptions';
import useLiveContent from '../hooks/useLiveContent';
import {
  buildCampYearSelectYears,
  getCampYearBounds,
  isValidEmail,
  normalizeEmail,
  parseCampYearForSave,
  zodRequiredEmail,
} from '../utils/formInput';
import { flattenRhfErrorMessages } from '../utils/formErrors';

const schema = z.object({
  parentEmail: zodRequiredEmail('Enter a valid email'),
  parentName: z.string().min(1, 'Parent name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  mobileNumber: z.string().min(7, 'Mobile number is required'),
  motherTongue: z.string().min(1, 'Mother tongue is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  children: z.array(
    z.object({
      name: z.string().min(1, 'Child name is required'),
      age: z.coerce.number().min(1).max(21),
      gender: z.string().min(1, 'Gender is required'),
      dob: z.string().min(1, 'DOB is required'),
      school: z.string().min(1, 'Current school is required'),
      currentClass: z.string().min(1, 'Current class is required'),
      schoolName: z.string().optional(),
      interestedBatches: z.array(z.string()).min(1, 'Select at least one batch'),
    })
  ).min(1, 'Add at least one child'),
  familyMembers: z.array(
    z.object({
      name: z.string().min(1, 'Family member name is required'),
      relationWithChild: z.string().min(1, 'Relation with child is required'),
      stayingDays: z.coerce.number().min(1, 'Days must be at least 1'),
    })
  ).default([]),
  transactionNote: z.string().optional(),
  paymentScreenshotUrl: z.string().url('Enter valid URL').optional().or(z.literal('')),
  source: z.string().min(1, 'Please choose one source'),
  sourceOther: z.string().optional(),
});

const ENTRY_EDITOR_REQUIRED_KEYS = [
  'registrationCampId',
  'registrationCampTitle',
  'email',
  'guardianName',
  'relationship',
  'mobileNumber',
  'motherTongue',
  'country',
  'state',
  'city',
  'childName',
  'childAge',
  'gender',
  'schoolName',
  'currentClass',
  'source',
];

const ENTRY_EDITOR_REQUIRED_SET = new Set(ENTRY_EDITOR_REQUIRED_KEYS);

const ENTRY_EDITOR_LABELS = {
  registrationCampId: 'Registration camp ID',
  registrationCampTitle: 'Camp title',
  email: 'Parent email',
  guardianName: 'Parent / guardian name',
  relationship: 'Relationship',
  mobileNumber: 'Mobile number',
  motherTongue: 'Mother tongue',
  country: 'Country',
  state: 'State',
  city: 'City',
  childName: 'Child name',
  childAge: 'Child age',
  gender: 'Gender',
  schoolName: 'School',
  currentClass: 'Current class',
  source: 'How did you hear about us',
};

function createDefaultContent(campLabel, campLabelLower) {
  return {
  title: `Valmiki Ashram ${campLabel} Registration`,
  subtitle:
    `A Gurukul-inspired weekly ${campLabelLower} focused on discipline, confidence, cultural grounding, and joy.`,
  formTitle: 'Register Now',
  formNote: '',
  registrationMode: 'built-in-form',
  googleFormUrl: '',
  googleFormButtonLabel: 'Register Now',
  googleFormHelperText: 'Continue your registration using our secure Google Form.',
  statusMessages: {
    open: {
      title: 'Registrations are currently open',
      message: 'Secure your slot by submitting the registration form below. Limited seats per batch.',
      ctaLabel: '',
      ctaLink: '',
      blocks: [],
    },
    closed: {
      title: 'Registrations are closed',
      message: 'Registrations are closed for now. Please check back later.',
      ctaLabel: '',
      ctaLink: '',
      blocks: [],
    },
    upcoming: {
      title: 'Registrations are not open yet',
      message: 'Registrations will open soon. Please stay tuned.',
      ctaLabel: '',
      ctaLink: '',
      blocks: [],
    },
    empty: {
      title: 'No registration is available right now',
      message: `A new ${campLabelLower} registration cycle has not been published yet.`,
      ctaLabel: 'Get in Touch',
      ctaLink: '/contact',
      blocks: [],
    },
  },
  registrationCamps: [],
  ageGuidelines: ['5-8 years: Parent/guardian required', '9-15 years: Independent participation allowed'],
  highlights: [
    'Dinacharya & nature-based morning rituals',
    'Yoga, dhyana & pranayama',
    'Samskrutham basics & shloka chanting',
    'Ramayana-Mahabharata katha',
    'Traditional arts: pottery, clay modeling, folk painting, theatre & music',
  ],
  batches: [
    'Batch 1: April 19th - April 25th',
    'Batch 2: April 26th - May 2nd',
    'Batch 3: May 3rd - May 9th',
    'Batch 4: May 10th - May 16th',
  ],
  batchDays: {
    'Batch 1: April 19th - April 25th': 7,
    'Batch 2: April 26th - May 2nd': 7,
    'Batch 3: May 3rd - May 9th': 7,
    'Batch 4: May 10th - May 16th': 7,
  },
  registrationFee: 999,
  perPersonPerDayPrice: 1999,
  pricing: 'Registration: Rs 999 per family (non-refundable)',
  residencePricing: 'Residential (Per day/person): Rs 1,999 (minimum stay of 1 week)',
  payment: {
    bankName: 'Bank of Maharashtra',
    accountHolder: 'The Change Foundation',
    accountNumber: '60160320009',
    ifsc: 'MAHB0001420',
  },
  transactionHint: `${campLabel} - Batch # and Child/Children Name`,
};
}

function rhfFieldClass(hasError) {
  const base =
    'mt-1 w-full rounded-lg border px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400';
  return `${base} ${hasError ? 'border-rose-400 dark:border-rose-600' : 'border-neutral-300 dark:border-neutral-700'}`;
}

const defaultValues = {
  parentEmail: '',
  parentName: '',
  relationship: '',
  mobileNumber: '',
  motherTongue: '',
  country: '',
  state: '',
  city: '',
  children: [
    {
      name: '',
      age: '',
      gender: '',
      dob: '',
      school: '',
      currentClass: '',
      interestedBatches: [],
    },
  ],
  familyMembers: [],
  transactionNote: '',
  paymentScreenshotUrl: '',
  source: '',
  sourceOther: '',
};

const toINRCurrency = (amount) =>
  `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;

const normalizeBatchDays = (rows, fallbackBatches, fallbackMap) => {
  const map = {};
  (fallbackBatches || []).forEach((batch) => {
    const fallback = Number(fallbackMap?.[batch]);
    map[batch] = Number.isFinite(fallback) && fallback > 0 ? fallback : 7;
  });
  if (!rows || typeof rows !== 'object') return map;
  Object.entries(rows).forEach(([batch, days]) => {
    const n = Number(days);
    if (batch && Number.isFinite(n) && n > 0) map[batch] = n;
  });
  return map;
};

const toBatchRows = (batches = [], batchDays = {}, batchConfigs = []) => {
  if (Array.isArray(batchConfigs) && batchConfigs.length) {
    return batchConfigs.map((row, index) => ({
      id: String(row?.id || `batch-${Date.now()}-${index}`),
      label: String(row?.label || '').trim(),
      startDate: String(row?.startDate || '').trim(),
      endDate: String(row?.endDate || '').trim(),
      days: Number(row?.days) || Number(batchDays?.[row?.label]) || 7,
    }));
  }
  return (batches || []).map((batch, index) => ({
    id: `batch-${Date.now()}-${index}`,
    label: String(batch || '').trim(),
    startDate: '',
    endDate: '',
    days: Number(batchDays?.[batch]) || 7,
  }));
};

const buildBatchPayload = (rows = []) => {
  const normalized = rows
    .map((row, index) => ({
      id: String(row?.id || `batch-${Date.now()}-${index}`),
      label: String(row?.label || '').trim(),
      startDate: String(row?.startDate || '').trim(),
      endDate: String(row?.endDate || '').trim(),
      days: Number(row?.days) || 0,
    }))
    .filter((row) => row.label);
  const batches = normalized.map((row) => row.label);
  const batchDays = {};
  normalized.forEach((row) => {
    batchDays[row.label] = row.days > 0 ? row.days : 1;
  });
  return { batchRows: normalized, batches, batchDays };
};

const formatBatchDisplayDate = (value) => {
  const date = parseDateInput(value);
  if (!date) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getUTCMonth()];
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${month} ${day} '${year}`;
};

const blueprintPreviewBatchLabel = (row) => {
  const days = Number(row?.days) > 0 ? Number(row.days) : 7;
  const start = formatBatchDisplayDate(row?.startDate);
  const end = formatBatchDisplayDate(row?.endDate);
  const label = String(row?.label || '').trim() || 'Batch';
  if (start && end) return `${label} (${start} - ${end}) (${days} day(s))`;
  return `${label} (${days} day(s))`;
};

const validateBatchRows = (rows = []) => {
  if (!Array.isArray(rows) || !rows.length) return 'Please add at least one batch.';
  let previousEndDate = null;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowLabel = `Batch ${i + 1}`;
    if (!String(row?.label || '').trim()) return `${rowLabel}: name is required.`;
    if (!String(row?.startDate || '').trim() || !String(row?.endDate || '').trim()) {
      return `${rowLabel}: start and end date are required.`;
    }
    if (Number(row?.days) < 1) return `${rowLabel}: days must be at least 1.`;
    const start = new Date(row.startDate);
    const end = new Date(row.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return `${rowLabel}: enter valid dates.`;
    }
    if (start >= end) {
      return `${rowLabel}: start date must be before end date.`;
    }
    if (previousEndDate && previousEndDate >= start) {
      return `${rowLabel}: start date must be after previous batch end date.`;
    }
    previousEndDate = end;
  }
  return '';
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const parseDateInput = (value) => {
  const text = String(value || '').trim();
  if (!text) return null;
  const [year, month, day] = text.split('-').map((v) => Number(v));
  if (!year || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateInput = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const addDays = (date, days) => {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const buildBatchRowUpdate = (row, field, value) => {
  const next = { ...row, [field]: value };
  const start = parseDateInput(field === 'startDate' ? value : row?.startDate);
  const end = parseDateInput(field === 'endDate' ? value : row?.endDate);
  const rawDays = Number(field === 'days' ? value : row?.days);

  if ((field === 'startDate' || field === 'days') && start && Number.isFinite(rawDays) && rawDays > 0) {
    next.days = rawDays;
    next.endDate = formatDateInput(addDays(start, rawDays));
    return next;
  }

  if (field === 'endDate' && start && end) {
    const diff = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
    next.days = Math.max(1, diff);
  }

  return next;
};
const registrationSocket = io(getApiBase(), { autoConnect: true });

export default function SummerCampRegistration({ variant = 'summer' }) {
  const isWinterVariant = variant === 'winter';
  const campLabel = isWinterVariant ? 'Winter Camp' : 'Summer Camp';
  const campLabelLower = isWinterVariant ? 'winter camp' : 'summer camp';
  const adminPath = isWinterVariant ? '/admin/register/winter-camp' : '/admin/register/summer-camp';
  const cmsPageKey = isWinterVariant ? 'winter-camp-registration' : 'summer-camp-registration';
  const publicRegistrationApi = isWinterVariant ? '/api/registrations/winter-camp' : '/api/registrations/summer-camp';
  const adminRegistrationsApiBase = isWinterVariant ? '/api/registrations/admin/winter-camp' : '/api/registrations/admin/summer-camp';
  const adminContentApi = `/api/admin/content/${cmsPageKey}`;
  const defaultContent = useMemo(() => createDefaultContent(campLabel, campLabelLower), [campLabel, campLabelLower]);
  const location = useLocation();
  const isAdmin = location.pathname === adminPath;
  const isPublic = !isAdmin;
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cms = useLiveContent(cmsPageKey, defaultContent);
  const content = useMemo(
    () => ({
      ...defaultContent,
      ...(cms || {}),
      payment: { ...defaultContent.payment, ...(cms?.payment || {}) },
      batches: Array.isArray(cms?.batches) && cms.batches.length ? cms.batches : defaultContent.batches,
      batchDays: normalizeBatchDays(
        cms?.batchDays,
        Array.isArray(cms?.batches) && cms.batches.length ? cms.batches : defaultContent.batches,
        defaultContent.batchDays
      ),
      ageGuidelines:
        Array.isArray(cms?.ageGuidelines) && cms.ageGuidelines.length
          ? cms.ageGuidelines
          : defaultContent.ageGuidelines,
      highlights:
        Array.isArray(cms?.highlights) && cms.highlights.length ? cms.highlights : defaultContent.highlights,
      registrationCamps:
        Array.isArray(cms?.registrationCamps) && cms.registrationCamps.length
          ? cms.registrationCamps
          : defaultContent.registrationCamps,
    }),
    [cms]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { fields: childFields, append: appendChild, remove: removeChild } = useFieldArray({
    control,
    name: 'children',
  });
  const { fields: familyFields, append: appendFamily, remove: removeFamily } = useFieldArray({
    control,
    name: 'familyMembers',
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [adminItems, setAdminItems] = useState([]);
  const [contentEditor, setContentEditor] = useState(null);
  const [entryEditor, setEntryEditor] = useState(null);
  const [entryPreview, setEntryPreview] = useState(null);
  const [campEditor, setCampEditor] = useState(null);
  const campYearSelectModel = useMemo(() => {
    if (!campEditor) return null;
    const bounds = getCampYearBounds();
    return { bounds, ...buildCampYearSelectYears(campEditor.year, bounds) };
  }, [campEditor]);
  const [adminTab, setAdminTab] = useState('registration-form');
  const [contentEditorStateTab, setContentEditorStateTab] = useState('empty');
  const [stateEditorOpen, setStateEditorOpen] = useState(false);
  const [adminBuiltInPreviewExpanded, setAdminBuiltInPreviewExpanded] = useState(false);
  const blueprintPreviewPricing = useMemo(() => {
    if (!contentEditor) return null;
    const reg = Number(contentEditor.registrationFee) || defaultContent.registrationFee;
    const per = Number(contentEditor.perPersonPerDayPrice) || defaultContent.perPersonPerDayPrice;
    const rows = contentEditor.batchRows || [];
    const firstDays = rows[0] && Number(rows[0]?.days) > 0 ? Number(rows[0].days) : 7;
    const childDays = firstDays;
    const famDays = 3;
    const residential = (childDays + famDays) * per;
    return {
      reg,
      per,
      childDays,
      famDays,
      residential,
      total: reg + residential,
    };
  }, [contentEditor, defaultContent.registrationFee, defaultContent.perPersonPerDayPrice]);
  const [selectedCampId, setSelectedCampId] = useState('');
  const [selectedAdminCampId, setSelectedAdminCampId] = useState('');
  const [adminRegistrationsPage, setAdminRegistrationsPage] = useState(1);
  const [campHistoryPage, setCampHistoryPage] = useState(1);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [paymentUploadError, setPaymentUploadError] = useState('');
  const registrationFormRef = useRef(null);
  const source = watch('source');
  const paymentScreenshotUrl = watch('paymentScreenshotUrl');
  const registrationCamps = Array.isArray(content.registrationCamps) ? content.registrationCamps : [];
  const openCamp = registrationCamps.find((c) => c.status === 'open') || null;
  const upcomingCamp = registrationCamps.find((c) => c.status === 'upcoming') || null;
  const registrationState = openCamp
    ? 'open'
    : upcomingCamp
      ? 'upcoming'
      : registrationCamps.length
        ? 'closed'
        : 'empty';
  const isRegistrationOpen = registrationState === 'open';
  const selectedCamp = registrationCamps.find((c) => c.id === selectedCampId) || null;
  const isGoogleFormMode = content.registrationMode === 'google-form';
  const statusTemplates = {
    ...defaultContent.statusMessages,
    ...(content.statusMessages || {}),
  };
  const activeStatusMessage = statusTemplates[registrationState] || defaultContent.statusMessages.empty;
  const activeStatusBlocks = Array.isArray(activeStatusMessage?.blocks) ? activeStatusMessage.blocks : [];
  const showRegistrationFormTab = !isAdmin || adminTab === 'registration-form';
  const showAddCampTab = isAdmin && adminTab === 'add-camp';
  const showCampHistoryTab = isAdmin && adminTab === 'camps-history';
  const addCampDisabled = Boolean(openCamp || upcomingCamp);
  const filteredAdminItems = useMemo(
    () => adminItems.filter((item) => item.registrationCampId === selectedAdminCampId),
    [adminItems, selectedAdminCampId]
  );
  const adminRegistrationsPerPage = 10;
  const adminRegistrationsTotalPages = Math.max(
    1,
    Math.ceil(filteredAdminItems.length / adminRegistrationsPerPage)
  );
  const paginatedAdminItems = useMemo(() => {
    const start = (adminRegistrationsPage - 1) * adminRegistrationsPerPage;
    return filteredAdminItems.slice(start, start + adminRegistrationsPerPage);
  }, [filteredAdminItems, adminRegistrationsPage]);
  const selectedAdminCamp = registrationCamps.find((camp) => camp.id === selectedAdminCampId) || null;
  const campHistoryPerPage = 3;
  const campHistoryTotalPages = Math.max(1, Math.ceil(registrationCamps.length / campHistoryPerPage));
  const paginatedCampsHistory = useMemo(() => {
    const start = (campHistoryPage - 1) * campHistoryPerPage;
    return registrationCamps.slice(start, start + campHistoryPerPage);
  }, [registrationCamps, campHistoryPage]);
  const getStatePreview = (stateKey) => {
    if (stateKey === 'form-blueprint') {
      return null;
    }
    if (!contentEditor) {
      return statusTemplates[stateKey] || defaultContent.statusMessages[stateKey];
    }
    return {
      title: contentEditor[`${stateKey}Title`] || '',
      message: contentEditor[`${stateKey}Message`] || '',
      ctaLabel: contentEditor[`${stateKey}CtaLabel`] || '',
      ctaLink: contentEditor[`${stateKey}CtaLink`] || '',
      blocks: String(contentEditor[`${stateKey}BlocksText`] || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
    };
  };
  const previewStateData = getStatePreview(contentEditorStateTab);
  const isAdminStatePreviewOnly =
    isAdmin && showRegistrationFormTab && contentEditorStateTab !== 'form-blueprint';
  const isAdminBlueprintPreviewOnly =
    isAdmin && showRegistrationFormTab && contentEditorStateTab === 'form-blueprint' && !stateEditorOpen;
  const adminBlueprintMode =
    contentEditorStateTab === 'form-blueprint'
      ? contentEditor?.registrationMode || content.registrationMode || defaultContent.registrationMode
      : content.registrationMode || defaultContent.registrationMode;
  const isGoogleBlueprintMode =
    adminBlueprintMode === 'google-form' || adminBlueprintMode === 'google-form-link';
  const showAdminBuiltInPreviewControls =
    isAdmin &&
    showRegistrationFormTab &&
    contentEditorStateTab === 'form-blueprint' &&
    stateEditorOpen &&
    !isGoogleBlueprintMode;

  useEffect(() => {
    if (isAdmin) {
      if (openCamp?.id) setSelectedCampId(openCamp.id);
      return;
    }
    setSelectedCampId((prev) => {
      if (!prev) return '';
      const matched = registrationCamps.find((camp) => camp.id === prev);
      return matched && matched.status === 'open' ? prev : '';
    });
  }, [isAdmin, openCamp?.id]);

  useEffect(() => {
    if (!isPublic || !(selectedCamp && selectedCamp.status === 'open')) {
      return;
    }
    requestAnimationFrame(() => {
      registrationFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setFocus('parentEmail');
    });
  }, [isPublic, selectedCampId, selectedCamp, setFocus]);

  useEffect(() => {
    if (!status.message) return undefined;
    const timeoutId = setTimeout(() => {
      setStatus({ type: '', message: '' });
    }, 3200);
    return () => clearTimeout(timeoutId);
  }, [status.message]);

  useEffect(() => {
    if (!showCampHistoryTab) return;
    const hasSelected = registrationCamps.some((camp) => camp.id === selectedAdminCampId);
    if (hasSelected) return;
    setSelectedAdminCampId(registrationCamps[0]?.id || '');
  }, [showCampHistoryTab, registrationCamps, selectedAdminCampId]);

  useEffect(() => {
    setAdminRegistrationsPage(1);
  }, [selectedAdminCampId]);

  useEffect(() => {
    if (adminRegistrationsPage > adminRegistrationsTotalPages) {
      setAdminRegistrationsPage(adminRegistrationsTotalPages);
    }
  }, [adminRegistrationsPage, adminRegistrationsTotalPages]);

  useEffect(() => {
    if (!showCampHistoryTab) return;
    setCampHistoryPage(1);
  }, [showCampHistoryTab]);

  useEffect(() => {
    if (campHistoryPage > campHistoryTotalPages) {
      setCampHistoryPage(campHistoryTotalPages);
    }
  }, [campHistoryPage, campHistoryTotalPages]);

  useEffect(() => {
    if (isAdmin && showRegistrationFormTab && !stateEditorOpen) {
      openContentEditor();
    }
  }, [isAdmin, showRegistrationFormTab, content, stateEditorOpen]);
  const loadAdminItems = async () => {
    if (!isAdmin) return;
    try {
      const res = await adminRequest(adminRegistrationsApiBase);
      setAdminItems(res?.items || []);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to load registrations.' });
    }
  };

  useEffect(() => {
    loadAdminItems();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const onRegistrationsUpdated = (payload = {}) => {
      const action = payload.action;
      const item = payload.item;
      if (action === 'created' && item?._id) {
        setAdminItems((prev) => {
          if (prev.some((row) => row._id === item._id)) return prev;
          return [item, ...prev];
        });
        return;
      }
      if (action === 'updated' && item?._id) {
        setAdminItems((prev) => prev.map((row) => (row._id === item._id ? item : row)));
        return;
      }
      if (action === 'deleted' && payload.id) {
        setAdminItems((prev) => prev.filter((row) => row._id !== payload.id));
      }
    };
    registrationSocket.on('registrations:updated', onRegistrationsUpdated);
    return () => {
      registrationSocket.off('registrations:updated', onRegistrationsUpdated);
    };
  }, [isAdmin]);

  const onSubmit = async (values) => {
    const submitCamp = selectedCamp && selectedCamp.status === 'open' ? selectedCamp : openCamp;
    if (!submitCamp) {
      setStatus({ type: 'error', message: `No open ${campLabelLower} registration is currently configured.` });
      return;
    }
    try {
      await apiRequest(publicRegistrationApi, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          children: (values.children || []).map((child) => ({
            ...child,
            schoolName: String(child?.schoolName || child?.school || '').trim(),
          })),
          registrationFee: Number(activeCampContent.registrationFee || 0),
          perPersonPerDayPrice: Number(activeCampContent.perPersonPerDayPrice || 0),
          childStayDaysTotal,
          familyStayDaysTotal,
          totalAmountPayable,
          registrationCampId: submitCamp.id,
          registrationCampTitle: submitCamp.title,
        }),
      });
      setStatus({ type: 'success', message: 'Registration submitted successfully.' });
      reset(defaultValues);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to submit registration.' });
    }
  };

  const handlePaymentScreenshotUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setUploadingPayment(true);
      setPaymentUploadError('');
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${getApiBase()}/api/registrations/upload-payment-screenshot`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        let message = 'Unable to upload image.';
        try {
          const body = await res.json();
          message = body?.message || message;
        } catch (error) {
          // no-op
        }
        throw new Error(message);
      }
      const data = await res.json();
      setValue('paymentScreenshotUrl', data?.url || '', { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      setPaymentUploadError(error.message || 'Unable to upload image.');
    } finally {
      setUploadingPayment(false);
    }
  };

  const openContentEditor = () => {
    setContentEditor({
      title: content.title,
      subtitle: content.subtitle,
      formTitle: content.formTitle || defaultContent.formTitle,
      formNote: content.formNote || '',
      registrationMode: content.registrationMode || defaultContent.registrationMode,
      googleFormUrl: content.googleFormUrl || '',
      googleFormButtonLabel:
        content.googleFormButtonLabel && content.googleFormButtonLabel !== 'Open Google Form'
          ? content.googleFormButtonLabel
          : defaultContent.googleFormButtonLabel,
      googleFormHelperText: content.googleFormHelperText || defaultContent.googleFormHelperText,
      openTitle: statusTemplates.open?.title || '',
      openMessage: statusTemplates.open?.message || '',
      openCtaLabel: statusTemplates.open?.ctaLabel || '',
      openCtaLink: statusTemplates.open?.ctaLink || '',
      openBlocksText: Array.isArray(statusTemplates.open?.blocks) ? statusTemplates.open.blocks.join('\n') : '',
      closedTitle: statusTemplates.closed?.title || '',
      closedMessage: statusTemplates.closed?.message || '',
      closedCtaLabel: statusTemplates.closed?.ctaLabel || '',
      closedCtaLink: statusTemplates.closed?.ctaLink || '',
      closedBlocksText: Array.isArray(statusTemplates.closed?.blocks) ? statusTemplates.closed.blocks.join('\n') : '',
      upcomingTitle: statusTemplates.upcoming?.title || '',
      upcomingMessage: statusTemplates.upcoming?.message || '',
      upcomingCtaLabel: statusTemplates.upcoming?.ctaLabel || '',
      upcomingCtaLink: statusTemplates.upcoming?.ctaLink || '',
      upcomingBlocksText: Array.isArray(statusTemplates.upcoming?.blocks) ? statusTemplates.upcoming.blocks.join('\n') : '',
      emptyTitle: statusTemplates.empty?.title || '',
      emptyMessage: statusTemplates.empty?.message || '',
      emptyCtaLabel: statusTemplates.empty?.ctaLabel || '',
      emptyCtaLink: statusTemplates.empty?.ctaLink || '',
      emptyBlocksText: Array.isArray(statusTemplates.empty?.blocks) ? statusTemplates.empty.blocks.join('\n') : '',
      ageGuidelinesText: content.ageGuidelines.join('\n'),
      highlightsText: content.highlights.join('\n'),
      batchRows: toBatchRows(content.batches, content.batchDays, content.batchConfigs),
      registrationFee: String(content.registrationFee ?? defaultContent.registrationFee),
      perPersonPerDayPrice: String(content.perPersonPerDayPrice ?? defaultContent.perPersonPerDayPrice),
      pricing: content.pricing,
      residencePricing: content.residencePricing,
      bankName: content.payment.bankName,
      accountHolder: content.payment.accountHolder,
      accountNumber: content.payment.accountNumber,
      ifsc: content.payment.ifsc,
      transactionHint: content.transactionHint,
    });
  };

  const saveContentEditor = async () => {
    if (!contentEditor) return;
    const batchError = validateBatchRows(contentEditor.batchRows || []);
    if (batchError) {
      setStatus({ type: 'error', message: batchError });
      return;
    }
    const batchPayload = buildBatchPayload(contentEditor.batchRows || []);
    const payload = {
      title: contentEditor.title,
      subtitle: contentEditor.subtitle,
      formTitle: contentEditor.formTitle || defaultContent.formTitle,
      formNote: contentEditor.formNote || '',
      registrationMode: contentEditor.registrationMode || defaultContent.registrationMode,
      googleFormUrl: String(contentEditor.googleFormUrl || '').trim(),
      googleFormButtonLabel:
        contentEditor.googleFormButtonLabel && contentEditor.googleFormButtonLabel !== 'Open Google Form'
          ? contentEditor.googleFormButtonLabel
          : defaultContent.googleFormButtonLabel,
      googleFormHelperText: contentEditor.googleFormHelperText || defaultContent.googleFormHelperText,
      statusMessages: {
        open: {
          title: contentEditor.openTitle || '',
          message: contentEditor.openMessage || '',
          ctaLabel: contentEditor.openCtaLabel || '',
          ctaLink: contentEditor.openCtaLink || '',
          blocks: String(contentEditor.openBlocksText || '').split('\n').map((x) => x.trim()).filter(Boolean),
        },
        closed: {
          title: contentEditor.closedTitle || '',
          message: contentEditor.closedMessage || '',
          ctaLabel: contentEditor.closedCtaLabel || '',
          ctaLink: contentEditor.closedCtaLink || '',
          blocks: String(contentEditor.closedBlocksText || '').split('\n').map((x) => x.trim()).filter(Boolean),
        },
        upcoming: {
          title: contentEditor.upcomingTitle || '',
          message: contentEditor.upcomingMessage || '',
          ctaLabel: contentEditor.upcomingCtaLabel || '',
          ctaLink: contentEditor.upcomingCtaLink || '',
          blocks: String(contentEditor.upcomingBlocksText || '').split('\n').map((x) => x.trim()).filter(Boolean),
        },
        empty: {
          title: contentEditor.emptyTitle || '',
          message: contentEditor.emptyMessage || '',
          ctaLabel: contentEditor.emptyCtaLabel || '',
          ctaLink: contentEditor.emptyCtaLink || '',
          blocks: String(contentEditor.emptyBlocksText || '').split('\n').map((x) => x.trim()).filter(Boolean),
        },
      },
      ageGuidelines: String(contentEditor.ageGuidelinesText || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
      highlights: String(contentEditor.highlightsText || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
      batches: batchPayload.batches,
      batchDays: batchPayload.batchDays,
      batchConfigs: batchPayload.batchRows,
      registrationFee: Number(contentEditor.registrationFee) || defaultContent.registrationFee,
      perPersonPerDayPrice:
        Number(contentEditor.perPersonPerDayPrice) || defaultContent.perPersonPerDayPrice,
      pricing: contentEditor.pricing,
      residencePricing: contentEditor.residencePricing,
      payment: {
        bankName: contentEditor.bankName,
        accountHolder: contentEditor.accountHolder,
        accountNumber: contentEditor.accountNumber,
        ifsc: contentEditor.ifsc,
      },
      transactionHint: contentEditor.transactionHint,
      registrationCamps,
    };
    try {
      await adminRequest(adminContentApi, {
        method: 'PUT',
        body: JSON.stringify({ content: payload }),
      });
      setStatus({ type: 'success', message: 'Registration page content updated.' });
      setStateEditorOpen(false);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to save content.' });
    }
  };

  const openEntryEditor = (item) => {
    setEntryEditor(
      item
        ? {
            ...item,
            interestedBatchesText: (item.interestedBatches || []).join('\n'),
            email: normalizeEmail(item.email || item.parentEmail || ''),
          }
        : {
            _id: '',
            registrationCampId: openCamp?.id || '',
            registrationCampTitle: openCamp?.title || '',
            email: '',
            guardianName: '',
            relationship: '',
            mobileNumber: '',
            motherTongue: '',
            country: '',
            state: '',
            city: '',
            childName: '',
            childAge: '',
            gender: '',
            schoolName: '',
            currentClass: '',
            interestedBatchesText: '',
            familyMembersStaying: '',
            transactionNote: '',
            paymentScreenshotUrl: '',
            source: '',
            sourceOther: '',
            status: 'new',
          }
    );
  };

  const openCampEditor = (camp) => {
    setCampEditor(
      camp
        ? {
            ...camp,
            ageGuidelinesText: (camp.ageGuidelines || content.ageGuidelines || []).join('\n'),
            highlightsText: (camp.highlights || content.highlights || []).join('\n'),
            batchRows: toBatchRows(
              camp.batches || content.batches || [],
              camp.batchDays || content.batchDays || {},
              camp.batchConfigs || []
            ),
            registrationFee: String(
              camp.registrationFee ?? content.registrationFee ?? defaultContent.registrationFee
            ),
            perPersonPerDayPrice: String(
              camp.perPersonPerDayPrice ?? content.perPersonPerDayPrice ?? defaultContent.perPersonPerDayPrice
            ),
            pricing: camp.pricing || content.pricing,
            residencePricing: camp.residencePricing || content.residencePricing,
            bankName: camp.payment?.bankName || content.payment.bankName,
            accountHolder: camp.payment?.accountHolder || content.payment.accountHolder,
            accountNumber: camp.payment?.accountNumber || content.payment.accountNumber,
            ifsc: camp.payment?.ifsc || content.payment.ifsc,
            transactionHint: camp.transactionHint || content.transactionHint,
            isNew: false,
            year: (() => {
              const raw = String(camp?.year ?? '').trim();
              if (/^\d{4}$/.test(raw)) return raw;
              return String(getCampYearBounds().min);
            })(),
          }
        : {
            id: `camp-${Date.now()}`,
            title: '',
            subtitle: '',
            year: String(new Date().getFullYear()),
            status: 'open',
            note: '',
            ageGuidelinesText: content.ageGuidelines.join('\n'),
            highlightsText: content.highlights.join('\n'),
            batchRows: toBatchRows(content.batches, content.batchDays, content.batchConfigs),
            registrationFee: String(content.registrationFee ?? defaultContent.registrationFee),
            perPersonPerDayPrice: String(
              content.perPersonPerDayPrice ?? defaultContent.perPersonPerDayPrice
            ),
            pricing: content.pricing,
            residencePricing: content.residencePricing,
            bankName: content.payment.bankName,
            accountHolder: content.payment.accountHolder,
            accountNumber: content.payment.accountNumber,
            ifsc: content.payment.ifsc,
            transactionHint: content.transactionHint,
            isNew: true,
          }
    );
  };

  const saveCampEditor = async () => {
    if (!campEditor) return;
    const campMissing = [];
    if (!String(campEditor.title || '').trim()) campMissing.push('Camp title');
    if (!String(campEditor.subtitle || '').trim()) campMissing.push('Camp subtitle');
    if (!String(campEditor.year || '').trim()) campMissing.push('Camp year');
    if (campMissing.length) {
      setStatus({
        type: 'error',
        message: `Required fields: ${campMissing.join(', ')}.`,
      });
      return;
    }
    if (!campEditor.isNew && campEditor.status === 'closed' && !String(campEditor.note || '').trim()) {
      setStatus({
        type: 'error',
        message: 'Required fields: Reason / Note (required when status is Closed).',
      });
      return;
    }
    const batchError = validateBatchRows(campEditor.batchRows || []);
    if (batchError) {
      setStatus({ type: 'error', message: batchError });
      return;
    }
    const yearParsed = parseCampYearForSave(campEditor.year);
    if (!yearParsed.ok) {
      setStatus({
        type: 'error',
        message: `Camp year must be between ${yearParsed.min} and ${yearParsed.max}.`,
      });
      return;
    }
    const batchPayload = buildBatchPayload(campEditor.batchRows || []);
    const normalizedCamp = {
      id: campEditor.id,
      title: String(campEditor.title || '').trim(),
      subtitle: String(campEditor.subtitle || '').trim(),
      year: yearParsed.year,
      status: campEditor.status,
      note: String(campEditor.note || '').trim(),
      ageGuidelines: toLines(campEditor.ageGuidelinesText),
      highlights: toLines(campEditor.highlightsText),
      batches: batchPayload.batches,
      batchDays: batchPayload.batchDays,
      batchConfigs: batchPayload.batchRows,
      registrationFee: Number(campEditor.registrationFee) || defaultContent.registrationFee,
      perPersonPerDayPrice:
        Number(campEditor.perPersonPerDayPrice) || defaultContent.perPersonPerDayPrice,
      pricing: String(campEditor.pricing || '').trim(),
      residencePricing: String(campEditor.residencePricing || '').trim(),
      payment: {
        bankName: String(campEditor.bankName || '').trim(),
        accountHolder: String(campEditor.accountHolder || '').trim(),
        accountNumber: String(campEditor.accountNumber || '').trim(),
        ifsc: String(campEditor.ifsc || '').trim(),
      },
      transactionHint: String(campEditor.transactionHint || '').trim(),
    };
    let nextCamps = [...registrationCamps];
    if (campEditor.isNew) {
      nextCamps = [normalizedCamp, ...nextCamps];
    } else {
      nextCamps = nextCamps.map((c) => (c.id === campEditor.id ? normalizedCamp : c));
    }
    const openCount = nextCamps.filter((c) => c.status === 'open').length;
    const upcomingCount = nextCamps.filter((c) => c.status === 'upcoming').length;
    if (openCount > 1 || upcomingCount > 1) {
      setStatus({ type: 'error', message: 'Only one camp can be Open and only one can be Upcoming.' });
      return;
    }
    try {
      await adminRequest(adminContentApi, {
        method: 'PUT',
        body: JSON.stringify({ content: { ...content, registrationCamps: nextCamps } }),
      });
      setStatus({ type: 'success', message: 'Registration camp updated.' });
      setCampEditor(null);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to save registration camp.' });
    }
  };

  const deleteCamp = async (campId) => {
    const nextCamps = registrationCamps.filter((c) => c.id !== campId);
    try {
      await adminRequest(adminContentApi, {
        method: 'PUT',
        body: JSON.stringify({ content: { ...content, registrationCamps: nextCamps } }),
      });
      setStatus({ type: 'success', message: 'Registration camp removed.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to remove registration camp.' });
    }
  };

  const saveEntryEditor = async () => {
    if (!entryEditor) return;
    const emailNorm = normalizeEmail(entryEditor.email);
    if (!isValidEmail(emailNorm)) {
      setStatus({ type: 'error', message: 'Enter a valid email address.' });
      return;
    }
    const entryMissing = [];
    for (const key of ENTRY_EDITOR_REQUIRED_KEYS) {
      if (!String(entryEditor[key] ?? '').trim()) {
        entryMissing.push(ENTRY_EDITOR_LABELS[key] || key);
      }
    }
    if (String(entryEditor.source || '').trim() === 'Other' && !String(entryEditor.sourceOther || '').trim()) {
      entryMissing.push('Source (other details)');
    }
    const batchLines = String(entryEditor.interestedBatchesText || '')
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
    if (!batchLines.length) {
      entryMissing.push('Interested batches (at least one line)');
    }
    if (entryMissing.length) {
      setStatus({
        type: 'error',
        message: `Required fields: ${entryMissing.join(', ')}.`,
      });
      return;
    }
    const payload = {
      ...entryEditor,
      email: emailNorm,
      parentEmail: emailNorm,
      interestedBatches: String(entryEditor.interestedBatchesText || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
    };
    delete payload.interestedBatchesText;
    try {
      if (entryEditor._id) {
        await adminRequest(`${adminRegistrationsApiBase}/${entryEditor._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await adminRequest(adminRegistrationsApiBase, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await loadAdminItems();
      setStatus({ type: 'success', message: 'Registration entry saved.' });
      setEntryEditor(null);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to save entry.' });
    }
  };

  const deleteEntry = async (id) => {
    try {
      await adminRequest(`${adminRegistrationsApiBase}/${id}`, { method: 'DELETE' });
      await loadAdminItems();
      setStatus({ type: 'success', message: 'Registration deleted.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to delete registration.' });
    }
  };

  const stripYearFromTitle = (text = '') => String(text).replace(/\s+\d{4}\s*$/, '').trim();
  const toLines = (value) =>
    String(value || '')
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
  const activeBuiltInCamp =
    isPublic && selectedCamp && selectedCamp.status === 'open'
      ? selectedCamp
      : isAdmin
        ? selectedCamp || openCamp || null
        : null;
  const activeCampContent = activeBuiltInCamp
    ? {
        ageGuidelines:
          Array.isArray(activeBuiltInCamp.ageGuidelines) && activeBuiltInCamp.ageGuidelines.length
            ? activeBuiltInCamp.ageGuidelines
            : content.ageGuidelines,
        highlights:
          Array.isArray(activeBuiltInCamp.highlights) && activeBuiltInCamp.highlights.length
            ? activeBuiltInCamp.highlights
            : content.highlights,
        batches:
          Array.isArray(activeBuiltInCamp.batches) && activeBuiltInCamp.batches.length
            ? activeBuiltInCamp.batches
            : content.batches,
        batchConfigs:
          Array.isArray(activeBuiltInCamp.batchConfigs) && activeBuiltInCamp.batchConfigs.length
            ? activeBuiltInCamp.batchConfigs
            : Array.isArray(content.batchConfigs)
              ? content.batchConfigs
              : [],
        batchDays: normalizeBatchDays(
          activeBuiltInCamp.batchDays || content.batchDays,
          Array.isArray(activeBuiltInCamp.batches) && activeBuiltInCamp.batches.length
            ? activeBuiltInCamp.batches
            : content.batches,
          defaultContent.batchDays
        ),
        registrationFee: Number(activeBuiltInCamp.registrationFee ?? content.registrationFee ?? defaultContent.registrationFee),
        perPersonPerDayPrice: Number(
          activeBuiltInCamp.perPersonPerDayPrice ?? content.perPersonPerDayPrice ?? defaultContent.perPersonPerDayPrice
        ),
        pricing: activeBuiltInCamp.pricing || content.pricing,
        residencePricing: activeBuiltInCamp.residencePricing || content.residencePricing,
        payment: {
          bankName: activeBuiltInCamp.payment?.bankName || content.payment.bankName,
          accountHolder: activeBuiltInCamp.payment?.accountHolder || content.payment.accountHolder,
          accountNumber: activeBuiltInCamp.payment?.accountNumber || content.payment.accountNumber,
          ifsc: activeBuiltInCamp.payment?.ifsc || content.payment.ifsc,
        },
        transactionHint: activeBuiltInCamp.transactionHint || content.transactionHint,
      }
    : {
        ageGuidelines: content.ageGuidelines,
        highlights: content.highlights,
        batches: content.batches,
        batchConfigs: Array.isArray(content.batchConfigs) ? content.batchConfigs : [],
        batchDays: normalizeBatchDays(content.batchDays, content.batches, defaultContent.batchDays),
        registrationFee: Number(content.registrationFee ?? defaultContent.registrationFee),
        perPersonPerDayPrice: Number(content.perPersonPerDayPrice ?? defaultContent.perPersonPerDayPrice),
        pricing: content.pricing,
        residencePricing: content.residencePricing,
        payment: content.payment,
        transactionHint: content.transactionHint,
      };
  const batchLabelMap = useMemo(() => {
    const map = {};
    (activeCampContent.batchConfigs || []).forEach((row) => {
      const key = String(row?.label || '').trim();
      if (!key) return;
      const start = formatBatchDisplayDate(row?.startDate);
      const end = formatBatchDisplayDate(row?.endDate);
      map[key] = start && end ? `${key} (${start} - ${end})` : key;
    });
    return map;
  }, [activeCampContent.batchConfigs]);
  const watchedChildren = watch('children') || [];
  const watchedFamilyMembers = watch('familyMembers') || [];
  const childPriceRows = watchedChildren.map((child, index) => {
    const selected = Array.isArray(child?.interestedBatches) ? child.interestedBatches : [];
    const days = selected.reduce((sum, batch) => sum + Number(activeCampContent.batchDays?.[batch] || 0), 0);
    return {
      label: child?.name ? `${child.name}` : `Child ${index + 1}`,
      batches: selected.map((batch) => batchLabelMap[batch] || batch),
      days,
      amount: days * Number(activeCampContent.perPersonPerDayPrice || 0),
    };
  });
  const familyPriceRows = watchedFamilyMembers.map((member, index) => {
    const days = Number.isFinite(Number(member?.stayingDays)) ? Number(member.stayingDays) : 0;
    return {
      label: member?.name ? `${member.name}` : `Member ${index + 1}`,
      relation: member?.relationWithChild || '-',
      days,
      amount: days * Number(activeCampContent.perPersonPerDayPrice || 0),
    };
  });
  const childStayDaysTotal = watchedChildren.reduce((total, child) => {
    const selected = Array.isArray(child?.interestedBatches) ? child.interestedBatches : [];
    const days = selected.reduce((sum, batch) => sum + Number(activeCampContent.batchDays?.[batch] || 0), 0);
    return total + days;
  }, 0);
  const familyStayDaysTotal = watchedFamilyMembers.reduce(
    (sum, member) => sum + (Number.isFinite(Number(member?.stayingDays)) ? Number(member.stayingDays) : 0),
    0
  );
  const totalAmountPayable =
    Number(activeCampContent.registrationFee || 0) +
    (childStayDaysTotal + familyStayDaysTotal) * Number(activeCampContent.perPersonPerDayPrice || 0);
  const residentialAmount =
    (childStayDaysTotal + familyStayDaysTotal) * Number(activeCampContent.perPersonPerDayPrice || 0);
  const previewChildren =
    Array.isArray(entryPreview?.children) && entryPreview.children.length
      ? entryPreview.children
      : entryPreview
        ? [
            {
              name: entryPreview.childName || '',
              age: entryPreview.childAge || '',
              gender: entryPreview.gender || '',
              school: entryPreview.school || entryPreview.schoolName || '',
              currentClass: entryPreview.currentClass || '',
              interestedBatches: Array.isArray(entryPreview.interestedBatches)
                ? entryPreview.interestedBatches
                : [],
            },
          ]
        : [];
  const previewFamilyMembers = Array.isArray(entryPreview?.familyMembers)
    ? entryPreview.familyMembers
    : [];
  const previewCamp = registrationCamps.find((camp) => camp.id === entryPreview?.registrationCampId) || null;
  const previewBatchDays = normalizeBatchDays(
    previewCamp?.batchDays || content.batchDays || {},
    previewCamp?.batches || content.batches || [],
    defaultContent.batchDays
  );
  const previewChildStayDaysTotal = Number(entryPreview?.childStayDaysTotal || 0);
  const previewFamilyStayDaysTotal = Number(entryPreview?.familyStayDaysTotal || 0);
  const previewPerPersonPerDayPrice = Number(entryPreview?.perPersonPerDayPrice || 0);
  const previewRegistrationFee = Number(entryPreview?.registrationFee || 0);
  const previewResidentialAmount =
    (previewChildStayDaysTotal + previewFamilyStayDaysTotal) * previewPerPersonPerDayPrice;
  const previewTotalAmount =
    Number(entryPreview?.totalAmountPayable || 0) ||
    previewRegistrationFee + previewResidentialAmount;
  const campStatusStyle = (state) => {
    if (state === 'open') {
      return 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-700/70 dark:bg-emerald-950/20';
    }
    if (state === 'upcoming') {
      return 'border-sky-300 bg-sky-50/80 dark:border-sky-700/70 dark:bg-sky-950/20';
    }
    return 'border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/60';
  };

  return (
    <PageFade>
      <Container className="pb-20 pt-10 md:pt-14">
        {isAdmin ? (
          <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAdminTab('add-camp')}
                className={`rounded-full px-4 py-2 text-sm ${
                  adminTab === 'add-camp'
                    ? 'bg-accent text-white dark:bg-emerald-700'
                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                Add Registration Camp
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('camps-history')}
                className={`rounded-full px-4 py-2 text-sm ${
                  adminTab === 'camps-history'
                    ? 'bg-accent text-white dark:bg-emerald-700'
                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                Camps History
              </button>
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
            </div>
          </section>
        ) : null}

        {!isAdmin ? (
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="heading-page max-w-4xl">
                {stripYearFromTitle(content.title)}
              </h1>
            </div>
            <p className="mt-3 max-w-4xl text-prose">{content.subtitle}</p>
          </header>
        ) : null}

        {showAddCampTab ? (
          <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="heading-section">Add Registration Camp</h2>
            <p className="mt-2 text-sm text-prose-muted">
              Create a new registration cycle. You can keep it Closed initially and open it later.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openCampEditor(null)}
                disabled={addCampDisabled}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-55 dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Registration Camp
              </button>
              <p className="text-xs text-prose-muted">
                Rule: only one Open and one Upcoming camp can exist at a time.
              </p>
              {addCampDisabled ? (
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Add is disabled while an active camp exists
                  {openCamp ? ` (Open: ${openCamp.title})` : ''}
                  {upcomingCamp ? `${openCamp ? ' and ' : ' ('}Upcoming: ${upcomingCamp.title}${openCamp ? '' : ')'}` : ''}
                  . Close or remove active camp(s) first.
                </p>
              ) : null}
            </div>
            {addCampDisabled ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {openCamp ? (
                  <article className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 dark:border-emerald-700/70 dark:bg-emerald-950/20">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                      Currently Open Camp
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{openCamp.title}</p>
                    {openCamp.subtitle ? <p className="mt-1 text-xs text-prose-muted">{openCamp.subtitle}</p> : null}
                    {openCamp.year ? <p className="mt-1 text-xs text-prose-muted">Year: {openCamp.year}</p> : null}
                  </article>
                ) : null}
                {upcomingCamp ? (
                  <article className="rounded-xl border border-sky-300 bg-sky-50/70 p-4 dark:border-sky-700/70 dark:bg-sky-950/20">
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-200">
                      Currently Upcoming Camp
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{upcomingCamp.title}</p>
                    {upcomingCamp.subtitle ? <p className="mt-1 text-xs text-prose-muted">{upcomingCamp.subtitle}</p> : null}
                    {upcomingCamp.year ? <p className="mt-1 text-xs text-prose-muted">Year: {upcomingCamp.year}</p> : null}
                  </article>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {showRegistrationFormTab && registrationState !== 'open' && (isAdmin || registrationState !== 'empty') ? (
          <section className="mb-8 rounded-2xl border border-amber-300 bg-amber-50/80 p-5 dark:border-amber-700/70 dark:bg-amber-950/20">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-200">
              {activeStatusMessage.title || defaultContent.statusMessages[registrationState].title}
            </h2>
            <p className="mt-2 text-sm text-amber-800 dark:text-amber-100/90">
              {activeStatusMessage.message || defaultContent.statusMessages[registrationState].message}
            </p>
            {activeStatusBlocks.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900 dark:text-amber-100">
                {activeStatusBlocks.map((block) => (
                  <li key={block}>{block}</li>
                ))}
              </ul>
            ) : null}
            {activeStatusMessage.ctaLabel && activeStatusMessage.ctaLink ? (
              <a
                href={activeStatusMessage.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-lg bg-amber-700 px-4 py-2 text-sm text-white hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500"
              >
                {activeStatusMessage.ctaLabel}
              </a>
            ) : null}
            {isAdmin ? (
              <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                Admin preview: Users cannot submit while status is {registrationState}.
              </p>
            ) : null}
          </section>
        ) : null}

        {isPublic && registrationState === 'empty' ? (
          <section className="mb-8 rounded-2xl border border-neutral-300 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900/70">
            <h2 className="text-2xl font-semibold text-accent dark:text-emerald-200">
              No registrations available right now
            </h2>
            <p className="mt-3 max-w-3xl text-prose">
              {`Get in touch with us and we'll post updates here when the next ${campLabelLower} registration opens.`}
            </p>
            <a
              href="/contact"
              className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
            >
              Get in Touch
            </a>
          </section>
        ) : null}

        {isPublic && registrationState !== 'empty' ? (
          <section className="mb-8">
            <h2 className="heading-section">Registration Camps</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {registrationCamps.map((camp) => (
                <article
                  key={camp.id}
                  className={`rounded-2xl border p-4 ${campStatusStyle(camp.status)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">{camp.title}</h3>
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200">
                      {camp.status}
                    </span>
                  </div>
                  {camp.subtitle ? <p className="mt-2 text-sm text-prose">{camp.subtitle}</p> : null}
                  {camp.year ? <p className="mt-1 text-sm text-prose-muted">Year: {camp.year}</p> : null}
                  {camp.note ? <p className="mt-2 text-sm text-prose">{camp.note}</p> : null}
                  {camp.status === 'open' ? (
                    isGoogleFormMode ? (
                      content.googleFormUrl ? (
                        <a
                          href={content.googleFormUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                        >
                          {content.googleFormButtonLabel && content.googleFormButtonLabel !== 'Open Google Form'
                            ? content.googleFormButtonLabel
                            : defaultContent.googleFormButtonLabel}
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="mt-4 inline-flex rounded-lg bg-neutral-300 px-4 py-2 text-sm text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
                        >
                          Google Form URL Not Set
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedCampId(camp.id)}
                        className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                      >
                        Register
                      </button>
                    )
                  ) : camp.status === 'upcoming' ? (
                    <p className="mt-4 text-sm font-medium text-sky-800 dark:text-sky-300">Stay tuned. Registration opens soon.</p>
                  ) : (
                    <p className="mt-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">Registrations closed for this camp.</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {showCampHistoryTab ? (
          <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="heading-section">Registration Camps History</h2>
              <button
                type="button"
                onClick={() => openCampEditor(null)}
                disabled={addCampDisabled}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-55 dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Registration Camp
              </button>
            </div>
            <div className="space-y-3">
              {paginatedCampsHistory.map((camp) => (
                <article key={camp.id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">{camp.title}</p>
                      {camp.subtitle ? <p className="text-sm text-prose-muted">{camp.subtitle}</p> : null}
                      {camp.year ? <p className="text-sm text-prose-muted">Year: {camp.year}</p> : null}
                      <p className="mt-1 text-sm text-prose">
                        Status:{' '}
                        <span className="font-medium uppercase">{camp.status}</span>
                      </p>
                      {camp.note ? <p className="mt-1 text-sm text-prose-muted">{camp.note}</p> : null}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openCampEditor(camp)}
                        className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCamp(camp.id)}
                        className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {!registrationCamps.length ? (
                <p className="text-sm text-prose-muted">No registration camps configured.</p>
              ) : null}
              {registrationCamps.length > campHistoryPerPage ? (
                <div className="flex items-center justify-between text-xs text-prose-muted">
                  <p>
                    Page {campHistoryPage} of {campHistoryTotalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCampHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={campHistoryPage === 1}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCampHistoryPage((p) => Math.min(campHistoryTotalPages, p + 1))}
                      disabled={campHistoryPage === campHistoryTotalPages}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
              <p className="text-xs text-prose-muted">
                Rule: at most one <strong>Open</strong> and one <strong>Upcoming</strong> camp at a time.
                {openCamp ? ` Current open: ${openCamp.title}.` : ' No camp is currently open.'}
                {upcomingCamp ? ` Upcoming: ${upcomingCamp.title}.` : ''}
              </p>
            </div>
          </section>
        ) : null}

        {showRegistrationFormTab && (!isPublic || (isPublic && registrationState !== 'empty')) ? (
        <>
        {isAdmin ? (
          <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-accent dark:text-emerald-200">Registration Form State Content</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'form-blueprint', label: 'Form Blueprint' },
                { key: 'open', label: 'If Registration Open' },
                { key: 'upcoming', label: 'If Upcoming' },
                { key: 'closed', label: 'If All Closed?' },
                { key: 'empty', label: 'If No Registration?' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setContentEditorStateTab(tab.key);
                    setStateEditorOpen(false);
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    contentEditorStateTab === tab.key
                      ? 'border-accent bg-accent/10 text-accent dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-200'
                      : 'border-neutral-300 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {contentEditorStateTab === 'form-blueprint' && contentEditor ? (
              <div className="mt-4 rounded-xl border border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/70">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Registration Form Mode</p>
                <div className="mt-3 flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
                    <input
                      type="radio"
                      name="registrationMode"
                      value="built-in-form"
                      checked={(contentEditor.registrationMode || defaultContent.registrationMode) === 'built-in-form'}
                      onChange={(e) => setContentEditor((p) => ({ ...p, registrationMode: e.target.value }))}
                    />
                    Built-in Form
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
                    <input
                      type="radio"
                      name="registrationMode"
                      value="google-form"
                      checked={(contentEditor.registrationMode || defaultContent.registrationMode) === 'google-form'}
                      onChange={(e) => setContentEditor((p) => ({ ...p, registrationMode: e.target.value }))}
                    />
                    Google Form Link
                  </label>
                </div>
              </div>
            ) : null}
            {contentEditorStateTab !== 'form-blueprint' ? (
              <div className="mt-4 rounded-2xl border border-neutral-300 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900/70">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">
                    Preview as User
                  </p>
                  {!stateEditorOpen ? (
                    <button
                      type="button"
                      onClick={() => setStateEditorOpen(true)}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  ) : null}
                </div>
                {contentEditorStateTab === 'empty' ? (
                  <section className="rounded-2xl border border-neutral-300 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900/70">
                    <h2 className="text-2xl font-semibold text-accent dark:text-emerald-200">
                      {previewStateData.title || 'No registrations available right now'}
                    </h2>
                    <p className="mt-3 max-w-3xl text-prose">
                      {previewStateData.message || `Get in touch with us and we'll post updates here when the next ${campLabelLower} registration opens.`}
                    </p>
                    <a
                      href={previewStateData.ctaLink || '/contact'}
                      className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                    >
                      {previewStateData.ctaLabel || 'Get in Touch'}
                    </a>
                  </section>
                ) : (
                  <section className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 dark:border-amber-700/70 dark:bg-amber-950/20">
                    <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-200">
                      {previewStateData.title || defaultContent.statusMessages[contentEditorStateTab]?.title}
                    </h2>
                    <p className="mt-2 text-sm text-amber-800 dark:text-amber-100/90">
                      {previewStateData.message || defaultContent.statusMessages[contentEditorStateTab]?.message}
                    </p>
                    {Array.isArray(previewStateData.blocks) && previewStateData.blocks.length ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900 dark:text-amber-100">
                        {previewStateData.blocks.map((block) => (
                          <li key={block}>{block}</li>
                        ))}
                      </ul>
                    ) : null}
                    {previewStateData.ctaLabel && previewStateData.ctaLink ? (
                      <a
                        href={previewStateData.ctaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex rounded-lg bg-amber-700 px-4 py-2 text-sm text-white hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500"
                      >
                        {previewStateData.ctaLabel}
                      </a>
                    ) : null}
                  </section>
                )}
                {contentEditorStateTab === 'open' ? (
                  <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 text-sm dark:border-emerald-700/70 dark:bg-emerald-950/20">
                    <p className="font-medium text-emerald-900 dark:text-emerald-200">
                      Open state user flow preview
                    </p>
                    <p className="mt-1 text-emerald-800 dark:text-emerald-100/90">
                      Users will see an open camp card with a Register button. Clicking Register reveals
                      {contentEditor.registrationMode === 'google-form' ? ' the Google Form link.' : ' the built-in form.'}
                    </p>
                  </div>
                ) : null}
                {contentEditorStateTab === 'upcoming' ? (
                  <div className="mt-4 rounded-xl border border-sky-300 bg-sky-50/80 p-4 text-sm dark:border-sky-700/70 dark:bg-sky-950/20">
                    <p className="font-medium text-sky-900 dark:text-sky-200">Upcoming state user flow preview</p>
                    <p className="mt-1 text-sky-800 dark:text-sky-100/90">
                      Users will see upcoming camp cards with “Stay tuned” and no visible form.
                    </p>
                  </div>
                ) : null}
                {contentEditorStateTab === 'closed' ? (
                  <div className="mt-4 rounded-xl border border-neutral-300 bg-neutral-100 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-800">
                    <p className="font-medium text-neutral-800 dark:text-neutral-100">Closed state user flow preview</p>
                    <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                      Users will see closed camp cards and no active form.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
            {contentEditor ? (
              <>
              {contentEditorStateTab !== 'form-blueprint' && stateEditorOpen ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    Title
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={contentEditor[`${contentEditorStateTab}Title`] || ''}
                      onChange={(e) => setContentEditor((p) => ({ ...p, [`${contentEditorStateTab}Title`]: e.target.value }))}
                    />
                  </label>
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    CTA Label
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={contentEditor[`${contentEditorStateTab}CtaLabel`] || ''}
                      onChange={(e) => setContentEditor((p) => ({ ...p, [`${contentEditorStateTab}CtaLabel`]: e.target.value }))}
                      placeholder={defaultContent.statusMessages[contentEditorStateTab]?.ctaLabel || 'CTA label'}
                    />
                  </label>
                  <label className="text-sm md:col-span-2 text-neutral-800 dark:text-neutral-200">
                    Message
                    <textarea
                      className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={contentEditor[`${contentEditorStateTab}Message`] || ''}
                      onChange={(e) => setContentEditor((p) => ({ ...p, [`${contentEditorStateTab}Message`]: e.target.value }))}
                    />
                  </label>
                  <label className="text-sm md:col-span-2 text-neutral-800 dark:text-neutral-200">
                    CTA Link
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={contentEditor[`${contentEditorStateTab}CtaLink`] || ''}
                      onChange={(e) => setContentEditor((p) => ({ ...p, [`${contentEditorStateTab}CtaLink`]: e.target.value }))}
                      placeholder={defaultContent.statusMessages[contentEditorStateTab]?.ctaLink || '/path-or-url'}
                    />
                  </label>
                  <label className="text-sm md:col-span-2 text-neutral-800 dark:text-neutral-200">
                    Content Blocks (one per line)
                    <textarea
                      className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={contentEditor[`${contentEditorStateTab}BlocksText`] || ''}
                      onChange={(e) => setContentEditor((p) => ({ ...p, [`${contentEditorStateTab}BlocksText`]: e.target.value }))}
                    />
                  </label>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStateEditorOpen(false)}
                      className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-3 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : contentEditorStateTab === 'form-blueprint' && !stateEditorOpen ? (
                <div className="mt-4 rounded-2xl border border-neutral-300 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900/70">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Preview as User</p>
                    <button
                      type="button"
                      onClick={() => setStateEditorOpen(true)}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </div>
                  <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 dark:border-amber-700/70 dark:bg-amber-950/20">
                    {contentEditor.registrationMode !== 'google-form' ? (
                      <>
                        <h4 className="text-3xl font-bold text-accent dark:text-emerald-200">
                          {contentEditor.title || defaultContent.title}
                        </h4>
                        <p className="mt-2 text-prose">
                          {contentEditor.subtitle || defaultContent.subtitle}
                        </p>
                      </>
                    ) : null}
                    {contentEditor.registrationMode !== 'google-form' ? (
                      <section className="mt-5 grid gap-6 lg:grid-cols-2">
                        <article className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                          <h2 className="heading-card">Age Guidelines</h2>
                          <ul className="mt-3 list-disc space-y-2 pl-5 text-prose marker:text-accent dark:marker:text-emerald-500">
                            {String(contentEditor.ageGuidelinesText || '').split('\n').map((x) => x.trim()).filter(Boolean).map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        </article>
                        <article className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                          <h2 className="heading-card">Batches</h2>
                          <ul className="mt-3 space-y-2 text-prose">
                            {(contentEditor.batchRows || []).map((row, idx) => (
                              <li key={row.id || idx} className="rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
                                {blueprintPreviewBatchLabel(row)}
                              </li>
                            ))}
                          </ul>
                        </article>
                      </section>
                    ) : null}
                    <div
                      className={
                        contentEditor.registrationMode === 'google-form'
                          ? 'mt-6'
                          : 'mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900'
                      }
                    >
                      <p className="heading-section">
                        {contentEditor.formTitle || defaultContent.formTitle}
                      </p>
                      {contentEditor.formNote ? (
                        <p className="mt-2 text-sm text-prose-muted">{contentEditor.formNote}</p>
                      ) : null}
                      {contentEditor.registrationMode === 'google-form' ? (
                        <>
                          <p className="mt-4 text-sm text-prose-muted">
                            {contentEditor.googleFormHelperText || defaultContent.googleFormHelperText}
                          </p>
                          <button
                            type="button"
                            disabled
                            className="mt-4 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm text-white opacity-60 dark:bg-emerald-700"
                          >
                            {contentEditor.googleFormButtonLabel && contentEditor.googleFormButtonLabel !== 'Open Google Form'
                              ? contentEditor.googleFormButtonLabel
                              : defaultContent.googleFormButtonLabel}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Parent Email<input type="email" disabled readOnly placeholder="parent@example.com" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Parent Name<input disabled readOnly placeholder="Parent name" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Relationship with child<input disabled readOnly placeholder="Father / Mother / Guardian" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Mobile Number<input disabled readOnly placeholder="+91…" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Mother Tongue<input disabled readOnly placeholder="Telugu" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Country<input disabled readOnly placeholder="India" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">State<input disabled readOnly placeholder="State" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">City/Town<input disabled readOnly placeholder="City" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                          </div>
                          <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Children (1)</p>
                              <span className="rounded-lg bg-neutral-200 px-2 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">Add Child (preview)</span>
                            </div>
                            <div className="rounded-xl border border-neutral-200 p-4 opacity-90 dark:border-neutral-700">
                              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Child 1</p>
                              <div className="mt-3 grid gap-4 md:grid-cols-2">
                                <label className="text-sm text-neutral-800 dark:text-neutral-200">Name<input disabled readOnly placeholder="Child name" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" /></label>
                                <label className="text-sm text-neutral-800 dark:text-neutral-200">Age<input disabled readOnly placeholder="10" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" /></label>
                                <label className="text-sm text-neutral-800 dark:text-neutral-200">Gender
                                  <select disabled className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white">
                                    <option value="">Select</option>
                                  </select>
                                </label>
                                <label className="text-sm text-neutral-800 dark:text-neutral-200">DOB<input type="date" disabled className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" /></label>
                                <label className="text-sm text-neutral-800 dark:text-neutral-200">School<input disabled readOnly placeholder="School" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" /></label>
                                <label className="text-sm text-neutral-800 dark:text-neutral-200">Current Class<input disabled readOnly placeholder="Class / standard" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" /></label>
                              </div>
                              <div className="mt-4">
                                <p className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">Select one or more batches</p>
                                <div className="grid gap-2 md:grid-cols-2">
                                  {(contentEditor.batchRows || []).map((row, idx) => (
                                    <label key={row.id || idx} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 opacity-70 dark:border-neutral-700 dark:text-neutral-200">
                                      <input type="checkbox" disabled />
                                      <span>{blueprintPreviewBatchLabel(row)}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Family Members Staying with child (1)</p>
                              <span className="rounded-lg bg-neutral-200 px-2 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">Add (preview)</span>
                            </div>
                            <div className="grid gap-2 rounded-xl border border-neutral-200 p-4 opacity-90 md:grid-cols-3 dark:border-neutral-700">
                              <label className="text-sm text-neutral-800 dark:text-neutral-200">Name<input disabled readOnly placeholder="Member name" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" /></label>
                              <label className="text-sm text-neutral-800 dark:text-neutral-200">Relation with child<input disabled readOnly placeholder="Father" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" /></label>
                              <label className="text-sm text-neutral-800 dark:text-neutral-200">Staying Days<input disabled readOnly placeholder="3" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" /></label>
                            </div>
                          </div>
                          <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">How did you hear about us?
                              <select disabled className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white">
                                <option value="">Choose</option>
                              </select>
                            </label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Other Source<input disabled readOnly placeholder="—" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" /></label>
                          </div>
                          <label className="mt-5 block text-sm text-neutral-800 dark:text-neutral-200">Transaction Note
                            <input disabled readOnly placeholder={contentEditor.transactionHint || defaultContent.transactionHint} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" />
                          </label>
                          <label className="mt-4 block text-sm text-neutral-800 dark:text-neutral-200">Payment Screenshot URL (optional)
                            <input disabled readOnly placeholder="Filled after upload" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" />
                          </label>
                          <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 opacity-90 dark:border-neutral-700 dark:bg-neutral-800/40">
                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Upload Payment Screenshot</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-accent/60 px-3 py-2 text-xs font-medium text-white dark:bg-emerald-800/70">
                                <Upload className="h-4 w-4" />
                                Choose Image (preview)
                              </span>
                            </div>
                          </div>
                          {blueprintPreviewPricing ? (
                            <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 text-sm opacity-95 dark:border-emerald-700/60 dark:bg-emerald-950/20">
                              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">Price preview (sample)</p>
                              <p className="mt-2">Registration fee (family): <span className="font-semibold">{toINRCurrency(blueprintPreviewPricing.reg)}</span></p>
                              <p>Example child stay: <span className="font-semibold">{blueprintPreviewPricing.childDays}</span> day(s) (first batch length)</p>
                              <p>Example family stay: <span className="font-semibold">{blueprintPreviewPricing.famDays}</span> day(s)</p>
                              <p>Per person/day: <span className="font-semibold">{toINRCurrency(blueprintPreviewPricing.per)}</span></p>
                              <p className="mt-1 text-xs text-emerald-900 dark:text-emerald-100">
                                Example: {toINRCurrency(blueprintPreviewPricing.reg)} + ({blueprintPreviewPricing.childDays} + {blueprintPreviewPricing.famDays}) × {toINRCurrency(blueprintPreviewPricing.per)} = {toINRCurrency(blueprintPreviewPricing.total)}
                              </p>
                              <p className="mt-2 text-base font-semibold text-emerald-900 dark:text-emerald-200">
                                Sample total: {toINRCurrency(blueprintPreviewPricing.total)}
                              </p>
                            </div>
                          ) : null}
                          <div className="mt-6">
                            <button
                              type="button"
                              disabled
                              className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm text-white opacity-60 dark:bg-emerald-700"
                            >
                              Submit Registration
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : contentEditorStateTab === 'form-blueprint' ? (
                <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Form Blueprint Content</h4>
                  {contentEditor.registrationMode !== 'google-form' ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="text-sm md:col-span-2 text-neutral-800 dark:text-neutral-200">
                        Title + Year
                        <input
                          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                          value={contentEditor.title || ''}
                          onChange={(e) => setContentEditor((p) => ({ ...p, title: e.target.value }))}
                        />
                      </label>
                      <label className="text-sm md:col-span-2 text-neutral-800 dark:text-neutral-200">
                        Subtitle
                        <textarea
                          className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                          value={contentEditor.subtitle || ''}
                          onChange={(e) => setContentEditor((p) => ({ ...p, subtitle: e.target.value }))}
                        />
                      </label>
                    </div>
                  ) : null}
                  <div className="mt-3 space-y-3">
                    {contentEditor.registrationMode !== 'google-form' ? (
                      <>
                        <label className="text-sm text-neutral-800 dark:text-neutral-200">Age Guidelines (one per line)
                          <textarea className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" value={contentEditor.ageGuidelinesText} onChange={(e) => setContentEditor((p) => ({ ...p, ageGuidelinesText: e.target.value }))} />
                        </label>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Batches</p>
                          {(contentEditor.batchRows || []).map((row, idx) => (
                            <div key={row.id || idx} className="grid gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-2 lg:grid-cols-5 dark:border-neutral-700">
                              <input className="min-w-0 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" placeholder={`Batch ${idx + 1} Name`} value={row.label || `Batch ${idx + 1}`} onChange={(e) => setContentEditor((p) => ({ ...p, batchRows: (p.batchRows || []).map((it, i) => (i === idx ? { ...it, label: e.target.value } : it)) }))} />
                              <input type="date" className="min-w-0 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" value={row.startDate || ''} onChange={(e) => setContentEditor((p) => ({ ...p, batchRows: (p.batchRows || []).map((it, i) => (i === idx ? buildBatchRowUpdate(it, 'startDate', e.target.value) : it)) }))} />
                              <input type="date" className="min-w-0 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" value={row.endDate || ''} onChange={(e) => setContentEditor((p) => ({ ...p, batchRows: (p.batchRows || []).map((it, i) => (i === idx ? buildBatchRowUpdate(it, 'endDate', e.target.value) : it)) }))} />
                              <input type="number" min="1" className="min-w-0 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" placeholder="Days" value={row.days || ''} onChange={(e) => setContentEditor((p) => ({ ...p, batchRows: (p.batchRows || []).map((it, i) => (i === idx ? buildBatchRowUpdate(it, 'days', e.target.value) : it)) }))} />
                              <button type="button" onClick={() => setContentEditor((p) => ({ ...p, batchRows: (p.batchRows || []).filter((_, i) => i !== idx) }))} className="inline-flex w-full items-center justify-center rounded-lg bg-rose-100 px-3 py-2 text-rose-700 sm:col-span-2 lg:col-span-1 dark:bg-rose-900/40 dark:text-rose-300" aria-label={`Delete Batch ${idx + 1}`}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setContentEditor((p) => {
                                const rows = p.batchRows || [];
                                const prev = rows.length ? rows[rows.length - 1] : null;
                                const prevEnd = parseDateInput(prev?.endDate);
                                const startDate = prevEnd ? formatDateInput(addDays(prevEnd, 1)) : '';
                                const days = 7;
                                const endDate =
                                  startDate && parseDateInput(startDate)
                                    ? formatDateInput(addDays(parseDateInput(startDate), days))
                                    : '';
                                return {
                                  ...p,
                                  batchRows: [
                                    ...rows,
                                    {
                                      id: `batch-${Date.now()}`,
                                      label: `Batch ${rows.length + 1}`,
                                      startDate,
                                      endDate,
                                      days,
                                    },
                                  ],
                                };
                              })
                            }
                            className="rounded-lg bg-accent px-3 py-2 text-xs text-white dark:bg-emerald-700"
                          >
                            Add Batch
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-sm text-neutral-800 dark:text-neutral-200">Registration Fee (per family)
                            <input type="number" min="0" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" value={contentEditor.registrationFee || ''} onChange={(e) => setContentEditor((p) => ({ ...p, registrationFee: e.target.value }))} />
                          </label>
                          <label className="text-sm text-neutral-800 dark:text-neutral-200">Per Person/Day Price
                            <input type="number" min="0" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" value={contentEditor.perPersonPerDayPrice || ''} onChange={(e) => setContentEditor((p) => ({ ...p, perPersonPerDayPrice: e.target.value }))} />
                          </label>
                        </div>
                      </>
                    ) : null}
                    <div className="rounded-xl border border-neutral-300 p-4 dark:border-neutral-700">
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Register Now Form</p>
                      {contentEditor.registrationMode !== 'google-form' ? (
                        <>
                          <label className="mt-3 block text-sm text-neutral-800 dark:text-neutral-200">
                            Form Title
                            <input
                              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                              value={contentEditor.formTitle || ''}
                              onChange={(e) => setContentEditor((p) => ({ ...p, formTitle: e.target.value }))}
                            />
                          </label>
                          <label className="mt-3 block text-sm text-neutral-800 dark:text-neutral-200">
                            Form Subtitle/Note
                            <textarea
                              className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                              value={contentEditor.formNote || ''}
                              onChange={(e) => setContentEditor((p) => ({ ...p, formNote: e.target.value }))}
                            />
                          </label>
                        </>
                      ) : null}
                      {contentEditor.registrationMode === 'google-form' ? (
                        <>
                          <label className="mt-3 block text-sm text-neutral-800 dark:text-neutral-200">
                            Google Form URL
                            <input
                              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                              value={contentEditor.googleFormUrl || ''}
                              onChange={(e) => setContentEditor((p) => ({ ...p, googleFormUrl: e.target.value }))}
                              placeholder="https://forms.gle/..."
                            />
                          </label>
                          <label className="mt-3 block text-sm text-neutral-800 dark:text-neutral-200">
                            Google Form Button Label
                            <input
                              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                              value={contentEditor.googleFormButtonLabel || ''}
                              onChange={(e) => setContentEditor((p) => ({ ...p, googleFormButtonLabel: e.target.value }))}
                            />
                          </label>
                          <label className="mt-3 block text-sm text-neutral-800 dark:text-neutral-200">
                            Helper Text
                            <textarea
                              className="mt-1 h-16 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                              value={contentEditor.googleFormHelperText || ''}
                              onChange={(e) => setContentEditor((p) => ({ ...p, googleFormHelperText: e.target.value }))}
                            />
                          </label>
                        </>
                      ) : null}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setStateEditorOpen(false)}
                        className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-3 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              </>
            ) : null}
            <div className="mt-4 flex justify-end">
              {stateEditorOpen ? (
                <button
                  type="button"
                  onClick={saveContentEditor}
                  className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                >
                  <Save className="h-4 w-4" /> Save State Content
                </button>
              ) : null}
            </div>
          </section>
        ) : null}
        {showAdminBuiltInPreviewControls ? (
          <section className="mb-0 rounded-t-2xl rounded-b-none border border-neutral-200 border-b-0 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => setAdminBuiltInPreviewExpanded((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/15 dark:border-emerald-500/30 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
            >
              {adminBuiltInPreviewExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Preview
            </button>
            {!adminBuiltInPreviewExpanded ? (
              <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-prose-muted dark:border-neutral-700 dark:bg-neutral-900/70">
                Preview is collapsed while editing. Click <span className="font-medium">Preview</span> to expand and view the user-facing form.
              </div>
            ) : null}
          </section>
        ) : null}
        {!isAdminStatePreviewOnly &&
        !isAdminBlueprintPreviewOnly &&
        (isAdmin
          ? !isGoogleBlueprintMode && (!showAdminBuiltInPreviewControls || adminBuiltInPreviewExpanded)
          : (isPublic && !isGoogleFormMode && selectedCamp && selectedCamp.status === 'open')) ? (
        <section
          className={`grid gap-6 lg:grid-cols-2 ${
            showAdminBuiltInPreviewControls
              ? 'border-x border-neutral-200 bg-white px-4 py-4 dark:border-neutral-700 dark:bg-neutral-900'
              : ''
          }`}
        >
          <article className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="heading-card">Age Guidelines</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-prose marker:text-accent dark:marker:text-emerald-500">
              {activeCampContent.ageGuidelines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3 className="mt-5 text-lg font-semibold text-accent dark:text-emerald-200">Camp Highlights</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-prose marker:text-accent dark:marker:text-emerald-500">
              {activeCampContent.highlights.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="heading-card">Batches</h2>
            <ul className="mt-3 space-y-2 text-prose">
              {activeCampContent.batches.map((batch) => (
                <li key={batch} className="rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
                  {batchLabelMap[batch] || batch} ({activeCampContent.batchDays?.[batch] || 7} days)
                </li>
              ))}
            </ul>
            <p className="mt-5 text-prose">{activeCampContent.pricing}</p>
            <p className="mt-2 text-prose">{activeCampContent.residencePricing}</p>
            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-800/60">
              <p>Registration (per family): <span className="font-semibold">{toINRCurrency(activeCampContent.registrationFee)}</span></p>
              <p>Residential (per person/day): <span className="font-semibold">{toINRCurrency(activeCampContent.perPersonPerDayPrice)}</span></p>
            </div>
            <div className="mt-4 rounded-xl border border-primary-muted/60 bg-primary/25 p-4 text-sm dark:border-emerald-800/50 dark:bg-emerald-950/20">
              <p><span className="font-semibold">Bank Name:</span> {activeCampContent.payment.bankName}</p>
              <p><span className="font-semibold">Account Holder:</span> {activeCampContent.payment.accountHolder}</p>
              <p><span className="font-semibold">Account Number:</span> {activeCampContent.payment.accountNumber}</p>
              <p><span className="font-semibold">IFSC:</span> {activeCampContent.payment.ifsc}</p>
              <p className="mt-2"><span className="font-semibold">Transaction Note:</span> {activeCampContent.transactionHint}</p>
            </div>
          </article>
        </section>
        ) : null}

        {!isAdminStatePreviewOnly &&
        !isAdminBlueprintPreviewOnly &&
        (isAdmin
          ? !isGoogleBlueprintMode && (!showAdminBuiltInPreviewControls || adminBuiltInPreviewExpanded)
          : (isPublic && selectedCamp && selectedCamp.status === 'open' && !isGoogleFormMode)) ? (
        <form
          ref={registrationFormRef}
          onSubmit={handleSubmit(onSubmit)}
          className={`${
            showAdminBuiltInPreviewControls
              ? 'rounded-b-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900'
              : 'mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900'
          }`}
        >
          <fieldset disabled={isAdmin} className={isAdmin ? 'opacity-90' : ''}>
          <h2 className="heading-section">{content.formTitle || defaultContent.formTitle}</h2>
          {content.formNote ? <p className="mt-2 text-sm text-prose-muted">{content.formNote}</p> : null}
          <p className="mt-2 text-xs text-prose-muted">
            Required fields are marked with <span className="font-medium text-red-500">*</span>.
          </p>
          {isPublic && selectedCamp ? (
            <p className="mt-2 text-sm text-prose-muted">
              Registering for: <span className="font-medium text-neutral-900 dark:text-neutral-100">{selectedCamp.title}</span>
            </p>
          ) : null}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-neutral-800 dark:text-neutral-200">
              Parent Email
              <RequiredStar />
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                className={rhfFieldClass(!!errors.parentEmail)}
                {...register('parentEmail', { setValueAs: (v) => normalizeEmail(v) })}
              />
              {errors.parentEmail ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.parentEmail.message}</p>
              ) : null}
            </label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">
              Parent Name
              <RequiredStar />
              <input className={rhfFieldClass(!!errors.parentName)} {...register('parentName')} />
              {errors.parentName ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.parentName.message}</p>
              ) : null}
            </label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">
              Relationship with child
              <RequiredStar />
              <input className={rhfFieldClass(!!errors.relationship)} {...register('relationship')} />
              {errors.relationship ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.relationship.message}</p>
              ) : null}
            </label>
            <PhoneInput
              label="Mobile Number"
              required
              name="mobileNumber"
              control={control}
              error={errors?.mobileNumber?.message}
              isDark={isDark}
            />
            <label className="text-sm text-neutral-800 dark:text-neutral-200">
              Mother Tongue
              <RequiredStar />
              <input className={rhfFieldClass(!!errors.motherTongue)} {...register('motherTongue')} />
              {errors.motherTongue ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.motherTongue.message}</p>
              ) : null}
            </label>
            <FormSelect
              name="country"
              control={control}
              label="Country"
              required
              options={COUNTRY_OPTIONS}
              placeholder="Select country"
              error={errors?.country?.message}
              isDark={isDark}
            />
            <label className="text-sm text-neutral-800 dark:text-neutral-200">
              State
              <RequiredStar />
              <input className={rhfFieldClass(!!errors.state)} {...register('state')} />
              {errors.state ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.state.message}</p>
              ) : null}
            </label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">
              City/Town
              <RequiredStar />
              <input className={rhfFieldClass(!!errors.city)} {...register('city')} />
              {errors.city ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.city.message}</p>
              ) : null}
            </label>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Children ({childFields.length})
                  <RequiredStar />
                </p>
                {errors.children && typeof errors.children.message === 'string' ? (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.children.message}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() =>
                  appendChild({
                    name: '',
                    age: '',
                    gender: '',
                    dob: '',
                    school: '',
                    currentClass: '',
                    interestedBatches: [],
                  })
                }
                className="rounded-lg bg-accent px-3 py-1.5 text-xs text-white dark:bg-emerald-700"
              >
                Add Child
              </button>
            </div>
            {childFields.map((field, childIndex) => (
              <div key={field.id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Child {childIndex + 1}</p>
                  {childFields.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeChild(childIndex)}
                      className="inline-flex items-center justify-center rounded-md bg-rose-100 px-2 py-1 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                      aria-label={`Delete Child ${childIndex + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    Name
                    <RequiredStar />
                    <input
                      className={rhfFieldClass(!!errors.children?.[childIndex]?.name)}
                      {...register(`children.${childIndex}.name`)}
                    />
                    {errors.children?.[childIndex]?.name ? (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {errors.children[childIndex].name.message}
                      </p>
                    ) : null}
                  </label>
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    Age
                    <RequiredStar />
                    <input
                      type="number"
                      className={rhfFieldClass(!!errors.children?.[childIndex]?.age)}
                      {...register(`children.${childIndex}.age`)}
                    />
                    {errors.children?.[childIndex]?.age ? (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {errors.children[childIndex].age.message}
                      </p>
                    ) : null}
                  </label>
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    Gender
                    <RequiredStar />
                    <select
                      className={rhfFieldClass(!!errors.children?.[childIndex]?.gender)}
                      {...register(`children.${childIndex}.gender`)}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {errors.children?.[childIndex]?.gender ? (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {errors.children[childIndex].gender.message}
                      </p>
                    ) : null}
                  </label>
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    DOB
                    <RequiredStar />
                    <input
                      type="date"
                      className={rhfFieldClass(!!errors.children?.[childIndex]?.dob)}
                      {...register(`children.${childIndex}.dob`)}
                    />
                    {errors.children?.[childIndex]?.dob ? (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {errors.children[childIndex].dob.message}
                      </p>
                    ) : null}
                  </label>
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    School
                    <RequiredStar />
                    <input
                      className={rhfFieldClass(!!errors.children?.[childIndex]?.school)}
                      {...register(`children.${childIndex}.school`)}
                    />
                    {errors.children?.[childIndex]?.school ? (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {errors.children[childIndex].school.message}
                      </p>
                    ) : null}
                  </label>
                  <label className="text-sm text-neutral-800 dark:text-neutral-200">
                    Current Class
                    <RequiredStar />
                    <input
                      className={rhfFieldClass(!!errors.children?.[childIndex]?.currentClass)}
                      {...register(`children.${childIndex}.currentClass`)}
                    />
                    {errors.children?.[childIndex]?.currentClass ? (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {errors.children[childIndex].currentClass.message}
                      </p>
                    ) : null}
                  </label>
                </div>
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Select one or more batches
                    <RequiredStar />
                  </p>
                  {errors.children?.[childIndex]?.interestedBatches ? (
                    <p className="mb-2 text-xs text-rose-600 dark:text-rose-400">
                      {errors.children[childIndex].interestedBatches.message}
                    </p>
                  ) : null}
                  <div className="grid gap-2 md:grid-cols-2">
                    {activeCampContent.batches.map((batch) => {
                      const checked = (watch(`children.${childIndex}.interestedBatches`) || []).includes(batch);
                      const daysForBatch = Number(activeCampContent.batchDays?.[batch] || 0);
                      return (
                        <label key={`${batch}-${childIndex}`} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const prev = watch(`children.${childIndex}.interestedBatches`) || [];
                              setValue(
                                `children.${childIndex}.interestedBatches`,
                                e.target.checked ? [...prev, batch] : prev.filter((x) => x !== batch),
                                { shouldValidate: true }
                              );
                            }}
                          />
                          <span>{batchLabelMap[batch] || batch} ({daysForBatch} days)</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Family Members Staying with child ({familyFields.length})</p>
              <button
                type="button"
                onClick={() => appendFamily({ name: '', relationWithChild: '', stayingDays: '' })}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs text-white dark:bg-emerald-700"
              >
                Add Family Member
              </button>
            </div>
            {familyFields.map((field, memberIndex) => (
              <div key={field.id} className="grid gap-3 rounded-xl border border-neutral-200 p-4 md:grid-cols-3 dark:border-neutral-700">
                <label className="text-sm text-neutral-800 dark:text-neutral-200">
                  Name
                  <RequiredStar />
                  <input
                    className={rhfFieldClass(!!errors.familyMembers?.[memberIndex]?.name)}
                    {...register(`familyMembers.${memberIndex}.name`)}
                  />
                  {errors.familyMembers?.[memberIndex]?.name ? (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {errors.familyMembers[memberIndex].name.message}
                    </p>
                  ) : null}
                </label>
                <label className="text-sm text-neutral-800 dark:text-neutral-200">
                  Relation with child
                  <RequiredStar />
                  <input
                    className={rhfFieldClass(!!errors.familyMembers?.[memberIndex]?.relationWithChild)}
                    {...register(`familyMembers.${memberIndex}.relationWithChild`)}
                  />
                  {errors.familyMembers?.[memberIndex]?.relationWithChild ? (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {errors.familyMembers[memberIndex].relationWithChild.message}
                    </p>
                  ) : null}
                </label>
                <div className="flex items-end gap-2">
                  <label className="w-full text-sm text-neutral-800 dark:text-neutral-200">
                    Staying Days
                    <RequiredStar />
                    <input
                      type="number"
                      min="1"
                      className={rhfFieldClass(!!errors.familyMembers?.[memberIndex]?.stayingDays)}
                      {...register(`familyMembers.${memberIndex}.stayingDays`)}
                    />
                    {errors.familyMembers?.[memberIndex]?.stayingDays ? (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {errors.familyMembers[memberIndex].stayingDays.message}
                      </p>
                    ) : null}
                  </label>
                  <button
                    type="button"
                    onClick={() => removeFamily(memberIndex)}
                    className="inline-flex items-center justify-center rounded-md bg-rose-100 px-2 py-2 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    aria-label={`Delete Family Member ${memberIndex + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-neutral-800 dark:text-neutral-200">
              How did you hear about us?
              <RequiredStar />
              <select
                className={rhfFieldClass(!!errors.source)}
                {...register('source')}
              >
                <option value="">Choose</option>
                <option>Word of mouth</option>
                <option>Poster/Flyer</option>
                <option>Website</option>
                <option>Instagram</option>
                <option>YouTube</option>
                <option>Whatsapp</option>
                <option>Other</option>
              </select>
              {errors.source ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.source.message}</p>
              ) : null}
            </label>
            {source === 'Other' ? (
              <label className="text-sm text-neutral-800 dark:text-neutral-200">
                Other Source
                <RequiredStar />
                <input
                  className={rhfFieldClass(!!errors.sourceOther)}
                  {...register('sourceOther')}
                />
                {errors.sourceOther ? (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.sourceOther.message}</p>
                ) : null}
              </label>
            ) : null}
          </div>

          <label className="mt-5 block text-sm text-neutral-800 dark:text-neutral-200">Transaction Note
            <input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" placeholder={activeCampContent.transactionHint} {...register('transactionNote')} />
          </label>
          <label className="mt-4 block text-sm text-neutral-800 dark:text-neutral-200">
            Payment Screenshot URL (optional)
            <input
              className={rhfFieldClass(!!errors.paymentScreenshotUrl)}
              placeholder="Paste uploaded payment screenshot link"
              {...register('paymentScreenshotUrl')}
            />
            {errors.paymentScreenshotUrl ? (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {errors.paymentScreenshotUrl.message}
              </p>
            ) : null}
          </label>
          <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/40">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Upload Payment Screenshot</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white dark:bg-emerald-700">
                <Upload className="h-4 w-4" />
                {uploadingPayment ? 'Uploading...' : 'Choose Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePaymentScreenshotUpload}
                  className="hidden"
                  disabled={uploadingPayment}
                />
              </label>
              {paymentScreenshotUrl ? (
                <button
                  type="button"
                  onClick={() => setValue('paymentScreenshotUrl', '', { shouldValidate: true, shouldDirty: true })}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-3 py-2 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Image
                </button>
              ) : null}
            </div>
            {paymentUploadError ? (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{paymentUploadError}</p>
            ) : null}
            {paymentScreenshotUrl ? (
              <a
                href={paymentScreenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-accent underline dark:text-emerald-300"
              >
                View uploaded screenshot
              </a>
            ) : null}
          </div>
          <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 text-sm dark:border-emerald-700/60 dark:bg-emerald-950/20">
            <p>Registration fee (family): <span className="font-semibold">{toINRCurrency(activeCampContent.registrationFee)}</span></p>
            <p>Children stay total: <span className="font-semibold">{childStayDaysTotal}</span> day(s)</p>
            <p>Family stay total: <span className="font-semibold">{familyStayDaysTotal}</span> day(s)</p>
            <p>Per person/day: <span className="font-semibold">{toINRCurrency(activeCampContent.perPersonPerDayPrice)}</span></p>
            {childPriceRows.length ? (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-white/70 p-3 dark:border-emerald-800/50 dark:bg-neutral-900/40">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">Children Breakdown</p>
                <div className="mt-2 space-y-1">
                  {childPriceRows.map((row, idx) => (
                    <p key={`child-price-${idx}`} className="text-xs text-emerald-900 dark:text-emerald-100">
                      {row.label}: {row.days} day(s) x {toINRCurrency(activeCampContent.perPersonPerDayPrice)} ={' '}
                      <span className="font-semibold">{toINRCurrency(row.amount)}</span>
                      {row.batches.length ? ` [${row.batches.join(', ')}]` : ''}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
            {familyPriceRows.length ? (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-white/70 p-3 dark:border-emerald-800/50 dark:bg-neutral-900/40">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">Family Members Breakdown</p>
                <div className="mt-2 space-y-1">
                  {familyPriceRows.map((row, idx) => (
                    <p key={`family-price-${idx}`} className="text-xs text-emerald-900 dark:text-emerald-100">
                      {row.label} ({row.relation}): {row.days} day(s) x {toINRCurrency(activeCampContent.perPersonPerDayPrice)} ={' '}
                      <span className="font-semibold">{toINRCurrency(row.amount)}</span>
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="mt-3 text-xs text-emerald-900 dark:text-emerald-100">
              Calculation: {toINRCurrency(activeCampContent.registrationFee)} + ({childStayDaysTotal} + {familyStayDaysTotal}) x{' '}
              {toINRCurrency(activeCampContent.perPersonPerDayPrice)} = {toINRCurrency(activeCampContent.registrationFee)} +{' '}
              {toINRCurrency(residentialAmount)}
            </p>
            <p className="mt-1 text-base font-semibold text-emerald-900 dark:text-emerald-200">
              Total Amount to Pay: {toINRCurrency(totalAmountPayable)}
            </p>
          </div>

          {Object.keys(errors).length ? (
            <div
              className="mt-3 rounded-lg border border-rose-200 bg-rose-50/90 p-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
              role="alert"
            >
              <p className="font-medium">Please fix the following:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {flattenRhfErrorMessages(errors).map((msg, idx) => (
                  <li key={`${msg}-${idx}`}>{msg}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="submit" disabled={isAdmin || isSubmitting || (isPublic && !(selectedCamp && selectedCamp.status === 'open'))} className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm text-white disabled:opacity-60 dark:bg-emerald-700">
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
            {isPublic ? (
              <button
                type="button"
                onClick={() => setSelectedCampId('')}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2.5 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            ) : null}
          </div>
          </fieldset>
        </form>
        ) : null}
        </>
        ) : null}

        {showCampHistoryTab ? (
          <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="heading-section">Submitted Registrations</h2>
            </div>
            <div className="mb-4">
              <label className="text-sm text-neutral-800 dark:text-neutral-200">
                Select Camp
                <select
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={selectedAdminCampId}
                  onChange={(e) => setSelectedAdminCampId(e.target.value)}
                >
                  {registrationCamps.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.title} ({camp.year || 'No Year'})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mb-3 flex items-center justify-between text-xs text-prose-muted">
              <p>
                Total registrations: <span className="font-semibold">{filteredAdminItems.length}</span>
              </p>
              <p>
                Page {adminRegistrationsPage} of {adminRegistrationsTotalPages}
              </p>
            </div>
            <div className="space-y-3">
              {paginatedAdminItems.map((item) => (
                <article key={item._id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {Array.isArray(item.children) && item.children.length
                          ? item.children
                              .map((child) => `${child?.name || 'Child'} (${child?.age || '-'})`)
                              .join(', ')
                          : `${item.childName || 'Child'} (${item.childAge || '-'})`}
                      </p>
                      <p className="text-sm text-prose-muted">{item.parentName || item.guardianName} • {item.mobileNumber} • {item.parentEmail || item.email}</p>
                      <p className="text-sm text-prose">Camp: <span className="font-medium">{item.registrationCampTitle || '-'}</span></p>
                      <p className="mt-1 text-sm text-prose">Status: <span className="font-medium">{item.status}</span></p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setEntryPreview(item)} className="rounded-md bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">View</button>
                      <button type="button" onClick={() => openEntryEditor(item)} className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => deleteEntry(item._id)} className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </article>
              ))}
              {!registrationCamps.length ? <p className="text-sm text-prose-muted">No camps configured yet.</p> : null}
              {selectedAdminCamp && !filteredAdminItems.length ? (
                <p className="text-sm text-prose-muted">No registrations for {selectedAdminCamp.title} yet.</p>
              ) : null}
            </div>
            {filteredAdminItems.length > adminRegistrationsPerPage ? (
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdminRegistrationsPage((p) => Math.max(1, p - 1))}
                  disabled={adminRegistrationsPage === 1}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAdminRegistrationsPage((p) => Math.min(adminRegistrationsTotalPages, p + 1))
                  }
                  disabled={adminRegistrationsPage === adminRegistrationsTotalPages}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
                >
                  Next
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        {status.message ? (
          <div className={`fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-lg px-3 py-2 text-sm shadow-lg ${status.type === 'error' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
            {status.message}
          </div>
        ) : null}
      </Container>


      {entryEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">{entryEditor._id ? 'Edit' : 'Add'} Registration Entry</h3>
            <p className="mt-2 text-xs text-prose-muted">
              Required fields are marked with <span className="font-medium text-red-500">*</span>.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {['registrationCampId','registrationCampTitle','email','guardianName','relationship','mobileNumber','motherTongue','country','state','city','childName','childAge','gender','schoolName','currentClass','familyMembersStaying','source','sourceOther','paymentScreenshotUrl','status'].map((key) =>
                key === 'email' ? (
                  <label key={key} className="text-sm capitalize text-neutral-800 dark:text-neutral-200">
                    email (parent)
                    <RequiredStar />
                    <input
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={entryEditor.email ?? ''}
                      onChange={(e) =>
                        setEntryEditor((p) => ({ ...p, email: e.target.value.toLowerCase() }))
                      }
                      onBlur={(e) =>
                        setEntryEditor((p) => ({ ...p, email: normalizeEmail(e.target.value) }))
                      }
                    />
                  </label>
                ) : (
                  <label key={key} className="text-sm capitalize text-neutral-800 dark:text-neutral-200">
                    {key}
                    {ENTRY_EDITOR_REQUIRED_SET.has(key) ? <RequiredStar /> : null}
                    <input
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                      value={entryEditor[key] ?? ''}
                      onChange={(e) => setEntryEditor((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  </label>
                )
              )}
            </div>
            <label className="mt-3 block text-sm text-neutral-800 dark:text-neutral-200">
              Interested Batches (one per line)
              <RequiredStar />
              <textarea
                className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                value={entryEditor.interestedBatchesText || ''}
                onChange={(e) => setEntryEditor((p) => ({ ...p, interestedBatchesText: e.target.value }))}
              />
            </label>
            <label className="mt-3 block text-sm text-neutral-800 dark:text-neutral-200">Transaction Note
              <textarea className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" value={entryEditor.transactionNote || ''} onChange={(e) => setEntryEditor((p) => ({ ...p, transactionNote: e.target.value }))} />
            </label>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={saveEntryEditor} className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"><Save className="h-4 w-4" /> Save</button>
              <button type="button" onClick={() => setEntryEditor(null)} className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"><X className="h-4 w-4" /> Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {entryPreview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">Registration Details</h3>
            <div className="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Parent & Contact</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
                {[
                  ['Camp', entryPreview.registrationCampTitle],
                  ['Parent Email', entryPreview.parentEmail || entryPreview.email],
                  ['Parent Name', entryPreview.parentName || entryPreview.guardianName],
                  ['Relationship', entryPreview.relationship],
                  ['Mobile Number', entryPreview.mobileNumber],
                  ['Mother Tongue', entryPreview.motherTongue],
                  ['Country', entryPreview.country],
                  ['State', entryPreview.state],
                  ['City', entryPreview.city],
                  ['Source', entryPreview.source],
                  ['Source Other', entryPreview.sourceOther],
                  ['Status', entryPreview.status],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                    <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">{label}</p>
                    <p className="mt-1 text-neutral-900 dark:text-neutral-100">{value || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Children Details</p>
              <div className="mt-3 space-y-3">
                {previewChildren.map((child, idx) => (
                  <div key={`preview-child-${idx}`} className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {child?.name || `Child ${idx + 1}`} ({child?.age || '-'})
                    </p>
                    <p className="mt-1 text-prose-muted">
                      Gender: {child?.gender || '-'} | School: {child?.school || child?.schoolName || '-'} | Class: {child?.currentClass || '-'}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-prose-muted">Selected Batches</p>
                    <p className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {Array.isArray(child?.interestedBatches) && child.interestedBatches.length
                        ? child.interestedBatches
                            .map((batch) => `${batch} (${previewBatchDays?.[batch] || 0} day(s))`)
                            .join(', ')
                        : '-'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Family Members Staying</p>
                {previewFamilyMembers.length ? (
                  <ul className="mt-2 space-y-2">
                    {previewFamilyMembers.map((member, idx) => (
                      <li key={`preview-family-${idx}`} className="rounded-lg border border-neutral-200 p-2 dark:border-neutral-700">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{member?.name || '-'}</span>{' '}
                        ({member?.relationWithChild || '-'}, {member?.stayingDays || 0} day(s))
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-neutral-900 dark:text-neutral-100">-</p>
                )}
              </div>
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 text-sm dark:border-emerald-700/60 dark:bg-emerald-950/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">Payment Breakdown</p>
                <p className="mt-2">Registration fee (family): <span className="font-semibold">{toINRCurrency(previewRegistrationFee)}</span></p>
                <p>Children stay total: <span className="font-semibold">{previewChildStayDaysTotal}</span> day(s)</p>
                <p>Family stay total: <span className="font-semibold">{previewFamilyStayDaysTotal}</span> day(s)</p>
                <p>Per person/day: <span className="font-semibold">{toINRCurrency(previewPerPersonPerDayPrice)}</span></p>
                <p className="mt-1 text-xs text-emerald-900 dark:text-emerald-100">
                  Formula: {toINRCurrency(previewRegistrationFee)} + ({previewChildStayDaysTotal} + {previewFamilyStayDaysTotal}) x {toINRCurrency(previewPerPersonPerDayPrice)} = {toINRCurrency(previewTotalAmount)}
                </p>
                <p className="mt-2 text-base font-semibold text-emerald-900 dark:text-emerald-200">
                  Total Amount: {toINRCurrency(previewTotalAmount)}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Transaction Note</p>
              <p className="mt-1 text-neutral-900 dark:text-neutral-100">{entryPreview.transactionNote || '-'}</p>
            </div>
            <div className="mt-4 rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Payment Screenshot</p>
              {entryPreview.paymentScreenshotUrl ? (
                <div className="mt-2 space-y-2">
                  <a
                    href={entryPreview.paymentScreenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-accent underline dark:text-emerald-300"
                  >
                    Open full image
                  </a>
                  <img
                    src={entryPreview.paymentScreenshotUrl}
                    alt="Payment screenshot"
                    className="max-h-72 w-auto rounded-lg border border-neutral-200 object-contain dark:border-neutral-700"
                  />
                </div>
              ) : (
                <p className="mt-1 text-neutral-900 dark:text-neutral-100">-</p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setEntryPreview(null)} className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"><X className="h-4 w-4" /> Close</button>
            </div>
          </div>
        </div>
      ) : null}

      {campEditor ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-black/40 px-4 py-6 sm:py-8">
          <div className="w-full max-w-4xl max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {campEditor.isNew ? 'Add Registration Camp' : 'Edit Registration Camp'}
            </h3>
            <p className="mt-2 text-xs text-prose-muted">
              Required fields are marked with <span className="font-medium text-red-500">*</span>.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                Camp Title
                <RequiredStar />
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.title}
                  onChange={(e) => setCampEditor((p) => ({ ...p, title: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                Camp Subtitle
                <RequiredStar />
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.subtitle || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, subtitle: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                Year
                <RequiredStar />
                {campYearSelectModel ? (
                  <select
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                    value={campEditor.year != null && campEditor.year !== '' ? String(campEditor.year) : ''}
                    onChange={(e) => setCampEditor((p) => ({ ...p, year: e.target.value }))}
                  >
                    {campYearSelectModel.legacyYears.map((y) => (
                      <option key={`legacy-${y}`} value={String(y)}>
                        {y} (outside {campYearSelectModel.bounds.min}–{campYearSelectModel.bounds.max}; update to save)
                      </option>
                    ))}
                    {campYearSelectModel.allowed.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                ) : null}
                <p className="mt-1 text-xs text-prose-muted">
                  Select {campYearSelectModel?.bounds.min} through {campYearSelectModel?.bounds.max}.
                </p>
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                Status
                <RequiredStar />
                <select
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.status}
                  onChange={(e) => setCampEditor((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="open">Open</option>
                  <option value="upcoming">Upcoming</option>
                  {campEditor.isNew ? null : <option value="closed">Closed</option>}
                </select>
              </label>
              {!campEditor.isNew && campEditor.status === 'closed' ? (
                <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                  Reason / Note
                  <RequiredStar />
                  <textarea
                    className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                    value={campEditor.note}
                    onChange={(e) => setCampEditor((p) => ({ ...p, note: e.target.value }))}
                  />
                </label>
              ) : null}
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Age Guidelines (one per line)
                <textarea
                  className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.ageGuidelinesText || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, ageGuidelinesText: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Camp Highlights (one per line)
                <textarea
                  className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.highlightsText || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, highlightsText: e.target.value }))}
                />
              </label>
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Batches
                  <RequiredStar />
                </p>
                {(campEditor.batchRows || []).map((row, idx) => (
                  <div key={row.id || idx} className="grid gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-2 lg:grid-cols-5 dark:border-neutral-700">
                    <input className="min-w-0 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" placeholder={`Batch ${idx + 1} Name`} value={row.label || `Batch ${idx + 1}`} onChange={(e) => setCampEditor((p) => ({ ...p, batchRows: (p.batchRows || []).map((it, i) => (i === idx ? { ...it, label: e.target.value } : it)) }))} />
                    <input type="date" className="min-w-0 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" value={row.startDate || ''} onChange={(e) => setCampEditor((p) => ({ ...p, batchRows: (p.batchRows || []).map((it, i) => (i === idx ? buildBatchRowUpdate(it, 'startDate', e.target.value) : it)) }))} />
                    <input type="date" className="min-w-0 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" value={row.endDate || ''} onChange={(e) => setCampEditor((p) => ({ ...p, batchRows: (p.batchRows || []).map((it, i) => (i === idx ? buildBatchRowUpdate(it, 'endDate', e.target.value) : it)) }))} />
                    <input type="number" min="1" className="min-w-0 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white" placeholder="Days" value={row.days || ''} onChange={(e) => setCampEditor((p) => ({ ...p, batchRows: (p.batchRows || []).map((it, i) => (i === idx ? buildBatchRowUpdate(it, 'days', e.target.value) : it)) }))} />
                    <button type="button" onClick={() => setCampEditor((p) => ({ ...p, batchRows: (p.batchRows || []).filter((_, i) => i !== idx) }))} className="inline-flex w-full items-center justify-center rounded-lg bg-rose-100 px-3 py-2 text-rose-700 sm:col-span-2 lg:col-span-1 dark:bg-rose-900/40 dark:text-rose-300" aria-label={`Delete Batch ${idx + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setCampEditor((p) => {
                      const rows = p.batchRows || [];
                      const prev = rows.length ? rows[rows.length - 1] : null;
                      const prevEnd = parseDateInput(prev?.endDate);
                      const startDate = prevEnd ? formatDateInput(addDays(prevEnd, 1)) : '';
                      const days = 7;
                      const endDate =
                        startDate && parseDateInput(startDate)
                          ? formatDateInput(addDays(parseDateInput(startDate), days))
                          : '';
                      return {
                        ...p,
                        batchRows: [
                          ...rows,
                          {
                            id: `batch-${Date.now()}`,
                            label: `Batch ${rows.length + 1}`,
                            startDate,
                            endDate,
                            days,
                          },
                        ],
                      };
                    })
                  }
                  className="rounded-lg bg-accent px-3 py-2 text-xs text-white dark:bg-emerald-700"
                >
                  Add Batch
                </button>
              </div>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Registration Fee (per family)
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.registrationFee || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, registrationFee: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Per Person/Day Price
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.perPersonPerDayPrice || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, perPersonPerDayPrice: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Registration Pricing
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.pricing || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, pricing: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Residential Pricing
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.residencePricing || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, residencePricing: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Bank Name
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.bankName || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, bankName: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Account Holder
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.accountHolder || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, accountHolder: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Account Number
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.accountNumber || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, accountNumber: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">IFSC
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.ifsc || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, ifsc: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Transaction Note Hint
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.transactionHint || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, transactionHint: e.target.value }))}
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={saveCampEditor} className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"><Save className="h-4 w-4" /> Save</button>
              <button type="button" onClick={() => setCampEditor(null)} className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"><X className="h-4 w-4" /> Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </PageFade>
  );
}
