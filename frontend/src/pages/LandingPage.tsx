import { useEffect, useRef } from "react";
import clsx from "clsx";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import heroDashboard from "../assets/synthcode-dashboard.jpeg";
import workflowLegacy from "../assets/legacy-workflow.jpeg";
import workflowSynthcode from "../assets/synthcode-editor.jpeg";
import analyticsDashboard from "../assets/synthcode-analytics.jpeg";
import customerCollaboration from "../assets/customer-collaboration.jpeg";
import teamWorkshop from "../assets/team-workshop.jpeg";
import avatarAmelia from "../assets/avatar-amelia.jpeg";
import avatarDiego from "../assets/avatar-diego.jpeg";
import avatarLinh from "../assets/avatar-linh.jpeg";
import { Link } from "react-router-dom";

const heroAnimation = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

const logos = [
  "Barclay Labs",
  "Orbit Stack",
  "NovaForge",
  "ChromaSystems",
  "Latitude",
  "HelioWorks",
  "Scalar",
  "Alto Labs",
];

const features = [
  {
    title: "Repository-aware intelligence",
    description:
      "Inject context into every commit with AI copilots that understand your entire codebase, sprint cadences, and governance playbooks.",
    image: analyticsDashboard,
    iconRow: [
      { label: "Version memory", tone: "accent" },
      { label: "Guardrails", tone: "sage" },
      { label: "Live insights", tone: "base" },
    ],
  },
  {
    title: "Automated delivery choreography",
    description:
      "Move from pull request to production in hours with orchestrated QA, instant compliance mapping, and rollout scripts that self-heal.",
    image: teamWorkshop,
    iconRow: [
      { label: "QA mesh", tone: "accent" },
      { label: "Compliance map", tone: "sage" },
      { label: "Smart rollouts", tone: "base" },
    ],
  },
  {
    title: "Adaptive developer experience",
    description:
      "Tailor flow to each builder with skill-aware prompts, onboarding pathways, and sentiment-driven nudges that keep momentum high.",
    image: customerCollaboration,
    iconRow: [
      { label: "Skill cues", tone: "accent" },
      { label: "Playbooks", tone: "sage" },
      { label: "Momentum AI", tone: "base" },
    ],
  },
];

const testimonials = [
  {
    quote:
      "SynthCode AI turned our tangled monolith into a fluent product platform. Ops escalations dropped 61% in the first launch quarter.",
    name: "Amelia Hart",
    role: "VP Engineering, Drivewave",
    avatar: avatarAmelia,
  },
  {
    quote:
      "Our AI release cadence quadrupled without ballooning headcount. SynthCode became the connective tissue between product, data, and delivery.",
    name: "Diego Alvarez",
    role: "CTO, Meridian AI",
    avatar: avatarDiego,
  },
  {
    quote:
      "The team ships faster and happier. Autocomplete is smart enough to feel like a senior engineer sitting side-by-side.",
    name: "Linh Nguyen",
    role: "Head of Platform, Ripple Labs",
    avatar: avatarLinh,
  },
];

const caseStudies = [
  {
    title: "Drivewave platform consolidation",
    kpi: "+214% deployment velocity",
    description:
      "Unified 12 autonomous squads under one AI operating layer while preserving domain autonomy and governance.",
    image: analyticsDashboard,
  },
  {
    title: "Meridian AI launch automation",
    kpi: "-48 hrs release drag",
    description:
      "Pushed daily launches without regression by pairing predictive quality signals with instant remediation.",
    image: heroDashboard,
  },
  {
    title: "Ripple Labs developer lift",
    kpi: "92 NPS among engineers",
    description:
      "Acceleration pods combined structured learning plans with AI pair programming to unlock new product verticals.",
    image: teamWorkshop,
  },
];

const pricing = [
  {
    tier: "Founders",
    price: "$189",
    cadence: "per workspace / month",
    features: [
      "Up to 25 builders",
      "AI merge assistant",
      "Baseline governance maps",
      "Waitlist concierge",
    ],
    highlighted: false,
  },
  {
    tier: "Scale",
    price: "$349",
    cadence: "per workspace / month",
    features: [
      "Up to 80 builders",
      "Custom LLM prompts",
      "Release runway analytics",
      "Founding partner advisory",
    ],
    highlighted: true,
  },
  {
    tier: "Enterprise",
    price: "Custom",
    cadence: "Annual partnership",
    features: [
      "Unlimited builders",
      "Dedicated AI training loops",
      "Private trust boundary audits",
      "Global rollout command",
    ],
    highlighted: false,
  },
];

const gradientBackground =
  "linear-gradient(150deg, rgba(222,232,240,0.72) 0%, rgba(203,216,228,0.85) 45%, rgba(234,237,240,0.92) 100%)";

function HeroScrollIndicator() {
  const { scrollYProgress } = useScroll();
  const transform = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scaleX = useSpring(transform, { stiffness: 120, damping: 20 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 h-1 origin-left bg-accent-500/70 z-[100]"
    />
  );
}

function StickyCTA() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200, 600], [0, 0, 1]);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-6 inset-x-0 mx-auto w-full px-6 sm:px-0 sm:max-w-md z-[90]"
    >
      <div className="rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-xl shadow-accent-900/5 p-1">
        <Link to="/app" className="block w-full text-center rounded-full bg-accent-600 text-white py-3 font-semibold tracking-wide transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500">
          Accéder à la plateforme
        </Link>
      </div>
    </motion.div>
  );
}

