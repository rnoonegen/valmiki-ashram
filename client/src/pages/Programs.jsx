import clsx from "clsx";
import { motion } from "framer-motion";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
 // import { FaWhatsapp } from "react-icons/fa";//remove this import if whatsapp community link is not needed
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { adminRequest } from "../admin/api";
import ImageUploader from "../components/admin/ImageUploader";
import Button from "../components/Button";
import Container from "../components/Container";
import PageFade from "../components/PageFade";
import { useTheme } from "../context/ThemeContext";
import useLiveContent from "../hooks/useLiveContent";

/**
 * Same Unsplash URLs as `programCards` in Home.jsx — used as CMS defaults until DB has content.
 */
const HOME_GURUKULAM_IMAGE =
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80";
const HOME_SEASONAL_CAMPS_IMAGE =
  "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1000&q=80";
const HOME_ONLINE_IMAGE =
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1000&q=80";

/** Placeholder for “Why are we special?” — education / India context (stable Unsplash URL). */
const WHY_SPECIAL_IMAGE =
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";

const WHY_SPECIAL_HEADING = "Why are we special?";
const WHY_SPECIAL_BODY =
  "Valmiki Ashram brings together ancient Indian wisdom and modern education in a way that nurtures both the mind and spirit. Children here don't just study—they live, learn, and grow in a community rooted in values, creativity, and nature.";
// const WHATSAPP_COMMUNITY_LINK =
//   process.env.REACT_APP_WHATSAPP_COMMUNITY_LINK || "";
// const WHATSAPP_COMMUNITY_HEADING =
//   "To stay updated, join our WhatsApp Community";

const defaultWhySpecial = {
  heading: WHY_SPECIAL_HEADING,
  body: WHY_SPECIAL_BODY,
  image: WHY_SPECIAL_IMAGE,
  buttonLabel: "Learn More",
  buttonTo: "/about",
};

// const defaultCommunityCta = {
//   heading: WHATSAPP_COMMUNITY_HEADING,
//   buttonLabel: "Join the Community",
//   buttonHref: WHATSAPP_COMMUNITY_LINK,
// };

