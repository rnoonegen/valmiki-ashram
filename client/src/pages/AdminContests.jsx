import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Save, Trash2, Users, X } from "lucide-react";
import Container from "../components/Container";
import { useTheme } from "../context/ThemeContext";
import { adminRequest } from "../admin/api";
import ImageUploader from "../components/admin/ImageUploader";
import { DEFAULT_BUILT_IN_REGISTRATION_INTRO } from "../constants/contestRegistrationDefaults";

const createBlankBlock = () => ({
  subHeading: "",
  paragraphs: [""],
  bulletPoints: [""],
});
const createBlankSection = () => ({
  heading: "",
  blocks: [createBlankBlock()],
});
const createBlankContest = () => ({
  title: "",
  description: "",
  submitDate: "",
  resultDate: "",
  heroImages: [],
  heroVideoLinks: [""],
  registerButtonText: "Register Now",
  registerMode: "google",
  googleFormUrl: "",
  googleFormButtonLabel: "",
  googleFormHelperText: "",
  builtInRegistrationIntro: DEFAULT_BUILT_IN_REGISTRATION_INTRO,
  registrationOpen: true,
  sections: [createBlankSection()],
});

function mapServerToForm(contest) {
  const sections = (contest.sections || []).map((section) => {
    if (Array.isArray(section.blocks) && section.blocks.length > 0) {
      return {
        heading: section.heading || "",
        blocks: section.blocks.map((block) => ({
          subHeading: block.subHeading || "",
          paragraphs:
            Array.isArray(block.paragraphs) && block.paragraphs.length > 0
              ? block.paragraphs
              : [""],
          bulletPoints:
            Array.isArray(block.bulletPoints) && block.bulletPoints.length > 0
              ? block.bulletPoints
              : [""],
        })),
      };
    }
    // Backward compatibility for old saved section shape.
    return {
      heading: section.heading || "",
      blocks: [
        {
          subHeading: section.subHeading || "",
          paragraphs: section.paragraph ? [section.paragraph] : [""],
          bulletPoints:
            Array.isArray(section.bulletPoints) &&
            section.bulletPoints.length > 0
              ? section.bulletPoints
              : [""],
        },
      ],
    };
  });

  return {
    ...contest,
    description: contest.description || contest.cardDescription || "",
    submitDate: contest.submitDate
      ? new Date(contest.submitDate).toISOString().slice(0, 10)
      : "",
    resultDate: contest.resultDate
      ? new Date(contest.resultDate).toISOString().slice(0, 10)
      : "",
    heroImages: Array.isArray(contest.heroImages) ? contest.heroImages : [],
    heroVideoLinks:
      Array.isArray(contest.heroVideoLinks) && contest.heroVideoLinks.length > 0
        ? contest.heroVideoLinks
        : [""],
    sections: sections.length > 0 ? sections : [createBlankSection()],
    builtInRegistrationIntro:
      String(contest.builtInRegistrationIntro || "").trim() ||
      DEFAULT_BUILT_IN_REGISTRATION_INTRO,
    registrationOpen:
      contest.registrationOpen !== undefined &&
      contest.registrationOpen !== null
        ? contest.registrationOpen !== false
        : contest.isPublished !== false,
  };
}

function mapFormToPayload(form) {
  return {
    title: form.title || "",
    description: form.description || "",
    submitDate: form.submitDate || null,
    resultDate: form.resultDate || null,
    heroImages: Array.isArray(form.heroImages)
      ? form.heroImages.filter(Boolean)
      : [],
    heroVideoLinks: Array.isArray(form.heroVideoLinks)
      ? form.heroVideoLinks
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      : [],
    registerButtonText: form.registerButtonText || "Register Now",
    registerMode: form.registerMode === "google" ? "google" : "internal",
    googleFormUrl: form.googleFormUrl || "",
    googleFormButtonLabel: form.googleFormButtonLabel || "",
    googleFormHelperText: form.googleFormHelperText || "",
    builtInRegistrationIntro: String(form.builtInRegistrationIntro || ""),
    registrationOpen: form.registrationOpen !== false,
    sections: (form.sections || []).map((section) => ({
      heading: section.heading || "",
      blocks: (section.blocks || []).map((block) => ({
        subHeading: block.subHeading || "",
        paragraphs: (block.paragraphs || [])
          .map((text) => String(text || "").trim())
          .filter(Boolean),
        bulletPoints: (block.bulletPoints || [])
          .map((text) => String(text || "").trim())
          .filter(Boolean),
      })),
    })),
  };
}

function hasSectionContent(sections = []) {
  return sections.some((section) =>
    (section.blocks || []).some((block) => {
      const hasSubHeading = Boolean(String(block.subHeading || "").trim());
      const hasParagraph = (block.paragraphs || []).some((text) =>
        Boolean(String(text || "").trim()),
      );
      const hasBullet = (block.bulletPoints || []).some((text) =>
        Boolean(String(text || "").trim()),
      );
      return hasSubHeading || hasParagraph || hasBullet;
    }),
  );
}

