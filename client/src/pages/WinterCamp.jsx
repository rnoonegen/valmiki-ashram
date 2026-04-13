import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { adminRequest } from "../admin/api";
import ImageUploader from "../components/admin/ImageUploader";
import ContentBlockEditor from "../components/camp/ContentBlockEditor";
import Container from "../components/Container";
import PageFade from "../components/PageFade";
import useLiveContent from "../hooks/useLiveContent";
import { renderContentBlocks, sanitizeContentBlocks } from "../utils/campContentBlocks";

const tabs = [
  { id: "about", label: "About Camp" },
  { id: "batches", label: "Batches" },
  { id: "highlights", label: "Highlights" },
  { id: "checklist", label: "Camp Checklist" },
];

const checklistTabs = [
  { id: "checklist", label: "Checklist" },
  { id: "reminders", label: "Reminders" },
];

const defaultHighlightsCampContent = {
  title: "Camp Highlights",
  contentBlocks: [
    {
      type: "paragraph",
      text:
        "The winter camp serves as an introduction to our full-time residential Gurukulam, launching in December 2026. It offers homeschooling families a unique opportunity to experience a comprehensive learning environment, where diverse educational opportunities are seamlessly integrated within a single campus.",
    },
    {
      type: "subheading",
      text: "Embark on an Unforgettable Winter Family Adventure!",
    },
    {
      type: "paragraph",
      text:
        "Experience an enriching 7-day residential family winter camp tailored for children aged 7 to 15 and parents.",
    },
    {
      type: "bullets",
      items: [
        "Traditional Indian games and Mallakhamb sessions",
        "Yoga, meditation, and mindful daily routines",
        "Farming, nature exposure, and activity-based learning",
        "Arts, storytelling, and team-building experiences",
      ],
    },
  ],
  images: [],
};

function buildHighlightsContentBlocks(raw) {
  const merged = { ...defaultHighlightsCampContent, ...(raw || {}) };
  const fromApi = merged.contentBlocks;
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    const normalized = sanitizeContentBlocks(fromApi, { allowImplicitBullets: true });
    if (normalized.length > 0) return normalized;
  }
  const legacy = [];
  if (merged.intro && String(merged.intro).trim()) {
    legacy.push({ type: "paragraph", text: String(merged.intro).trim() });
  }
  if (merged.subheading && String(merged.subheading).trim()) {
    legacy.push({ type: "subheading", text: String(merged.subheading).trim() });
  }
  if (merged.description && String(merged.description).trim()) {
    legacy.push({ type: "paragraph", text: String(merged.description).trim() });
  }
  if (Array.isArray(merged.points) && merged.points.length) {
    legacy.push({
      type: "bullets",
      items: merged.points
        .map((p) => (typeof p === "string" ? p.trim() : String(p)))
        .filter(Boolean),
    });
  }
  if (legacy.length > 0) {
    return sanitizeContentBlocks(legacy, { allowImplicitBullets: true });
  }
  return defaultHighlightsCampContent.contentBlocks;
}

const defaultAboutCampContent = {
  title: "Winter Camp",
  intro:
    "The winter camp serves as an introduction to our full-time residential Gurukulam, launching in December 2026. It offers homeschooling families a unique opportunity to experience a comprehensive learning environment, where diverse educational opportunities are seamlessly integrated within a single campus.",
  adventureHeading: "Embark on an Unforgettable Winter Family Adventure!",
  adventureText:
    "Experience an enriching 7-day residential family winter camp tailored for children aged 7 to 15 and parents.",
  ageGuidelinesTitle: "Age Guidelines:",
  ageGuidelines: [
    "5-8 years: Parent/guardian required",
    "9-15 years: Independent participation allowed",
  ],
  belowTitleBlocks: [
    {
      type: "paragraph",
      text:
        "The winter camp serves as an introduction to our full-time residential Gurukulam, launching in December 2026. It offers homeschooling families a unique opportunity to experience a comprehensive learning environment, where diverse educational opportunities are seamlessly integrated within a single campus.",
    },
  ],
  belowAdventureBlocks: [
    {
      type: "paragraph",
      text:
        "Experience an enriching 7-day residential family winter camp tailored for children aged 7 to 15 and parents.",
    },
  ],
  belowGuidelinesBlocks: [],
  images: [],
};

function buildAboutSectionBlocks(raw, blocksKey, legacyTextKey) {
  const merged = { ...defaultAboutCampContent, ...(raw || {}) };
  const fromApi = merged[blocksKey];
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    const normalized = sanitizeContentBlocks(fromApi, { allowImplicitBullets: true });
    if (normalized.length > 0) return normalized;
  }
  const legacy = merged[legacyTextKey];
  if (legacy && String(legacy).trim()) {
    return [{ type: "paragraph", text: String(legacy).trim() }];
  }
  return defaultAboutCampContent[blocksKey] || [];
}

function buildAboutBelowTitleBlocks(raw) {
  return buildAboutSectionBlocks(raw, "belowTitleBlocks", "intro");
}

function buildAboutBelowAdventureBlocks(raw) {
  return buildAboutSectionBlocks(raw, "belowAdventureBlocks", "adventureText");
}

function buildAboutBelowGuidelinesBlocks(raw) {
  const merged = { ...defaultAboutCampContent, ...(raw || {}) };
  const fromApi = merged.belowGuidelinesBlocks;
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    const normalized = sanitizeContentBlocks(fromApi, { allowImplicitBullets: true });
    if (normalized.length > 0) return normalized;
  }
  return [];
}

const defaultBatchesCampContent = {
  title: "Camp Batches",
  items: ["Batch 1: Dec 24th to Dec 30th"],
  leftContentBlocks: [
    {
      type: "paragraph",
      text:
        "Set amidst the vast 70-acre Forest Ridge campus in Hyderabad, this immersive program combines traditional learning with modern activities, promoting personal development, creativity, and unforgettable experiences.",
    },
  ],
  rightContentBlocks: [
    {
      type: "paragraph",
      text:
        "Families can expect a balanced routine that includes physical training, creative exploration, self-discipline, and joyful community bonding throughout the 7-day experience.",
    },
  ],
};

function buildBatchesSideBlocks(raw, blocksKey, legacyTextKey) {
  const merged = { ...defaultBatchesCampContent, ...(raw || {}) };
  const fromApi = merged[blocksKey];
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    const normalized = sanitizeContentBlocks(fromApi, { allowImplicitBullets: true });
    if (normalized.length > 0) return normalized;
  }
  const legacy = merged[legacyTextKey];
  if (legacy && String(legacy).trim()) {
    return [{ type: "paragraph", text: String(legacy).trim() }];
  }
  return defaultBatchesCampContent[blocksKey];
}

function buildBatchesLeftBlocks(raw) {
  return buildBatchesSideBlocks(raw, "leftContentBlocks", "description");
}

function buildBatchesRightBlocks(raw) {
  return buildBatchesSideBlocks(raw, "rightContentBlocks", "note");
}


function normalizeChecklistEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.type === "nested" || Array.isArray(raw.bullets)) {
    return {
      type: "nested",
      label: typeof raw.label === "string" ? raw.label : "",
      bullets: Array.isArray(raw.bullets)
        ? raw.bullets.map((b) => (typeof b === "string" ? b : String(b)))
        : [],
    };
  }
  if (typeof raw.text === "string" && raw.text.trim() && !raw.label && !raw.body) {
    return { type: "line", label: "", body: raw.text };
  }
  return {
    type: "line",
    label: typeof raw.label === "string" ? raw.label : "",
    body: typeof raw.body === "string" ? raw.body : "",
  };
}

