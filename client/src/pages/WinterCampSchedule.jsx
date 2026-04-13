import { Pencil, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { adminRequest } from "../admin/api";
import Container from "../components/Container";
import ContentBlockEditor from "../components/camp/ContentBlockEditor";
import PageFade from "../components/PageFade";
import useLiveContent from "../hooks/useLiveContent";
import {
  renderContentBlocks,
  sanitizeContentBlocks,
} from "../utils/campContentBlocks";

const scheduleTabs = [
  { id: "morning", label: "Morning Routine" },
  { id: "activity", label: "Activity Sessions" },
  { id: "evening", label: "Evening Routine" },
  { id: "dietary", label: "Dietary Schedule" },
];

const defaultScheduleContent = {
  introBlocks: [
    {
      type: "paragraph",
      text: "This structured routine is designed to provide a balanced blend of physical activity, educational enrichment, and personal development, ensuring a fulfilling and memorable camp experience.",
    },
  ],
  tabs: {
    morning: {
      title: "Morning Routine",
      contentBlocks: [
        {
          type: "bullets",
          items: [
            "6:00 AM: Rise with Pratahkal Mantras, observing a vow of silence.",
            "6:30 AM: Personal hygiene activities with guidance to maintain a healthy lifestyle, including drinking warm water and attending nature's call.",
            "7:00 AM: Physical fitness - Yoga / Indian Martial Arts.",
            "8:00 AM: Bath.",
            "8:30 AM: Breakfast.",
          ],
        },
      ],
    },
    activity: {
      title: "Activity Sessions",
      contentBlocks: [
        {
          type: "paragraph",
          text: "Engage in group activities with peers. Each session lasts 45-60 minutes and takes place in a combination of outdoors and air-conditioned indoor halls.",
        },
        {
          type: "subheading",
          text: "Activities include (9:00 AM - 1:00 PM and 2:00 PM - 5:00 PM)",
        },
        {
          type: "bullets",
          items: [
            "Robotics (12 to 15 year age group)",
            "Puzzles",
            "Swimming",
            "Dhanurvidya",
            "Astronomy (Bharatiya Panchangam)",
            "Ayurvedha and lifestyle practices",
            "Indian Martial Arts (Kalari Payattu / Gatka)",
            "Yoga / Mallakhambh",
            "Theater workshops",
            "Ithihaasa",
            "Samskrutha Sambhashanam",
            "Nature exploration and trekking",
          ],
        },
      ],
    },
    evening: {
      title: "Evening Routine",
      contentBlocks: [
        {
          type: "bullets",
          items: [
            "5:00 PM - 6:30 PM: Outdoor games and sports.",
            "6:30 PM - 7:00 PM: Sandya and Upasana meditation.",
            "7:00 PM - 7:30 PM: Entertainment period.",
            "7:30 PM - 8:00 PM: Dinner break with North and South Indian cuisine.",
            "8:00 PM - 8:30 PM: Prayer and Sayanakala Mantras.",
            "8:30 PM - 8:45 PM: Evening walk (Bramanam) with discussions on Chanakya Neeti, Bartruhari Neethi, and Slokas.",
            "8:45 PM - 6:00 AM: Sleep and rest period.",
          ],
        },
      ],
    },
    dietary: {
      title: "Dietary Schedule",
      contentBlocks: [
        {
          type: "bullets",
          items: [
            "8:30 AM - 9:30 AM: Breakfast with two varieties daily.",
            "11:00 AM: Fresh fruit juice.",
            "1:00 PM: Nutritious vegetarian lunch featuring both North and South Indian dishes.",
            "4:30 PM: Snacks, including special items like chat.",
            "7:30 PM: Dinner serving a delectable vegetarian meal with North and South Indian cuisine.",
          ],
        },
      ],
    },
  },
};

function normalizeTabContent(rawTab, fallbackTab) {
  const merged = { ...(fallbackTab || {}), ...(rawTab || {}) };
  const title = (merged.title || "").trim() || fallbackTab.title;
  const sanitizedBlocks = sanitizeContentBlocks(merged.contentBlocks || [], {
    allowImplicitBullets: true,
  });
  return {
    title,
    contentBlocks:
      sanitizedBlocks.length > 0 ? sanitizedBlocks : fallbackTab.contentBlocks,
  };
}

export default function WinterCampSchedule() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin/winter-camp/schedule";
  const [activeTab, setActiveTab] = useState("morning");
  const [introEditor, setIntroEditor] = useState(null);
  const [tabEditor, setTabEditor] = useState(null);
  const cms = useLiveContent("winter-camp-schedule", defaultScheduleContent);
  const [draft, setDraft] = useState(cms);

  useEffect(() => setDraft(cms), [cms]);

  const saveScheduleContent = async (nextContent) => {
    await adminRequest("/api/admin/content/winter-camp-schedule", {
      method: "PUT",
      body: JSON.stringify({ content: nextContent }),
    });
  };

  const display = isAdmin ? draft : cms;
  const introBlocksRaw =
    display.introBlocks || defaultScheduleContent.introBlocks;
  const introBlocks = sanitizeContentBlocks(introBlocksRaw, {
    allowImplicitBullets: true,
  });
  const resolvedIntroBlocks =
    introBlocks.length > 0 ? introBlocks : defaultScheduleContent.introBlocks;

  const resolvedTabs = useMemo(() => {
    const sourceTabs = display.tabs || {};
    return {
      morning: normalizeTabContent(
        sourceTabs.morning,
        defaultScheduleContent.tabs.morning,
      ),
      activity: normalizeTabContent(
        sourceTabs.activity,
        defaultScheduleContent.tabs.activity,
      ),
      evening: normalizeTabContent(
        sourceTabs.evening,
        defaultScheduleContent.tabs.evening,
      ),
      dietary: normalizeTabContent(
        sourceTabs.dietary,
        defaultScheduleContent.tabs.dietary,
      ),
    };
  }, [display.tabs]);

  const activeTabContent =
    resolvedTabs[activeTab] || defaultScheduleContent.tabs.morning;

  const openIntroEditor = () => {
    setIntroEditor({
      introBlocks: JSON.parse(JSON.stringify(resolvedIntroBlocks)),
    });
  };

  const saveIntroEditor = async () => {
    if (!introEditor) return;
    const nextIntroBlocks = sanitizeContentBlocks(
      introEditor.introBlocks || [],
      {
        allowImplicitBullets: true,
      },
    );
    const next = {
      ...draft,
      introBlocks:
        nextIntroBlocks.length > 0
          ? nextIntroBlocks
          : defaultScheduleContent.introBlocks,
    };
    setDraft(next);
    await saveScheduleContent(next);
    setIntroEditor(null);
  };

  const openTabEditor = (tabId) => {
    const source = resolvedTabs[tabId] || defaultScheduleContent.tabs[tabId];
    setTabEditor({
      tabId,
      title: source.title || "",
      contentBlocks: JSON.parse(JSON.stringify(source.contentBlocks || [])),
    });
  };

  const saveTabEditor = async () => {
    if (!tabEditor?.tabId) return;
    const tabId = tabEditor.tabId;
    const next = {
      ...draft,
      tabs: {
        ...(draft.tabs || {}),
        [tabId]: normalizeTabContent(
          { title: tabEditor.title, contentBlocks: tabEditor.contentBlocks },
          defaultScheduleContent.tabs[tabId],
        ),
      },
    };
    setDraft(next);
    await saveScheduleContent(next);
    setTabEditor(null);
  };

  const detailsPath = isAdmin ? "/admin/winter-camp" : "/winter-camp";
  const registerPath = isAdmin
    ? "/admin/register/winter-camp"
    : "/register/winter-camp";

  return (
    <PageFade>
      <section className="border-b border-neutral-200 bg-secondary/35 py-10 dark:border-neutral-700 dark:bg-neutral-950/70 md:py-14">
        <Container>
          <h1 className="heading-page">Winter Camp Schedule</h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={registerPath}
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              Registration
            </Link>
            <Link
              to={detailsPath}
              className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-prose transition hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Winter Camp Details
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-8 md:py-12">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {renderContentBlocks(resolvedIntroBlocks, "wcs-intro", "mt-0")}
          </div>
          {isAdmin ? (
            <button
              type="button"
              onClick={openIntroEditor}
              className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
              aria-label="Edit schedule intro content"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {scheduleTabs.map((tab) => {
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
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold text-prose">
                {activeTabContent.title}
              </h3>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => openTabEditor(activeTab)}
                  className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                  aria-label={`Edit ${activeTab} tab content`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            {renderContentBlocks(
              activeTabContent.contentBlocks,
              `wcs-${activeTab}`,
              "mt-4",
            )}
          </div>
        </div>
      </Container>

      {isAdmin && introEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit Schedule Intro
            </h3>
            <p className="mt-1 text-xs text-prose-muted">
              This content is shown above the schedule tabs.
            </p>
            <ContentBlockEditor
              blockKeyPrefix="schedule-intro"
              sectionTitle="Intro content"
              sectionHint="Use paragraphs, subheadings, or bullet lists."
              blocks={introEditor.introBlocks}
              onBlocksChange={(next) =>
                setIntroEditor((prev) => ({ ...prev, introBlocks: next }))
              }
            />
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={saveIntroEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setIntroEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && tabEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit {scheduleTabs.find((t) => t.id === tabEditor.tabId)?.label}
            </h3>
            <p className="mt-1 text-xs text-prose-muted">
              Edit only this tab content to keep the form simple.
            </p>
            <input
              className="mt-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              placeholder="Tab heading"
              value={tabEditor.title || ""}
              onChange={(e) =>
                setTabEditor((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <ContentBlockEditor
              blockKeyPrefix={`schedule-${tabEditor.tabId}`}
              sectionTitle="Tab content"
              sectionHint="Add one or more paragraphs, subheadings, or bullet lists."
              blocks={tabEditor.contentBlocks || []}
              onBlocksChange={(next) =>
                setTabEditor((prev) => ({ ...prev, contentBlocks: next }))
              }
            />

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={saveTabEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setTabEditor(null)}
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