export default function AdminContests() {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(createBlankContest);
  const [showEditor, setShowEditor] = useState(false);
  const [adminTab, setAdminTab] = useState("new-contest");
  const [registrationItems, setRegistrationItems] = useState([]);
  const [selectedRegistrationContestId, setSelectedRegistrationContestId] =
    useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [contestsPageHeading, setContestsPageHeading] = useState("Contests");
  const [contestsPageParagraphs, setContestsPageParagraphs] = useState([
    "Competitions and challenges hosted by Valmiki Ashram.",
  ]);
  const [contestsPageSaving, setContestsPageSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const editorRef = useRef(null);
  const [registrationBlueprintContestId, setRegistrationBlueprintContestId] =
    useState("");
  const [registrationBlueprintForm, setRegistrationBlueprintForm] =
    useState(null);
  const [registrationBlueprintLoading, setRegistrationBlueprintLoading] =
    useState(false);
  const [registrationBlueprintSaving, setRegistrationBlueprintSaving] =
    useState(false);
  const [
    registrationBlueprintBuiltinIntroEditorOpen,
    setRegistrationBlueprintBuiltinIntroEditorOpen,
  ] = useState(false);
  const [
    registrationBlueprintGoogleEditorOpen,
    setRegistrationBlueprintGoogleEditorOpen,
  ] = useState(false);

  const load = async () => {
    const data = await adminRequest("/api/admin/contests");
    setItems(data.items || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  useEffect(() => {
    adminRequest("/api/admin/content/contests")
      .then((data) => {
        const content = data?.content || {};
        setContestsPageHeading(String(content.heading || "Contests"));
        const paragraphs = Array.isArray(content.paragraphs)
          ? content.paragraphs
              .map((item) => String(item || "").trim())
              .filter(Boolean)
          : [];
        setContestsPageParagraphs(
          paragraphs.length
            ? paragraphs
            : ["Competitions and challenges hosted by Valmiki Ashram."],
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!items.length) return;
    if (!selectedRegistrationContestId) {
      setSelectedRegistrationContestId(String(items[0]._id));
    }
  }, [items, selectedRegistrationContestId]);

  useEffect(() => {
    if (!items.length) return;
    if (!registrationBlueprintContestId) {
      setRegistrationBlueprintContestId(String(items[0]._id));
    }
  }, [items, registrationBlueprintContestId]);

  useEffect(() => {
    if (adminTab !== "registration-form" || !registrationBlueprintContestId)
      return undefined;
    let cancelled = false;
    setRegistrationBlueprintLoading(true);
    adminRequest(`/api/admin/contests/${registrationBlueprintContestId}`)
      .then((data) => {
        if (cancelled || !data?.contest) return;
        setRegistrationBlueprintForm(mapServerToForm(data.contest));
      })
      .catch(() => {
        if (!cancelled) setRegistrationBlueprintForm(null);
      })
      .finally(() => {
        if (!cancelled) setRegistrationBlueprintLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adminTab, registrationBlueprintContestId]);

  const selectedContest = useMemo(
    () => items.find((item) => String(item._id) === String(selectedId)),
    [items, selectedId],
  );

  const selectContest = (id) => {
    setSelectedId(id);
    const contest = items.find((item) => String(item._id) === String(id));
    if (contest) {
      setForm(mapServerToForm(contest));
      setShowEditor(true);
    }
  };

  const loadRegistrations = async (contestId) => {
    if (!contestId) return;
    setRegistrationLoading(true);
    try {
      const data = await adminRequest(
        `/api/admin/contests/${contestId}/registrations`,
      );
      setRegistrationItems(data.items || []);
    } catch (_error) {
      setRegistrationItems([]);
    } finally {
      setRegistrationLoading(false);
    }
  };

  useEffect(() => {
    if (adminTab !== "previous-contests") return;
    loadRegistrations(selectedRegistrationContestId);
  }, [adminTab, selectedRegistrationContestId]);

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), createBlankSection()],
    }));
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
      heroVideoLinks: (prev.heroVideoLinks || []).map((item, i) =>
        i === index ? value : item,
      ),
    }));
  };

  const addHeroVideoLink = () => {
    setForm((prev) => ({
      ...prev,
      heroVideoLinks: [...(prev.heroVideoLinks || []), ""],
    }));
  };

  const removeHeroVideoLink = (index) => {
    setForm((prev) => {
      const next = (prev.heroVideoLinks || []).filter((_, i) => i !== index);
      return { ...prev, heroVideoLinks: next.length > 0 ? next : [""] };
    });
  };

  const updateSection = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i === index ? { ...s, ...patch } : s,
      ),
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
          : section,
      ),
    }));
  };

  const removeBlock = (sectionIndex, blockIndex) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, idx) => {
        if (idx !== sectionIndex) return section;
        const nextBlocks = (section.blocks || []).filter(
          (_, i) => i !== blockIndex,
        );
        return {
          ...section,
          blocks: nextBlocks.length > 0 ? nextBlocks : [createBlankBlock()],
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
              blocks: (section.blocks || []).map((block, bIdx) =>
                bIdx === blockIndex ? { ...block, ...patch } : block,
              ),
            }
          : section,
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
                bIdx === blockIndex
                  ? { ...block, paragraphs: [...(block.paragraphs || []), ""] }
                  : block,
              ),
            }
          : section,
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
                      paragraphs: (block.paragraphs || []).map((text, pIdx) =>
                        pIdx === paragraphIndex ? value : text,
                      ),
                    }
                  : block,
              ),
            }
          : section,
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
                const next = (block.paragraphs || []).filter(
                  (_, pIdx) => pIdx !== paragraphIndex,
                );
                return { ...block, paragraphs: next.length > 0 ? next : [""] };
              }),
            }
          : section,
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
                bIdx === blockIndex
                  ? {
                      ...block,
                      bulletPoints: [...(block.bulletPoints || []), ""],
                    }
                  : block,
              ),
            }
          : section,
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
                      bulletPoints: (block.bulletPoints || []).map(
                        (text, pIdx) => (pIdx === bulletIndex ? value : text),
                      ),
                    }
                  : block,
              ),
            }
          : section,
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
                const next = (block.bulletPoints || []).filter(
                  (_, pIdx) => pIdx !== bulletIndex,
                );
                return {
                  ...block,
                  bulletPoints: next.length > 0 ? next : [""],
                };
              }),
            }
          : section,
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
    setError("");
    setMessage("");
    if (!hasSectionContent(form.sections || [])) {
      setError(
        "Please add at least one Sub Section content (sub heading, paragraph, or bullet point).",
      );
      return;
    }
    try {
      await adminRequest("/api/admin/contests", {
        method: "POST",
        body: JSON.stringify(mapFormToPayload(form)),
      });
      setMessage("Contest created.");
      setForm(createBlankContest());
      setSelectedId("");
      setShowEditor(false);
      await load();
    } catch (err) {
      setError(err.message || "Unable to create contest");
    }
  };

  const saveContest = async () => {
    if (!selectedId) return;
    setError("");
    setMessage("");
    if (!hasSectionContent(form.sections || [])) {
      setError(
        "Please add at least one Sub Section content (sub heading, paragraph, or bullet point).",
      );
      return;
    }
    try {
      await adminRequest(`/api/admin/contests/${selectedId}`, {
        method: "PUT",
        body: JSON.stringify(mapFormToPayload(form)),
      });
      setMessage("Contest updated.");
      setShowEditor(false);
      setSelectedId("");
      await load();
    } catch (err) {
      setError(err.message || "Unable to update contest");
    }
  };

  const startCreateContest = () => {
    setSelectedId("");
    setForm(createBlankContest());
    setMessage("");
    setError("");
    setShowEditor(true);
  };

  const editContest = async (id) => {
    setMessage("");
    setError("");
    try {
      const data = await adminRequest(`/api/admin/contests/${id}`);
      const contest = data?.contest;
      if (!contest) throw new Error("Contest not found");
      setSelectedId(String(id));
      setForm(mapServerToForm(contest));
      setShowEditor(true);
      setTimeout(() => {
        editorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    } catch (err) {
      const msg = err.message || "Unable to open contest editor";
      setError(msg);
      window.alert(msg);
    }
  };

  const deleteContest = async (id) => {
    try {
      await adminRequest(`/api/admin/contests/${id}`, { method: "DELETE" });
      if (String(selectedId) === String(id)) {
        setSelectedId("");
        setForm(createBlankContest());
        setShowEditor(false);
      }
      if (String(selectedRegistrationContestId) === String(id)) {
        setSelectedRegistrationContestId("");
      }
      setMessage("Contest deleted.");
      setError("");
      await load();
    } catch (err) {
      const msg = err.message || "Unable to delete contest";
      setError(msg);
      window.alert(msg);
    }
  };

  const patchRegistrationBlueprint = (patch) => {
    setRegistrationBlueprintForm((prev) =>
      prev ? { ...prev, ...patch } : prev,
    );
  };

  const saveRegistrationBlueprint = async () => {
    if (!registrationBlueprintContestId || !registrationBlueprintForm) return;
    setRegistrationBlueprintSaving(true);
    setError("");
    setMessage("");
    try {
      await adminRequest(
        `/api/admin/contests/${registrationBlueprintContestId}`,
        {
          method: "PUT",
          body: JSON.stringify(mapFormToPayload(registrationBlueprintForm)),
        },
      );
      setMessage("Contest registration form settings saved.");
      setRegistrationBlueprintBuiltinIntroEditorOpen(false);
      setRegistrationBlueprintGoogleEditorOpen(false);
      await load();
      const refreshed = await adminRequest(
        `/api/admin/contests/${registrationBlueprintContestId}`,
      );
      if (refreshed?.contest) {
        setRegistrationBlueprintForm(mapServerToForm(refreshed.contest));
      }
    } catch (err) {
      setError(err.message || "Unable to save registration form settings");
    } finally {
      setRegistrationBlueprintSaving(false);
    }
  };

  const updateIntroParagraph = (index, value) => {
    setContestsPageParagraphs((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  };

  const addIntroParagraph = () => {
    setContestsPageParagraphs((prev) => [...prev, ""]);
  };

  const removeIntroParagraph = (index) => {
    setContestsPageParagraphs((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [""];
    });
  };

  const saveContestsIntro = async () => {
    setContestsPageSaving(true);
    setError("");
    setMessage("");
    try {
      await adminRequest("/api/admin/content/contests", {
        method: "PUT",
        body: JSON.stringify({
          content: {
            heading: String(contestsPageHeading || "").trim() || "Contests",
            paragraphs: contestsPageParagraphs
              .map((item) => String(item || "").trim())
              .filter(Boolean),
          },
        }),
      });
      setMessage("Contests page intro updated.");
    } catch (err) {
      setError(err.message || "Unable to update contests page intro");
    } finally {
      setContestsPageSaving(false);
    }
  };

  const showCreateEditor = showEditor && !selectedId;
  const showEditEditor =
    adminTab === "previous-contests" && showEditor && Boolean(selectedId);
  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  const editor = (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <input
        placeholder="Contest title"
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
        value={form.title}
        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
      />
      <textarea
        placeholder="Description"
        rows={2}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
        value={form.description}
        onChange={(e) =>
          setForm((p) => ({ ...p, description: e.target.value }))
        }
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-neutral-800 dark:text-neutral-200">
          Submit Date
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
            value={form.submitDate || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, submitDate: e.target.value }))
            }
          />
        </label>
        <label className="text-sm text-neutral-800 dark:text-neutral-200">
          Result Date
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
            value={form.resultDate || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, resultDate: e.target.value }))
            }
          />
        </label>
      </div>
      <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Contest Images
          </p>
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
                <img
                  src={imageUrl}
                  alt={`Contest ${index + 1}`}
                  className="h-36 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeHeroImage(index)}
                  className="w-full border-t border-neutral-200 bg-neutral-50 px-2 py-1 text-sm font-medium text-rose-800 hover:bg-rose-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-rose-300 dark:hover:bg-rose-950/30"
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
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            YouTube Links
          </p>
          <button
            type="button"
            onClick={addHeroVideoLink}
            className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-100 dark:border-neutral-400 dark:bg-neutral-700 dark:text-white dark:shadow-none dark:hover:bg-neutral-600"
          >
            Add Link
          </button>
        </div>
        {(form.heroVideoLinks || []).map((videoLink, index) => (
          <div key={`hero-video-${index}`} className="flex gap-2">
            <input
              placeholder={`YouTube link ${index + 1}`}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
              value={videoLink}
              onChange={(e) => updateHeroVideoLink(index, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeHeroVideoLink(index)}
              className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 hover:bg-rose-100 dark:border-rose-700/50 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/40"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <input
        placeholder="Register button text"
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
        value={form.registerButtonText}
        onChange={(e) =>
          setForm((p) => ({ ...p, registerButtonText: e.target.value }))
        }
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-neutral-800 dark:text-neutral-200">
          Registration mode
          <select
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
            value={form.registerMode}
            onChange={(e) =>
              setForm((p) => ({ ...p, registerMode: e.target.value }))
            }
          >
            <option value="google">Google Form Link</option>
            <option value="internal">Website Form (store in DB)</option>
          </select>
        </label>
        <label className="text-sm text-neutral-800 dark:text-neutral-200">
          Registration
          <select
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
            value={String(form.registrationOpen !== false)}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                registrationOpen: e.target.value === "true",
              }))
            }
          >
            <option value="true">Open</option>
            <option value="false">Closed</option>
          </select>
        </label>
      </div>
      {form.registerMode === "google" ? (
        <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Google Form (registration page)
          </p>
          <input
            placeholder="Google form URL"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
            value={form.googleFormUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, googleFormUrl: e.target.value }))
            }
          />
          <input
            placeholder="Button label on registration page (e.g. Submit on Google Form)"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
            value={form.googleFormButtonLabel || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, googleFormButtonLabel: e.target.value }))
            }
          />
          <label className="block text-sm text-neutral-800 dark:text-neutral-200">
            Helper text (above the button)
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
              value={form.googleFormHelperText || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, googleFormHelperText: e.target.value }))
              }
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Built-in form introduction
          </p>
          <p className="text-xs text-prose-muted">
            Shown above the registration fields on the contest registration
            page. You can also edit this from Admin → Registration Form →
            Preview → Edit.
          </p>
          <textarea
            rows={12}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:[color-scheme:dark]"
            value={form.builtInRegistrationIntro || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                builtInRegistrationIntro: e.target.value,
              }))
            }
          />
        </div>
      )}
      <div className="space-y-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Template Sections
          </h2>
          <button
            type="button"
            onClick={addSection}
            className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-100 dark:border-neutral-400 dark:bg-neutral-700 dark:text-white dark:shadow-none dark:hover:bg-neutral-600"
          >
            Add Section
          </button>
        </div>
        {form.sections.map((section, index) => (
          <div
            key={`section-${index}`}
            className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Section {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeSection(index)}
                className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-800 hover:bg-rose-100 dark:border-rose-700/50 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/40"
              >
                Remove
              </button>
            </div>
            <input
              placeholder="Section heading"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
              value={section.heading}
              onChange={(e) =>
                updateSection(index, { heading: e.target.value })
              }
            />
            <div className="space-y-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Sub Sections
                </p>
                <button
                  type="button"
                  onClick={() => addBlock(index)}
                  className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm hover:bg-neutral-100 dark:border-neutral-400 dark:bg-neutral-700 dark:text-white dark:shadow-none dark:hover:bg-neutral-600"
                >
                  Add Sub Heading
                </button>
              </div>
              {(section.blocks || []).map((block, blockIndex) => (
                <div
                  key={`block-${blockIndex}`}
                  className="space-y-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-prose-muted">
                      Sub Section {blockIndex + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeBlock(index, blockIndex)}
                      className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-800 hover:bg-rose-100 dark:border-rose-700/50 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/40"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    placeholder="Sub heading"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                    value={block.subHeading}
                    onChange={(e) =>
                      updateBlock(index, blockIndex, {
                        subHeading: e.target.value,
                      })
                    }
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-prose-muted">
                        Paragraphs
                      </p>
                      <button
                        type="button"
                        onClick={() => addParagraph(index, blockIndex)}
                        className="rounded border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-800 shadow-sm hover:bg-neutral-100 dark:border-neutral-400 dark:bg-neutral-700 dark:text-white dark:shadow-none dark:hover:bg-neutral-600"
                      >
                        Add Paragraph
                      </button>
                    </div>
                    {(block.paragraphs || []).map(
                      (paragraph, paragraphIndex) => (
                        <div
                          key={`paragraph-${paragraphIndex}`}
                          className="flex gap-2"
                        >
                          <textarea
                            rows={2}
                            placeholder={`Paragraph ${paragraphIndex + 1}`}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                            value={paragraph}
                            onChange={(e) =>
                              updateParagraph(
                                index,
                                blockIndex,
                                paragraphIndex,
                                e.target.value,
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeParagraph(index, blockIndex, paragraphIndex)
                            }
                            className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-800 hover:bg-rose-100 dark:border-rose-700/50 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/40"
                          >
                            Delete
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-prose-muted">
                        Bullet Points
                      </p>
                      <button
                        type="button"
                        onClick={() => addBulletPoint(index, blockIndex)}
                        className="rounded border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-800 shadow-sm hover:bg-neutral-100 dark:border-neutral-400 dark:bg-neutral-700 dark:text-white dark:shadow-none dark:hover:bg-neutral-600"
                      >
                        Add Bullet
                      </button>
                    </div>
                    {(block.bulletPoints || []).map((point, pointIndex) => (
                      <div key={`bullet-${pointIndex}`} className="flex gap-2">
                        <input
                          placeholder={`Bullet point ${pointIndex + 1}`}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                          value={point}
                          onChange={(e) =>
                            updateBulletPoint(
                              index,
                              blockIndex,
                              pointIndex,
                              e.target.value,
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeBulletPoint(index, blockIndex, pointIndex)
                          }
                          className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-800 hover:bg-rose-100 dark:border-rose-700/50 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/40"
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
      {message ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}
      <div className="flex gap-3">
        {selectedId ? (
          <button
            type="button"
            onClick={saveContest}
            className="rounded-lg bg-accent px-4 py-2 text-white dark:bg-emerald-700"
          >
            Save Contest
          </button>
        ) : (
          <button
            type="button"
            onClick={createContest}
            className="rounded-lg bg-accent px-4 py-2 text-white dark:bg-emerald-700"
          >
            Create Contest
          </button>
        )}
      </div>
    </section>
  );

  return (
    <Container className="py-10">
      <h1 className="heading-page">Contests</h1>
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="heading-section">Contests Page Intro</h2>
        <p className="mt-1 text-sm text-prose-muted">
          One heading and multiple paragraphs shown on the user contests page.
        </p>
        <div className="mt-4 space-y-3">
          <label className="text-sm text-neutral-800 dark:text-neutral-200">
            Heading
            <input
              value={contestsPageHeading}
              onChange={(e) => setContestsPageHeading(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
              placeholder="Contests"
            />
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Paragraphs
              </p>
              <button
                type="button"
                onClick={addIntroParagraph}
                className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-1 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-100 dark:border-neutral-400 dark:bg-neutral-700 dark:text-white dark:shadow-none dark:hover:bg-neutral-600"
              >
                Add Paragraph
              </button>
            </div>
            {contestsPageParagraphs.map((paragraph, index) => (
              <div key={`intro-paragraph-${index}`} className="flex gap-2">
                <textarea
                  rows={2}
                  value={paragraph}
                  onChange={(e) => updateIntroParagraph(index, e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                  placeholder={`Paragraph ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeIntroParagraph(index)}
                  className="shrink-0 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 hover:bg-rose-100 dark:border-rose-700/50 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/40"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={saveContestsIntro}
            disabled={contestsPageSaving}
            className="rounded-lg bg-accent px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-700"
          >
            {contestsPageSaving ? "Saving..." : "Save Intro"}
          </button>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAdminTab("new-contest")}
            className={`rounded-full px-4 py-2 text-sm ${adminTab === "new-contest" ? "bg-accent text-white dark:bg-emerald-700" : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"}`}
          >
            Add Contest
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("previous-contests")}
            className={`rounded-full px-4 py-2 text-sm ${adminTab === "previous-contests" ? "bg-accent text-white dark:bg-emerald-700" : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"}`}
          >
            Contests History
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("registration-form")}
            className={`rounded-full px-4 py-2 text-sm ${adminTab === "registration-form" ? "bg-accent text-white dark:bg-emerald-700" : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"}`}
          >
            Registration Form
          </button>
        </div>
      </section>
      {adminTab === "new-contest" ? (
        <section className="mt-6 space-y-5">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="heading-section">Add Contest</h2>
            <p className="mt-2 max-w-2xl text-sm text-prose-muted">
              Create a new contest with clear dates, media highlights, and
              structured content so participants can quickly understand the
              challenge and register with confidence.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={startCreateContest}
                className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white dark:bg-emerald-700"
              >
                + Add Contest
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Created Contests
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-prose-muted">
              Compact overview of every contest. Open{" "}
              <span className="font-medium text-accent/90 dark:text-emerald-300/90">
                Contests History
              </span>{" "}
              to edit or remove.
            </p>
            {items.length === 0 ? (
              <p className="mt-4 text-sm text-prose-muted">
                No contests yet. Create one with the button above.
              </p>
            ) : (
              <ul
                className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                role="list"
              >
                {items.map((item) => {
                  const cover =
                    Array.isArray(item.heroImages) && item.heroImages[0]
                      ? item.heroImages[0]
                      : null;
                  const isDarkUi = theme === "dark";
                  return (
                    <li key={item._id} className="min-w-0">
                      <article
                        className={`flex h-full min-h-[11rem] min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md ${
                          isDarkUi
                            ? "border-emerald-800/45 bg-gradient-to-br from-emerald-950/55 via-neutral-900 to-neutral-950"
                            : "border-accent/20 bg-gradient-to-br from-primary/80 via-primary/45 to-secondary/60"
                        }`}
                      >
                        {cover ? (
                          <div className="aspect-[5/3] w-full shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                            <img
                              src={cover}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`flex aspect-[5/3] w-full shrink-0 items-center justify-center ${
                              isDarkUi ? "bg-emerald-900/35" : "bg-accent/10"
                            }`}
                          >
                            <span
                              className={`text-xs font-semibold uppercase tracking-wider ${
                                isDarkUi
                                  ? "text-emerald-400/90"
                                  : "text-accent/60"
                              }`}
                            >
                              Valmiki Ashram
                            </span>
                          </div>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col p-3.5">
                          <p
                            className="truncate text-sm font-semibold leading-snug text-accent dark:text-emerald-200"
                            title={item.title || "Untitled contest"}
                          >
                            {item.title || "Untitled contest"}
                          </p>
                          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/15 bg-white/90 px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-sm dark:border-emerald-800/40 dark:bg-neutral-950/60 dark:text-neutral-200">
                              <Users
                                className="h-3.5 w-3.5 text-accent dark:text-emerald-400"
                                aria-hidden
                              />
                              <span>{item.registrationCount ?? 0}</span>
                              <span className="text-prose-muted">
                                registered
                              </span>
                            </span>
                            {item.registrationOpen === false ? (
                              <span className="shrink-0 rounded-full bg-amber-100/95 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                                Closed
                              </span>
                            ) : (
                              <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent dark:bg-emerald-900/50 dark:text-emerald-200">
                                Open
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      ) : null}
      {showCreateEditor ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-900 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Add Contest
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditor(false);
                  setSelectedId("");
                  setForm(createBlankContest());
                  setMessage("");
                  setError("");
                }}
                className="rounded-md border border-neutral-300 px-3 py-1 text-sm text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                Close
              </button>
            </div>
            <div ref={editorRef}>{editor}</div>
          </div>
        </div>
      ) : null}
      {adminTab === "previous-contests" ? (
        <section className="mt-6 space-y-5">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="heading-section">contest history</h2>
              <button
                type="button"
                onClick={startCreateContest}
                className="w-full rounded-full bg-accent px-4 py-2 text-white dark:bg-emerald-700 sm:w-auto"
              >
                + Add Contest
              </button>
            </div>

            <div className="space-y-3">
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              {message ? (
                <p className="text-sm text-emerald-600">{message}</p>
              ) : null}
              {items.map((item) => (
                <article
                  key={item._id}
                  className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700 dark:bg-neutral-950/40"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p
                        className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100"
                        title={item.title}
                      >
                        {item.title}
                      </p>
                      <div className="mt-2 grid gap-1 text-sm text-prose sm:grid-cols-2 sm:gap-x-6">
                        <p>
                          Submit Date:{" "}
                          <span className="text-prose-muted">
                            {formatDate(item.submitDate)}
                          </span>
                        </p>
                        <p>
                          Result Date:{" "}
                          <span className="text-prose-muted">
                            {formatDate(item.resultDate)}
                          </span>
                        </p>
                        <p>
                          Registration:{" "}
                          <span className="text-prose-muted">
                            {item.registrationOpen === false
                              ? "Closed"
                              : "Open"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <button
                        type="button"
                        onClick={() => editContest(String(item._id))}
                        aria-label="Edit contest"
                        className="inline-flex h-9 w-9 items-center justify-center rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteContest(String(item._id))}
                        aria-label="Delete contest"
                        className="inline-flex h-9 w-9 items-center justify-center rounded bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {showEditEditor ? (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
              <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-900 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Edit Contest
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditor(false);
                      setSelectedId("");
                    }}
                    className="rounded-md border border-neutral-300 px-3 py-1 text-sm text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                  >
                    Close
                  </button>
                </div>
                <div ref={editorRef}>{editor}</div>
              </div>
            </div>
          ) : null}

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="heading-section">Submitted Registrations</h2>
              <p className="text-sm text-prose-muted">
                Total registrations: {registrationItems.length}
              </p>
            </div>
            <label className="text-sm text-neutral-800 dark:text-neutral-200">
              Select Contest
              <select
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                value={selectedRegistrationContestId}
                onChange={(e) =>
                  setSelectedRegistrationContestId(e.target.value)
                }
              >
                {items.map((contest) => (
                  <option key={contest._id} value={contest._id}>
                    {contest.title}
                  </option>
                ))}
              </select>
            </label>
            {registrationLoading ? (
              <p className="mt-4 text-sm text-prose-muted">
                Loading registrations...
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {registrationItems.map((entry) => (
                  <article
                    key={entry._id}
                    className="rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-700"
                  >
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {entry.fullName} ({entry.mobileNumber})
                    </p>
                    <p className="text-prose-muted">{entry.email}</p>
                    <p className="mt-1 text-prose">
                      Video: {entry.shortVideoLink || "-"}
                    </p>
                    <p className="text-prose">
                      Platforms:{" "}
                      {(entry.socialPlatforms || []).join(", ") || "-"}
                    </p>
                    <p className="text-prose">
                      Summary: {entry.strategySummary || "-"}
                    </p>
                  </article>
                ))}
                {!registrationItems.length ? (
                  <p className="text-sm text-prose-muted">
                    No registrations for this contest yet.
                  </p>
                ) : null}
              </div>
            )}
          </section>
        </section>
      ) : null}
      {adminTab === "registration-form" ? (
        <section className="mt-6 space-y-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          {!items.length ? (
            <p className="text-sm text-prose-muted">
              Create a contest first to configure its registration form.
            </p>
          ) : registrationBlueprintLoading || !registrationBlueprintForm ? (
            <p className="text-sm text-prose-muted">
              Loading contest registration settings…
            </p>
          ) : (
            <>
              {/* Section 1: Form blueprint — mode + Google fields when external */}
              <section className="rounded-2xl border border-emerald-800/40 bg-neutral-50 p-5 shadow-sm dark:border-emerald-700/50 dark:bg-neutral-900/80">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-emerald-100">
                  Form Blueprint
                </h3>
                <p className="mt-1 text-sm text-prose-muted">
                  Choose how registration works for this contest. What you see
                  next depends on this choice.
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-prose-muted">
                  Registration Form Mode
                </p>
                <div className="mt-2 flex flex-wrap gap-6">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    <input
                      type="radio"
                      name="contestRegisterModeBlueprint"
                      className="accent-accent dark:accent-emerald-500"
                      checked={
                        registrationBlueprintForm.registerMode === "google"
                      }
                      onChange={() => {
                        setRegistrationBlueprintBuiltinIntroEditorOpen(false);
                        setRegistrationBlueprintGoogleEditorOpen(false);
                        patchRegistrationBlueprint({ registerMode: "google" });
                      }}
                    />
                    Google Form Link
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    <input
                      type="radio"
                      name="contestRegisterModeBlueprint"
                      className="accent-accent dark:accent-emerald-500"
                      checked={
                        registrationBlueprintForm.registerMode !== "google"
                      }
                      onChange={() => {
                        setRegistrationBlueprintGoogleEditorOpen(false);
                        patchRegistrationBlueprint({
                          registerMode: "internal",
                        });
                      }}
                    />
                    Built-in Form
                  </label>
                </div>
                {registrationBlueprintForm.registerMode === "google" ? (
                  <p className="mt-4 border-t border-neutral-200 pt-4 text-sm text-prose-muted dark:border-neutral-700">
                    Open{" "}
                    <span className="font-medium text-neutral-700 dark:text-neutral-200">
                      Preview as user
                    </span>{" "}
                    and click{" "}
                    <span className="font-medium text-neutral-700 dark:text-neutral-200">
                      Edit
                    </span>{" "}
                    to set the Google Form URL, button label, and helper text.
                    The preview card is hidden while you edit.
                  </p>
                ) : (
                  <p className="mt-4 border-t border-neutral-200 pt-4 text-sm text-prose-muted dark:border-neutral-700">
                    Below you will see the built-in preview and the full field
                    reference. Edit the introduction from{" "}
                    <span className="font-medium text-neutral-700 dark:text-neutral-200">
                      Preview as user
                    </span>{" "}
                    →{" "}
                    <span className="font-medium text-neutral-700 dark:text-neutral-200">
                      Edit
                    </span>
                    .
                  </p>
                )}
              </section>

              {registrationBlueprintForm.registerMode !== "google" &&
              registrationBlueprintBuiltinIntroEditorOpen ? (
                <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-700">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Edit built-in form introduction
                      </h3>
                      <p className="mt-0.5 text-sm text-prose-muted">
                        Shown above the registration fields on the public page
                        when Built-in Form is selected.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationBlueprintBuiltinIntroEditorOpen(false);
                        adminRequest(
                          `/api/admin/contests/${registrationBlueprintContestId}`,
                        )
                          .then((data) => {
                            if (data?.contest)
                              setRegistrationBlueprintForm(
                                mapServerToForm(data.contest),
                              );
                          })
                          .catch(() => {});
                      }}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                    >
                      <X className="h-3.5 w-3.5" />
                      Close editor
                    </button>
                  </div>
                  <label className="mt-4 block text-sm text-neutral-800 dark:text-neutral-200">
                    Introduction (plain text)
                    <textarea
                      rows={18}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:[color-scheme:dark]"
                      value={
                        registrationBlueprintForm.builtInRegistrationIntro || ""
                      }
                      onChange={(e) =>
                        patchRegistrationBlueprint({
                          builtInRegistrationIntro: e.target.value,
                        })
                      }
                    />
                  </label>
                  <div className="mt-6 flex flex-wrap justify-end border-t border-neutral-200 pt-4 dark:border-neutral-700">
                    <button
                      type="button"
                      onClick={saveRegistrationBlueprint}
                      disabled={registrationBlueprintSaving}
                      className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-emerald-700"
                    >
                      <Save className="h-4 w-4" />
                      {registrationBlueprintSaving
                        ? "Saving…"
                        : "Save registration settings"}
                    </button>
                  </div>
                </section>
              ) : registrationBlueprintForm.registerMode === "google" &&
                registrationBlueprintGoogleEditorOpen ? (
                <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-700">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Edit Google Form
                      </h3>
                      <p className="mt-0.5 text-sm text-prose-muted">
                        URL, button label, and helper text for the public
                        registration page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationBlueprintGoogleEditorOpen(false);
                        adminRequest(
                          `/api/admin/contests/${registrationBlueprintContestId}`,
                        )
                          .then((data) => {
                            if (data?.contest)
                              setRegistrationBlueprintForm(
                                mapServerToForm(data.contest),
                              );
                          })
                          .catch(() => {});
                      }}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                    >
                      <X className="h-3.5 w-3.5" />
                      Close editor
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Register Now Form
                    </p>
                    <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                      Google Form URL
                      <input
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:[color-scheme:dark]"
                        value={registrationBlueprintForm.googleFormUrl || ""}
                        onChange={(e) =>
                          patchRegistrationBlueprint({
                            googleFormUrl: e.target.value,
                          })
                        }
                        placeholder="https://docs.google.com/forms/..."
                      />
                    </label>
                    <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                      Google Form button label
                      <input
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:[color-scheme:dark]"
                        value={
                          registrationBlueprintForm.googleFormButtonLabel || ""
                        }
                        onChange={(e) =>
                          patchRegistrationBlueprint({
                            googleFormButtonLabel: e.target.value,
                          })
                        }
                        placeholder="e.g. Register Now"
                      />
                    </label>
                    <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                      Helper text (shown above the button)
                      <textarea
                        rows={4}
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:[color-scheme:dark]"
                        value={
                          registrationBlueprintForm.googleFormHelperText || ""
                        }
                        onChange={(e) =>
                          patchRegistrationBlueprint({
                            googleFormHelperText: e.target.value,
                          })
                        }
                        placeholder="Continue your registration using our secure Google Form."
                      />
                    </label>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-end border-t border-neutral-200 pt-4 dark:border-neutral-700">
                    <button
                      type="button"
                      onClick={saveRegistrationBlueprint}
                      disabled={registrationBlueprintSaving}
                      className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-emerald-700"
                    >
                      <Save className="h-4 w-4" />
                      {registrationBlueprintSaving
                        ? "Saving…"
                        : "Save registration settings"}
                    </button>
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-prose-muted">
                        Preview as user
                      </p>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Preview
                      </h3>
                      <p className="mt-1 text-sm text-prose-muted">
                        Read-only. Matches the public registration page when{" "}
                        <span className="font-medium text-neutral-700 dark:text-neutral-200">
                          {registrationBlueprintForm.registerMode === "google"
                            ? "Google Form Link"
                            : "Built-in Form"}
                        </span>{" "}
                        is active.
                      </p>
                    </div>
                    {registrationBlueprintForm.registerMode === "google" ? (
                      <button
                        type="button"
                        onClick={() =>
                          setRegistrationBlueprintGoogleEditorOpen(true)
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setRegistrationBlueprintBuiltinIntroEditorOpen(true)
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-5 dark:border-amber-700/70 dark:bg-amber-950/20">
                    <h4 className="text-lg font-semibold text-accent dark:text-emerald-300">
                      {registrationBlueprintForm.registerMode === "google"
                        ? String(
                            registrationBlueprintForm.googleFormButtonLabel ||
                              "",
                          ).trim() || "Register Now"
                        : registrationBlueprintForm.title || "Contest title"}
                    </h4>
                    {registrationBlueprintForm.registerMode === "google" ? (
                      <div className="mt-4 space-y-3">
                        {registrationBlueprintForm.googleFormHelperText ? (
                          <p className="whitespace-pre-wrap text-sm text-prose-muted">
                            {registrationBlueprintForm.googleFormHelperText}
                          </p>
                        ) : (
                          <p className="text-sm text-prose-muted">
                            This contest uses Google Form registration.
                          </p>
                        )}
                        {registrationBlueprintForm.googleFormUrl ? (
                          <button
                            type="button"
                            disabled
                            className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm text-white opacity-60 dark:bg-emerald-700"
                          >
                            {String(
                              registrationBlueprintForm.googleFormButtonLabel ||
                                "",
                            ).trim() || "Register Now"}
                          </button>
                        ) : (
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                            Google Form URL not set
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 max-h-[min(28rem,55vh)] overflow-y-auto pr-1">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-prose dark:text-neutral-200">
                          {registrationBlueprintForm.builtInRegistrationIntro ||
                            DEFAULT_BUILT_IN_REGISTRATION_INTRO}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Built-in field reference — only when Built-in Form is selected (hidden while editing intro) */}
              {registrationBlueprintForm.registerMode !== "google" &&
              !registrationBlueprintBuiltinIntroEditorOpen ? (
                <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Built-in registration form
                  </h3>
                  <p className="mt-1 text-sm text-prose-muted">
                    Complete field layout used when Form Blueprint is{" "}
                    <span className="font-medium text-neutral-700 dark:text-neutral-200">
                      Built-in Form
                    </span>
                    . Read-only reference; edit the introduction in Preview
                    (Edit). When Google Form Link is selected, visitors do not
                    see this form.
                  </p>
                  <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs whitespace-pre-wrap text-prose-muted dark:border-neutral-700 dark:bg-neutral-950/50">
                    {(
                      registrationBlueprintForm.builtInRegistrationIntro ||
                      DEFAULT_BUILT_IN_REGISTRATION_INTRO
                    ).slice(0, 800)}
                    {(
                      registrationBlueprintForm.builtInRegistrationIntro ||
                      DEFAULT_BUILT_IN_REGISTRATION_INTRO
                    ).length > 800
                      ? "…"
                      : ""}
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <input
                      disabled
                      placeholder="Full Name"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                    />
                    <input
                      disabled
                      placeholder="Email"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                    />
                    <input
                      disabled
                      placeholder="Mobile Number"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                    />
                    <input
                      disabled
                      placeholder="Short video link"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                    />
                    <label className="text-sm text-prose-muted md:col-span-2">
                      <input
                        disabled
                        type="checkbox"
                        className="mr-2 align-middle"
                      />
                      Have you watched the official contest rules video?
                    </label>
                    <label className="text-sm text-prose-muted md:col-span-2">
                      <input
                        disabled
                        type="checkbox"
                        className="mr-2 align-middle"
                      />
                      Have you joined the Arattai App community?
                    </label>
                    <label className="text-sm text-prose-muted md:col-span-2">
                      <span className="mb-2 block font-medium text-neutral-700 dark:text-neutral-200">
                        Social media platforms
                      </span>
                      <span className="grid gap-2 sm:grid-cols-2">
                        {[
                          "YouTube",
                          "Instagram",
                          "X (Twitter)",
                          "Facebook",
                          "Other",
                        ].map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-2 opacity-70"
                          >
                            <input
                              disabled
                              type="checkbox"
                              className="accent-accent dark:accent-emerald-500"
                            />
                            {item}
                          </span>
                        ))}
                      </span>
                    </label>
                    <textarea
                      disabled
                      rows={4}
                      placeholder="Brief summary of your strategy"
                      className="md:col-span-2 w-full rounded-lg border border-neutral-300 px-3 py-2 opacity-70 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                    />
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        disabled
                        className="rounded-lg bg-accent px-4 py-2 text-sm text-white opacity-50 dark:bg-emerald-700"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </section>
              ) : null}

              {!registrationBlueprintBuiltinIntroEditorOpen &&
              !registrationBlueprintGoogleEditorOpen ? (
                <div className="flex justify-end border-t border-neutral-200 pt-4 dark:border-neutral-700">
                  <button
                    type="button"
                    onClick={saveRegistrationBlueprint}
                    disabled={registrationBlueprintSaving}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" />
                    {registrationBlueprintSaving
                      ? "Saving…"
                      : "Save registration settings"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      ) : null}
    </Container>
  );
}
