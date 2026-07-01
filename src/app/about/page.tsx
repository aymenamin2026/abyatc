"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { Award, Briefcase, Target, CheckCircle2, Eye, Rocket, ArrowRight } from "lucide-react";

// --- Animated Counter Component ---
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

    const rX = ((mouseY - height / 2) / height) * -10;
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

// كرت زجاجي تفاعلي يعتمد بالكامل على متغيرات ثيم موقعك الأصلي
function TiltCard({ children }: { children: React.ReactNode }) {
  const { ref, rotateX, rotateY, glowX, glowY, isHovered, setIsHovered, handleMouseMove, handleMouseLeave } = useTiltEffect();

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
      animate={{ rotateX: rotateX, rotateY: rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-[24px] border border-border/60 bg-card/60 backdrop-blur-xl shadow-xl transition-all duration-300 h-full w-full"
    >
      {/* Spotlight Hover Glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${glowX}px ${glowY}px, rgba(var(--primary), 0.1), transparent 40%)`,
        }}
      />
      <div style={{ transform: "translateZ(20px)" }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}

// --- النصوص والبيانات المنظمة ---
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
      { icon: Award, title: "Quality Assurance", desc: "Highest standards implemented at every single project stage." },
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
      className="relative min-h-screen bg-background text-foreground overflow-x-hidden w-full transition-colors duration-500 selection:bg-primary/30"
    >
      {/* --- HERO SECTION WITH PARALLAX --- */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden w-full">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="relative z-10 max-w-5xl mx-auto text-center space-y-8 w-full">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 shadow-sm">
              {text.badge}
            </span>
          </motion.div>

          <h1 className="font-serif text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="block">
              {text.heroTitle}
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="block mt-2 text-2xl md:text-4xl font-sans font-medium text-primary">
              {text.heroSubtitle}
            </motion.span>
          </h1>
        </motion.div>
      </section>

      {/* --- STATS SECTION (ANIMATED COUNTERS) --- */}
      <section className="relative z-10 py-10 px-4 sm:px-6 max-w-7xl mx-auto -mt-16 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
          {text.stats.map((stat, i) => (
            <div key={i} className="p-4 md:p-6 text-center bg-card/40 border border-border/50 backdrop-blur-md rounded-2xl shadow-sm w-full">
              <div className="text-2xl md:text-5xl font-bold text-primary font-mono mb-2">
                <AnimatedCounter value={stat.value} />
                <span className="text-xl md:text-3xl ml-1">{stat.suffix}</span>
              </div>
              <p className="text-muted-foreground text-[10px] md:text-sm font-medium uppercase tracking-wide line-clamp-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- WHY CHOOSE US (TILT & SPOTLIGHT CARDS) --- */}
      <section className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold font-serif tracking-tight text-foreground">{text.featuresTitle}</h2>
          <p className="text-sm md:text-lg text-muted-foreground">{text.featuresSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {text.features.map((f, i) => (
            <TiltCard key={i}>
              <div className="p-6 md:p-8 h-full flex flex-col justify-between group w-full">
                <div>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="font-bold text-lg md:text-xl mb-2 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* --- MISSION & VISION (ADVANCED GLASSMORPHISM) --- */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 w-full">
          <motion.div whileHover={{ y: -4 }} className="p-6 md:p-10 bg-card/50 backdrop-blur-xl border border-border/50 rounded-[32px] shadow-xl flex flex-col sm:flex-row gap-6 items-start w-full">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl shrink-0"><Eye className="w-6 h-6 md:w-8 md:h-8" /></div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold font-serif mb-3 md:mb-4 text-foreground">{text.mvv.vision.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{text.mvv.vision.desc}</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="p-6 md:p-10 bg-card/50 backdrop-blur-xl border border-border/50 rounded-[32px] shadow-xl flex flex-col sm:flex-row gap-6 items-start w-full">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl shrink-0"><Rocket className="w-6 h-6 md:w-8 md:h-8" /></div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold font-serif mb-3 md:mb-4 text-primary">{text.mvv.mission.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{text.mvv.mission.desc}</p>
            </div>
          </motion.div>
        </div>

        {/* Core Values Box */}
        <div className="mt-12 p-6 md:p-12 bg-card/30 backdrop-blur-xl border border-border/50 rounded-[32px] shadow-lg w-full">
          <h3 className="text-lg md:text-xl font-bold tracking-wider text-center mb-10 text-muted-foreground">{text.mvv.values.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {text.mvv.values.items.map((item, idx) => (
              <div key={idx} className="space-y-3 text-center w-full">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{idx + 1}</div>
                <h4 className="font-bold text-base md:text-lg text-foreground">{item.title}</h4>
                <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE TIMELINE SECTION --- */}
      <section className="relative z-10 py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-serif tracking-tight text-foreground">{text.timelineTitle}</h2>
        </div>
        <div className="relative border-s-2 border-border ms-2 md:ms-32 space-y-12 py-4 w-full">
          {text.timeline.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: isRtl ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative ps-6 md:ps-12 group w-full">
              <div className="absolute -start-[9px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:bg-primary transition-all duration-300" />
              <div className="hidden md:block absolute -start-[140px] top-0 text-right w-24 font-mono font-bold text-xl text-muted-foreground group-hover:text-primary transition-colors duration-300">{item.year}</div>
              <div className="p-6 bg-card/50 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm w-full max-w-[calc(100%-16px)]">
                <span className="inline-block md:hidden font-mono font-bold text-primary mb-1">[{item.year}]</span>
                <h3 className="font-bold text-base md:text-lg mb-2 text-foreground">{item.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-6xl mx-auto mb-20 w-full">
        <div className="relative overflow-hidden rounded-[32px] bg-card border border-border/80 p-8 md:p-16 shadow-2xl text-center space-y-6 w-full">
          <h2 className="text-2xl md:text-5xl font-serif font-bold text-foreground leading-tight">{text.ctaTitle}</h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">{text.ctaSubtitle}</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block w-full sm:w-auto">
            <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-300 w-full">
              {text.ctaBtn}
              <ArrowRight className={`w-5 h-5 transform ${isRtl ? "rotate-180" : ""}`} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER QUOTE --- */}
      <footer className="relative z-10 py-12 text-center border-t border-border/60 w-full">
        <p className="text-lg md:text-2xl font-serif font-bold text-primary max-w-4xl mx-auto px-6">{text.footerQuote}</p>
      </footer>
    </div>
  );
}