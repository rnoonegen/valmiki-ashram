import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { adminRequest } from "../admin/api";
import Container from "../components/Container";
import ImageUploader from "../components/admin/ImageUploader";
import PageFade from "../components/PageFade";
import useLiveContent from "../hooks/useLiveContent";

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

const aboutCampImages = [
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
];

const highlightImages = [
  "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80",
];

const defaultAboutCamp = {
  heading: "Winter Camp",
  intro:
    "The winter camp serves as an introduction to our full-time residential Gurukulam, launching in December 2026. It offers homeschooling families a unique opportunity to experience a comprehensive learning environment, where diverse educational opportunities are seamlessly integrated within a single campus.",
  adventureHeading: "Embark on an Unforgettable Winter Family Adventure!",
  adventureBody:
    "Experience an enriching 7-day residential family winter camp tailored for children aged 7 to 15 and parents.",
  ageHeading: "Age Guidelines:",
  ageGuidelines: [
    "5-8 years: Parent/guardian required",
    "9-15 years: Independent participation allowed",
  ],
  images: aboutCampImages,
};

export default function WinterCamp() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin/winter-camp";
  const cms = useLiveContent("winter-camp", {
    aboutCamp: defaultAboutCamp,
  });
  const [activeTab, setActiveTab] = useState("about");
  const [activeChecklistTab, setActiveChecklistTab] = useState("checklist");
  const [draft, setDraft] = useState(cms);
  const [aboutEditor, setAboutEditor] = useState(null);
  const [saveError, setSaveError] = useState("");

  useEffect(() => setDraft(cms), [cms]);

  const saveWinterCampContent = async (nextContent) => {
    try {
      setSaveError("");
      await adminRequest("/api/admin/content/winter-camp", {
        method: "PUT",
        body: JSON.stringify({ content: nextContent }),
      });
      return true;
    } catch (error) {
      setSaveError(error?.message || "Failed to save winter camp content.");
      return false;
    }
  };

  const display = isAdmin ? draft : cms;
  const aboutCamp = {
    ...defaultAboutCamp,
    ...(display.aboutCamp || {}),
    ageGuidelines:
      display.aboutCamp?.ageGuidelines?.length
        ? display.aboutCamp.ageGuidelines
        : defaultAboutCamp.ageGuidelines,
    images: display.aboutCamp?.images?.length
      ? display.aboutCamp.images
      : defaultAboutCamp.images,
  };

  const content = useMemo(() => {
    if (activeTab === "batches") {
      return (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div>
            <h3 className="text-2xl font-semibold text-prose">Camp Batches</h3>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-prose-muted">
              <li>Batch 1: Dec 24th to Dec 30th</li>
            </ol>
            <p className="mt-6 text-base leading-8 text-prose-muted">
              Set amidst the vast 70-acre Forest Ridge campus in Hyderabad, this
              immersive program combines traditional learning with modern
              activities, promoting personal development, creativity, and
              unforgettable experiences.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-primary/50 p-6 dark:border-neutral-700 dark:bg-neutral-800/80">
            <p className="text-base leading-8 text-prose-muted">
              Families can expect a balanced routine that includes physical
              training, creative exploration, self-discipline, and joyful
              community bonding throughout the 7-day experience.
            </p>
          </div>
        </div>
      );
    }

    if (activeTab === "highlights") {
      return (
        <div>
          <h3 className="text-2xl font-semibold text-prose">Camp Highlights</h3>
          <p className="mt-4 text-base leading-8 text-prose-muted">
            The winter camp serves as an introduction to our full-time
            residential Gurukulam, launching in December 2026. It offers
            homeschooling families a unique opportunity to experience a
            comprehensive learning environment, where diverse educational
            opportunities are seamlessly integrated within a single campus.
          </p>
          <p className="mt-5 text-lg font-semibold text-prose">
            Embark on an Unforgettable Winter Family Adventure!
          </p>
          <p className="mt-2 text-base leading-8 text-prose-muted">
            Experience an enriching 7-day residential family winter camp
            tailored for children aged 7 to 15 and parents.
          </p>
          <ul className="mt-5 list-disc space-y-2 pl-6 text-prose-muted">
            <li>Traditional Indian games and Mallakhamb sessions</li>
            <li>Yoga, meditation, and mindful daily routines</li>
            <li>Farming, nature exposure, and activity-based learning</li>
            <li>Arts, storytelling, and team-building experiences</li>
          </ul>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlightImages.map((image, index) => (
              <div
                key={image}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              >
                <img
                  src={image}
                  alt={`Winter camp highlight ${index + 1}`}
                  className="h-52 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "checklist") {
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
                <div>
                  <h4 className="text-xl font-semibold text-prose">Clothing</h4>
                  <ol className="mt-3 list-decimal space-y-2 pl-6 text-prose-muted">
                    <li>
                      <span className="font-medium text-prose">
                        Traditional Attire (Gurukul dress code):
                      </span>{" "}
                      Two sets of cotton outfits (Salwar Kameez with sleeves and
                      Lehenga for girls; Kurta Pyjama with track pants for
                      boys).
                    </li>
                    <li>
                      <span className="font-medium text-prose">
                        Casual Wear:
                      </span>{" "}
                      Five sets of everyday clothing, preferably lightweight and
                      breathable fabrics like cotton.
                    </li>
                    <li>
                      <span className="font-medium text-prose">
                        Sports Wear:
                      </span>{" "}
                      Four sets of athletic apparel suitable for physical
                      activities.
                    </li>
                    <li>
                      <span className="font-medium text-prose">
                        MallaKhamb Wear:
                      </span>{" "}
                      Shorts for boys and leggings or caprice for girls.
                    </li>
                    <li>
                      <span className="font-medium text-prose">
                        Undergarments:
                      </span>{" "}
                      Sufficient quantity (approximately ten pairs).
                    </li>
                    <li>
                      <span className="font-medium text-prose">Swim Wear:</span>{" "}
                      Swim dress, swim short for boys and full swimsuit for
                      girls.
                    </li>
                    <li>
                      <span className="font-medium text-prose">Jacket</span>
                    </li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-prose">
                    Toiletries
                  </h4>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-prose-muted">
                    <li>
                      <span className="font-medium text-prose">
                        Personal Hygiene Kit:
                      </span>{" "}
                      Includes toothbrush, toothpaste, tongue cleaner, soap,
                      shampoo and coconut oil.
                    </li>
                    <li>
                      <span className="font-medium text-prose">
                        Laundry Bag:
                      </span>{" "}
                      For storing used garments.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-prose">
                    Miscellaneous Items
                  </h4>
                  <ol className="mt-3 list-decimal space-y-2 pl-6 text-prose-muted">
                    <li>
                      <span className="font-medium text-prose">
                        Stationary:
                      </span>
                      <ul className="mt-2 list-disc space-y-1 pl-6 text-prose-muted">
                        <li>Art supplies</li>
                        <li>Sketch pens</li>
                        <li>Color pencils</li>
                        <li>Crayons</li>
                        <li>Watercolors</li>
                        <li>Paints</li>
                        <li>Watercolor papers</li>
                        <li>Art book</li>
                        <li>Paint brushes</li>
                      </ul>
                    </li>
                    <li>Daypack: A small backpack suitable for excursions.</li>
                    <li>
                      Bed pack: Two bed sheets, thick blanket (as it gets cold
                      in the night) and two pillow covers.
                    </li>
                    <li>Yoga mat</li>
                    <li>
                      <span className="font-medium text-prose">Footwear:</span>
                      <ul className="mt-2 list-disc space-y-1 pl-6 text-prose-muted">
                        <li>Sports shoes: Comfortable pairs for activities.</li>
                        <li>Socks: Around five pairs.</li>
                        <li>Slippers: For casual wear.</li>
                      </ul>
                    </li>
                    <li>
                      <span className="font-medium text-prose">
                        Hydration Supplies:
                      </span>
                      <ul className="mt-2 list-disc space-y-1 pl-6 text-prose-muted">
                        <li>Insulated flask: For hot beverages.</li>
                        <li>Water bottle: Durable and refillable.</li>
                      </ul>
                    </li>
                    <li>Locks: Number lock small size - 2.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-xl font-semibold text-prose">Reminders</h4>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-prose-muted">
                  <li>
                    <span className="font-medium text-prose">Labeling:</span>{" "}
                    Clearly mark all personal items with a permanent marker
                    using your child&apos;s unique admission number to prevent
                    mix-ups.
                  </li>
                  <li>
                    <span className="font-medium text-prose">
                      Inventory List:
                    </span>{" "}
                    Provide a detailed checklist of all belongings accompanying
                    your child to the camp.
                  </li>
                </ul>
                <p className="mt-5 text-base leading-8 text-prose-muted">
                  By ensuring your child is equipped with these essentials, they
                  will be well-prepared to fully engage in all the enriching
                  activities the winter camp offers.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        {isAdmin ? (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() =>
                setAboutEditor({
                  ...aboutCamp,
                  ageGuidelines: [...aboutCamp.ageGuidelines],
                  images: [...aboutCamp.images],
                })
              }
              className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white dark:bg-emerald-700"
            >
              <Pencil className="h-4 w-4" /> Edit About Camp
            </button>
          </div>
        ) : null}
        <h3 className="text-2xl font-semibold text-prose">{aboutCamp.heading}</h3>
        <p className="mt-4 text-base leading-8 text-prose-muted">
          {aboutCamp.intro}
        </p>
        <p className="mt-6 text-lg font-semibold text-prose">
          {aboutCamp.adventureHeading}
        </p>
        <p className="mt-2 text-base leading-8 text-prose-muted">
          {aboutCamp.adventureBody}
        </p>
        <ul className="mt-5 list-disc space-y-2 pl-6 text-prose-muted">
          <li>
            <span className="font-medium text-prose">{aboutCamp.ageHeading}</span>
          </li>
          {aboutCamp.ageGuidelines.map((line, index) => (
            <li key={`${line}-${index}`}>{line}</li>
          ))}
        </ul>

        <div className="mt-7 space-y-3">
          {isAdmin ? (
            <div className="flex justify-end">
              <ImageUploader
                folder="winter-camp"
                buttonText="Add Image"
                onUploaded={(asset) => {
                  setDraft((prev) => {
                    const currentAbout = {
                      ...defaultAboutCamp,
                      ...(prev.aboutCamp || {}),
                    };
                    const next = {
                      ...prev,
                      aboutCamp: {
                        ...currentAbout,
                        images: [...(currentAbout.images || []), asset.url],
                      },
                    };
                    saveWinterCampContent(next);
                    return next;
                  });
                }}
              />
            </div>
          ) : null}
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-4">
              {aboutCamp.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative w-72 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <img
                    src={image}
                    alt={`Winter camp activity ${index + 1}`}
                    className="h-52 w-full object-cover"
                    loading="lazy"
                  />
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const images = aboutCamp.images.filter((_, i) => i !== index);
                        const next = {
                          ...draft,
                          aboutCamp: { ...aboutCamp, images },
                        };
                        setDraft(next);
                        await saveWinterCampContent(next);
                      }}
                      className="absolute right-2 top-2 rounded-md bg-rose-600 p-1 text-white"
                      aria-label="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }, [aboutCamp, activeChecklistTab, activeTab, draft, isAdmin]);

  return (
    <PageFade>
      <section className="border-b border-neutral-200 bg-secondary/35 py-10 dark:border-neutral-700 dark:bg-neutral-950/70 md:py-14">
        <Container>
          <h1 className="heading-page">Winter Camp Details</h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register/summer-camp"
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              Registration
            </Link>
            <Link
              to="/winter-camp/schedule"
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
      </Container>

      {isAdmin && aboutEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit About Camp
            </h3>

            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Heading"
                value={aboutEditor.heading}
                onChange={(e) =>
                  setAboutEditor((p) => ({ ...p, heading: e.target.value }))
                }
              />
              <textarea
                className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Intro text"
                value={aboutEditor.intro}
                onChange={(e) =>
                  setAboutEditor((p) => ({ ...p, intro: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Adventure heading"
                value={aboutEditor.adventureHeading}
                onChange={(e) =>
                  setAboutEditor((p) => ({
                    ...p,
                    adventureHeading: e.target.value,
                  }))
                }
              />
              <textarea
                className="h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Adventure description"
                value={aboutEditor.adventureBody}
                onChange={(e) =>
                  setAboutEditor((p) => ({
                    ...p,
                    adventureBody: e.target.value,
                  }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Age section heading"
                value={aboutEditor.ageHeading}
                onChange={(e) =>
                  setAboutEditor((p) => ({ ...p, ageHeading: e.target.value }))
                }
              />

              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="mb-2 text-sm font-medium text-prose">Age Guideline Lines</p>
                <div className="space-y-2">
                  {aboutEditor.ageGuidelines.map((line, index) => (
                    <div key={`age-line-${index}`} className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                        value={line}
                        onChange={(e) =>
                          setAboutEditor((p) => {
                            const lines = [...p.ageGuidelines];
                            lines[index] = e.target.value;
                            return { ...p, ageGuidelines: lines };
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAboutEditor((p) => ({
                            ...p,
                            ageGuidelines: p.ageGuidelines.filter((_, i) => i !== index),
                          }))
                        }
                        className="rounded-lg bg-rose-600 px-2 text-white"
                        aria-label="Delete guideline line"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAboutEditor((p) => ({
                      ...p,
                      ageGuidelines: [...p.ageGuidelines, ""],
                    }))
                  }
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-white dark:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" /> Add Line
                </button>
              </div>

              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="mb-2 text-sm font-medium text-prose">About Camp Images</p>
                <div className="space-y-2">
                  {aboutEditor.images.map((image, index) => (
                    <div key={`about-image-${index}`} className="space-y-2 rounded-lg border border-neutral-200 p-2 dark:border-neutral-700">
                      <img
                        src={image}
                        alt={`About camp ${index + 1}`}
                        className="h-24 w-full rounded object-cover"
                      />
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                          value={image}
                          onChange={(e) =>
                            setAboutEditor((p) => {
                              const images = [...p.images];
                              images[index] = e.target.value;
                              return { ...p, images };
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setAboutEditor((p) => ({
                              ...p,
                              images: p.images.filter((_, i) => i !== index),
                            }))
                          }
                          className="rounded-lg bg-rose-600 px-2 text-white"
                          aria-label="Delete image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAboutEditor((p) => ({
                        ...p,
                        images: [...p.images, ""],
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-white dark:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" /> Add Image URL
                  </button>
                  <ImageUploader
                    folder="winter-camp"
                    buttonText="Upload Image"
                    onUploaded={(asset) =>
                      setAboutEditor((p) => ({
                        ...p,
                        images: [...p.images, asset.url],
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {saveError ? (
              <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
                {saveError}
              </p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  const next = {
                    ...draft,
                    aboutCamp: {
                      ...aboutEditor,
                      ageGuidelines: aboutEditor.ageGuidelines.filter((line) =>
                        line.trim()
                      ),
                      images: aboutEditor.images.filter((img) => img.trim()),
                    },
                  };
                  setDraft(next);
                  const ok = await saveWinterCampContent(next);
                  if (ok) setAboutEditor(null);
                }}
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
    </PageFade>
  );
}
