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
import { Link, useLocation } from "react-router-dom";
import { adminRequest } from "../admin/api";
import ImageUploader from "../components/admin/ImageUploader";
import ContentBlockEditor from "../components/camp/ContentBlockEditor";
import Container from "../components/Container";
import PageFade from "../components/PageFade";
import useLiveContent from "../hooks/useLiveContent";
import { renderContentBlocks, resolveContentBlocks, sanitizeContentBlocks } from "../utils/campContentBlocks";

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

const defaultAboutCamp = {
  title: "Summer Camp",
  adventureHeading: "Embark on an Unforgettable Summer Family Adventure!",
  ageGuidelinesTitle: "Age Guidelines:",
  ageGuidelines: [
    "5-8 years: Parent/guardian required",
    "9-15 years: Independent participation allowed",
  ],
  belowTitleBlocks: [
    {
      type: "paragraph",
      text:
        "The summer camp serves as an introduction to our full-time residential Gurukulam, launching in June 2025. It offers homeschooling families a unique opportunity to experience a comprehensive learning environment, where diverse educational opportunities are seamlessly integrated within a single campus.",
    },
  ],
  belowAdventureBlocks: [
    {
      type: "paragraph",
      text:
        "Experience an enriching weekly residential family summer camp tailored for children aged 7 to 15 and parents. We recommend 2 weeks to get better experience.",
    },
  ],
  belowGuidelinesBlocks: [],
  images: [],
};

const defaultBatchesCamp = {
  title: "Weekly Camp Batches",
  items: [
    "Batch 1: April 19th - April 25th",
    "Batch 2: April 26th - May 2nd",
    "Batch 3: May 3rd - May 9th",
    "Batch 4: May 10th - May 16th",
    "Batch 5: May 17th - May 23rd",
    "Batch 6: May 24th - May 31st",
    "NRI Batch 1: June 14th - June 20th",
    "NRI Batch 2: June 21st - June 27th",
    "NRI Batch 3: June 28th - July 4th",
    "NRI Batch 4: July 5th - July 11th",
    "NRI Batch 5: July 12th - July 18th",
    "NRI Batch 6: July 19th - July 25th",
    "NRI Batch 7: July 26th - August 1st",
    "NRI Batch 8: August 2nd - August 8th",
    "NRI Batch 9: August 9th - August 15th",
  ],
  leftContentBlocks: [
    { type: "paragraph", text: "You can choose multiple weeks if you would like to stay longer." },
  ],
  rightContentBlocks: [
    {
      type: "paragraph",
      text:
        "Set amidst the vast 70-acre Forest Ridge campus in Hyderabad, this immersive program combines traditional learning with modern activities, promoting personal development, creativity, and unforgettable experiences.",
    },
  ],
};

const defaultHighlightsCamp = {
  title: "Camp Highlights",
  contentBlocks: [
    {
      type: "paragraph",
      text:
        "The summer camp serves as an introduction to our full-time residential Gurukulam, launching in June 2026. It offers homeschooling families a unique opportunity to experience a comprehensive learning environment, where diverse educational opportunities are seamlessly integrated within a single campus.",
    },
    { type: "subheading", text: "Embark on an Unforgettable Summer Family Adventure!" },
    {
      type: "paragraph",
      text:
        "Experience an enriching 14-day residential family summer camp tailored for children aged 7 to 15 and parents.",
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

const defaultChecklistCamp = {
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
          body: "Four sets of athletic apparel suitable for physical activities.",
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
          body: "Two sets of swim dresses, swim short for boys and full swimsuit for girls.",
        },
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
        { type: "line", label: "Laundry Bag:", body: "For storing used garments." },
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
        { type: "line", label: "", body: "Daypack: A small backpack suitable for excursions." },
        {
          type: "line",
          label: "",
          body:
            "Bed pack: Two bed sheets, thick blanket (as it may get cold in the night) and two pillow covers.",
        },
        { type: "line", label: "", body: "Yoga mat" },
        { type: "line", label: "", body: "Raincoat / Umbrella" },
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
          bullets: ["Insulated flask: For hot beverages.", "Water bottle: Durable and refillable."],
        },
        { type: "line", label: "", body: "Locks: Number lock small size - 1." },
      ],
    },
  ],
  reminders: {
    title: "Important Reminders",
    items: [
      {
        label: "Labeling:",
        body:
          "Clearly mark all personal items with a permanent marker using your child's unique admission number to prevent mix-ups.",
      },
      {
        label: "Inventory List:",
        body: "Provide a detailed checklist of all belongings accompanying your child to the camp.",
      },
    ],
    closingBlocks: [
      {
        type: "paragraph",
        text:
          "By ensuring your child is equipped with these essentials, they will be well-prepared to fully engage in all the enriching activities the summer camp offers.",
      },
    ],
  },
};

const fallbackLegacyContent = {
  title: "Summer Camp",
  subtitle: "Outdoor learning, skills, and community during the summer season.",
  intro:
    "Our summer camp blends traditional Bharatiya values with hands-on activities, nature, and creative expression.",
  infoCards: [
    { title: "Camp Duration", body: "Weekly batches with optional residential stay." },
    { title: "Age Group", body: "Designed for children between 5 and 15 years." },
    { title: "Core Focus", body: "Discipline, fitness, culture, storytelling, and practical learning." },
  ],
  previousGalleries: [],
};

function normalizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.type === "nested" || Array.isArray(raw.bullets)) {
    return {
      type: "nested",
      label: typeof raw.label === "string" ? raw.label : "",
      bullets: Array.isArray(raw.bullets)
        ? raw.bullets.map((b) => (typeof b === "string" ? b.trim() : String(b).trim())).filter(Boolean)
        : [],
    };
  }
  return {
    type: "line",
    label: typeof raw.label === "string" ? raw.label : "",
    body: typeof raw.body === "string" ? raw.body : "",
  };
}

function normalizeCategory(raw) {
  if (!raw || typeof raw !== "object") return null;
  const entries = Array.isArray(raw.entries) ? raw.entries.map(normalizeEntry).filter(Boolean) : [];
  return {
    title: typeof raw.title === "string" ? raw.title : "",
    listType: raw.listType === "unordered" ? "unordered" : "ordered",
    entries,
  };
}

function sanitizeCategories(categories) {
  return (categories || [])
    .map(normalizeCategory)
    .filter((c) => c && c.title.trim() && c.entries.length > 0);
}

export default function SummerCamp() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin/summer-camp";
  const registrationPath = isAdmin
    ? "/admin/register/summer-camp"
    : "/register/summer-camp";
  const schedulePath = isAdmin
    ? "/admin/summer-camp/schedule"
    : "/summer-camp/schedule";
  const [activeTab, setActiveTab] = useState("about");
  const [activeChecklistTab, setActiveChecklistTab] = useState("checklist");
  const cms = useLiveContent("summer-camp", {
    aboutCamp: defaultAboutCamp,
    batchesCamp: defaultBatchesCamp,
    highlightsCamp: defaultHighlightsCamp,
    checklistCamp: defaultChecklistCamp,
  });
  const registrationCms = useLiveContent("summer-camp-registration", { registrationCamps: [] });
  const registrationCamps = Array.isArray(registrationCms?.registrationCamps)
    ? registrationCms.registrationCamps
    : [];
  const [draft, setDraft] = useState(cms);
  const [aboutEditor, setAboutEditor] = useState(null);
  const [batchesEditor, setBatchesEditor] = useState(null);
  const [highlightsEditor, setHighlightsEditor] = useState(null);
  const [checklistEditor, setChecklistEditor] = useState(null);
  const [remindersEditor, setRemindersEditor] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [textEditor, setTextEditor] = useState(null);
  const [infoEditor, setInfoEditor] = useState(null);
  const [galleryEditor, setGalleryEditor] = useState(null);

  useEffect(() => setDraft(cms), [cms]);

  const saveContent = async (next) => {
    await adminRequest("/api/admin/content/summer-camp", {
      method: "PUT",
      body: JSON.stringify({ content: next }),
    });
  };

  const display = isAdmin ? draft : cms;
  const usedRegistrationCampIds = useMemo(
    () =>
      new Set(
        (draft.previousGalleries || [])
          .map((gallery) => gallery.registrationCampId)
          .filter(Boolean)
      ),
    [draft.previousGalleries]
  );
  const legacyPage = {
    ...fallbackLegacyContent,
    ...(display || {}),
    infoCards: Array.isArray(display?.infoCards) ? display.infoCards : fallbackLegacyContent.infoCards,
    previousGalleries: Array.isArray(display?.previousGalleries)
      ? display.previousGalleries
      : fallbackLegacyContent.previousGalleries,
  };
  const aboutCamp = {
    ...defaultAboutCamp,
    ...(display.aboutCamp || {}),
    ageGuidelines: Array.isArray(display.aboutCamp?.ageGuidelines)
      ? display.aboutCamp.ageGuidelines
      : defaultAboutCamp.ageGuidelines,
    belowTitleBlocks: resolveContentBlocks(display.aboutCamp, "belowTitleBlocks", defaultAboutCamp.belowTitleBlocks, "intro"),
    belowAdventureBlocks: resolveContentBlocks(display.aboutCamp, "belowAdventureBlocks", defaultAboutCamp.belowAdventureBlocks, "adventureText"),
    belowGuidelinesBlocks: resolveContentBlocks(display.aboutCamp, "belowGuidelinesBlocks", defaultAboutCamp.belowGuidelinesBlocks),
    images: [],
  };

  const batchesCamp = {
    ...defaultBatchesCamp,
    ...(display.batchesCamp || {}),
    items: Array.isArray(display.batchesCamp?.items) ? display.batchesCamp.items : defaultBatchesCamp.items,
    leftContentBlocks: resolveContentBlocks(display.batchesCamp, "leftContentBlocks", defaultBatchesCamp.leftContentBlocks, "description"),
    rightContentBlocks: resolveContentBlocks(display.batchesCamp, "rightContentBlocks", defaultBatchesCamp.rightContentBlocks, "note"),
  };

  const highlightsCamp = {
    ...defaultHighlightsCamp,
    ...(display.highlightsCamp || {}),
    contentBlocks: resolveContentBlocks(display.highlightsCamp, "contentBlocks", defaultHighlightsCamp.contentBlocks),
    images: [],
  };

  const checklistCamp = {
    ...defaultChecklistCamp,
    ...(display.checklistCamp || {}),
    checklistCategories: (() => {
      const cats = Array.isArray(display.checklistCamp?.checklistCategories)
        ? display.checklistCamp.checklistCategories.map(normalizeCategory).filter(Boolean)
        : [];
      return cats.length > 0 ? cats : defaultChecklistCamp.checklistCategories;
    })(),
    reminders: {
      ...defaultChecklistCamp.reminders,
      ...(display.checklistCamp?.reminders || {}),
      items: Array.isArray(display.checklistCamp?.reminders?.items)
        ? display.checklistCamp.reminders.items.map((it) => ({ label: it.label || "", body: it.body || "" }))
        : defaultChecklistCamp.reminders.items,
      closingBlocks: resolveContentBlocks(display.checklistCamp?.reminders, "closingBlocks", defaultChecklistCamp.reminders.closingBlocks, "closing"),
    },
  };

  const saveAndClose = async (next, closer) => {
    setDraft(next);
    await saveContent(next);
    closer();
  };

  const saveWithStatus = async (next = draft) => {
    try {
      await saveContent(next);
      setStatus({ type: "success", message: "Summer Camp content updated." });
      return true;
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Save failed." });
      return false;
    }
  };

  const openTextEditor = (key, label) =>
    setTextEditor({ key, label, value: key === "title" ? legacyPage.title : legacyPage[key] || "" });

  const saveTextEditor = async () => {
    if (!textEditor) return;
    const next = { ...draft, [textEditor.key]: textEditor.value };
    setDraft(next);
    const ok = await saveWithStatus(next);
    if (ok) setTextEditor(null);
  };

  const openInfoEditor = (index) => {
    const item = legacyPage.infoCards?.[index];
    setInfoEditor({
      index,
      isNew: !item,
      title: item?.title || "",
      body: item?.body || "",
    });
  };

  const saveInfoEditor = async () => {
    if (!infoEditor) return;
    if (!String(infoEditor.title || "").trim() || !String(infoEditor.body || "").trim()) {
      setStatus({ type: "error", message: "Info title and description are required." });
      return;
    }
    const cards = [...(legacyPage.infoCards || [])];
    const item = { title: infoEditor.title.trim(), body: infoEditor.body.trim() };
    if (infoEditor.isNew) cards.unshift(item);
    else cards[infoEditor.index] = item;
    const next = { ...draft, infoCards: cards };
    setDraft(next);
    const ok = await saveWithStatus(next);
    if (ok) setInfoEditor(null);
  };

  const deleteInfo = async (index) => {
    const next = { ...draft, infoCards: (legacyPage.infoCards || []).filter((_, i) => i !== index) };
    setDraft(next);
    await saveWithStatus(next);
  };

  const openGalleryEditor = (index) => {
    const item = legacyPage.previousGalleries?.[index];
    setGalleryEditor({
      index,
      isNew: !item,
      id: item?.id || `gallery-${Date.now()}`,
      registrationCampId: item?.registrationCampId || "",
      registrationCampYear:
        item?.registrationCampYear ||
        registrationCamps.find((camp) => camp.id === item?.registrationCampId)?.year ||
        "",
      title: item?.title || "",
      description: item?.description || "",
      longDescription: item?.longDescription || "",
      contentBlocksText: Array.isArray(item?.contentBlocks) ? item.contentBlocks.join("\n") : "",
      images: Array.isArray(item?.images) ? item.images : [],
    });
  };

  const saveGalleryEditor = async () => {
    if (!galleryEditor) return;
    if (galleryEditor.isNew && !galleryEditor.registrationCampId) {
      setStatus({ type: "error", message: "Please select a summer camp." });
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
        registrationCamps.find((camp) => camp.id === galleryEditor.registrationCampId)?.year ||
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
    const ok = await saveWithStatus(next);
    if (ok) setGalleryEditor(null);
  };

  const deleteGallery = async (index) => {
    const next = {
      ...draft,
      previousGalleries: (legacyPage.previousGalleries || []).filter((_, i) => i !== index),
    };
    setDraft(next);
    await saveWithStatus(next);
  };

  const content = useMemo(() => {
    const renderChecklistEntry = (entry, key) => {
      if (entry.type === "nested") {
        return (
          <li key={key} className="text-prose-muted">
            <span className="font-medium text-prose">{entry.label}</span>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-prose-muted">
              {(entry.bullets || []).map((b, i) => <li key={`${key}-${i}`}>{b}</li>)}
            </ul>
          </li>
        );
      }
      return (
        <li key={key} className="text-prose-muted">
          {entry.label ? <><span className="font-medium text-prose">{entry.label}</span> {entry.body}</> : entry.body}
        </li>
      );
    };

    if (activeTab === "batches") {
      return (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-2xl font-semibold text-prose">{batchesCamp.title}</h3>
              {isAdmin ? <button type="button" onClick={() => setBatchesEditor({
                title: batchesCamp.title || "",
                items: [...(batchesCamp.items || [])],
                leftContentBlocks: JSON.parse(JSON.stringify(batchesCamp.leftContentBlocks || [])),
                rightContentBlocks: JSON.parse(JSON.stringify(batchesCamp.rightContentBlocks || [])),
              })} className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"><Pencil className="h-4 w-4" /></button> : null}
            </div>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-prose-muted">
              {(batchesCamp.items || []).map((item, i) => <li key={`b-${i}`}>{item}</li>)}
            </ol>
            {renderContentBlocks(batchesCamp.leftContentBlocks, "batch-left", "mt-6")}
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-primary/50 p-6 dark:border-neutral-700 dark:bg-neutral-800/80">
            {renderContentBlocks(batchesCamp.rightContentBlocks, "batch-right", "")}
          </div>
        </div>
      );
    }

    if (activeTab === "highlights") {
      return (
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-2xl font-semibold text-prose">{highlightsCamp.title}</h3>
            {isAdmin ? <button type="button" onClick={() => setHighlightsEditor({
              title: highlightsCamp.title || "",
              contentBlocks: JSON.parse(JSON.stringify(highlightsCamp.contentBlocks || [])),
            })} className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"><Pencil className="h-4 w-4" /></button> : null}
          </div>
          {renderContentBlocks(highlightsCamp.contentBlocks, "highlights", "mt-4")}
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
                <button key={item.id} type="button" onClick={() => setActiveChecklistTab(item.id)} className={`px-4 py-3 text-sm font-medium transition sm:text-base ${isActive ? "bg-primary/70 text-prose dark:bg-emerald-950/50 dark:text-emerald-100" : "bg-white text-prose-muted hover:bg-primary/40 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}>
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="border-x border-b border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900 sm:p-8">
            {activeChecklistTab === "checklist" ? (
              <div className="space-y-7">
                <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-700">
                  <p className="text-sm font-medium text-prose-muted">Packing checklist by category</p>
                  {isAdmin ? <button type="button" onClick={() => setChecklistEditor({ categories: JSON.parse(JSON.stringify(checklistCamp.checklistCategories || [])) })} className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"><Pencil className="h-4 w-4" /></button> : null}
                </div>
                {(checklistCamp.checklistCategories || []).map((cat, ci) => {
                  const ListTag = cat.listType === "unordered" ? "ul" : "ol";
                  const listClass = cat.listType === "unordered" ? "mt-3 list-disc space-y-2 pl-6 text-prose-muted" : "mt-3 list-decimal space-y-2 pl-6 text-prose-muted";
                  return (
                    <div key={`cat-${ci}`}>
                      <h4 className="text-xl font-semibold text-prose">{cat.title}</h4>
                      <ListTag className={listClass}>{(cat.entries || []).map((entry, ei) => renderChecklistEntry(entry, `${ci}-${ei}`))}</ListTag>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-700">
                  <h4 className="text-xl font-semibold text-prose">{reminders.title || "Reminders"}</h4>
                  {isAdmin ? <button type="button" onClick={() => setRemindersEditor({
                    title: reminders.title || "",
                    items: JSON.parse(JSON.stringify(reminders.items || [])),
                    closingBlocks: JSON.parse(JSON.stringify(reminders.closingBlocks || [])),
                  })} className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"><Pencil className="h-4 w-4" /></button> : null}
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-prose-muted">
                  {(reminders.items || []).map((it, i) => (
                    <li key={`r-${i}`}>{it.label ? <><span className="font-medium text-prose">{it.label}</span> {it.body}</> : it.body}</li>
                  ))}
                </ul>
                {renderContentBlocks(reminders.closingBlocks, "reminders", "mt-5")}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-semibold text-prose">{aboutCamp.title}</h3>
          {isAdmin ? <button type="button" onClick={() => setAboutEditor({
            title: aboutCamp.title || "",
            adventureHeading: aboutCamp.adventureHeading || "",
            ageGuidelinesTitle: aboutCamp.ageGuidelinesTitle || "",
            ageGuidelines: [...(aboutCamp.ageGuidelines || [])],
            belowTitleBlocks: JSON.parse(JSON.stringify(aboutCamp.belowTitleBlocks || [])),
            belowAdventureBlocks: JSON.parse(JSON.stringify(aboutCamp.belowAdventureBlocks || [])),
            belowGuidelinesBlocks: JSON.parse(JSON.stringify(aboutCamp.belowGuidelinesBlocks || [])),
          })} className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"><Pencil className="h-4 w-4" /></button> : null}
        </div>
        {renderContentBlocks(aboutCamp.belowTitleBlocks, "about-title", "mt-4")}
        <p className="mt-6 text-lg font-semibold text-prose">{aboutCamp.adventureHeading}</p>
        {renderContentBlocks(aboutCamp.belowAdventureBlocks, "about-adv", "mt-2")}
        <ul className="mt-5 list-disc space-y-2 pl-6 text-prose-muted">
          <li><span className="font-medium text-prose">{aboutCamp.ageGuidelinesTitle}</span></li>
          {(aboutCamp.ageGuidelines || []).map((line, i) => <li key={`age-${i}`}>{line}</li>)}
        </ul>
        {renderContentBlocks(aboutCamp.belowGuidelinesBlocks, "about-guides", "mt-5")}
      </div>
    );
  }, [activeChecklistTab, activeTab, aboutCamp, batchesCamp, checklistCamp, highlightsCamp, isAdmin]);

  return (
    <PageFade>
      <section className="border-b border-neutral-200 bg-secondary/35 py-10 dark:border-neutral-700 dark:bg-neutral-950/70 md:py-14">
        <Container>
          <h1 className="heading-page">Summer Camp Details</h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={registrationPath} className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light dark:bg-emerald-700 dark:hover:bg-emerald-600">Registration</Link>
            <Link to={schedulePath} className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-prose transition hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800">Camp Schedule</Link>
          </div>
        </Container>
      </section>

      <Container className="py-8 md:py-12">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`border-b border-r border-neutral-200 px-4 py-3 text-sm font-medium transition last:border-r-0 md:text-base dark:border-neutral-700 ${isActive ? "bg-primary/70 text-prose dark:bg-emerald-950/50 dark:text-emerald-100" : "bg-white text-prose-muted hover:bg-primary/40 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}>
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="bg-neutral-50 p-5 sm:p-8 dark:bg-neutral-950/70">{content}</div>
        </div>

        <section className="mt-10">
          {/* <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="heading-section">{legacyPage.title}</h2>
              <p className="mt-2 max-w-3xl text-prose">{legacyPage.subtitle}</p>
            </div>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => openTextEditor("title", "Page Title")}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-3 py-1.5 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
            ) : null}
          </div>
          {isAdmin ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => openTextEditor("subtitle", "Subtitle")}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs text-accent dark:bg-neutral-800 dark:text-emerald-200"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Subtitle
              </button>
            </div>
          ) : null} */}

          {/* <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold text-prose">About The Camp</h3>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => openTextEditor("intro", "Intro")}
                  className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs text-accent dark:bg-neutral-800 dark:text-emerald-200"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              ) : null}
            </div>
            <p className="mt-3 text-prose">{legacyPage.intro}</p>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-prose">Camp Info</h3>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => openInfoEditor()}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" /> Add Info
                </button>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {(legacyPage.infoCards || []).map((item, index) => (
                <article
                  key={`${item.title}-${index}`}
                  className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-accent dark:text-emerald-200">{item.title}</h4>
                    {isAdmin ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openInfoEditor(index)}
                          className="rounded-md bg-neutral-100 p-1.5 text-accent dark:bg-neutral-800 dark:text-emerald-200"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteInfo(index)}
                          className="rounded-md bg-rose-100 p-1.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-2 text-prose">{item.body}</p>
                </article>
              ))}
            </div>
          </div> */}

          <div className="mt-10">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-prose">Previous Summer Camp Galleries</h3>
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
                    Photo collections from previous summer camps appear in this section.
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
                    ? `/admin/summer-camp/${gallery.id}`
                    : `/summer-camp/${gallery.id}`;
                  const cover = gallery.images?.[0] || "";
                  const stack = (gallery.images || []).slice(1, 3);
                  return (
                    <article
                      key={gallery.id || index}
                      className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link to={detailPath} className="min-w-0 flex-1">
                          <h4 className="font-semibold text-accent dark:text-emerald-200">{gallery.title}</h4>
                          <p className="mt-1 text-xs text-prose-muted">
                            Summer:{" "}
                            {gallery.registrationCampYear ||
                              registrationCamps.find((camp) => camp.id === gallery.registrationCampId)?.year ||
                              "-"}
                          </p>
                          <p className="mt-1 text-sm text-prose-muted">{gallery.description}</p>
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
                              style={{ top: 8 + (i + 1) * 6, left: 8 + (i + 1) * 6, zIndex: 10 + i }}
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

      {textEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit {textEditor.label}
            </h3>
            <label className="mt-4 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {textEditor.label}
            </label>
            <textarea
              className="mt-2 h-28 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
              value={textEditor.value}
              onChange={(e) => setTextEditor((p) => ({ ...p, value: e.target.value }))}
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveTextEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setTextEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {infoEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {infoEditor.isNew ? "Add" : "Edit"} Info Card
            </h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                Title
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={infoEditor.title}
                  onChange={(e) => setInfoEditor((p) => ({ ...p, title: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Description
                <textarea
                  className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={infoEditor.body}
                  onChange={(e) => setInfoEditor((p) => ({ ...p, body: e.target.value }))}
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveInfoEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setInfoEditor(null)}
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
                <label className="block text-sm">
                  Select Summer Camp
                  <select
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                    value={galleryEditor.registrationCampId}
                    onChange={(e) => {
                      const selectedCampId = e.target.value;
                      const selectedCamp = registrationCamps.find((camp) => camp.id === selectedCampId);
                      setGalleryEditor((p) => ({
                        ...p,
                        registrationCampId: selectedCampId,
                        registrationCampYear: selectedCamp?.year || "",
                        id: selectedCampId ? `gallery-${selectedCampId}` : p.id,
                        title: selectedCamp?.title || p.title,
                        description: selectedCamp?.subtitle || p.description,
                      }));
                    }}
                  >
                    <option value="">Choose summer camp</option>
                    {registrationCamps.map((camp) => {
                      const alreadyUsed = usedRegistrationCampIds.has(camp.id);
                      return (
                        <option key={camp.id} value={camp.id} disabled={alreadyUsed}>
                          {camp.title} {camp.year ? `(${camp.year})` : ""}{alreadyUsed ? " - already added" : ""}
                        </option>
                      );
                    })}
                  </select>
                </label>
              ) : null}
              <label className="block text-sm">
                Title
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={galleryEditor.title}
                  onChange={(e) => setGalleryEditor((p) => ({ ...p, title: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Description
                <textarea
                  className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={galleryEditor.description}
                  onChange={(e) => setGalleryEditor((p) => ({ ...p, description: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Detailed Intro
                <textarea
                  className="mt-1 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={galleryEditor.longDescription}
                  onChange={(e) => setGalleryEditor((p) => ({ ...p, longDescription: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Content Points (one per line)
                <textarea
                  className="mt-1 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                  value={galleryEditor.contentBlocksText}
                  onChange={(e) => setGalleryEditor((p) => ({ ...p, contentBlocksText: e.target.value }))}
                />
              </label>
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">Gallery Images</p>
                <ImageUploader
                  folder="summer-camp"
                  buttonText="Add Images"
                  multiple
                  onUploaded={(asset) =>
                    setGalleryEditor((p) => ({ ...p, images: [...(p.images || []), asset.url] }))
                  }
                />
                {(galleryEditor.images || []).length ? (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {galleryEditor.images.map((img, i) => (
                      <div key={`${img}-${i}`} className="relative shrink-0">
                        <img src={img} alt="Gallery preview" className="h-20 w-36 rounded-lg object-cover" />
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

      {isAdmin && aboutEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">Edit About Camp</h3>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={aboutEditor.title} onChange={(e) => setAboutEditor((p) => ({ ...p, title: e.target.value }))} />
              <ContentBlockEditor keyPrefix="about-b1" title="Below main heading" hint="Add paragraphs, subheadings, or bullet lists." blocks={aboutEditor.belowTitleBlocks} onChange={(next) => setAboutEditor((p) => ({ ...p, belowTitleBlocks: next }))} />
              <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={aboutEditor.adventureHeading} onChange={(e) => setAboutEditor((p) => ({ ...p, adventureHeading: e.target.value }))} />
              <ContentBlockEditor keyPrefix="about-b2" title="Below adventure heading" blocks={aboutEditor.belowAdventureBlocks} onChange={(next) => setAboutEditor((p) => ({ ...p, belowAdventureBlocks: next }))} />
              <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={aboutEditor.ageGuidelinesTitle} onChange={(e) => setAboutEditor((p) => ({ ...p, ageGuidelinesTitle: e.target.value }))} />
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-prose">Age guideline lines</p>
                  <button type="button" onClick={() => setAboutEditor((p) => ({ ...p, ageGuidelines: [...(p.ageGuidelines || []), ""] }))} className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs text-white dark:bg-emerald-700"><Plus className="h-4 w-4" /> Add Line</button>
                </div>
                <div className="space-y-2">
                  {(aboutEditor.ageGuidelines || []).map((line, i) => (
                    <div key={`agl-${i}`} className="flex gap-2">
                      <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={line} onChange={(e) => setAboutEditor((p) => {
                        const next = [...(p.ageGuidelines || [])];
                        next[i] = e.target.value;
                        return { ...p, ageGuidelines: next };
                      })} />
                      <button type="button" className="rounded-md bg-rose-600 p-2 text-white" onClick={() => setAboutEditor((p) => ({ ...p, ageGuidelines: (p.ageGuidelines || []).filter((_, idx) => idx !== i) }))}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <ContentBlockEditor keyPrefix="about-b3" title="Below age guidelines" blocks={aboutEditor.belowGuidelinesBlocks} onChange={(next) => setAboutEditor((p) => ({ ...p, belowGuidelinesBlocks: next }))} />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700" onClick={async () => {
                let a = sanitizeContentBlocks(aboutEditor.belowTitleBlocks || []);
                let b = sanitizeContentBlocks(aboutEditor.belowAdventureBlocks || []);
                const c = sanitizeContentBlocks(aboutEditor.belowGuidelinesBlocks || []);
                if (a.length === 0) a = defaultAboutCamp.belowTitleBlocks;
                if (b.length === 0) b = defaultAboutCamp.belowAdventureBlocks;
                const next = {
                  ...draft,
                  aboutCamp: {
                    ...aboutCamp,
                    title: aboutEditor.title,
                    adventureHeading: aboutEditor.adventureHeading,
                    ageGuidelinesTitle: aboutEditor.ageGuidelinesTitle,
                    ageGuidelines: (aboutEditor.ageGuidelines || []).map((x) => x.trim()).filter(Boolean),
                    belowTitleBlocks: a,
                    belowAdventureBlocks: b,
                    belowGuidelinesBlocks: c,
                    images: [],
                  },
                };
                await saveAndClose(next, () => setAboutEditor(null));
              }}><Save className="h-4 w-4" /> Save</button>
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100" onClick={() => setAboutEditor(null)}><X className="h-4 w-4" /> Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && batchesEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">Edit Camp Batches</h3>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={batchesEditor.title} onChange={(e) => setBatchesEditor((p) => ({ ...p, title: e.target.value }))} />
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-prose">Batch lines</p>
                  <button type="button" onClick={() => setBatchesEditor((p) => ({ ...p, items: [...(p.items || []), ""] }))} className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs text-white dark:bg-emerald-700"><Plus className="h-4 w-4" /> Add batch</button>
                </div>
                <div className="space-y-2">
                  {(batchesEditor.items || []).map((line, i) => (
                    <div key={`bat-${i}`} className="flex gap-2">
                      <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={line} onChange={(e) => setBatchesEditor((p) => {
                        const next = [...(p.items || [])];
                        next[i] = e.target.value;
                        return { ...p, items: next };
                      })} />
                      <button type="button" className="rounded-md bg-rose-600 p-2 text-white" onClick={() => setBatchesEditor((p) => ({ ...p, items: (p.items || []).filter((_, idx) => idx !== i) }))}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <ContentBlockEditor keyPrefix="bat-l" title="Below batch list (left)" blocks={batchesEditor.leftContentBlocks} onChange={(next) => setBatchesEditor((p) => ({ ...p, leftContentBlocks: next }))} />
              <ContentBlockEditor keyPrefix="bat-r" title="Right highlighted box" blocks={batchesEditor.rightContentBlocks} onChange={(next) => setBatchesEditor((p) => ({ ...p, rightContentBlocks: next }))} />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700" onClick={async () => {
                let left = sanitizeContentBlocks(batchesEditor.leftContentBlocks || []);
                let right = sanitizeContentBlocks(batchesEditor.rightContentBlocks || []);
                if (left.length === 0) left = defaultBatchesCamp.leftContentBlocks;
                if (right.length === 0) right = defaultBatchesCamp.rightContentBlocks;
                const next = {
                  ...draft,
                  batchesCamp: {
                    ...batchesCamp,
                    title: batchesEditor.title,
                    items: (batchesEditor.items || []).map((x) => x.trim()).filter(Boolean),
                    leftContentBlocks: left,
                    rightContentBlocks: right,
                  },
                };
                await saveAndClose(next, () => setBatchesEditor(null));
              }}><Save className="h-4 w-4" /> Save</button>
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100" onClick={() => setBatchesEditor(null)}><X className="h-4 w-4" /> Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && highlightsEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">Edit Camp Highlights</h3>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={highlightsEditor.title} onChange={(e) => setHighlightsEditor((p) => ({ ...p, title: e.target.value }))} />
              <ContentBlockEditor keyPrefix="hl" title="Highlights blocks" blocks={highlightsEditor.contentBlocks} onChange={(next) => setHighlightsEditor((p) => ({ ...p, contentBlocks: next }))} />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700" onClick={async () => {
                let blocks = sanitizeContentBlocks(highlightsEditor.contentBlocks || []);
                if (blocks.length === 0) blocks = defaultHighlightsCamp.contentBlocks;
                const next = {
                  ...draft,
                  highlightsCamp: {
                    ...highlightsCamp,
                    title: highlightsEditor.title,
                    contentBlocks: blocks,
                    images: [],
                  },
                };
                await saveAndClose(next, () => setHighlightsEditor(null));
              }}><Save className="h-4 w-4" /> Save</button>
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100" onClick={() => setHighlightsEditor(null)}><X className="h-4 w-4" /> Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && checklistEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">Edit Checklist Categories</h3>
            <div className="mt-4 space-y-4">
              {(checklistEditor.categories || []).map((cat, ci) => (
                <div key={`c-${ci}`} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <input className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={cat.title} onChange={(e) => setChecklistEditor((p) => {
                      const categories = [...(p.categories || [])];
                      categories[ci] = { ...categories[ci], title: e.target.value };
                      return { ...p, categories };
                    })} />
                    <select className="rounded-lg border border-neutral-300 px-2 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={cat.listType} onChange={(e) => setChecklistEditor((p) => {
                      const categories = [...(p.categories || [])];
                      categories[ci] = { ...categories[ci], listType: e.target.value };
                      return { ...p, categories };
                    })}>
                      <option value="ordered">Ordered</option>
                      <option value="unordered">Unordered</option>
                    </select>
                    <button type="button" className="rounded-md bg-rose-600 px-3 py-2 text-white" onClick={() => setChecklistEditor((p) => ({ ...p, categories: (p.categories || []).filter((_, i) => i !== ci) }))}>Remove</button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(cat.entries || []).map((entry, ei) => (
                      <div key={`e-${ci}-${ei}`} className="rounded-lg border border-neutral-100 p-2 dark:border-neutral-800">
                        <div className="mb-2 flex items-center justify-between">
                          <select className="rounded-lg border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-950" value={entry.type || "line"} onChange={(e) => setChecklistEditor((p) => {
                            const categories = [...(p.categories || [])];
                            const c = { ...categories[ci] };
                            const entries = [...(c.entries || [])];
                            entries[ei] = e.target.value === "nested" ? { type: "nested", label: "", bullets: [""] } : { type: "line", label: "", body: "" };
                            c.entries = entries;
                            categories[ci] = c;
                            return { ...p, categories };
                          })}>
                            <option value="line">Line</option>
                            <option value="nested">Nested bullets</option>
                          </select>
                          <button type="button" className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => setChecklistEditor((p) => {
                            const categories = [...(p.categories || [])];
                            const c = { ...categories[ci] };
                            c.entries = (c.entries || []).filter((_, i) => i !== ei);
                            categories[ci] = c;
                            return { ...p, categories };
                          })}>Delete</button>
                        </div>
                        <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" placeholder="Label" value={entry.label || ""} onChange={(e) => setChecklistEditor((p) => {
                          const categories = [...(p.categories || [])];
                          const c = { ...categories[ci] };
                          const entries = [...(c.entries || [])];
                          entries[ei] = { ...entries[ei], label: e.target.value };
                          c.entries = entries;
                          categories[ci] = c;
                          return { ...p, categories };
                        })} />
                        {entry.type === "nested" ? (
                          <div className="mt-2 space-y-2">
                            {(entry.bullets || []).map((b, bi) => (
                              <div key={`b-${ci}-${ei}-${bi}`} className="flex gap-2">
                                <input className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" value={b} onChange={(e) => setChecklistEditor((p) => {
                                  const categories = [...(p.categories || [])];
                                  const c = { ...categories[ci] };
                                  const entries = [...(c.entries || [])];
                                  const bullets = [...(entries[ei].bullets || [])];
                                  bullets[bi] = e.target.value;
                                  entries[ei] = { ...entries[ei], bullets };
                                  c.entries = entries;
                                  categories[ci] = c;
                                  return { ...p, categories };
                                })} />
                                <button type="button" className="rounded-md bg-rose-600 p-2 text-white" onClick={() => setChecklistEditor((p) => {
                                  const categories = [...(p.categories || [])];
                                  const c = { ...categories[ci] };
                                  const entries = [...(c.entries || [])];
                                  const bullets = (entries[ei].bullets || []).filter((_, i) => i !== bi);
                                  entries[ei] = { ...entries[ei], bullets };
                                  c.entries = entries;
                                  categories[ci] = c;
                                  return { ...p, categories };
                                })}><Trash2 className="h-4 w-4" /></button>
                              </div>
                            ))}
                            <button type="button" className="text-xs font-medium text-accent dark:text-emerald-200" onClick={() => setChecklistEditor((p) => {
                              const categories = [...(p.categories || [])];
                              const c = { ...categories[ci] };
                              const entries = [...(c.entries || [])];
                              entries[ei] = { ...entries[ei], bullets: [...(entries[ei].bullets || []), ""] };
                              c.entries = entries;
                              categories[ci] = c;
                              return { ...p, categories };
                            })}>+ Add bullet</button>
                          </div>
                        ) : (
                          <textarea className="mt-2 h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" placeholder="Body" value={entry.body || ""} onChange={(e) => setChecklistEditor((p) => {
                            const categories = [...(p.categories || [])];
                            const c = { ...categories[ci] };
                            const entries = [...(c.entries || [])];
                            entries[ei] = { ...entries[ei], body: e.target.value };
                            c.entries = entries;
                            categories[ci] = c;
                            return { ...p, categories };
                          })} />
                        )}
                      </div>
                    ))}
                    <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-xs dark:border-neutral-600" onClick={() => setChecklistEditor((p) => {
                      const categories = [...(p.categories || [])];
                      const c = { ...categories[ci] };
                      c.entries = [...(c.entries || []), { type: "line", label: "", body: "" }];
                      categories[ci] = c;
                      return { ...p, categories };
                    })}><Plus className="h-3.5 w-3.5" /> Add entry</button>
                  </div>
                </div>
              ))}
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs text-white dark:bg-emerald-700" onClick={() => setChecklistEditor((p) => ({ ...p, categories: [...(p.categories || []), { title: "", listType: "ordered", entries: [{ type: "line", label: "", body: "" }] }] }))}><Plus className="h-4 w-4" /> Add category</button>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700" onClick={async () => {
                const nextCats = sanitizeCategories(checklistEditor.categories || []);
                const next = {
                  ...draft,
                  checklistCamp: {
                    ...checklistCamp,
                    checklistCategories: nextCats.length ? nextCats : defaultChecklistCamp.checklistCategories,
                  },
                };
                await saveAndClose(next, () => setChecklistEditor(null));
              }}><Save className="h-4 w-4" /> Save</button>
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100" onClick={() => setChecklistEditor(null)}><X className="h-4 w-4" /> Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && remindersEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">Edit Reminders</h3>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950" value={remindersEditor.title} onChange={(e) => setRemindersEditor((p) => ({ ...p, title: e.target.value }))} />
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-prose">Reminder items</p>
                  <button type="button" onClick={() => setRemindersEditor((p) => ({ ...p, items: [...(p.items || []), { label: "", body: "" }] }))} className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs text-white dark:bg-emerald-700"><Plus className="h-4 w-4" /> Add</button>
                </div>
                <div className="space-y-3">
                  {(remindersEditor.items || []).map((it, i) => (
                    <div key={`ri-${i}`} className="rounded-lg border border-neutral-100 p-2 dark:border-neutral-800">
                      <div className="flex gap-2">
                        <input className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" value={it.label} onChange={(e) => setRemindersEditor((p) => {
                          const items = [...(p.items || [])];
                          items[i] = { ...items[i], label: e.target.value };
                          return { ...p, items };
                        })} />
                        <button type="button" className="rounded-md bg-rose-600 p-2 text-white" onClick={() => setRemindersEditor((p) => ({ ...p, items: (p.items || []).filter((_, idx) => idx !== i) }))}><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <textarea className="mt-2 h-16 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" value={it.body} onChange={(e) => setRemindersEditor((p) => {
                        const items = [...(p.items || [])];
                        items[i] = { ...items[i], body: e.target.value };
                        return { ...p, items };
                      })} />
                    </div>
                  ))}
                </div>
              </div>
              <ContentBlockEditor keyPrefix="rem-close" title="Below the reminder list" blocks={remindersEditor.closingBlocks} onChange={(next) => setRemindersEditor((p) => ({ ...p, closingBlocks: next }))} />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700" onClick={async () => {
                const items = (remindersEditor.items || []).map((it) => ({ label: (it.label || "").trim(), body: (it.body || "").trim() })).filter((it) => it.label || it.body);
                let closingBlocks = sanitizeContentBlocks(remindersEditor.closingBlocks || []);
                if (closingBlocks.length === 0) closingBlocks = defaultChecklistCamp.reminders.closingBlocks;
                const next = {
                  ...draft,
                  checklistCamp: {
                    ...checklistCamp,
                    reminders: {
                      ...checklistCamp.reminders,
                      title: (remindersEditor.title || "").trim() || "Reminders",
                      items: items.length ? items : defaultChecklistCamp.reminders.items,
                      closingBlocks,
                      closing: closingBlocks.find((b) => b.type === "paragraph")?.text || "",
                    },
                  },
                };
                await saveAndClose(next, () => setRemindersEditor(null));
              }}><Save className="h-4 w-4" /> Save</button>
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100" onClick={() => setRemindersEditor(null)}><X className="h-4 w-4" /> Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </PageFade>
  );
}