function WhySpecialSection({ isAdmin, content, onEdit, onImageUploaded }) {
  const { theme } = useTheme();

  return (

    <motion.section
      className="pt-4 pb-6 md:pt-6 md:pb-8 lg:pt-8 lg:pb-10"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      aria-labelledby="programs-why-special-heading"
    >
      <Container>
        <div
          className={clsx(
            "relative rounded-2xl border border-theme p-6 md:p-8 lg:p-10",
            theme === "dark"
              ? "bg-neutral-900 text-neutral-100"
              : "bg-[#FEF9E7] text-neutral-900"
          )}
        >
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
          {isAdmin ? (
            <button
              type="button"
              onClick={onEdit}
              className="absolute right-0 top-0 z-10 rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
              aria-label="Edit why special section"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1 lg:order-1">
            <h2 id="programs-why-special-heading" className="heading-section">
              {content.heading || defaultWhySpecial.heading}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-prose md:text-lg">
              {content.body || defaultWhySpecial.body}
            </p>
            <Button
              to={content.buttonTo || defaultWhySpecial.buttonTo}
              variant="outline"
              className="mt-6"
            >
              {content.buttonLabel || defaultWhySpecial.buttonLabel}
            </Button>
          </div>
          <div className="min-w-0 flex-1 lg:order-2">
            <div className="group/image relative overflow-hidden rounded-2xl border border-theme shadow-nav ring-1 ring-black/5 dark:shadow-nav-dark dark:ring-white/10">
              <img
                src={content.image || defaultWhySpecial.image}
                alt="Children learning together in an educational setting"
                className="aspect-[4/3] w-full object-cover"
                width={1200}
                height={900}
                loading="lazy"
                decoding="async"
              />
              {isAdmin ? (
                <div className="absolute inset-x-2 bottom-2 flex justify-end">
                  <ImageUploader
                    folder="programs"
                    buttonText="Change Image"
                    onUploaded={onImageUploaded}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        </div>
      </Container>
    </motion.section>
  );
}

// function WhatsAppCommunitySection({ isAdmin, content, onEdit }) {
//   const { theme } = useTheme();

//   return (
//     <motion.section
//       className={clsx(
//         "border-b border-theme py-12 sm:py-14 md:py-16",
//         theme === "dark"
//           ? "bg-neutral-950 text-neutral-100"
//           : "bg-white text-neutral-900"
//       )}
//       initial={{ opacity: 0, y: 14 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, margin: "-40px" }}
//       transition={{ duration: 0.4 }}
//       aria-labelledby="programs-whatsapp-heading"
//     >
//       <Container>
//         <div className="relative mx-auto max-w-5xl text-center">
//           {isAdmin ? (
//             <button
//               type="button"
//               onClick={onEdit}
//               className="absolute right-0 top-0 z-10 rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
//               aria-label="Edit WhatsApp section"
//             >
//               <Pencil className="h-4 w-4" />
//             </button>
//           ) : null}
//           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-3xl font-semibold text-white shadow-nav ring-1 ring-black/10 dark:bg-emerald-600 dark:shadow-nav-dark dark:ring-white/10 sm:h-20 sm:w-20">
//             <span aria-hidden="true">
//               <FaWhatsapp className="h-9 w-9 sm:h-11 sm:w-11" />
//             </span>
//           </div>

//           <h2
//             id="programs-whatsapp-heading"
//             className="mt-6 text-4xl font-bold leading-tight text-accent dark:text-emerald-200 sm:text-5xl md:text-6xl"
//           >
//             {content.heading || defaultCommunityCta.heading}
//           </h2>

//           <div className="mt-7">
//             <Button
//               href={content.buttonHref || defaultCommunityCta.buttonHref}
//               className="rounded-full px-8 py-3 text-base sm:text-lg"
//             >
//               {content.buttonLabel || defaultCommunityCta.buttonLabel}
//             </Button>
//           </div>
//         </div>
//       </Container>
//     </motion.section>
//   );
// }

const defaultProgramCards = [
  {
    key: "summer",
    title: "Summer Camp",
    image: HOME_SEASONAL_CAMPS_IMAGE,
    imageAlt: "Children learning outdoors at camp",
    body: "Our summer camps offer exciting activities that ignite curiosity and build resilience, allowing kids to connect with their roots while developing modern critical thinking. Through adventure, creativity, and hands-on discovery, they learn, grow, and create lifelong memories—all while having fun!",
    to: "/summer-camp",
    buttonLabel: "Learn More",
  },
  {
    key: "winter",
    title: "Winter Camp",
    image: HOME_SEASONAL_CAMPS_IMAGE,
    imageAlt: "Seasonal camp learning and activities",
    body: "Our winter cohort brings martial arts, robotics, yoga, gamified math, and more into a focused seasonal immersion. Shorter days, warm community, and hands-on projects help children stay active, curious, and connected to learning through the cooler months.",
    to: "/winter-camp",
    buttonLabel: "Learn More",
  },
  {
    key: "nri",
    title: "NRI Summer Camp",
    image: HOME_SEASONAL_CAMPS_IMAGE,
    imageAlt: "Students learning together",
    body: "Designed with NRI families in mind, our summer camp helps children bond with Bharatiya culture, language, and values while visiting or reconnecting from abroad. Structured activities, caring mentors, and peers from similar journeys make it easy to feel at home and return with confidence and lasting friendships.",
    to: "/summer-camp",
    buttonLabel: "Learn More",
  },
  {
    key: "gurukulam",
    title: "Gurukulam",
    image: HOME_GURUKULAM_IMAGE,
    imageAlt: "Residential Gurukulam learning environment",
    body: "The Gurukulam is our full-time residential pathway—Shatpatha Shiksha blending academics, Indian knowledge systems, and life skills. Children learn at their own pace through real-world projects, memory training, stories, and hands-on challenges in a supportive family-style community.",
    to: "/gurukulam",
    buttonLabel: "Learn More",
  },
  {
    key: "online",
    title: "Online Programs",
    image: HOME_ONLINE_IMAGE,
    imageAlt: "Online learning and workshops",
    body: "Learn from anywhere with live and flexible offerings: Samskrutham, Ayurveda, astronomy, video editing, and more. Weekend and online courses welcome all ages, so families can deepen skills and culture without leaving home.",
    to: "/online-programs",
    buttonLabel: "Learn More",
  },
];

function ProgramCard({
  card,
  index,
  isAdmin,
  onEdit,
  onDelete,
  setDraft,
  saveProgramsContent,
}) {
  return (
    <motion.article
      className="relative flex h-full flex-col rounded-2xl border-2 border-accent/35 bg-secondary/90 p-6 shadow-sm dark:border-emerald-700/40 dark:bg-neutral-900 dark:shadow-nav-dark"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
    >
      {isAdmin ? (
        <div className="absolute right-3 top-3 z-10 flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(index)}
            className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
            aria-label="Edit program card"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="rounded-md bg-rose-600 p-1 text-white shadow"
            aria-label="Delete program card"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <div className="group/image relative mb-4 overflow-hidden rounded-xl">
        {card.image ? (
          <img
            src={card.image}
            alt={card.imageAlt || card.title}
            className="h-36 w-full rounded-xl object-cover transition-transform duration-300 ease-out group-hover/image:scale-105 sm:h-40 md:h-44"
            width={1000}
            height={440}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-36 rounded-xl bg-primary/60 dark:bg-neutral-800 sm:h-40 md:h-44" />
        )}
        {isAdmin ? (
          <div className="absolute inset-x-2 bottom-2 flex justify-end">
            <ImageUploader
              folder="programs"
              buttonText={card.image ? "Change Image" : "Add Image"}
              onUploaded={(asset) =>
                setDraft((p) => {
                  const base = p.programCards?.length
                    ? p.programCards
                    : defaultProgramCards;
                  const cards = [...base];
                  cards[index] = { ...cards[index], image: asset.url };
                  const next = { ...p, programCards: cards };
                  saveProgramsContent(next);
                  return next;
                })
              }
            />
          </div>
        ) : null}
      </div>
      <h3 className="heading-card">{card.title}</h3>
      <p className="mt-2 flex-1 text-sm text-prose-muted">{card.body}</p>
      <Button to={card.to} className="mt-4 self-start">
        {card.buttonLabel || "Learn More"}
      </Button>
    </motion.article>
  );
}

export default function Programs() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin/programs";
  const cms = useLiveContent("programs", {
    programCards: defaultProgramCards,
  });
  const [draft, setDraft] = useState(cms);
  const [cardEditor, setCardEditor] = useState(null);
  const [sectionEditor, setSectionEditor] = useState(null);

  useEffect(() => setDraft(cms), [cms]);

  const saveProgramsContent = async (nextContent) => {
    await adminRequest("/api/admin/content/programs", {
      method: "PUT",
      body: JSON.stringify({ content: nextContent }),
    });
  };

  const display = isAdmin ? draft : cms;
  const displayCards = (
    display.programCards?.length ? display.programCards : defaultProgramCards
  ).slice(0, 24);
  const whySpecial = { ...defaultWhySpecial, ...(display.whySpecial || {}) };
  // const communityCta = { ...defaultCommunityCta, ...(display.communityCta || {}) };

  const openCardEditor = (index) => {
    const card = Number.isInteger(index) ? displayCards[index] : undefined;
    setCardEditor({
      index,
      isNew: !card,
      key: card?.key || `program-${Date.now()}`,
      title: card?.title || "",
      body: card?.body || "",
      path: card?.to || "/programs",
      buttonLabel: card?.buttonLabel || "Learn More",
      image: card?.image || "",
      imageAlt: card?.imageAlt || "",
    });
  };

  const saveCardEditor = async () => {
    if (!cardEditor) return;
    const base = draft.programCards?.length
      ? [...draft.programCards]
      : [...defaultProgramCards];
    const payload = {
      key: cardEditor.key || `program-${Date.now()}`,
      title: cardEditor.title || "Untitled",
      body: cardEditor.body || "",
      to: cardEditor.path || "/programs",
      buttonLabel: cardEditor.buttonLabel || "Learn More",
      image: cardEditor.image || "",
      imageAlt: cardEditor.imageAlt || "",
    };
    if (cardEditor.isNew) {
      base.push(payload);
    } else {
      base[cardEditor.index] = payload;
    }
    const next = { ...draft, programCards: base };
    setDraft(next);
    await saveProgramsContent(next);
    setCardEditor(null);
  };

  const openSectionEditor = (sectionKey, content) => {
    setSectionEditor({
      sectionKey,
      content: { ...(content || {}) },
    });
  };

  const saveSectionEditor = async () => {
    if (!sectionEditor) return;
    const next = {
      ...draft,
      [sectionEditor.sectionKey]: sectionEditor.content,
    };
    setDraft(next);
    await saveProgramsContent(next);
    setSectionEditor(null);
  };

  const deleteCard = async (index) => {
    const base = draft.programCards?.length
      ? [...draft.programCards]
      : [...defaultProgramCards];
    const cards = base.filter((_, i) => i !== index);
    const next = { ...draft, programCards: cards };
    setDraft(next);
    await saveProgramsContent(next);
  };

  return (
    <PageFade>
      <section className="surface-muted py-10 md:py-14">
        <Container>
          <h1 className="heading-page">Our Programs</h1>
          <p className="mt-4 max-w-2xl text-prose">
            Explore camps, online offerings, and pathways into the Gurukulam.
          </p>

          {isAdmin ? (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => openCardEditor()}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Card
              </button>
            </div>
          ) : null}

          <ul className="mt-8 grid list-none grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {displayCards.map((card, index) => (
              <li key={card.key || `${card.title}-${index}`} className="min-w-0">
                <ProgramCard
                  card={card}
                  index={index}
                  isAdmin={isAdmin}
                  onEdit={openCardEditor}
                  onDelete={deleteCard}
                  setDraft={setDraft}
                  saveProgramsContent={saveProgramsContent}
                />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <WhySpecialSection
        isAdmin={isAdmin}
        content={whySpecial}
        onEdit={() => openSectionEditor("whySpecial", whySpecial)}
        onImageUploaded={(asset) => {
          const next = {
            ...draft,
            whySpecial: { ...whySpecial, image: asset.url },
          };
          setDraft(next);
          saveProgramsContent(next);
        }}
      />
      {/* <WhatsAppCommunitySection
        isAdmin={isAdmin}
        content={communityCta}
        onEdit={() => openSectionEditor("communityCta", communityCta)}
      /> */}

      {isAdmin && cardEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {cardEditor.isNew ? "Add Program Card" : "Edit Program Card"}
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Card Image
                </p>
                {cardEditor.image ? (
                  <img
                    src={cardEditor.image}
                    alt={cardEditor.title || "Program card preview"}
                    className="mb-2 h-28 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-2 h-28 w-full rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                )}
                <ImageUploader
                  folder="programs"
                  buttonText={cardEditor.image ? "Change Image" : "Add Image"}
                  onUploaded={(asset) =>
                    setCardEditor((p) => ({ ...p, image: asset.url }))
                  }
                />
              </div>
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Image alt text (accessibility)"
                value={cardEditor.imageAlt}
                onChange={(e) =>
                  setCardEditor((p) => ({ ...p, imageAlt: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Title"
                value={cardEditor.title}
                onChange={(e) =>
                  setCardEditor((p) => ({ ...p, title: e.target.value }))
                }
              />
              <textarea
                className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Description"
                value={cardEditor.body}
                onChange={(e) =>
                  setCardEditor((p) => ({ ...p, body: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Route path (e.g. /summer-camp)"
                value={cardEditor.path}
                onChange={(e) =>
                  setCardEditor((p) => ({ ...p, path: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Button label"
                value={cardEditor.buttonLabel}
                onChange={(e) =>
                  setCardEditor((p) => ({ ...p, buttonLabel: e.target.value }))
                }
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveCardEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setCardEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && sectionEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit Why are we special
            </h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Heading"
                value={sectionEditor.content.heading || ""}
                onChange={(e) =>
                  setSectionEditor((p) => ({
                    ...p,
                    content: { ...p.content, heading: e.target.value },
                  }))
                }
              />

              <textarea
                className="h-28 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Body text"
                value={sectionEditor.content.body || ""}
                onChange={(e) =>
                  setSectionEditor((p) => ({
                    ...p,
                    content: { ...p.content, body: e.target.value },
                  }))
                }
              />
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Section Image
                </p>
                {sectionEditor.content.image ? (
                  <img
                    src={sectionEditor.content.image}
                    alt={sectionEditor.content.heading || "Why special preview"}
                    className="mb-2 h-28 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-2 h-28 w-full rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                )}
                <ImageUploader
                  folder="programs"
                  buttonText={sectionEditor.content.image ? "Change Image" : "Add Image"}
                  onUploaded={(asset) =>
                    setSectionEditor((p) => ({
                      ...p,
                      content: { ...p.content, image: asset.url },
                    }))
                  }
                />
              </div>
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Button label"
                value={sectionEditor.content.buttonLabel || ""}
                onChange={(e) =>
                  setSectionEditor((p) => ({
                    ...p,
                    content: { ...p.content, buttonLabel: e.target.value },
                  }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Button route (e.g. /about)"
                value={sectionEditor.content.buttonTo || ""}
                onChange={(e) =>
                  setSectionEditor((p) => ({
                    ...p,
                    content: { ...p.content, buttonTo: e.target.value },
                  }))
                }
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveSectionEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setSectionEditor(null)}
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