function normalizeChecklistCategory(cat) {
  if (!cat || typeof cat !== "object") return null;
  const entries = (cat.entries || [])
    .map(normalizeChecklistEntry)
    .filter(Boolean);
  const title = typeof cat.title === "string" ? cat.title.trim() : "";
  if (!title || !entries.length) return null;
  return {
    title,
    listType: cat.listType === "unordered" ? "unordered" : "ordered",
    entries,
  };
}

function sanitizeChecklistEntry(e) {
  if (!e || typeof e !== "object") return null;
  if (e.type === "nested") {
    const label = (e.label || "").trim();
    const bullets = (e.bullets || [])
      .map((b) => (typeof b === "string" ? b.trim() : ""))
      .filter(Boolean);
    if (!label && !bullets.length) return null;
    return { type: "nested", label, bullets };
  }
  const label = (e.label || "").trim();
  const body = (e.body || "").trim();
  if (!label && !body) return null;
  return { type: "line", label, body };
}

function sanitizeChecklistCategories(categories) {
  return (categories || [])
    .map((cat) => {
      const title = (cat.title || "").trim();
      const entries = (cat.entries || [])
        .map(sanitizeChecklistEntry)
        .filter(Boolean);
      if (!title || !entries.length) return null;
      return {
        title,
        listType: cat.listType === "unordered" ? "unordered" : "ordered",
        entries,
      };
    })
    .filter(Boolean);
}

const defaultChecklistCampContent = {
  checklistCategories: [
    {
      title: "Clothing",
      listType: "ordered",
      entries: [
        {
          type: "line",
          label: "Traditional Attire (Gurukul dress code):",
          body:
            "Two sets of cotton outfits (Salwar Kameez with sleeves and Lehenga for girls; Kurta Pyjama with track pants for boys).",
        },
        {
          type: "line",
          label: "Casual Wear:",
          body:
            "Five sets of everyday clothing, preferably lightweight and breathable fabrics like cotton.",
        },
        {
          type: "line",
          label: "Sports Wear:",
          body:
            "Four sets of athletic apparel suitable for physical activities.",
        },
        {
          type: "line",
          label: "MallaKhamb Wear:",
          body: "Shorts for boys and leggings or caprice for girls.",
        },
        {
          type: "line",
          label: "Undergarments:",
          body: "Sufficient quantity (approximately ten pairs).",
        },
        {
          type: "line",
          label: "Swim Wear:",
          body:
            "Swim dress, swim short for boys and full swimsuit for girls.",
        },
        { type: "line", label: "Jacket", body: "" },
      ],
    },
    {
      title: "Toiletries",
      listType: "unordered",
      entries: [
        {
          type: "line",
          label: "Personal Hygiene Kit:",
          body:
            "Includes toothbrush, toothpaste, tongue cleaner, soap, shampoo and coconut oil.",
        },
        {
          type: "line",
          label: "Laundry Bag:",
          body: "For storing used garments.",
        },
      ],
    },
    {
      title: "Miscellaneous Items",
      listType: "ordered",
      entries: [
        {
          type: "nested",
          label: "Stationary:",
          bullets: [
            "Art supplies",
            "Sketch pens",
            "Color pencils",
            "Crayons",
            "Watercolors",
            "Paints",
            "Watercolor papers",
            "Art book",
            "Paint brushes",
          ],
        },
        {
          type: "line",
          label: "",
          body: "Daypack: A small backpack suitable for excursions.",
        },
        {
          type: "line",
          label: "",
          body:
            "Bed pack: Two bed sheets, thick blanket (as it gets cold in the night) and two pillow covers.",
        },
        { type: "line", label: "", body: "Yoga mat" },
        {
          type: "nested",
          label: "Footwear:",
          bullets: [
            "Sports shoes: Comfortable pairs for activities.",
            "Socks: Around five pairs.",
            "Slippers: For casual wear.",
          ],
        },
        {
          type: "nested",
          label: "Hydration Supplies:",
          bullets: [
            "Insulated flask: For hot beverages.",
            "Water bottle: Durable and refillable.",
          ],
        },
        {
          type: "line",
          label: "",
          body: "Locks: Number lock small size - 2.",
        },
      ],
    },
  ],
  reminders: {
    title: "Reminders",
    items: [
      {
        label: "Labeling:",
        body:
          "Clearly mark all personal items with a permanent marker using your child's unique admission number to prevent mix-ups.",
      },
      {
        label: "Inventory List:",
        body:
          "Provide a detailed checklist of all belongings accompanying your child to the camp.",
      },
    ],
    closing:
      "By ensuring your child is equipped with these essentials, they will be well-prepared to fully engage in all the enriching activities the winter camp offers.",
    closingBlocks: [
      {
        type: "paragraph",
        text:
          "By ensuring your child is equipped with these essentials, they will be well-prepared to fully engage in all the enriching activities the winter camp offers.",
      },
    ],
  },
};

const fallbackLegacyContent = {
  previousGalleries: [],
};

function buildRemindersClosingBlocks(rawReminders) {
  const merged = {
    ...defaultChecklistCampContent.reminders,
    ...(rawReminders || {}),
  };
  const fromApi = merged.closingBlocks;
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    const normalized = sanitizeContentBlocks(fromApi, { allowImplicitBullets: true });
    if (normalized.length > 0) return normalized;
  }
  const legacy = merged.closing;
  if (legacy && String(legacy).trim()) {
    return [{ type: "paragraph", text: String(legacy).trim() }];
  }
  return defaultChecklistCampContent.reminders.closingBlocks;
}

