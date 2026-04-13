import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { adminRequest } from "../admin/api";
import Button from "../components/Button";
import ImageUploader from "../components/admin/ImageUploader";
import Container from "../components/Container";
import VideoPlayer, { getYoutubeEmbedUrl } from "../components/VideoPlayer";
import useLiveContent from "../hooks/useLiveContent";

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.4 },
};

/** Used when CMS `introVideoUrl` and `REACT_APP_INTRO_VIDEO_URL` are both empty (e.g. fresh DB / Docker build). */
const DEFAULT_HOME_INTRO_VIDEO_URL =
  "https://www.youtube.com/watch?v=vciPv_GGQ0E";

const programCards = [
  {
    title: "Residential Gurukulam",
    body: "Shatpatha Shiksha blending academics, IKS, and life skills.",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80",
    path: "/gurukulam",
    buttonLabel: "Explore",
  },
  {
    title: "Seasonal Camps",
    body: "Summer & winter immersions in martial arts, robotics, yoga, and more.",
    image:
      "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1000&q=80",
    path: "/programs",
    buttonLabel: "View Camps",
  },
  {
    title: "Online & Weekend",
    body: "Samskrutham, Ayurveda, astronomy, and skill workshops for all ages.",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1000&q=80",
    path: "/online-programs",
    buttonLabel: "Join Online",
  },
];

const defaultTestimonials = [
  {
    quote:
      "The stories haven't stopped since the day my daughter got back. From kayaking and jumping into the pool with the lily pad, to all the friends she made and the games they played in the fields. It was the kind of childhood joy we all wish we had. She keeps saying, 'Can I go again next year?' And honestly, we're already looking forward to it.",
    author: "Janaki (parent)",
  },
  {
    quote:
      "The first thing my son said when he came back was, 'I already miss the cows!' He had the best time playing in the mud, farming, doing pottery... things kids these days don't usually get to experience. It was so refreshing to see him so happy, grounded, and full of stories. We're really grateful he got to be part of something like this.",
    author: "Naveen (parent)",
  },
  {
    quote:
      "My son started waking up early in the morning even after coming back home. That really surprised us. The camp taught him discipline and helped him build a proper routine. He told us about doing yoga, morning prayers and farming. In just two weeks, there was a noticeable change in him and he seems more responsible and grounded.",
    author: "Shiva (parent)",
  },
  {
    quote:
      "My daughter came back with so much confidence. She now speaks clearly, helps at home, and even teaches her younger brother simple yoga stretches every morning.",
    author: "Meera (parent)",
  },
  {
    quote:
      "I expected a normal camp, but this was transformative. My son learned discipline, teamwork, and respect for nature. We saw a major mindset shift in just a short time.",
    author: "Raghav (parent)",
  },
  {
    quote:
      "The balance between tradition and modern learning is excellent. My child enjoyed the activities while also developing better focus and daily habits.",
    author: "Kavitha (parent)",
  },
  {
    quote:
      "After returning, my son reduced screen time on his own and started spending evenings in outdoor play. That one change made us truly happy.",
    author: "Sandeep (parent)",
  },
  {
    quote:
      "The mentors are caring and attentive. My daughter felt safe, heard, and encouraged. She returned with so many stories and a bright smile.",
    author: "Lakshmi (parent)",
  },
];

const defaultSamskaraVideos = [
  {
    title: "Sankalpam 2 - Mana Parampara",
    url: "https://youtube.com/shorts/VcnHRxsIRf8?si=Rpfa4sypOUP9Da6v",
  },
  {
    title: "Open House at Valmiki International Gurukulam ",
    url: "https://youtube.com/shorts/oGXPk3as4BI?si=FLdRYh_2fwKMFJi_",
  },
  {
    title: "Student Entrepreneur",
    url: "https://youtu.be/vciPv_GGQ0E?si=6C7r_QOIR-pxSg2N",
  },
  {
    title: "Neera Ji (UK NRI) Testimonial",
    url: "https://youtu.be/I5ZLt5Bl_V0?si=YUwueHXQIv1y-7qa",
  },
];

