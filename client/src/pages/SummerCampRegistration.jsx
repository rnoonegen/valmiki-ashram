import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { z } from 'zod';
import { adminRequest, apiRequest, getApiBase } from '../admin/api';
import Container from '../components/Container';
import FormSelect from '../components/forms/FormSelect';
import PhoneInput from '../components/forms/PhoneInput';
import PageFade from '../components/PageFade';
import { useTheme } from '../context/ThemeContext';
import { COUNTRY_OPTIONS } from '../data/registrationOptions';
import useLiveContent from '../hooks/useLiveContent';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  guardianName: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  mobileNumber: z.string().min(7, 'Mobile number is required'),
  motherTongue: z.string().min(1, 'Mother tongue is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  childName: z.string().min(1, 'Child name is required'),
  childAge: z.coerce.number().min(1).max(21),
  gender: z.string().min(1, 'Gender is required'),
  schoolName: z.string().min(1, 'School name is required'),
  currentClass: z.string().min(1, 'Current class is required'),
  interestedBatches: z.array(z.string()).min(1, 'Select at least one batch'),
  familyMembersStaying: z.string().min(1, 'Select family members count'),
  transactionNote: z.string().optional(),
  paymentScreenshotUrl: z.string().url('Enter valid URL').optional().or(z.literal('')),
  source: z.string().min(1, 'Please choose one source'),
  sourceOther: z.string().optional(),
});

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