export default function WinterCamp() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin/winter-camp";
  const schedulePath = isAdmin
    ? "/admin/winter-camp/schedule"
    : "/winter-camp/schedule";
  const registerPath = isAdmin ? "/admin/register/winter-camp" : "/register/winter-camp";
  const [activeTab, setActiveTab] = useState("about");
  const [activeChecklistTab, setActiveChecklistTab] = useState("checklist");
  const cms = useLiveContent("winter-camp", {
    aboutCamp: defaultAboutCampContent,
    batchesCamp: defaultBatchesCampContent,
    highlightsCamp: defaultHighlightsCampContent,
    checklistCamp: defaultChecklistCampContent,
    previousGalleries: [],
  });
  const registrationCms = useLiveContent("winter-camp-registration", {
    registrationCamps: [],
  });
  const registrationCamps = Array.isArray(registrationCms?.registrationCamps)
    ? registrationCms.registrationCamps
    : [];
  const [draft, setDraft] = useState(cms);
  const [aboutEditor, setAboutEditor] = useState(null);
  const [batchesEditor, setBatchesEditor] = useState(null);
  const [highlightsEditor, setHighlightsEditor] = useState(null);
  const [checklistCategoriesEditor, setChecklistCategoriesEditor] =
    useState(null);
  const [remindersEditor, setRemindersEditor] = useState(null);
  const [galleryEditor, setGalleryEditor] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => setDraft(cms), [cms]);

  const saveWinterCampContent = async (nextContent) => {
    await adminRequest("/api/admin/content/winter-camp", {
      method: "PUT",
      body: JSON.stringify({ content: nextContent }),
    });
  };

  const display = isAdmin ? draft : cms;
  const usedRegistrationCampIds = useMemo(
    () =>
      new Set(
        ((display?.previousGalleries || []) || [])
          .map((gallery) => gallery.registrationCampId)
          .filter(Boolean)
      ),
    [display?.previousGalleries]
  );
  const aboutCamp = {
    ...defaultAboutCampContent,
    ...(display.aboutCamp || {}),
    ageGuidelines: Array.isArray(display.aboutCamp?.ageGuidelines)
      ? display.aboutCamp.ageGuidelines
      : defaultAboutCampContent.ageGuidelines,
    belowTitleBlocks: buildAboutBelowTitleBlocks(display.aboutCamp),
    belowAdventureBlocks: buildAboutBelowAdventureBlocks(display.aboutCamp),
    belowGuidelinesBlocks: buildAboutBelowGuidelinesBlocks(display.aboutCamp),
    images: [],
  };

  const batchesCamp = {
    ...defaultBatchesCampContent,
    ...(display.batchesCamp || {}),
    items: Array.isArray(display.batchesCamp?.items)
      ? display.batchesCamp.items
      : defaultBatchesCampContent.items,
    leftContentBlocks: buildBatchesLeftBlocks(display.batchesCamp),
    rightContentBlocks: buildBatchesRightBlocks(display.batchesCamp),
  };

  const highlightsCamp = {
    ...defaultHighlightsCampContent,
    ...(display.highlightsCamp || {}),
    contentBlocks: buildHighlightsContentBlocks(display.highlightsCamp),
    images: [],
  };

  const rawChecklistCategories = Array.isArray(
    display.checklistCamp?.checklistCategories
  )
    ? display.checklistCamp.checklistCategories
    : defaultChecklistCampContent.checklistCategories;
  const normalizedCategories = rawChecklistCategories
    .map(normalizeChecklistCategory)
    .filter(Boolean);
  const checklistCamp = {
    ...defaultChecklistCampContent,
    ...(display.checklistCamp || {}),
    checklistCategories:
      normalizedCategories.length > 0
        ? normalizedCategories
        : defaultChecklistCampContent.checklistCategories,
    reminders: {
      ...defaultChecklistCampContent.reminders,
      ...(display.checklistCamp?.reminders || {}),
      items: Array.isArray(display.checklistCamp?.reminders?.items)
        ? display.checklistCamp.reminders.items.map((it) => ({
            label: typeof it.label === "string" ? it.label : "",
            body: typeof it.body === "string" ? it.body : "",
          }))
        : defaultChecklistCampContent.reminders.items,
      closingBlocks: buildRemindersClosingBlocks(
        display.checklistCamp?.reminders
      ),
    },
  };

  const legacyPage = {
    ...fallbackLegacyContent,
    ...(display || {}),
    previousGalleries: Array.isArray(display?.previousGalleries)
      ? display.previousGalleries
      : fallbackLegacyContent.previousGalleries,
  };

  const openAboutEditor = () => {
    setAboutEditor({
      title: aboutCamp.title || "",
      adventureHeading: aboutCamp.adventureHeading || "",
      ageGuidelinesTitle: aboutCamp.ageGuidelinesTitle || "",
      ageGuidelines: [...(aboutCamp.ageGuidelines || [])],
      belowTitleBlocks: JSON.parse(
        JSON.stringify(aboutCamp.belowTitleBlocks || [])
      ),
      belowAdventureBlocks: JSON.parse(
        JSON.stringify(aboutCamp.belowAdventureBlocks || [])
      ),
      belowGuidelinesBlocks: JSON.parse(
        JSON.stringify(aboutCamp.belowGuidelinesBlocks || [])
      ),
    });
  };

  const saveAboutEditor = async () => {
    if (!aboutEditor) return;
    let belowTitle = sanitizeContentBlocks(
      aboutEditor.belowTitleBlocks || []
    );
    let belowAdventure = sanitizeContentBlocks(
      aboutEditor.belowAdventureBlocks || []
    );
    const belowGuidelines = sanitizeContentBlocks(
      aboutEditor.belowGuidelinesBlocks || []
    );
    if (belowTitle.length === 0) {
      belowTitle = defaultAboutCampContent.belowTitleBlocks;
    }
    if (belowAdventure.length === 0) {
      belowAdventure = defaultAboutCampContent.belowAdventureBlocks;
    }
    const next = {
      ...draft,
      aboutCamp: {
        ...aboutCamp,
        title: aboutEditor.title,
        adventureHeading: aboutEditor.adventureHeading,
        ageGuidelinesTitle: aboutEditor.ageGuidelinesTitle,
        ageGuidelines: (aboutEditor.ageGuidelines || [])
          .map((line) => line.trim())
          .filter(Boolean),
        belowTitleBlocks: belowTitle,
        belowAdventureBlocks: belowAdventure,
        belowGuidelinesBlocks: belowGuidelines,
        images: [],
      },
    };
    setDraft(next);
    await saveWinterCampContent(next);
    setAboutEditor(null);
  };

  const openBatchesEditor = () => {
    setBatchesEditor({
      title: batchesCamp.title || "",
      items: [...(batchesCamp.items || [])],
      leftContentBlocks: JSON.parse(
        JSON.stringify(batchesCamp.leftContentBlocks || [])
      ),
      rightContentBlocks: JSON.parse(
        JSON.stringify(batchesCamp.rightContentBlocks || [])
      ),
    });
  };

  const saveBatchesEditor = async () => {
    if (!batchesEditor) return;
    let leftBlocks = sanitizeContentBlocks(
      batchesEditor.leftContentBlocks || []
    );
    let rightBlocks = sanitizeContentBlocks(
      batchesEditor.rightContentBlocks || []
    );
    if (leftBlocks.length === 0) {
      leftBlocks = defaultBatchesCampContent.leftContentBlocks;
    }
    if (rightBlocks.length === 0) {
      rightBlocks = defaultBatchesCampContent.rightContentBlocks;
    }
    const next = {
      ...draft,
      batchesCamp: {
        ...batchesCamp,
        ...batchesEditor,
        items: (batchesEditor.items || [])
          .map((line) => line.trim())
          .filter(Boolean),
        leftContentBlocks: leftBlocks,
        rightContentBlocks: rightBlocks,
      },
    };
    setDraft(next);
    await saveWinterCampContent(next);
    setBatchesEditor(null);
  };

  const openHighlightsEditor = () => {
    setHighlightsEditor({
      title: highlightsCamp.title || "",
      contentBlocks: JSON.parse(
        JSON.stringify(highlightsCamp.contentBlocks || [])
      ),
    });
  };

  const saveHighlightsEditor = async () => {
    if (!highlightsEditor) return;
    let blocks = sanitizeContentBlocks(
      highlightsEditor.contentBlocks || []
    );
    if (blocks.length === 0) {
      blocks = defaultHighlightsCampContent.contentBlocks;
    }
    const next = {
      ...draft,
      highlightsCamp: {
        title:
          (highlightsEditor.title || "").trim() ||
          defaultHighlightsCampContent.title,
        contentBlocks: blocks,
        images: [],
      },
    };
    setDraft(next);
    await saveWinterCampContent(next);
    setHighlightsEditor(null);
  };

  const openChecklistCategoriesEditor = () => {
    setChecklistCategoriesEditor({
      categories: JSON.parse(
        JSON.stringify(checklistCamp.checklistCategories || [])
      ),
    });
  };

  const saveChecklistCategoriesEditor = async () => {
    if (!checklistCategoriesEditor) return;
    const sanitized = sanitizeChecklistCategories(
      checklistCategoriesEditor.categories
    );
    const nextCategories =
      sanitized.length > 0
        ? sanitized
        : defaultChecklistCampContent.checklistCategories;
    const next = {
      ...draft,
      checklistCamp: {
        ...checklistCamp,
        checklistCategories: nextCategories,
      },
    };
    setDraft(next);
    await saveWinterCampContent(next);
    setChecklistCategoriesEditor(null);
  };

  const openRemindersEditor = () => {
    const r = checklistCamp.reminders || defaultChecklistCampContent.reminders;
    setRemindersEditor({
      title: r.title || "",
      items: (r.items || []).map((it) => ({
        label: it.label || "",
        body: it.body || "",
      })),
      closingBlocks: JSON.parse(JSON.stringify(r.closingBlocks || [])),
    });
  };

  const saveRemindersEditor = async () => {
    if (!remindersEditor) return;
    const items = (remindersEditor.items || [])
      .map((it) => ({
        label: (it.label || "").trim(),
        body: (it.body || "").trim(),
      }))
      .filter((it) => it.label || it.body);
    let closingBlocks = sanitizeContentBlocks(
      remindersEditor.closingBlocks || []
    );
    if (closingBlocks.length === 0) {
      closingBlocks = defaultChecklistCampContent.reminders.closingBlocks;
    }
    const closingLegacy = (
      closingBlocks.find((b) => b.type === "paragraph")?.text || ""
    ).trim();
    const next = {
      ...draft,
      checklistCamp: {
        ...checklistCamp,
        reminders: {
          title: (remindersEditor.title || "").trim() || "Reminders",
          items:
            items.length > 0
              ? items
              : defaultChecklistCampContent.reminders.items,
          closingBlocks,
          closing: closingLegacy.trim(),
        },
      },
    };
    setDraft(next);
    await saveWinterCampContent(next);
    setRemindersEditor(null);
  };

  const openGalleryEditor = (index) => {
    const item = legacyPage.previousGalleries?.[index];
    setGalleryEditor({
      index,
      isNew: !item,
      id: item?.id || `winter-gallery-${Date.now()}`,
      registrationCampId: item?.registrationCampId || "",
      registrationCampYear:
        item?.registrationCampYear ||
        registrationCamps.find((camp) => camp.id === item?.registrationCampId)
          ?.year ||
        "",
      title: item?.title || "",
      description: item?.description || "",
      longDescription: item?.longDescription || "",
      contentBlocksText: Array.isArray(item?.contentBlocks)
        ? item.contentBlocks.join("\n")
        : "",
      images: Array.isArray(item?.images) ? item.images : [],
    });
  };

  const saveGalleryEditor = async () => {
    if (!galleryEditor) return;
    if (galleryEditor.isNew && !galleryEditor.registrationCampId) {
      setStatus({ type: "error", message: "Please select a winter camp." });
      return;
    }
    if (!String(galleryEditor.title || "").trim()) {
      setStatus({ type: "error", message: "Gallery title is required." });
      return;
    }
    const galleries = [...(legacyPage.previousGalleries || [])];
    const item = {
      id: galleryEditor.id,
      registrationCampId: galleryEditor.registrationCampId || "",
      registrationCampYear:
        galleryEditor.registrationCampYear ||
        registrationCamps.find((camp) => camp.id === galleryEditor.registrationCampId)
          ?.year ||
        "",
      title: galleryEditor.title.trim(),
      description: galleryEditor.description.trim(),
      longDescription: String(galleryEditor.longDescription || "").trim(),
      contentBlocks: String(galleryEditor.contentBlocksText || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      images: galleryEditor.images || [],
    };
    if (galleryEditor.isNew) galleries.unshift(item);
    else galleries[galleryEditor.index] = item;
    const next = { ...draft, previousGalleries: galleries };
    setDraft(next);
    await saveWinterCampContent(next);
    setStatus({ type: "success", message: "Winter camp gallery updated." });
    setGalleryEditor(null);
  };

  const deleteGallery = async (index) => {
    const next = {
      ...draft,
      previousGalleries: (legacyPage.previousGalleries || []).filter(
        (_, i) => i !== index
      ),
    };
    setDraft(next);
    await saveWinterCampContent(next);
    setStatus({ type: "success", message: "Winter camp gallery deleted." });
  };

  const renderChecklistEntry = (entry, index) => {
    const key = `entry-${index}-${entry.type}-${entry.label || entry.body}`;
    if (entry.type === "nested") {
      return (
        <li key={key} className="text-prose-muted">
          <span className="font-medium text-prose">{entry.label}</span>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-prose-muted">
            {(entry.bullets || []).map((b, bi) => (
              <li key={`${key}-b-${bi}`}>{b}</li>
            ))}
          </ul>
        </li>
      );
    }
    return (
      <li key={key} className="text-prose-muted">
        {entry.label ? (
          <>
            <span className="font-medium text-prose">{entry.label}</span>
            {entry.body ? <> {entry.body}</> : null}
          </>
        ) : (
          entry.body
        )}
      </li>
    );
  };

  const content = useMemo(() => {
    if (activeTab === "batches") {
      return (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-2xl font-semibold text-prose">
                {batchesCamp.title}
              </h3>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={openBatchesEditor}
                  className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                  aria-label="Edit camp batches"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-prose-muted">
              {(batchesCamp.items || []).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ol>
            {(batchesCamp.leftContentBlocks || []).map((block, bi) => {
              if (block.type === "subheading") {
                return (
                  <p
                    key={`batch-l-${bi}`}
                    className={
                      bi === 0
                        ? "mt-6 text-lg font-semibold text-prose"
                        : "mt-5 text-lg font-semibold text-prose"
                    }
                  >
                    {block.text}
                  </p>
                );
              }
              if (block.type === "bullets") {
                return (
                  <ul
                    key={`batch-l-${bi}`}
                    className={
                      bi === 0
                        ? "mt-6 list-disc space-y-2 pl-6 text-prose-muted"
                        : "mt-5 list-disc space-y-2 pl-6 text-prose-muted"
                    }
                  >
                    {(block.items || []).map((item, ii) => (
                      <li key={`${item}-${ii}`}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p
                  key={`batch-l-${bi}`}
                  className={
                    bi === 0
                      ? "mt-6 text-base leading-8 text-prose-muted"
                      : "mt-2 text-base leading-8 text-prose-muted"
                  }
                >
                  {block.text}
                </p>
              );
            })}
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-primary/50 p-6 dark:border-neutral-700 dark:bg-neutral-800/80">
            {(batchesCamp.rightContentBlocks || []).map((block, bi) => {
              if (block.type === "subheading") {
                return (
                  <p
                    key={`batch-r-${bi}`}
                    className={
                      bi === 0
                        ? "text-lg font-semibold text-prose"
                        : "mt-5 text-lg font-semibold text-prose"
                    }
                  >
                    {block.text}
                  </p>
                );
              }
              if (block.type === "bullets") {
                return (
                  <ul
                    key={`batch-r-${bi}`}
                    className={
                      bi === 0
                        ? "list-disc space-y-2 pl-6 text-prose-muted"
                        : "mt-5 list-disc space-y-2 pl-6 text-prose-muted"
                    }
                  >
                    {(block.items || []).map((item, ii) => (
                      <li key={`${item}-${ii}`}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p
                  key={`batch-r-${bi}`}
                  className={
                    bi === 0
                      ? "text-base leading-8 text-prose-muted"
                      : "mt-2 text-base leading-8 text-prose-muted"
                  }
                >
                  {block.text}
                </p>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeTab === "highlights") {
      return (
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-2xl font-semibold text-prose">
              {highlightsCamp.title}
            </h3>
            {isAdmin ? (
              <button
                type="button"
                onClick={openHighlightsEditor}
                className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                aria-label="Edit camp highlights text"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          {(highlightsCamp.contentBlocks || []).map((block, bi) => {
            if (block.type === "subheading") {
              return (
                <p
                  key={`hlb-${bi}`}
                  className={
                    bi === 0
                      ? "mt-4 text-lg font-semibold text-prose"
                      : "mt-5 text-lg font-semibold text-prose"
                  }
                >
                  {block.text}
                </p>
              );
            }
            if (block.type === "bullets") {
              return (
                <ul
                  key={`hlb-${bi}`}
                  className={
                    bi === 0
                      ? "mt-4 list-disc space-y-2 pl-6 text-prose-muted"
                      : "mt-5 list-disc space-y-2 pl-6 text-prose-muted"
                  }
                >
                  {(block.items || []).map((item, ii) => (
                    <li key={`${item}-${ii}`}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={`hlb-${bi}`}
                className={
                  bi === 0
                    ? "mt-4 text-base leading-8 text-prose-muted"
                    : "mt-2 text-base leading-8 text-prose-muted"
                }
              >
                {block.text}
              </p>
            );
          })}
        </div>
      );
    }

    if (activeTab === "checklist") {
      const reminders = checklistCamp.reminders || {};
      return (
        <div>
          <div className="grid grid-cols-2 border border-neutral-200 dark:border-neutral-700">
            {checklistTabs.map((item) => {
              const isActive = activeChecklistTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveChecklistTab(item.id)}
                  className={`px-4 py-3 text-sm font-medium transition sm:text-base ${
                    isActive
                      ? "bg-primary/70 text-prose dark:bg-emerald-950/50 dark:text-emerald-100"
                      : "bg-white text-prose-muted hover:bg-primary/40 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="border-x border-b border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900 sm:p-8">
            {activeChecklistTab === "checklist" ? (
              <div className="space-y-7">
                <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-700">
                  <p className="text-sm font-medium text-prose-muted">
                    Packing checklist by category
                  </p>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={openChecklistCategoriesEditor}
                      className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                      aria-label="Edit checklist categories"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                {(checklistCamp.checklistCategories || []).map((cat, ci) => {
                  const ListTag = cat.listType === "unordered" ? "ul" : "ol";
                  const listClass =
                    cat.listType === "unordered"
                      ? "mt-3 list-disc space-y-2 pl-6 text-prose-muted"
                      : "mt-3 list-decimal space-y-2 pl-6 text-prose-muted";
                  return (
                    <div key={`${cat.title}-${ci}`}>
                      <h4 className="text-xl font-semibold text-prose">
                        {cat.title}
                      </h4>
                      <ListTag className={listClass}>
                        {(cat.entries || []).map((entry, ei) =>
                          renderChecklistEntry(entry, `${ci}-${ei}`)
                        )}
                      </ListTag>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-700">
                  <h4 className="text-xl font-semibold text-prose">
                    {reminders.title || "Reminders"}
                  </h4>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={openRemindersEditor}
                      className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                      aria-label="Edit reminders"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-prose-muted">
                  {(reminders.items || []).map((it, ri) => (
                    <li key={`r-${ri}`}>
                      {it.label ? (
                        <>
                          <span className="font-medium text-prose">
                            {it.label}
                          </span>{" "}
                          {it.body}
                        </>
                      ) : (
                        it.body
                      )}
                    </li>
                  ))}
                </ul>
                {renderContentBlocks(
                  reminders.closingBlocks,
                  "rem-close",
                  "mt-5"
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-semibold text-prose">
            {aboutCamp.title}
          </h3>
          {isAdmin ? (
            <button
              type="button"
              onClick={openAboutEditor}
              className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
              aria-label="Edit about camp text"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        {renderContentBlocks(aboutCamp.belowTitleBlocks, "about-t", "mt-4")}
        <p className="mt-6 text-lg font-semibold text-prose">
          {aboutCamp.adventureHeading}
        </p>
        {renderContentBlocks(
          aboutCamp.belowAdventureBlocks,
          "about-a",
          "mt-2"
        )}
        <ul className="mt-5 list-disc space-y-2 pl-6 text-prose-muted">
          <li>
            <span className="font-medium text-prose">
              {aboutCamp.ageGuidelinesTitle}
            </span>
          </li>
          {(aboutCamp.ageGuidelines || []).map((line, index) => (
            <li key={`${line}-${index}`}>{line}</li>
          ))}
        </ul>
        {renderContentBlocks(
          aboutCamp.belowGuidelinesBlocks,
          "about-g",
          "mt-5"
        )}
      </div>
    );
  }, [
    activeChecklistTab,
    activeTab,
    aboutCamp,
    batchesCamp,
    highlightsCamp,
    checklistCamp,
    isAdmin,
  ]);

  return (
    <PageFade>
      <section className="border-b border-neutral-200 bg-secondary/35 py-10 dark:border-neutral-700 dark:bg-neutral-950/70 md:py-14">
        <Container>
          <h1 className="heading-page">Winter Camp Details</h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={registerPath}
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              Registration
            </Link>
            <Link
              to={schedulePath}
              className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-prose transition hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Camp Schedule
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-8 md:py-12">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b border-r border-neutral-200 px-4 py-3 text-sm font-medium transition last:border-r-0 md:text-base dark:border-neutral-700 ${
                    isActive
                      ? "bg-primary/70 text-prose dark:bg-emerald-950/50 dark:text-emerald-100"
                      : "bg-white text-prose-muted hover:bg-primary/40 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-neutral-50 p-5 sm:p-8 dark:bg-neutral-950/70">
            {content}
          </div>
        </div>
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-prose">
              Previous Winter Camp Galleries
            </h3>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => openGalleryEditor()}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Gallery
              </button>
            ) : null}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {(legacyPage.previousGalleries || []).length === 0 ? (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center dark:border-neutral-600 dark:bg-neutral-900/60">
                <p className="text-sm font-medium text-prose">No past camp galleries yet</p>
                <p className="mx-auto mt-2 max-w-lg text-sm text-prose-muted">
                  Photo collections from previous winter camps appear in this section.
                  {isAdmin ? (
                    <> Use &ldquo;Add Gallery&rdquo; above when you are ready to publish the first one.</>
                  ) : (
                    <> Check back later for highlights from past seasons.</>
                  )}
                </p>
              </div>
            ) : (
              (legacyPage.previousGalleries || []).map((gallery, index) => {
                const detailPath = isAdmin
                  ? `/admin/winter-camp/${gallery.id}`
                  : `/winter-camp/${gallery.id}`;
                const cover = gallery.images?.[0] || "";
                const stack = (gallery.images || []).slice(1, 3);
                return (
                  <article
                    key={gallery.id || index}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link to={detailPath} className="min-w-0 flex-1">
                        <h4 className="font-semibold text-accent dark:text-emerald-200">
                          {gallery.title}
                        </h4>
                        <p className="mt-1 text-xs text-prose-muted">
                          Winter:{" "}
                          {gallery.registrationCampYear ||
                            registrationCamps.find(
                              (camp) => camp.id === gallery.registrationCampId
                            )?.year ||
                            "-"}
                        </p>
                        <p className="mt-1 text-sm text-prose-muted">
                          {gallery.description}
                        </p>
                      </Link>
                      {isAdmin ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openGalleryEditor(index)}
                            className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteGallery(index)}
                            className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <Link to={detailPath} className="mt-3 block">
                      <div className="relative h-48 rounded-xl bg-neutral-100 p-2 dark:bg-neutral-800">
                        {stack.map((img, i) => (
                          <img
                            key={`${img}-${i}`}
                            src={img}
                            alt={`${gallery.title} stacked ${i + 1}`}
                            className="absolute h-[calc(100%-16px)] w-[calc(100%-16px)] rounded-lg object-cover opacity-60"
                            style={{
                              top: 8 + (i + 1) * 6,
                              left: 8 + (i + 1) * 6,
                              zIndex: 10 + i,
                            }}
                          />
                        ))}
                        {cover ? (
                          <img
                            src={cover}
                            alt={gallery.title}
                            className="relative z-30 h-full w-full rounded-lg object-contain bg-white dark:bg-neutral-900"
                          />
                        ) : (
                          <div className="relative z-30 flex h-full w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 text-sm text-prose-muted dark:border-neutral-600">
                            No cover image
                          </div>
                        )}
                      </div>
                    </Link>
                  </article>
                );
              })
            )}
          </div>
        </section>
        {status.message ? (
          <div
            className={`fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-lg px-3 py-2 text-sm shadow-lg ${
              status.type === "error"
                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            }`}
          >
            {status.message}
          </div>
        ) : null}
      </Container>

      {isAdmin && checklistCategoriesEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit packing checklist
            </h3>
            <p className="mt-1 text-xs text-prose-muted">
              Add categories (Clothing, Toiletries, …). Each category uses a
              numbered or bullet list. Use &quot;line&quot; for a single row
              (optional bold label + detail), or &quot;nested&quot; for a
              heading with sub-bullets (e.g. Stationary, Footwear).
            </p>

            <div className="mt-4 space-y-6">
              {(checklistCategoriesEditor.categories || []).map((cat, ci) => (
                <div
                  key={`ed-cat-${ci}`}
                  className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="min-w-[10rem] flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                      placeholder="Category title"
                      value={cat.title}
                      onChange={(e) =>
                        setChecklistCategoriesEditor((p) => {
                          const categories = [...(p.categories || [])];
                          categories[ci] = {
                            ...categories[ci],
                            title: e.target.value,
                          };
                          return { categories };
                        })
                      }
                    />
                    <select
                      className="rounded-lg border border-neutral-300 px-2 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                      value={cat.listType || "ordered"}
                      onChange={(e) =>
                        setChecklistCategoriesEditor((p) => {
                          const categories = [...(p.categories || [])];
                          categories[ci] = {
                            ...categories[ci],
                            listType: e.target.value,
                          };
                          return { categories };
                        })
                      }
                    >
                      <option value="ordered">Numbered list</option>
                      <option value="unordered">Bullet list</option>
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setChecklistCategoriesEditor((p) => ({
                          categories: (p.categories || []).filter(
                            (_, i) => i !== ci
                          ),
                        }))
                      }
                      className="rounded-md bg-rose-600 p-2 text-white"
                      aria-label="Remove category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    {(cat.entries || []).map((ent, ei) => (
                      <div
                        key={`ed-ent-${ci}-${ei}`}
                        className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-900/50"
                      >
                        {ent.type === "nested" ? (
                          <div className="space-y-2">
                            <input
                              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                              placeholder="Group title (e.g. Stationary:)"
                              value={ent.label || ""}
                              onChange={(e) =>
                                setChecklistCategoriesEditor((p) => {
                                  const categories = (p.categories || []).map(
                                    (c, i) =>
                                      i !== ci
                                        ? c
                                        : {
                                            ...c,
                                            entries: c.entries.map((en, j) =>
                                              j !== ei
                                                ? en
                                                : {
                                                    ...en,
                                                    label: e.target.value,
                                                  }
                                            ),
                                          }
                                  );
                                  return { categories };
                                })
                              }
                            />
                            <p className="text-xs font-medium text-prose-muted">
                              Sub-bullets
                            </p>
                            {(ent.bullets || []).map((b, bi) => (
                              <div
                                key={`${ci}-${ei}-b-${bi}`}
                                className="flex gap-2"
                              >
                                <input
                                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                                  placeholder="Sub-item"
                                  value={b}
                                  onChange={(e) =>
                                    setChecklistCategoriesEditor((p) => {
                                      const categories = (
                                        p.categories || []
                                      ).map((c, i) =>
                                        i !== ci
                                          ? c
                                          : {
                                              ...c,
                                              entries: c.entries.map((en, j) =>
                                                j !== ei
                                                  ? en
                                                  : {
                                                      ...en,
                                                      bullets: (
                                                        en.bullets || []
                                                      ).map((bb, bj) =>
                                                        bj === bi
                                                          ? e.target.value
                                                          : bb
                                                      ),
                                                    }
                                              ),
                                            }
                                      );
                                      return { categories };
                                    })
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setChecklistCategoriesEditor((p) => {
                                      const categories = (
                                        p.categories || []
                                      ).map((c, i) =>
                                        i !== ci
                                          ? c
                                          : {
                                              ...c,
                                              entries: c.entries.map((en, j) =>
                                                j !== ei
                                                  ? en
                                                  : {
                                                      ...en,
                                                      bullets: (
                                                        en.bullets || []
                                                      ).filter(
                                                        (_, bj) => bj !== bi
                                                      ),
                                                    }
                                              ),
                                            }
                                      );
                                      return { categories };
                                    })
                                  }
                                  className="rounded-md bg-rose-600 p-2 text-white"
                                  aria-label="Remove sub-bullet"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                setChecklistCategoriesEditor((p) => {
                                  const categories = (p.categories || []).map(
                                    (c, i) =>
                                      i !== ci
                                        ? c
                                        : {
                                            ...c,
                                            entries: c.entries.map((en, j) =>
                                              j !== ei
                                                ? en
                                                : {
                                                    ...en,
                                                    bullets: [
                                                      ...(en.bullets || []),
                                                      "",
                                                    ],
                                                  }
                                            ),
                                          }
                                  );
                                  return { categories };
                                })
                              }
                              className="text-xs font-medium text-accent dark:text-emerald-200"
                            >
                              + Add sub-bullet
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                              placeholder="Bold label (optional, e.g. Casual Wear:)"
                              value={ent.label || ""}
                              onChange={(e) =>
                                setChecklistCategoriesEditor((p) => {
                                  const categories = (p.categories || []).map(
                                    (c, i) =>
                                      i !== ci
                                        ? c
                                        : {
                                            ...c,
                                            entries: c.entries.map((en, j) =>
                                              j !== ei
                                                ? en
                                                : {
                                                    ...en,
                                                    label: e.target.value,
                                                  }
                                            ),
                                          }
                                  );
                                  return { categories };
                                })
                              }
                            />
                            <textarea
                              className="h-16 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                              placeholder="Detail text (or full line if label empty)"
                              value={ent.body || ""}
                              onChange={(e) =>
                                setChecklistCategoriesEditor((p) => {
                                  const categories = (p.categories || []).map(
                                    (c, i) =>
                                      i !== ci
                                        ? c
                                        : {
                                            ...c,
                                            entries: c.entries.map((en, j) =>
                                              j !== ei
                                                ? en
                                                : {
                                                    ...en,
                                                    body: e.target.value,
                                                  }
                                            ),
                                          }
                                  );
                                  return { categories };
                                })
                              }
                            />
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setChecklistCategoriesEditor((p) => {
                                const categories = (p.categories || []).map(
                                  (c, i) =>
                                    i !== ci
                                      ? c
                                      : {
                                          ...c,
                                          entries: c.entries.map((en, j) =>
                                            j !== ei
                                              ? en
                                              : en.type === "nested"
                                                ? {
                                                    type: "line",
                                                    label: en.label || "",
                                                    body: (en.bullets || []).join(
                                                      "; "
                                                    ),
                                                  }
                                                : {
                                                    type: "nested",
                                                    label: en.label || "Group:",
                                                    bullets:
                                                      en.body
                                                        ?.split("\n")
                                                        .map((s) => s.trim())
                                                        .filter(Boolean) || [
                                                        "",
                                                      ],
                                                  }
                                          ),
                                        }
                                );
                                return { categories };
                              })
                            }
                            className="text-xs text-prose-muted underline"
                          >
                            {ent.type === "nested"
                              ? "Switch to single line"
                              : "Switch to nested list"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setChecklistCategoriesEditor((p) => {
                                const categories = (p.categories || []).map(
                                  (c, i) =>
                                    i !== ci
                                      ? c
                                      : {
                                          ...c,
                                          entries: c.entries.filter(
                                            (_, j) => j !== ei
                                          ),
                                        }
                                );
                                return { categories };
                              })
                            }
                            className="text-xs text-rose-600"
                          >
                            Remove entry
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setChecklistCategoriesEditor((p) => {
                            const categories = (p.categories || []).map(
                              (c, i) =>
                                i !== ci
                                  ? c
                                  : {
                                      ...c,
                                      entries: [
                                        ...(c.entries || []),
                                        {
                                          type: "line",
                                          label: "",
                                          body: "",
                                        },
                                      ],
                                    }
                            );
                            return { categories };
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                      >
                        <Plus className="h-3.5 w-3.5" /> Line item
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setChecklistCategoriesEditor((p) => {
                            const categories = (p.categories || []).map(
                              (c, i) =>
                                i !== ci
                                  ? c
                                  : {
                                      ...c,
                                      entries: [
                                        ...(c.entries || []),
                                        {
                                          type: "nested",
                                          label: "",
                                          bullets: [""],
                                        },
                                      ],
                                    }
                            );
                            return { categories };
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                      >
                        <Plus className="h-3.5 w-3.5" /> Nested group
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setChecklistCategoriesEditor((p) => ({
                    categories: [
                      ...(p.categories || []),
                      {
                        title: "New category",
                        listType: "ordered",
                        entries: [
                          { type: "line", label: "", body: "" },
                        ],
                      },
                    ],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add category
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={saveChecklistCategoriesEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setChecklistCategoriesEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && remindersEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit reminders
            </h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Section title"
                value={remindersEditor.title}
                onChange={(e) =>
                  setRemindersEditor((p) => ({ ...p, title: e.target.value }))
                }
              />
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-prose">Reminder items</p>
                  <button
                    type="button"
                    onClick={() =>
                      setRemindersEditor((p) => ({
                        ...p,
                        items: [...(p.items || []), { label: "", body: "" }],
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs text-white dark:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
                <div className="space-y-3">
                  {(remindersEditor.items || []).map((it, ri) => (
                    <div
                      key={`rem-${ri}`}
                      className="rounded-lg border border-neutral-100 p-2 dark:border-neutral-800"
                    >
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                          placeholder="Label (e.g. Labeling:)"
                          value={it.label}
                          onChange={(e) =>
                            setRemindersEditor((p) => {
                              const items = [...(p.items || [])];
                              items[ri] = { ...items[ri], label: e.target.value };
                              return { ...p, items };
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setRemindersEditor((p) => ({
                              ...p,
                              items: (p.items || []).filter((_, i) => i !== ri),
                            }))
                          }
                          className="rounded-md bg-rose-600 p-2 text-white"
                          aria-label="Remove reminder"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        className="mt-2 h-16 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                        placeholder="Body text"
                        value={it.body}
                        onChange={(e) =>
                          setRemindersEditor((p) => {
                            const items = [...(p.items || [])];
                            items[ri] = { ...items[ri], body: e.target.value };
                            return { ...p, items };
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <ContentBlockEditor
                blockKeyPrefix="reminders-closing"
                sectionTitle="Below the reminder list"
                sectionHint="One or more paragraphs, subheadings, or bullet lists after the bullets."
                blocks={remindersEditor.closingBlocks}
                onBlocksChange={(next) =>
                  setRemindersEditor((p) => ({ ...p, closingBlocks: next }))
                }
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveRemindersEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setRemindersEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && highlightsEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit Camp Highlights
            </h3>
            <p className="mt-1 text-xs text-prose-muted">
              Stack sections in order: paragraphs, subheadings (like “Embark on…”), and
              bullet lists. Reorder with the arrows. Images stay on the page (add/change
              below the text when you close this dialog).
            </p>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Main section heading (e.g. Camp Highlights)"
                value={highlightsEditor.title}
                onChange={(e) =>
                  setHighlightsEditor((p) => ({ ...p, title: e.target.value }))
                }
              />

              <div className="space-y-4">
                {(highlightsEditor.contentBlocks || []).map((block, bi) => {
                  const blocks = highlightsEditor.contentBlocks || [];
                  const blockCount = blocks.length;
                  return (
                    <div
                      key={`hl-edit-${bi}`}
                      className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-prose-muted">
                          {block.type === "paragraph"
                            ? "Paragraph"
                            : block.type === "subheading"
                              ? "Subheading"
                              : "Bullet list"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={bi === 0}
                            onClick={() =>
                              setHighlightsEditor((p) => {
                                const next = [...(p.contentBlocks || [])];
                                if (bi <= 0) return p;
                                [next[bi - 1], next[bi]] = [next[bi], next[bi - 1]];
                                return { ...p, contentBlocks: next };
                              })
                            }
                            className="rounded-md border border-neutral-300 bg-white p-1.5 text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                            aria-label="Move block up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={bi >= blockCount - 1}
                            onClick={() =>
                              setHighlightsEditor((p) => {
                                const next = [...(p.contentBlocks || [])];
                                if (bi >= next.length - 1) return p;
                                [next[bi], next[bi + 1]] = [next[bi + 1], next[bi]];
                                return { ...p, contentBlocks: next };
                              })
                            }
                            className="rounded-md border border-neutral-300 bg-white p-1.5 text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                            aria-label="Move block down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setHighlightsEditor((p) => ({
                                ...p,
                                contentBlocks: (p.contentBlocks || []).filter(
                                  (_, i) => i !== bi
                                ),
                              }))
                            }
                            className="rounded-md bg-rose-600 p-1.5 text-white"
                            aria-label="Remove block"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {block.type === "paragraph" ? (
                        <textarea
                          className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                          placeholder="Paragraph text"
                          value={block.text || ""}
                          onChange={(e) =>
                            setHighlightsEditor((p) => {
                              const next = (p.contentBlocks || []).map((b, i) =>
                                i === bi ? { ...b, text: e.target.value } : b
                              );
                              return { ...p, contentBlocks: next };
                            })
                          }
                        />
                      ) : null}

                      {block.type === "subheading" ? (
                        <input
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                          placeholder="Subheading (displayed larger, e.g. Embark on…)"
                          value={block.text || ""}
                          onChange={(e) =>
                            setHighlightsEditor((p) => {
                              const next = (p.contentBlocks || []).map((b, i) =>
                                i === bi ? { ...b, text: e.target.value } : b
                              );
                              return { ...p, contentBlocks: next };
                            })
                          }
                        />
                      ) : null}

                      {block.type === "bullets" ? (
                        <div className="space-y-2">
                          {(block.items || []).map((line, li) => (
                            <div key={`${bi}-b-${li}`} className="flex gap-2">
                              <input
                                className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                                placeholder={`Bullet ${li + 1}`}
                                value={line}
                                onChange={(e) =>
                                  setHighlightsEditor((p) => {
                                    const next = (p.contentBlocks || []).map(
                                      (b, i) => {
                                        if (i !== bi) return b;
                                        const items = [...(b.items || [])];
                                        items[li] = e.target.value;
                                        return { ...b, items };
                                      }
                                    );
                                    return { ...p, contentBlocks: next };
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setHighlightsEditor((p) => {
                                    const next = (p.contentBlocks || []).map(
                                      (b, i) => {
                                        if (i !== bi) return b;
                                        return {
                                          ...b,
                                          items: (b.items || []).filter(
                                            (_, j) => j !== li
                                          ),
                                        };
                                      }
                                    );
                                    return { ...p, contentBlocks: next };
                                  })
                                }
                                className="rounded-md bg-rose-600 p-2 text-white"
                                aria-label="Remove bullet"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setHighlightsEditor((p) => {
                                const next = (p.contentBlocks || []).map((b, i) =>
                                  i === bi
                                    ? {
                                        ...b,
                                        items: [...(b.items || []), ""],
                                      }
                                    : b
                                );
                                return { ...p, contentBlocks: next };
                              })
                            }
                            className="text-xs font-medium text-accent dark:text-emerald-200"
                          >
                            + Add bullet
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setHighlightsEditor((p) => ({
                      ...p,
                      contentBlocks: [
                        ...(p.contentBlocks || []),
                        { type: "paragraph", text: "" },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Plus className="h-4 w-4" /> Paragraph
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setHighlightsEditor((p) => ({
                      ...p,
                      contentBlocks: [
                        ...(p.contentBlocks || []),
                        { type: "subheading", text: "" },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Plus className="h-4 w-4" /> Subheading
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setHighlightsEditor((p) => ({
                      ...p,
                      contentBlocks: [
                        ...(p.contentBlocks || []),
                        { type: "bullets", items: [""] },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Plus className="h-4 w-4" /> Bullet list
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={saveHighlightsEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setHighlightsEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && batchesEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit Camp Batches
            </h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Section heading (e.g. Camp Batches)"
                value={batchesEditor.title}
                onChange={(e) =>
                  setBatchesEditor((p) => ({ ...p, title: e.target.value }))
                }
              />

              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-prose">Batch lines</p>
                  <button
                    type="button"
                    onClick={() =>
                      setBatchesEditor((p) => ({
                        ...p,
                        items: [...(p.items || []), ""],
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs text-white dark:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" /> Add batch
                  </button>
                </div>
                <div className="space-y-2">
                  {(batchesEditor.items || []).map((line, index) => (
                    <div key={`batch-${index}`} className="flex gap-2">
                      <input
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                        placeholder={`Batch ${index + 1} (e.g. Batch 2: Jan 1–7)`}
                        value={line}
                        onChange={(e) =>
                          setBatchesEditor((p) => {
                            const next = [...(p.items || [])];
                            next[index] = e.target.value;
                            return { ...p, items: next };
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setBatchesEditor((p) => ({
                            ...p,
                            items: (p.items || []).filter((_, i) => i !== index),
                          }))
                        }
                        className="rounded-md bg-rose-600 p-2 text-white"
                        aria-label="Remove batch line"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <ContentBlockEditor
                sectionTitle="Below the batch list (left column)"
                sectionHint="Add paragraphs, subheadings, or bullet lists under the numbered batches."
                blocks={batchesEditor.leftContentBlocks}
                onBlocksChange={(next) =>
                  setBatchesEditor((p) => ({ ...p, leftContentBlocks: next }))
                }
              />
              <ContentBlockEditor
                sectionTitle="Highlighted box (right column)"
                sectionHint="Extra callouts beside the main column — same block types as the left side."
                blocks={batchesEditor.rightContentBlocks}
                onBlocksChange={(next) =>
                  setBatchesEditor((p) => ({ ...p, rightContentBlocks: next }))
                }
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveBatchesEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setBatchesEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && aboutEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit About Camp
            </h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Section heading"
                value={aboutEditor.title}
                onChange={(e) =>
                  setAboutEditor((p) => ({ ...p, title: e.target.value }))
                }
              />
              <ContentBlockEditor
                blockKeyPrefix="about-below-title"
                sectionTitle="Below the main heading"
                sectionHint="Paragraphs, subheadings, or bullet lists shown directly under the section title."
                blocks={aboutEditor.belowTitleBlocks}
                onBlocksChange={(next) =>
                  setAboutEditor((p) => ({ ...p, belowTitleBlocks: next }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Small heading"
                value={aboutEditor.adventureHeading}
                onChange={(e) =>
                  setAboutEditor((p) => ({
                    ...p,
                    adventureHeading: e.target.value,
                  }))
                }
              />
              <ContentBlockEditor
                blockKeyPrefix="about-below-adventure"
                sectionTitle="Below the small heading"
                sectionHint="More paragraphs or lists under the adventure subheading."
                blocks={aboutEditor.belowAdventureBlocks}
                onBlocksChange={(next) =>
                  setAboutEditor((p) => ({ ...p, belowAdventureBlocks: next }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Age guidelines heading"
                value={aboutEditor.ageGuidelinesTitle}
                onChange={(e) =>
                  setAboutEditor((p) => ({
                    ...p,
                    ageGuidelinesTitle: e.target.value,
                  }))
                }
              />

              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-prose">Age guideline lines</p>
                  <button
                    type="button"
                    onClick={() =>
                      setAboutEditor((p) => ({
                        ...p,
                        ageGuidelines: [...(p.ageGuidelines || []), ""],
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs text-white dark:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" /> Add Line
                  </button>
                </div>

                <div className="space-y-2">
                  {(aboutEditor.ageGuidelines || []).map((line, index) => (
                    <div key={`guideline-${index}`} className="flex gap-2">
                      <input
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                        placeholder={`Guideline ${index + 1}`}
                        value={line}
                        onChange={(e) =>
                          setAboutEditor((p) => {
                            const next = [...(p.ageGuidelines || [])];
                            next[index] = e.target.value;
                            return { ...p, ageGuidelines: next };
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAboutEditor((p) => ({
                            ...p,
                            ageGuidelines: (p.ageGuidelines || []).filter(
                              (_, i) => i !== index
                            ),
                          }))
                        }
                        className="rounded-md bg-rose-600 p-2 text-white"
                        aria-label="Delete guideline line"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <ContentBlockEditor
                blockKeyPrefix="about-below-guidelines"
                sectionTitle="Below age guideline lines"
                sectionHint="Optional extra copy after the bullet list (paragraphs, subheadings, or bullets)."
                blocks={aboutEditor.belowGuidelinesBlocks}
                onBlocksChange={(next) =>
                  setAboutEditor((p) => ({ ...p, belowGuidelinesBlocks: next }))
                }
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveAboutEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setAboutEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {galleryEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {galleryEditor.isNew ? "Add" : "Edit"} Gallery
            </h3>
            <div className="mt-4 space-y-3">
              {galleryEditor.isNew ? (
                <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                  Select Winter Camp
                  <select
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                    value={galleryEditor.registrationCampId}
                    onChange={(e) => {
                      const selectedCampId = e.target.value;
                      const selectedCamp = registrationCamps.find(
                        (camp) => camp.id === selectedCampId
                      );
                      setGalleryEditor((p) => ({
                        ...p,
                        registrationCampId: selectedCampId,
                        registrationCampYear: selectedCamp?.year || "",
                        id: selectedCampId
                          ? `winter-gallery-${selectedCampId}`
                          : p.id,
                        title: selectedCamp?.title || p.title,
                        description: selectedCamp?.subtitle || p.description,
                      }));
                    }}
                  >
                    <option value="">Choose winter camp</option>
                    {registrationCamps.map((camp) => {
                      const alreadyUsed = usedRegistrationCampIds.has(camp.id);
                      return (
                        <option
                          key={camp.id}
                          value={camp.id}
                          disabled={alreadyUsed}
                        >
                          {camp.title} {camp.year ? `(${camp.year})` : ""}{" "}
                          {alreadyUsed ? " - already added" : ""}
                        </option>
                      );
                    })}
                  </select>
                </label>
              ) : null}
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                Title
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  value={galleryEditor.title}
                  onChange={(e) =>
                    setGalleryEditor((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                Description
                <textarea
                  className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  value={galleryEditor.description}
                  onChange={(e) =>
                    setGalleryEditor((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                Detailed Intro
                <textarea
                  className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  value={galleryEditor.longDescription}
                  onChange={(e) =>
                    setGalleryEditor((p) => ({
                      ...p,
                      longDescription: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                Content Points (one per line)
                <textarea
                  className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  value={galleryEditor.contentBlocksText}
                  onChange={(e) =>
                    setGalleryEditor((p) => ({
                      ...p,
                      contentBlocksText: e.target.value,
                    }))
                  }
                />
              </label>
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Gallery Images
                </p>
                <ImageUploader
                  folder="winter-camp"
                  buttonText="Add Images"
                  multiple
                  onUploaded={(asset) =>
                    setGalleryEditor((p) => ({
                      ...p,
                      images: [...(p.images || []), asset.url],
                    }))
                  }
                />
                {(galleryEditor.images || []).length ? (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {galleryEditor.images.map((img, i) => (
                      <div key={`${img}-${i}`} className="relative shrink-0">
                        <img
                          src={img}
                          alt="Gallery preview"
                          className="h-20 w-36 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryEditor((p) => ({
                              ...p,
                              images: p.images.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="absolute right-1 top-1 rounded bg-black/60 px-1 text-xs text-white"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveGalleryEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setGalleryEditor(null)}
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