const defaultPhilosophyContent = {
  title: "Our Philosophy",
  intro:
    "At Valmiki Ashram, learning is not just a tagline. It is how children truly absorb culture and values through rhythm, stories, repetition, and doing things with their own hands.",
  verseTitle: "सा विद्या या विमुक्तये",
  verseMeaning:
    "Sa vidya ya vimuktaye - True learning is that which frees you.",
  images: [
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80",
  ],
  paragraphs: [
    "At Valmiki Ashram, we are not trying to recreate the past. We are reviving what worked - the depth, the balance, the stillness - and bringing it into a world full of distraction.",
    "Children here do not just study Gita or robotics. They live it. They farm, they chant, they ask questions, they build things, they sit in silence.",
    "Our goal is to create an ecosystem where children are free to explore; one that gives them deep exposure to both ancient Indian knowledge and modern technology.",
  ],
};

export default function Home() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";
  const cms = useLiveContent("home", {
    heroTitle:
      "Valmiki International Gurukulam Residential Family Admissions Open Now",
    heroSubtitle: "World's First Skill Based Technology Gurukulam",
    heroImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    introVideoUrl:
      process.env.REACT_APP_INTRO_VIDEO_URL || DEFAULT_HOME_INTRO_VIDEO_URL,
    programCards,
    samskaraVideos: defaultSamskaraVideos,
    testimonials: defaultTestimonials,
    philosophyContent: defaultPhilosophyContent,
  });
  const [draft, setDraft] = useState(cms);
  const [editingField, setEditingField] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [cardEditor, setCardEditor] = useState(null);
  const [samskaraEditor, setSamskaraEditor] = useState(null);
  const [testimonialEditor, setTestimonialEditor] = useState(null);
  const [philosophyEditor, setPhilosophyEditor] = useState(null);
  const samskaraTrackRef = useRef(null);
  const testimonialsTrackRef = useRef(null);
  useEffect(() => setDraft(cms), [cms]);
  const videoUrl =
    String(cms.introVideoUrl || "").trim() ||
    String(process.env.REACT_APP_INTRO_VIDEO_URL || "").trim() ||
    DEFAULT_HOME_INTRO_VIDEO_URL;
  const display = isAdmin ? draft : cms;
  const displayCards = (
    display.programCards?.length ? display.programCards : programCards
  ).slice(0, 12);
  const displaySamskaraVideos = Array.isArray(display.samskaraVideos)
    ? display.samskaraVideos
    : defaultSamskaraVideos;
  const displayTestimonials = Array.isArray(display.testimonials)
    ? display.testimonials
    : defaultTestimonials;
  const displayPhilosophy =
    display.philosophyContent || defaultPhilosophyContent;

  const whatsappNumberDigits = (
    process.env.REACT_APP_WHATSAPP_NUMBER || ""
  ).replace(/\D/g, "");
  const whatsappChatHref =
    whatsappNumberDigits.length > 0
      ? `https://wa.me/${whatsappNumberDigits}?text=${encodeURIComponent(
          "Hello, I came from the Valmiki Ashram website.",
        )}`
      : null;

  const saveHomeContent = async (nextContent) => {
    await adminRequest("/api/admin/content/home", {
      method: "PUT",
      body: JSON.stringify({ content: nextContent }),
    });
  };

  const startEdit = (field) => {
    setEditingField(field);
    setFieldValue(draft?.[field] || "");
  };

  const saveField = async () => {
    if (!editingField) return;
    const next = { ...draft, [editingField]: fieldValue };
    setDraft(next);
    await saveHomeContent(next);
    setEditingField("");
  };

  const openCardEditor = (index) => {
    const card = displayCards[index];
    setCardEditor({
      index,
      isNew: !card,
      title: card?.title || "",
      body: card?.body || "",
      path: card?.path || "/programs",
      buttonLabel: card?.buttonLabel || "Learn More",
      image: card?.image || "",
    });
  };

  const saveCardEditor = async () => {
    if (!cardEditor) return;
    const cards = [...displayCards];
    const payload = {
      title: cardEditor.title || "Untitled Program",
      body: cardEditor.body || "",
      path: cardEditor.path || "/programs",
      buttonLabel: cardEditor.buttonLabel || "Learn More",
      image: cardEditor.image || "",
    };
    if (cardEditor.isNew) {
      cards.push(payload);
    } else {
      cards[cardEditor.index] = payload;
    }
    const next = { ...draft, programCards: cards };
    setDraft(next);
    await saveHomeContent(next);
    setCardEditor(null);
  };

  const deleteCard = async (index) => {
    const cards = displayCards.filter((_, i) => i !== index);
    const next = { ...draft, programCards: cards };
    setDraft(next);
    await saveHomeContent(next);
  };

  const openSamskaraEditor = (index) => {
    const item = displaySamskaraVideos[index];
    setSamskaraEditor({
      index,
      isNew: !item,
      title: item?.title || "",
      url: item?.url || "",
    });
  };

  const saveSamskaraEditor = async () => {
    if (!samskaraEditor) return;
    const videos = [...displaySamskaraVideos];
    const payload = {
      title: samskaraEditor.title || "Untitled Video",
      url: samskaraEditor.url || "",
    };
    if (samskaraEditor.isNew) {
      videos.push(payload);
    } else {
      videos[samskaraEditor.index] = payload;
    }
    const next = { ...draft, samskaraVideos: videos };
    setDraft(next);
    await saveHomeContent(next);
    setSamskaraEditor(null);
  };

  const deleteSamskaraVideo = async (index) => {
    const videos = displaySamskaraVideos.filter((_, i) => i !== index);
    const next = { ...draft, samskaraVideos: videos };
    setDraft(next);
    await saveHomeContent(next);
  };

  const openTestimonialEditor = (index) => {
    const item = displayTestimonials[index];
    setTestimonialEditor({
      index,
      isNew: !item,
      quote: item?.quote || "",
      author: item?.author || "",
    });
  };

  const saveTestimonialEditor = async () => {
    if (!testimonialEditor) return;
    const items = [...displayTestimonials];
    const payload = {
      quote: testimonialEditor.quote || "",
      author: testimonialEditor.author || "Anonymous",
    };
    if (testimonialEditor.isNew) {
      items.push(payload);
    } else {
      items[testimonialEditor.index] = payload;
    }
    const next = { ...draft, testimonials: items };
    setDraft(next);
    await saveHomeContent(next);
    setTestimonialEditor(null);
  };

  const deleteTestimonial = async (index) => {
    const items = displayTestimonials.filter((_, i) => i !== index);
    const next = { ...draft, testimonials: items };
    setDraft(next);
    await saveHomeContent(next);
  };

  const openPhilosophyEditor = () => {
    setPhilosophyEditor({
      title: displayPhilosophy.title || "",
      intro: displayPhilosophy.intro || "",
      verseTitle: displayPhilosophy.verseTitle || "",
      verseMeaning: displayPhilosophy.verseMeaning || "",
      paragraphsText: (displayPhilosophy.paragraphs || []).join("\n"),
    });
  };

  const savePhilosophyEditor = async () => {
    if (!philosophyEditor) return;
    const nextPhilosophy = {
      ...displayPhilosophy,
      title: philosophyEditor.title || "Our Philosophy",
      intro: philosophyEditor.intro || "",
      verseTitle: philosophyEditor.verseTitle || "",
      verseMeaning: philosophyEditor.verseMeaning || "",
      paragraphs: (philosophyEditor.paragraphsText || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };
    const next = { ...draft, philosophyContent: nextPhilosophy };
    setDraft(next);
    await saveHomeContent(next);
    setPhilosophyEditor(null);
  };

  const updatePhilosophyImage = async (index, imageUrl) => {
    const images = [...(displayPhilosophy.images || [])];
    images[index] = imageUrl;
    const next = {
      ...draft,
      philosophyContent: { ...displayPhilosophy, images },
    };
    setDraft(next);
    await saveHomeContent(next);
  };

  // const addPhilosophyImage = async (imageUrl) => {
  //   const images = [...(displayPhilosophy.images || [])];
  //   images.push(imageUrl);
  //   const next = {
  //     ...draft,
  //     philosophyContent: { ...displayPhilosophy, images },
  //   };
  //   setDraft(next);
  //   await saveHomeContent(next);
  // };

  const deletePhilosophyImage = async (index) => {
    const images = (displayPhilosophy.images || []).filter(
      (_, i) => i !== index,
    );
    const next = {
      ...draft,
      philosophyContent: { ...displayPhilosophy, images },
    };
    setDraft(next);
    await saveHomeContent(next);
  };

  const scrollTestimonials = (direction) => {
    const track = testimonialsTrackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-testimonial-card]");
    const cardWidth = card ? card.clientWidth : 320;
    const gap = 12;
    const delta = direction === "next" ? cardWidth + gap : -(cardWidth + gap);
    track.scrollBy({ left: delta, behavior: "smooth" });
  };

  const scrollSamskaraVideos = (direction) => {
    const track = samskaraTrackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-samskara-video-card]");
    const cardWidth = card ? card.clientWidth : 320;
    const gap = 16;
    const delta = direction === "next" ? cardWidth + gap : -(cardWidth + gap);
    track.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <>
      <motion.section
        className="bg-neutral-50 py-8 dark:bg-neutral-950 md:py-12"
        {...sectionMotion}
      >
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-neutral-200 shadow-nav ring-1 ring-black/5 dark:border-neutral-700 dark:shadow-nav-dark dark:ring-white/10"
              {...fade}
            >
              <img
                src={display.heroImage}
                alt="Campus preview placeholder"
                className="aspect-[4/3] w-full object-cover"
              />
              {isAdmin ? (
                <div className="absolute inset-x-3 top-3 z-10 flex justify-end">
                  <ImageUploader
                    folder="home"
                    buttonText="Change Image"
                    onUploaded={(asset) =>
                      setDraft((p) => ({ ...p, heroImage: asset.url }))
                    }
                  />
                </div>
              ) : null}
            </motion.div>
            <div className="space-y-6">
              <motion.div className="flex items-start gap-2" {...fade}>
                <motion.h1 className="heading-hero">
                  {display.heroTitle}
                </motion.h1>
                {isAdmin ? (
                  <button
                    type="button"
                    aria-label="Edit hero title"
                    className="mt-1 rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                    onClick={() => startEdit("heroTitle")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : null}
              </motion.div>
              <motion.div className="flex items-start gap-2" {...fade}>
                <motion.h2 className="text-lg font-semibold text-prose md:text-xl">
                  {display.heroSubtitle}
                </motion.h2>
                {isAdmin ? (
                  <button
                    type="button"
                    aria-label="Edit hero subtitle"
                    className="mt-1 rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                    onClick={() => startEdit("heroSubtitle")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : null}
              </motion.div>
              <motion.div className="flex flex-wrap gap-3" {...fade}>
                <Button to="/contact">Enquiry</Button>
                <Button to="/gurukulam">Learn More</Button>
              </motion.div>
              <motion.p className="text-prose-muted" {...fade}>
                Reconnect with Bharat through Samskrutham, Soil, and Stories.
              </motion.p>
              <motion.a
                href={process.env.REACT_APP_WHATSAPP_COMMUNITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="link-app inline-flex items-center gap-2"
                {...fade}
              >
                <FaWhatsapp
                  className="h-5 w-5 shrink-0 text-[#25D366]"
                  aria-hidden
                />
                Join the WhatsApp Community to stay updated
              </motion.a>
              {whatsappChatHref ? (
                <motion.a
                  href={whatsappChatHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-app inline-flex items-center gap-2"
                  {...fade}
                >
                  <FaWhatsapp
                    className="h-5 w-5 shrink-0 text-[#25D366]"
                    aria-hidden
                  />
                  Chat with us on WhatsApp
                </motion.a>
              ) : null}
            </div>
          </div>
        </Container>
      </motion.section>

      <motion.section
        className="bg-secondary/50 py-8 dark:bg-neutral-900/60 md:py-12"
        {...sectionMotion}
      >
        <Container>
          <motion.div
            className="mb-8 flex items-center justify-center gap-2"
            {...fade}
          >
            <motion.h2 className="heading-section text-center">
              Who are we?
            </motion.h2>
            {isAdmin ? (
              <button
                type="button"
                aria-label="Edit intro video URL"
                className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                onClick={() => startEdit("introVideoUrl")}
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
          </motion.div>
          <motion.div {...fade}>
            <VideoPlayer
              url={(isAdmin ? draft.introVideoUrl : videoUrl) || videoUrl}
              title="Who are we introductory video"
            />
          </motion.div>
        </Container>
      </motion.section>

      <motion.section
        className="surface-muted py-8 md:py-12"
        {...sectionMotion}
      >
        <Container>
          <motion.h2 className="heading-section mb-10 text-center" {...fade}>
            Valmiki International Gurukulam
          </motion.h2>
          {isAdmin ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => openCardEditor()}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Card
              </button>
            </div>
          ) : null}
          <div className="grid gap-6 md:grid-cols-3">
            {displayCards.map((card, index) => (
              <motion.article
                key={`${card.title}-${index}`}
                className="relative rounded-2xl border-2 border-accent/35 bg-secondary/90 p-6 shadow-sm dark:border-emerald-700/40 dark:bg-neutral-900 dark:shadow-nav-dark"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
              >
                {isAdmin ? (
                  <div className="absolute right-3 top-3 z-10 flex gap-1">
                    <button
                      type="button"
                      onClick={() => openCardEditor(index)}
                      className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                      aria-label="Edit program card"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCard(index)}
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
                      alt={card.title}
                      className="h-24 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-24 rounded-xl bg-primary/60 dark:bg-neutral-800" />
                  )}
                  {isAdmin ? (
                    <div className="absolute inset-x-2 bottom-2 flex justify-end">
                      <ImageUploader
                        folder="home"
                        buttonText={card.image ? "Change Image" : "Add Image"}
                        onUploaded={(asset) =>
                          setDraft((p) => {
                            const cards = [
                              ...(p.programCards?.length
                                ? p.programCards
                                : displayCards),
                            ];
                            cards[index] = {
                              ...cards[index],
                              image: asset.url,
                            };
                            const next = { ...p, programCards: cards };
                            saveHomeContent(next);
                            return next;
                          })
                        }
                      />
                    </div>
                  ) : null}
                </div>
                <h3 className="heading-card">{card.title}</h3>
                <p className="mt-2 text-sm text-prose-muted">{card.body}</p>
                {card.path ? (
                  <Button to={card.path} className="mt-4">
                    {card.buttonLabel || "Learn More"}
                  </Button>
                ) : null}
              </motion.article>
            ))}
          </div>
        </Container>
      </motion.section>

      <motion.section
        className="bg-secondary/50 py-8 dark:bg-neutral-900/60 md:py-12"
        {...sectionMotion}
      >
        <Container>
          <motion.h2
            className="heading-section mb-3 text-center md:mb-4"
            {...fade}
          >
            Snapshots of Samskara
          </motion.h2>
          {isAdmin ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => openSamskaraEditor()}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1.5 text-xs text-white sm:px-3 sm:py-2 sm:text-sm dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Video
              </button>
            </div>
          ) : null}
          <div
            ref={samskaraTrackRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {displaySamskaraVideos.map((video, index) => (
              <motion.article
                key={video.title}
                data-samskara-video-card
                className="relative w-[calc(100%-10px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-nav ring-1 ring-black/5 sm:w-[420px] md:w-[460px] dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-nav-dark dark:ring-white/10"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.35 }}
              >
                {isAdmin ? (
                  <div className="absolute right-2 top-2 z-10 flex gap-1">
                    <button
                      type="button"
                      onClick={() => openSamskaraEditor(index)}
                      className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                      aria-label="Edit samskara video"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSamskaraVideo(index)}
                      className="rounded-md bg-rose-600 p-1 text-white shadow"
                      aria-label="Delete samskara video"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
                <div className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-700">
                  <h3 className="truncate text-sm font-semibold text-accent sm:text-base dark:text-emerald-200">
                    {video.title}
                  </h3>
                </div>
                {video.url ? (
                  <div className="relative aspect-[9/16] w-full bg-black">
                    <iframe
                      title={video.title}
                      src={getYoutubeEmbedUrl(video.url.trim())}
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[9/16] w-full items-center justify-center bg-secondary/70 px-4 text-center text-sm text-prose-muted dark:bg-neutral-900">
                    Add this YouTube embed URL in <code>samskaraVideos</code>.
                  </div>
                )}
              </motion.article>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-2 md:gap-3">
            <button
              type="button"
              aria-label="Previous samskara video"
              onClick={() => scrollSamskaraVideos("prev")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 shadow-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next samskara video"
              onClick={() => scrollSamskaraVideos("next")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 shadow-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </motion.section>

      <motion.section
        className="bg-neutral-50 py-10 dark:bg-neutral-950 md:py-14"
        {...sectionMotion}
      >
        <Container>
          <motion.div
            className="mb-8 rounded-2xl border border-accent/20 bg-secondary/70 p-5 shadow-sm md:mb-10 md:p-8 dark:border-emerald-700/40 dark:bg-neutral-900/90"
            {...fade}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="heading-section text-accent dark:text-emerald-200">
                {displayPhilosophy.title}
              </h2>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={openPhilosophyEditor}
                  className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                  aria-label="Edit philosophy text"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-prose-muted sm:text-base md:text-lg md:leading-8">
              {displayPhilosophy.intro}
            </p>
            <div className="my-5 h-px bg-accent/50 dark:bg-emerald-700/60" />
            <p className="text-lg font-semibold tracking-wide text-prose sm:text-xl md:text-2xl">
              {displayPhilosophy.verseTitle}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-prose-muted sm:text-base md:text-lg">
              {displayPhilosophy.verseMeaning}
            </p>
            <div className="my-5 h-px bg-accent/50 dark:bg-emerald-700/60" />
            <div className="grid items-start gap-5 sm:gap-6 md:grid-cols-[1.7fr_1fr] md:gap-8">
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={displayPhilosophy.images?.[0]}
                    alt="Indian cow at Valmiki Ashram"
                    className="h-full min-h-[260px] w-full rounded-lg object-cover shadow-sm"
                  />
                  {isAdmin ? (
                    <div className="absolute right-2 top-2 z-10 flex gap-1">
                      <ImageUploader
                        folder="home"
                        buttonText="Change Image"
                        onUploaded={(asset) =>
                          updatePhilosophyImage(0, asset.url)
                        }
                      />
                    </div>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(displayPhilosophy.images || [])
                    .slice(1)
                    .map((imageUrl, index) => {
                      const imageIndex = index + 1;
                      return (
                        <div
                          key={`${imageUrl}-${imageIndex}`}
                          className="relative"
                        >
                          <img
                            src={imageUrl}
                            alt={`Desi cow ${imageIndex + 1}`}
                            className="h-28 w-full rounded-lg object-cover shadow-sm sm:h-32"
                          />
                          {isAdmin ? (
                            <div className="absolute right-1 top-1 z-10 flex gap-1">
                              <ImageUploader
                                folder="home"
                                buttonText="Change"
                                onUploaded={(asset) =>
                                  updatePhilosophyImage(imageIndex, asset.url)
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  deletePhilosophyImage(imageIndex)
                                }
                                className="rounded-md bg-rose-600 p-1 text-white shadow"
                                aria-label="Delete philosophy image"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="space-y-4 text-sm leading-7 text-prose sm:text-base md:space-y-5 md:text-lg md:leading-8">
                {(displayPhilosophy.paragraphs || []).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.h2
            className="heading-section mb-3 text-center md:mb-4"
            {...fade}
          >
            Testimonials
          </motion.h2>
          {isAdmin ? (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => openTestimonialEditor()}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1.5 text-xs text-white sm:px-3 sm:py-2 sm:text-sm dark:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Testimonial
              </button>
            </div>
          ) : null}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => scrollTestimonials("prev")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 shadow-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div
              ref={testimonialsTrackRef}
              className="flex flex-1 items-start snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:gap-4"
            >
              {displayTestimonials.map((item, index) => (
                <motion.article
                  key={`${item.author}-${index}`}
                  data-testimonial-card
                  className="relative mt-0 flex h-[340px] w-[260px] shrink-0 snap-start flex-col rounded-2xl border border-black/10 bg-[#f4efde] p-4 text-center shadow-md sm:w-[280px] md:w-[300px] md:p-5 dark:border-white/10 dark:bg-neutral-900/90"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  whileHover={{
                    scale: 1.015,
                    boxShadow: "0 14px 30px rgba(0, 0, 0, 0.12)",
                  }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {isAdmin ? (
                    <div className="absolute right-2 top-2 z-10 flex gap-1">
                      <button
                        type="button"
                        onClick={() => openTestimonialEditor(index)}
                        className="rounded-md bg-white/90 p-1 text-accent shadow dark:bg-neutral-800 dark:text-emerald-200"
                        aria-label="Edit testimonial"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTestimonial(index)}
                        className="rounded-md bg-rose-600 p-1 text-white shadow"
                        aria-label="Delete testimonial"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                  <p className="text-2xl leading-none text-neutral-900 dark:text-neutral-100">
                    "
                  </p>
                  <p className="mt-2 flex-1 overflow-hidden text-sm leading-7 text-neutral-800 md:text-[15px] dark:text-neutral-200">
                    {item.quote}
                  </p>
                  <p className="mt-4 text-xl leading-none text-neutral-900 dark:text-neutral-100">
                    "
                  </p>
                  <p className="mt-3 text-lg font-medium text-neutral-900 md:text-xl dark:text-neutral-100">
                    {item.author}
                  </p>
                </motion.article>
              ))}
            </div>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => scrollTestimonials("next")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 shadow-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </motion.section>
      {isAdmin && cardEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
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
                  folder="home"
                  buttonText={cardEditor.image ? "Change Image" : "Add Image"}
                  onUploaded={(asset) =>
                    setCardEditor((p) => ({ ...p, image: asset.url }))
                  }
                />
              </div>
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
                placeholder="Route path (e.g. /gurukulam)"
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
      {isAdmin && samskaraEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {samskaraEditor.isNew
                ? "Add Samskara Video"
                : "Edit Samskara Video"}
            </h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Video title"
                value={samskaraEditor.title}
                onChange={(e) =>
                  setSamskaraEditor((p) => ({ ...p, title: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="YouTube URL"
                value={samskaraEditor.url}
                onChange={(e) =>
                  setSamskaraEditor((p) => ({ ...p, url: e.target.value }))
                }
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveSamskaraEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setSamskaraEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isAdmin && testimonialEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              {testimonialEditor.isNew ? "Add Testimonial" : "Edit Testimonial"}
            </h3>
            <div className="mt-4 space-y-3">
              <textarea
                className="h-28 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Testimonial quote"
                value={testimonialEditor.quote}
                onChange={(e) =>
                  setTestimonialEditor((p) => ({ ...p, quote: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Author (e.g. Janaki - parent)"
                value={testimonialEditor.author}
                onChange={(e) =>
                  setTestimonialEditor((p) => ({
                    ...p,
                    author: e.target.value,
                  }))
                }
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveTestimonialEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setTestimonialEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isAdmin && philosophyEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit Philosophy Content
            </h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Section title"
                value={philosophyEditor.title}
                onChange={(e) =>
                  setPhilosophyEditor((p) => ({ ...p, title: e.target.value }))
                }
              />
              <textarea
                className="h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Intro text"
                value={philosophyEditor.intro}
                onChange={(e) =>
                  setPhilosophyEditor((p) => ({ ...p, intro: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Verse title"
                value={philosophyEditor.verseTitle}
                onChange={(e) =>
                  setPhilosophyEditor((p) => ({
                    ...p,
                    verseTitle: e.target.value,
                  }))
                }
              />
              <textarea
                className="h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Verse meaning"
                value={philosophyEditor.verseMeaning}
                onChange={(e) =>
                  setPhilosophyEditor((p) => ({
                    ...p,
                    verseMeaning: e.target.value,
                  }))
                }
              />
              <textarea
                className="h-28 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder="Paragraphs (one paragraph per line)"
                value={philosophyEditor.paragraphsText}
                onChange={(e) =>
                  setPhilosophyEditor((p) => ({
                    ...p,
                    paragraphsText: e.target.value,
                  }))
                }
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={savePhilosophyEditor}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setPhilosophyEditor(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isAdmin && editingField ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold text-accent dark:text-emerald-200">
              Edit{" "}
              {editingField === "introVideoUrl"
                ? "Intro Video URL"
                : editingField === "heroTitle"
                  ? "Hero Title"
                  : "Hero Subtitle"}
            </h3>
            <textarea
              className="mt-4 h-24 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveField}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm text-white dark:bg-emerald-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setEditingField("")}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-4 py-2 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