const defaultValues = {
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
  interestedBatches: [],
  familyMembersStaying: '',
  transactionNote: '',
  paymentScreenshotUrl: '',
  source: '',
  sourceOther: '',
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

  const [status, setStatus] = useState({ type: '', message: '' });
  const [adminItems, setAdminItems] = useState([]);
  const [contentEditor, setContentEditor] = useState(null);
  const [entryEditor, setEntryEditor] = useState(null);
  const [entryPreview, setEntryPreview] = useState(null);
  const [campEditor, setCampEditor] = useState(null);
  const [adminTab, setAdminTab] = useState('registration-form');
  const [contentEditorStateTab, setContentEditorStateTab] = useState('empty');
  const [stateEditorOpen, setStateEditorOpen] = useState(false);
  const [adminBuiltInPreviewExpanded, setAdminBuiltInPreviewExpanded] = useState(true);
  const [selectedCampId, setSelectedCampId] = useState('');
  const [selectedAdminCampId, setSelectedAdminCampId] = useState('');
  const [adminRegistrationsPage, setAdminRegistrationsPage] = useState(1);
  const [campHistoryPage, setCampHistoryPage] = useState(1);
  const registrationFormRef = useRef(null);
  const source = watch('source');
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
      setFocus('email');
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
      batchesText: content.batches.join('\n'),
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
      batches: String(contentEditor.batchesText || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
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
        ? { ...item, interestedBatchesText: (item.interestedBatches || []).join('\n') }
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
            batchesText: (camp.batches || content.batches || []).join('\n'),
            pricing: camp.pricing || content.pricing,
            residencePricing: camp.residencePricing || content.residencePricing,
            bankName: camp.payment?.bankName || content.payment.bankName,
            accountHolder: camp.payment?.accountHolder || content.payment.accountHolder,
            accountNumber: camp.payment?.accountNumber || content.payment.accountNumber,
            ifsc: camp.payment?.ifsc || content.payment.ifsc,
            transactionHint: camp.transactionHint || content.transactionHint,
            isNew: false,
          }
        : {
            id: `camp-${Date.now()}`,
            title: '',
            subtitle: '',
            year: '',
            status: 'open',
            note: '',
            ageGuidelinesText: content.ageGuidelines.join('\n'),
            highlightsText: content.highlights.join('\n'),
            batchesText: content.batches.join('\n'),
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
    if (
      !String(campEditor.title || '').trim() ||
      !String(campEditor.subtitle || '').trim() ||
      !String(campEditor.year || '').trim()
    ) {
      setStatus({ type: 'error', message: 'Camp title, subtitle, and year are required.' });
      return;
    }
    const normalizedCamp = {
      id: campEditor.id,
      title: String(campEditor.title || '').trim(),
      subtitle: String(campEditor.subtitle || '').trim(),
      year: String(campEditor.year || '').trim(),
      status: campEditor.status,
      note: String(campEditor.note || '').trim(),
      ageGuidelines: toLines(campEditor.ageGuidelinesText),
      highlights: toLines(campEditor.highlightsText),
      batches: toLines(campEditor.batchesText),
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
    const payload = {
      ...entryEditor,
      interestedBatches: String(entryEditor.interestedBatchesText || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
    };
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
        pricing: content.pricing,
        residencePricing: content.residencePricing,
        payment: content.payment,
        transactionHint: content.transactionHint,
      };
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
                            {String(contentEditor.batchesText || '').split('\n').map((x) => x.trim()).filter(Boolean).map((line) => (
                              <li key={line} className="rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">{line}</li>
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
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Email<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Name<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Relationship with child<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Mobile Number<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Mother Tongue<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Country<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">State<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">City/Town<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Child Name<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Child Age<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Gender
                              <select disabled className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400">
                                <option value="">Select</option>
                              </select>
                            </label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">School Name<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Current Class/Standard<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Family Members Staying
                              <select disabled className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400">
                                <option value="">Choose</option>
                              </select>
                            </label>
                          </div>
                          <div className="mt-5">
                            <p className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">Which batch are you interested in?</p>
                            <div className="grid gap-2 md:grid-cols-2">
                              {String(contentEditor.batchesText || '').split('\n').map((x) => x.trim()).filter(Boolean).map((line) => (
                                <label key={line} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 opacity-70 dark:border-neutral-700 dark:text-neutral-200">
                                  <input type="checkbox" disabled />
                                  {line}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">How did you hear about us?
                              <select disabled className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400">
                                <option value="">Choose</option>
                              </select>
                            </label>
                            <label className="text-sm text-neutral-800 dark:text-neutral-200">Other Source<input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" /></label>
                          </div>
                          <label className="mt-5 block text-sm text-neutral-800 dark:text-neutral-200">Transaction Note
                            <input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" />
                          </label>
                          <label className="mt-4 block text-sm text-neutral-800 dark:text-neutral-200">Payment Screenshot URL (optional)
                            <input disabled readOnly value="" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" />
                          </label>
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
                        <label className="text-sm text-neutral-800 dark:text-neutral-200">Batches (one per line)
                          <textarea className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" value={contentEditor.batchesText} onChange={(e) => setContentEditor((p) => ({ ...p, batchesText: e.target.value }))} />
                        </label>
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
                  {batch}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-prose">{activeCampContent.pricing}</p>
            <p className="mt-2 text-prose">{activeCampContent.residencePricing}</p>
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
          {isPublic && selectedCamp ? (
            <p className="mt-2 text-sm text-prose-muted">
              Registering for: <span className="font-medium text-neutral-900 dark:text-neutral-100">{selectedCamp.title}</span>
            </p>
          ) : null}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-neutral-800 dark:text-neutral-200">Email<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('email')} /></label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">Name<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('guardianName')} /></label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">Relationship with child<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('relationship')} /></label>
            <PhoneInput
              label="Mobile Number"
              required
              name="mobileNumber"
              control={control}
              error={errors?.mobileNumber?.message}
              isDark={isDark}
            />
            <label className="text-sm text-neutral-800 dark:text-neutral-200">Mother Tongue<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('motherTongue')} /></label>
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
            <label className="text-sm text-neutral-800 dark:text-neutral-200">State<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('state')} /></label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">City/Town<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('city')} /></label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">Child Name<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('childName')} /></label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">Child Age<input type="number" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('childAge')} /></label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">Gender
              <select className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('gender')}>
                <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option>
              </select>
            </label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">School Name<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('schoolName')} /></label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">Current Class/Standard<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('currentClass')} /></label>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">Family Members Staying
              <select className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('familyMembersStaying')}>
                <option value="">Choose</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="Above 5">Above 5</option>
              </select>
            </label>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">Which batch are you interested in?</p>
            <div className="grid gap-2 md:grid-cols-2">
              {activeCampContent.batches.map((batch) => {
                const checked = (watch('interestedBatches') || []).includes(batch);
                return (
                  <label key={batch} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const prev = watch('interestedBatches') || [];
                        setValue(
                          'interestedBatches',
                          e.target.checked ? [...prev, batch] : prev.filter((x) => x !== batch),
                          { shouldValidate: true }
                        );
                      }}
                    />
                    {batch}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-neutral-800 dark:text-neutral-200">How did you hear about us?
              <select className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('source')}>
                <option value="">Choose</option><option>Word of mouth</option><option>Poster/Flyer</option><option>Website</option><option>Instagram</option><option>YouTube</option><option>Whatsapp</option><option>Other</option>
              </select>
            </label>
            {source === 'Other' ? (
              <label className="text-sm text-neutral-800 dark:text-neutral-200">Other Source<input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" {...register('sourceOther')} /></label>
            ) : null}
          </div>

          <label className="mt-5 block text-sm text-neutral-800 dark:text-neutral-200">Transaction Note
            <input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" placeholder={activeCampContent.transactionHint} {...register('transactionNote')} />
          </label>
          <label className="mt-4 block text-sm text-neutral-800 dark:text-neutral-200">Payment Screenshot URL (optional)
            <input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" placeholder="Paste uploaded payment screenshot link" {...register('paymentScreenshotUrl')} />
          </label>

          {Object.values(errors).length ? (
            <p className="mt-3 text-sm text-rose-600">Please fill all required fields correctly.</p>
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
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.childName} ({item.childAge})</p>
                      <p className="text-sm text-prose-muted">{item.guardianName} • {item.mobileNumber} • {item.email}</p>
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
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {['registrationCampId','registrationCampTitle','email','guardianName','relationship','mobileNumber','motherTongue','country','state','city','childName','childAge','gender','schoolName','currentClass','familyMembersStaying','source','sourceOther','paymentScreenshotUrl','status'].map((key) => (
                <label key={key} className="text-sm capitalize text-neutral-800 dark:text-neutral-200">{key}
                  <input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" value={entryEditor[key] ?? ''} onChange={(e) => setEntryEditor((p) => ({ ...p, [key]: e.target.value }))} />
                </label>
              ))}
            </div>
            <label className="mt-3 block text-sm text-neutral-800 dark:text-neutral-200">Interested Batches (one per line)
              <textarea className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400" value={entryEditor.interestedBatchesText || ''} onChange={(e) => setEntryEditor((p) => ({ ...p, interestedBatchesText: e.target.value }))} />
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
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">Registration Details</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
              {[
                ['Camp', entryPreview.registrationCampTitle],
                ['Email', entryPreview.email],
                ['Guardian Name', entryPreview.guardianName],
                ['Relationship', entryPreview.relationship],
                ['Mobile Number', entryPreview.mobileNumber],
                ['Mother Tongue', entryPreview.motherTongue],
                ['Country', entryPreview.country],
                ['State', entryPreview.state],
                ['City', entryPreview.city],
                ['Child Name', entryPreview.childName],
                ['Child Age', entryPreview.childAge],
                ['Gender', entryPreview.gender],
                ['School Name', entryPreview.schoolName],
                ['Current Class', entryPreview.currentClass],
                ['Family Members Staying', entryPreview.familyMembersStaying],
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
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Interested Batches</p>
                <p className="mt-1 text-neutral-900 dark:text-neutral-100">
                  {Array.isArray(entryPreview.interestedBatches) && entryPreview.interestedBatches.length
                    ? entryPreview.interestedBatches.join(', ')
                    : '-'}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Transaction Note</p>
                <p className="mt-1 text-neutral-900 dark:text-neutral-100">{entryPreview.transactionNote || '-'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-prose-muted">Payment Screenshot URL</p>
                <p className="mt-1 break-all text-neutral-900 dark:text-neutral-100">{entryPreview.paymentScreenshotUrl || '-'}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setEntryPreview(null)} className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"><X className="h-4 w-4" /> Close</button>
            </div>
          </div>
        </div>
      ) : null}

      {campEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {campEditor.isNew ? 'Add Registration Camp' : 'Edit Registration Camp'}
            </h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Camp Title
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.title}
                  onChange={(e) => setCampEditor((p) => ({ ...p, title: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Camp Subtitle
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.subtitle || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, subtitle: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Year
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.year || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, year: e.target.value }))}
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Status
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
                <label className="block text-sm text-neutral-800 dark:text-neutral-200">Reason / Note
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
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">Batches (one per line)
                <textarea
                  className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400"
                  value={campEditor.batchesText || ''}
                  onChange={(e) => setCampEditor((p) => ({ ...p, batchesText: e.target.value }))}
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
