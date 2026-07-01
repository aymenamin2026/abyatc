"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Award, Briefcase, Target, CheckCircle2, Shield, Eye, Compass, Rocket, ArrowRight } from "lucide-react";

// --- Custom Hooks للـ Effects المتقدمة ---

// 1. تتبع حركة الماوس للـ Custom Cursor والـ Global Mouse Glow
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return mousePosition;
}

// 2. عداد متحرك تفاعلي (Animated Counter)
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 10);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count}</span>;
}

// 3. تأثير Tilt الكروت ثلاثي الأبعاد مع الـ Spotlight Hover
function useTiltEffect() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(0);
  const [glowY, setGlowY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // حسابات الـ Tilt (تأثير الإمالة)
    const rX = ((mouseY - height / 2) / height) * -10; // بحد أقصى 10 درجات
    const rY = ((mouseX - width / 2) / width) * 10;

    setRotateX(rX);
    setRotateY(rY);
    setGlowX(mouseX);
    setGlowY(mouseY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return { ref, rotateX, rotateY, glowX, glowY, isHovered, setIsHovered, handleMouseMove, handleMouseLeave };
}

// --- المكونات الداخلية الفرعية الفاخرة ---

// كرت تفاعلي يجمع بين Tilt و Spotlight و Glassmorphism
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, rotateX, rotateY, glowX, glowY, isHovered, setIsHovered, handleMouseMove, handleMouseLeave } = useTiltEffect();

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden rounded-[24px] border border-white/10 dark:border-white/5 bg-gradient-to-br from-white/10 to-white/5 dark:from-neutral-900/40 dark:to-neutral-900/10 backdrop-blur-xl shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Spotlight Glow Effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${glowX}px ${glowY}px, rgba(var(--primary-rgb), 0.15), transparent 40%)`,
        }}
      />
      <div style={{ transform: "translateZ(20px)" }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}

// --- البيانات والنصوص المنظمة ---

const content = {
  en: {
    heroTitle: "About Us",
    heroSubtitle: "Lamea Abyat Contracting",
    badge: "🏗️ Excellence in Construction",
    stats: [
      { value: 15, suffix: "+", label: "Years of Experience" },
      { value: 120, suffix: "+", label: "Projects Delivered" },
      { value: 50, suffix: "M+", label: "Invested Capital" },
      { value: 99, suffix: "%", label: "Client Satisfaction" },
    ],
    featuresTitle: "Why Choose Us",
    featuresSubtitle: "We combine precision engineering with premium execution to set industry benchmarks.",
    features: [
      { icon: Award, title: "Quality Assurance", desc: "Highest global standards implemented at every single project stage." },
      { icon: CheckCircle2, title: "Absolute Commitment", desc: "On-time delivery within strictly optimized budgetary frames." },
      { icon: Briefcase, title: "Elite Professionalism", desc: "Expert multinational team trained on safety and top-tier efficiency." },
      { icon: Target, title: "Strategic Innovation", desc: "Smart engineering solutions that fundamentally enhance project value." },
    ],
    mvv: {
      vision: { title: "Our Vision", desc: "To stand as the leading pioneering force in the Kingdom's contracting sector by introducing disruptive, sustainable, and high-tech construction paradigms." },
      mission: { title: "Our Mission", desc: "Delivering integrated infrastructural engineering solutions that surpass customer expectations and effectively fuel the Kingdom's Vision 2030." },
      values: {
        title: "Core Values",
        items: [
          { title: "Integrity", desc: "Transparency in all transactions." },
          { title: "Safety", desc: "Zero compromise on human lives." },
          { title: "Sustainability", desc: "Eco-friendly construction methods." }
        ]
      }
    },
    timelineTitle: "Our Journey of Success",
    timeline: [
      { year: "2012", title: "The Inception", desc: "Founded in Riyadh with a vision to redefine regional local contracting standards." },
      { year: "2016", title: "Commercial Expansion", desc: "Secured mega commercial contracts and entered large-scale government bids." },
      { year: "2021", title: "Digital Transformation", desc: "Integrated advanced modern BIM methodologies and AI project tracking." },
      { year: "2026", title: "The Pinnacle", desc: "Recognized among the elite modern sustainable infrastructure builders in KSA." },
    ],
    ctaTitle: "Ready to Build Your Vision?",
    ctaSubtitle: "Let's collaborate to architect your next structural landmark with unmatched precision.",
    ctaBtn: "Initiate Strategic Consultation",
    footerQuote: "Lamea Abyat Contracting… Building the future with excellence."
  },
  ar: {
    heroTitle: "من نحن",
    heroSubtitle: "شركة لمعة أبيات للمقاولات",
    badge: "🏗️ التميز في التشييد والبناء",
    stats: [
      { value: 15, suffix: "+", label: "عاماً من الخبرة" },
      { value: 120, suffix: "+", label: "مشروعاً متكاملاً" },
      { value: 50, suffix: "مليون+", label: "رأس المال المستثمر" },
      { value: 99, suffix: "%", label: "نسبة رضا العملاء" },
    ],
    featuresTitle: "لماذا تختار لمعة أبيات؟",
    featuresSubtitle: "نحن ندمج الهندسة الدقيقة مع التنفيذ الفاخر لوضع معايير جديدة في السوق العربي.",
    features: [
      { icon: Award, title: "ضمان الجودة", desc: "نلتزم بأعلى المعايير العالمية الصارمة في كل مرحلة من مراحل المشروع." },
      { icon: CheckCircle2, title: "الالتزام المطلق", desc: "تنفيذ هندسي دقيق وتسليم صارم وفق الجداول الزمنية والميزانية المرصودة." },
      { icon: Briefcase, title: "الاحترافية النخبوية", desc: "فريق من المهندسين والخبراء المدربين على أعلى مستويات الكفاءة والسلامة." },
      { icon: Target, title: "الابتكار الاستراتيجي", desc: "نقدم حلولاً هندسية ذكية ومبتكرة ترفع من القيمة الاستثمارية للمشاريع." },
    ],
    mvv: {
      vision: { title: "رؤيتنا", desc: "أن نكون القوة الريادية الأولى في قطاع المقاولات بالمملكة عبر تقديم نماذج تشييد مستدامة تعتمد على التقنيات الحديثة." },
      mission: { title: "رسالتنا", desc: "تقديم خدمات هندسية وإنشائية متكاملة تفوق تطلعات عملائنا وتساهم بقوة في تطوير البنية التحتية تماشياً مع رؤية المملكة 2030." },
      values: {
        title: "قيمنا الجوهرية",
        items: [
          { title: "النزاهة والشفافية", desc: "الوضوح المطلق في كافة التعاملات والتعاقدات." },
          { title: "السلامة أولاً", desc: "بيئة عمل آمنة تماماً وخالية من المخاطر للكوادر البشرية." },
          { title: "الاستدامة والابتكار", desc: "تبني حلول ومواد صديقة للبيئة لضمان مستقبل أفضل." }
        ]
      }
    },
    timelineTitle: "مسيرة التميز والنجاح",
    timeline: [
      { year: "2012", title: "التأسيس والانطلاق", desc: "تأسست الشركة في مدينة الرياض ككيان طموح لإعادة صياغة معايير المقاولات المحلية." },
      { year: "2016", title: "التوسع التجاري والاستراتيجي", desc: "الفوز بعقود تجارية ضخمة والدخول بقوة في المشاريع الحكومية الحيوية." },
      { year: "2021", title: "التحول الرقمي والهندسي", desc: "دمج تقنيات الـ BIM الحديثة وأنظمة الذكاء الاصطناعي لإدارة الموارد والمشاريع." },
      { year: "2026", title: "الريادة والاستدامة", desc: "تصنيف الشركة ضمن النخبة الرائدة في تشييد البنى التحتية الذكية والمستدامة في المملكة." },
    ],
    ctaTitle: "هل أنت مستعد لتجسيد رؤيتك على أرض الواقع؟",
    ctaSubtitle: "دعنا نعمل معاً لبناء صرحك القادم بأعلى معايير الإتقان والفخامة الهندسيّة.",
    ctaBtn: "ابدأ استشارتك الاستراتيجية الآن",
    footerQuote: "شركة لمعة أبيات للمقاولات... نبني المستقبل بإتقان."
  },
};

export default function AboutPage() {
  const { lang } = useLanguage();
  const text = content[lang as keyof typeof content];
  const isRtl = lang === "ar";

  // تتبع الماوس والمؤشر الخاص
  const { x, y } = useMousePosition();
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  // السكرول للتأثيرات البارالاكس
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const yHero = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div
      ref={containerRef}
      dir={isRtl ? "rtl" : "ltr"}
      className="relative min-h-screen bg-[#fafafa] text-neutral-900 dark:bg-[#070708] dark:text-neutral-50 overflow-hidden transition-colors duration-700 selection:bg-primary/30"
    >
      {/* 1. Global Mouse Glow Background Effect */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-30 blur-[140px] transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 350px at ${x}px ${y}px, rgba(var(--primary-rgb, 140, 100, 255), 0.18), transparent 80%)`,
        }}
      />

      {/* 2. Custom Fluid Cursor (Hidden on mobile) */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block rounded-full bg-primary/20 border border-primary/40 backdrop-blur-[2px]"
        animate={{
          x: x - (isHoveringClickable ? 24 : 10),
          y: y - (isHoveringClickable ? 24 : 10),
          width: isHoveringClickable ? 48 : 20,
          height: isHoveringClickable ? 48 : 20,
        }}
        transition={{ type: "spring", stiffness: 450, damping: 28, mass: 0.2 }}
      />

      {/* 3. Luxury Decorative Background Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-amber-500/5 to-transparent blur-[150px] pointer-events-none" />

      {/* --- HERO SECTION WITH PARALLAX --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
        <motion.div
          style={{ y: yHero, opacity: opacityHero }}
          className="relative z-10 max-w-5xl mx-auto text-center space-y-8"
        >
          {/* Badge Grid with Entrance Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md text-primary text-xs md:text-sm font-semibold uppercase tracking-widest border border-primary/20 shadow-lg shadow-primary/5">
              {text.badge}
            </span>
          </motion.div>

          {/* Main Titles */}
          <h1 className="font-serif text-5xl md:text-8xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="block"
            >
              {text.heroTitle}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="block mt-2 text-3xl md:text-5xl font-sans font-medium text-primary tracking-wide"
            >
              {text.heroSubtitle}
            </motion.span>
          </h1>

          {/* Luxury Divider */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full"
          />
        </motion.div>

        {/* Decorative Scroll Indicator */}
        <div className="absolute bottom-10 left-100 right-100 flex justify-center">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-neutral-400 dark:border-neutral-600 rounded-full flex justify-center p-1"
          >
            <div className="w-1.5 h-2 bg-primary rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* --- STATS SECTION (ANIMATED COUNTERS) --- */}
      <section className="relative z-10 py-12 px-6 max-w-7xl mx-auto -mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {text.stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 text-center bg-white/40 dark:bg-neutral-900/30 backdrop-blur-md rounded-3xl border border-white/20 dark:border-neutral-800/40 shadow-xl"
            >
              <div className="text-3xl md:text-5xl font-black text-primary font-mono mb-2">
                <AnimatedCounter value={stat.value} />
                <span className="text-2xl md:text-3xl ml-1">{stat.suffix}</span>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs md:text-sm font-medium tracking-wide uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- WHY CHOOSE US SECTION (TILT CARDS & SPOTLIGHT) --- */}
      <section className="relative z-10 py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold font-serif tracking-tight">{text.featuresTitle}</h2>
          <p className="text-lg text-neutral-500 dark:text-neutral-400">{text.featuresSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {text.features.map((f, i) => (
            <TiltCard key={i}>
              <div className="p-8 h-full flex flex-col justify-between group">
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 text-primary rounded-2xl flex items-center justify-center mb-8 border border-primary/20 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 tracking-tight group-hover:text-primary transition-colors duration-300">
                    {f.title}
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                <div className="mt-6 w-full h-[2px] bg-gradient-to-r from-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* --- MISSION, VISION & VALUES (ADVANCED GLASSMORPHISM) --- */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vision Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-10 md:p-14 bg-gradient-to-br from-white/30 to-white/5 dark:from-neutral-900/50 dark:to-neutral-900/10 backdrop-blur-2xl border border-white/30 dark:border-neutral-800/40 rounded-[32px] shadow-2xl flex flex-col md:flex-row gap-6 items-start"
          >
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-serif mb-4 text-amber-500">{text.mvv.vision.title}</h3>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">{text.mvv.vision.desc}</p>
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-10 md:p-14 bg-gradient-to-br from-white/30 to-white/5 dark:from-neutral-900/50 dark:to-neutral-900/10 backdrop-blur-2xl border border-white/30 dark:border-neutral-800/40 rounded-[32px] shadow-2xl flex flex-col md:flex-row gap-6 items-start"
          >
            <div className="p-4 bg-primary/10 text-primary rounded-2xl border border-primary/20">
              <Rocket className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-serif mb-4 text-primary">{text.mvv.mission.title}</h3>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">{text.mvv.mission.desc}</p>
            </div>
          </motion.div>
        </div>

        {/* Core Values Rows */}
        <div className="mt-12 p-8 md:p-12 bg-white/20 dark:bg-neutral-900/20 backdrop-blur-xl border border-white/20 dark:border-neutral-800/20 rounded-[32px] shadow-xl">
          <h3 className="text-xl font-bold uppercase tracking-wider text-center mb-10 text-neutral-400 dark:text-neutral-500">
            {text.mvv.values.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divider-y md:divider-y-0 md:divider-x dark:divider-neutral-800">
            {text.mvv.values.items.map((item, idx) => (
              <div key={idx} className="space-y-3 px-4 text-center md:text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <h4 className="font-bold text-lg text-neutral-800 dark:text-neutral-200">{item.title}</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE TIMELINE SECTION --- */}
      <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-serif tracking-tight">{text.timelineTitle}</h2>
        </div>

        <div className="relative border-l-2 dark:border-l border-neutral-300 dark:border-neutral-800 ml-4 md:ml-32 space-y-12 py-4">
          {text.timeline.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative pl-8 md:pl-12 group"
            >
              {/* Point indicator */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-neutral-950 border-2 border-primary group-hover:bg-primary transition-all duration-300 shadow-sm" />

              {/* Year float on left side */}
              <div className="hidden md:block absolute left-[-140px] top-0 text-right w-24 font-mono font-black text-2xl text-neutral-400 dark:text-neutral-600 group-hover:text-primary transition-colors duration-300">
                {item.year}
              </div>

              {/* Box Info */}
              <div className="p-6 bg-white/50 dark:bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-neutral-800/40 shadow-md group-hover:shadow-xl transition-shadow duration-300">
                <span className="inline-block md:hidden font-mono font-bold text-primary mb-1">{item.year}</span>
                <h3 className="font-bold text-lg mb-2 text-neutral-900 dark:text-neutral-100">{item.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- PREMIUM CALL TO ACTION (CTA) --- */}
      <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto mb-24">
        <div className="relative overflow-hidden rounded-[40px] bg-neutral-900 dark:bg-gradient-to-br dark:from-neutral-900 dark:to-neutral-950 text-white p-10 md:p-20 shadow-2xl border border-white/10">
          {/* Animated Ambient background circle */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-6xl font-serif font-bold tracking-tight leading-tight">
              {text.ctaTitle}
            </h2>
            <p className="text-neutral-400 text-lg md:text-xl font-light">
              {text.ctaSubtitle}
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setIsHoveringClickable(true)}
              onMouseLeave={() => setIsHoveringClickable(false)}
              className="inline-block"
            >
              <button className="flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-semibold text-base shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all duration-300">
                {text.ctaBtn}
                <ArrowRight className={`w-5 h-5 transform ${isRtl ? "rotate-180" : ""}`} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- BRAND FOOTER SLOGAN QUOTE --- */}
      <footer className="relative z-10 py-12 px-6 border-t border-neutral-200 dark:border-neutral-900 text-center text-neutral-400 dark:text-neutral-600">
        <p className="text-xl md:text-2xl font-serif font-bold text-primary max-w-4xl mx-auto">
          {text.footerQuote}
        </p>
      </footer>
    </div>
  );
}