function AnimatedAmbientShape() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 60]);

  return (
    <motion.div
      style={{ y }}
      className="absolute inset-x-10 -top-20 h-96 rounded-[200px] bg-gradient-to-br from-accent-100 via-base-100 to-sage-100 blur-3xl opacity-70"
    />
  );
}

function Chip({ label, tone }: { label: string; tone: "accent" | "sage" | "base" }) {
  return (
    <motion.div
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm shadow-accent-900/5",
        {
          "border-accent-100 bg-accent-50 text-accent-700": tone === "accent",
          "border-sage-100 bg-sage-50 text-sage-700": tone === "sage",
          "border-base-200 bg-base-100 text-base-700": tone === "base",
        }
      )}
      whileHover={{ y: -2 }}
    >
      <span className="text-base">✦</span>
      {label}
    </motion.div>
  );
}

export function LandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-base-50 overflow-x-hidden">
      <HeroScrollIndicator />
      <StickyCTA />

      <main className="relative">
        <section
          className="relative overflow-hidden"
          style={{ background: gradientBackground }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_55%)]" />

          <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-28 md:pt-32">
            <AnimatedAmbientShape />
            <motion.div
              className="max-w-3xl"
              initial="hidden"
              animate="visible"
              variants={heroAnimation}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-sm font-medium text-accent-700 shadow-sm shadow-accent-500/5 backdrop-blur-md">
                EcoVille Smart City
              </span>
              <h1 className="mt-6 font-display text-4xl leading-tight text-base-900 sm:text-5xl lg:text-6xl">
                Système Intelligent de Gestion des Déchets Urbains
              </h1>
              <p className="mt-6 text-lg text-base-700 sm:text-xl">
                Une plateforme centralisée pour optimiser les tournées, gérer les ressources et améliorer la durabilité environnementale de notre municipalité.
              </p>
            </motion.div>

            <motion.div
              className="mt-10 flex w-full flex-col gap-6 rounded-3xl border border-white/60 bg-white/75 p-6 backdrop-blur-xl shadow-xl shadow-accent-900/5 sm:flex-row"
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex-1 space-y-4">
                <div className="text-base text-base-600">
                  <span className="font-semibold text-base-800">Objectifs du projet :</span>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-base-700">
                    <li>Optimisation des tournées de collecte</li>
                    <li>Suivi en temps réel des conteneurs</li>
                    <li>Interopérabilité XML/XSD</li>
                  </ul>
                </div>
                <Link
                  to="/app"
                  className="inline-flex items-center gap-3 rounded-full bg-accent-600 px-6 py-3 text-white font-semibold shadow-lg shadow-accent-900/10 hover:scale-105 transition-transform"
                >
                  Accéder à la plateforme
                  <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    →
                  </span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="mt-16 overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-2 shadow-2xl shadow-accent-900/10"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <motion.img
                src={heroDashboard}
                alt="SynthCode AI product dashboard"
                className="w-full rounded-[26px] object-cover"
                initial={{ opacity: 0, scale: 1.02 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FloatingField({
  label,
  placeholder,
  type,
}: {
  label: string;
  placeholder: string;
  type: string;
}) {
  return (
    <motion.label
      className="group relative block"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.4 }}
    >
      <span className="absolute left-5 top-3 text-xs font-semibold uppercase tracking-[0.2em] text-base-500 transition-all group-focus-within:-translate-y-2 group-focus-within:text-accent-600">
        {label}
      </span>
      <motion.input
        type={type}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-white/70 bg-white/90 px-5 pt-6 text-base text-base-700 shadow-inner shadow-white/60 placeholder:text-base-400 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-200"
        whileFocus={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl border border-transparent"
        initial={{ opacity: 0 }}
        whileFocus={{ opacity: 1, borderColor: "rgba(77,145,208,0.45)" }}
      />
    </motion.label>
  );
}

function CaseStudyCarousel({
  slides,
}: {
  slides: Array<{
    title: string;
    kpi: string;
    description: string;
    image: string;
  }>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({
    container: containerRef,
    layoutEffect: false,
  });
  const progress = useSpring(scrollXProgress, { stiffness: 120, damping: 20 });

  return (
    <div className="mt-14">
      <motion.div
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div
          ref={containerRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6"
        >
          {slides.map((slide) => (
            <article
              key={slide.title}
              className="relative w-[320px] flex-shrink-0 snap-center overflow-hidden rounded-[28px] border border-base-100 bg-white/80 shadow-xl shadow-accent-900/10"
            >
              <div className="relative h-56 overflow-hidden">
                <motion.img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                  initial={{ scale: 1.05 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-base-900/70" />
                <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-base-800">
                  {slide.kpi}
                </div>
              </div>
              <div className="space-y-3 px-5 py-6">
                <h3 className="font-display text-xl text-base-900">{slide.title}</h3>
                <p className="text-sm text-base-600">{slide.description}</p>
              </div>
            </article>
          ))}
        </div>
        <motion.div className="mt-4 h-1 rounded-full bg-base-200">
          <motion.div style={{ scaleX: progress }} className="h-full origin-left rounded-full bg-accent-500" />
        </motion.div>
      </motion.div>
    </div>
  );
}
