"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { fetchArticles, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import Link from "next/link";
import { Calendar, User, ArrowLeft, ArrowRight, Eye, Sparkles, Target, Compass, Award, ShieldCheck, CheckCircle2, MessageSquare, ArrowUpRight } from "lucide-react";

// المسميات الافتراضية للفئات الملونة
const categoryColorMap: Record<string, string> = {
  general: "from-blue-500 to-cyan-500",
  construction: "from-amber-500 to-orange-600",
  equipment: "from-emerald-500 to-teal-600",
  security: "from-red-500 to-rose-600",
};

// --- Custom Mouse Tracker Hook for Spotlight and Custom Cursor ---
function useMouseTracker() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [isClickable, setIsClickable] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      const isHoverClickable = !!target.closest("button, a, select, input, [role='button']");
      setIsClickable(isHoverClickable);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY, isClickable };
}

// --- Animated Counter Component ---
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = Math.max(Math.floor(totalMiliseconds / end), 30);

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span ref={nodeRef}>{count}</span>;
}

// --- Premium Tilt Card Element with Spotlight Glow & Animated Gradient Border ---
function PremiumArticleCard({ article, index, lang }: { article: any; index: number; lang: 'ar' | 'en' }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const localX = useMotionValue(0);
  const localY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    localX.set(e.clientX - rect.left);
    localY.set(e.clientY - rect.top);
  };

  const title = article.title?.[lang] || article.title?.en || article.title;
  const excerpt = article.excerpt?.[lang] || article.excerpt?.en || article.excerpt;
  const image = getImageUrl(article.image);
  const authorName = article.author?.name?.[lang] || article.author?.name?.en || 'Admin';
  const categoryName = article.category?.name?.[lang] || article.category?.name?.en || 'General';
  const catKey = (article.category?.slug || 'general').toLowerCase();
  const gradientClass = categoryColorMap[catKey] || "from-primary to-cyan-500";

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.12, 0.4), type: "spring", stiffness: 60 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-border/40 bg-card/40 backdrop-blur-xl p-4 shadow-xl hover:shadow-3xl dark:hover:shadow-primary/5 transition-all duration-500 h-full w-full"
    >
      {/* 1. Animated Moving Gradient Border */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[32px] p-[1.5px] bg-gradient-to-r from-primary via-cyan-500 to-amber-500 bg-[length:200%_auto] animate-gradient-shift" />

      {/* 2. Mouse Spotlight Radial Mask */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(240px circle at ${localX.get()}px ${localY.get()}px, rgba(var(--primary-rgb), 0.09), transparent 70%)`,
        }}
      />

      {/* Image Container with Cinematic Shine & Zoom */}
      <div className="relative z-10 w-full aspect-[16/10] rounded-[24px] overflow-hidden bg-muted/50 mb-5 shadow-inner">
        <Link href={`/blogs/${article.slug}`} className="block w-full h-full cursor-none">
          <img
            src={image || '/no-image.jpg'}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
            onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.jpg'; }}
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none z-10" />

        {/* Hover View Detail Overlay Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center gap-3 z-20">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-full bg-white text-black shadow-2xl flex items-center justify-center">
            <Link href={`/blogs/${article.slug}`} className="cursor-none"><Eye className="w-5 h-5" /></Link>
          </motion.div>
        </div>

        {/* Badge Floating */}
        <span className={`absolute top-4 start-4 px-3.5 py-1 text-[10px] font-bold tracking-widest uppercase text-white bg-gradient-to-r ${gradientClass} rounded-full shadow-lg border border-white/10 backdrop-blur-md`}>
          {categoryName}
        </span>
      </div>

      {/* Card Metadata & Typography Details */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-2">
        <div className="space-y-3">
          <Link href={`/blogs/${article.slug}`} className="block cursor-none">
            <h3 className="text-xl font-bold text-foreground font-serif tracking-tight line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
          </Link>
          <p className="text-muted-foreground text-sm font-light leading-relaxed line-clamp-3 opacity-85">
            {excerpt}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary/70" />
              <span className="font-medium max-w-[90px] truncate">{authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              <span>
                {article.published_at
                  ? new Date(article.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
                  : ''}
              </span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link href={`/blogs/${article.slug}`} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted/60 border border-border/60 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 cursor-none">
              {lang === 'ar' ? <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" /> : <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />}
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

// --- Skeleton Loader Screen Grid ---
function PremiumSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 w-full">
      {[1, 2, 3].map((idx) => (
        <div key={idx} className="p-5 rounded-[32px] border border-border/30 bg-card/20 space-y-5 animate-pulse w-full">
          <div className="bg-muted rounded-[24px] aspect-[16/10] w-full" />
          <div className="space-y-3 px-2">
            <div className="h-5 bg-muted rounded-md w-1/3" />
            <div className="h-4 bg-muted rounded-md w-full" />
            <div className="h-4 bg-muted rounded-md w-3/4" />
            <div className="h-10 bg-muted rounded-xl w-full pt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ArticlesPage() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Parallax Mechanics via Framer Motion useScroll
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const bgTransformY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  // Cursor Integration
  const { mouseX, mouseY, isClickable } = useMouseTracker();
  const smoothCursorX = useSpring(mouseX, { stiffness: 350, damping: 25 });
  const smoothCursorY = useSpring(mouseY, { stiffness: 350, damping: 25 });

  // Hero interactive track pos
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroMouse, setHeroMouse] = useState({ x: 50, y: 50 });

  useEffect(() => {
    fetchArticles().then(data => {
      setArticles(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setHeroMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div ref={containerRef} dir={isRtl ? "rtl" : "ltr"} className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden md:cursor-none select-none">

      {/* 1. Global Custom Fluid Elastic Smooth Cursor + Glow */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block rounded-full border border-primary/40 bg-primary/5 backdrop-blur-[1.5px] w-6 h-6 -ml-3 -mt-3 shadow-lg shadow-primary/20"
        style={{ x: smoothCursorX, y: smoothCursorY }}
        animate={{
          scale: isClickable ? 2.3 : 1,
          borderColor: isClickable ? "var(--primary)" : "rgba(var(--primary-rgb), 0.4)",
          backgroundColor: isClickable ? "rgba(var(--primary-rgb), 0.1)" : "rgba(var(--primary-rgb), 0.02)",
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.2 }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-15 dark:opacity-20 blur-[130px] hidden md:block"
        style={{
          background: `radial-gradient(circle 350px at ${mouseX.get()}px ${mouseY.get()}px, var(--primary), transparent 80%)`,
        }}
      />

      {/* Static Noise Background and ambient layers */}
      <motion.div style={{ y: bgTransformY }} className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] end-[-10%] w-[700px] h-[700px] bg-primary/5 blur-[150px] rounded-full animate-pulse duration-10000" />
        <div className="absolute bottom-[20%] start-[-10%] w-[800px] h-[800px] bg-cyan-500/5 blur-[180px] rounded-full animate-pulse duration-7000" />
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01] bg-[url('/noise.png')]" />
      </motion.div>

      {/* ================= HERO SECTION ================= */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-12 text-center overflow-hidden border-b border-border/40 bg-gradient-to-b from-muted/10 to-transparent z-10"
      >
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-300 opacity-50 mix-blend-screen dark:mix-blend-normal"
          style={{
            background: `radial-gradient(700px circle at ${heroMouse.x}% ${heroMouse.y}%, rgba(var(--primary-rgb), 0.12), transparent 70%)`,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl text-primary text-xs font-semibold tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-amber-500" />
            {isRtl ? 'رؤى هندسية وأخبار المقاولات' : 'Construction Insights & Tech Trends'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 leading-tight"
          >
            {isRtl ? 'مدونة لمعة أبيات الرائدة' : 'Lamat Abyat Premium Blog'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground font-light leading-relaxed opacity-90"
          >
            {isRtl
              ? 'بوابتك المعرفية الشاملة حول آليات صيانة المعدات الثقيلة، معايير الأمن السيبراني للمنشآت، وأحدث تقنيات الإشراف الهندسي المعماري المتطور.'
              : 'Your gateway to strategic knowledge on heavy machinery management, cybersecurity in structural enterprise, and optimal engineering methodologies.'}
          </motion.p>
        </div>
      </section>

      {/* ================= STATS / COUNTERS SECTION ================= */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10 border-b border-border/40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { en: "Active Projects", ar: "مشاريع نشطة", val: 42 },
            { en: "Heavy Equipment", ar: "معدة ثقيلة مفعّلة", val: 88 },
            { en: "Articles Published", ar: "مقال هندسي متقدم", val: 150 },
            { en: "Expert Engineers", ar: "مهندس استشاري", val: 35 }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card/20 backdrop-blur-md border border-border/40"
            >
              <h3 className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-1">
                +<AnimatedCounter value={stat.val} />
              </h3>
              <p className="text-xs sm:text-sm font-light text-muted-foreground">{isRtl ? stat.ar : stat.en}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= ARTICLES ARTICLES LAYOUT AREA ================= */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-border/30 pb-6">
          <div>
            <h2 className="text-2xl font-serif font-light tracking-wide">{isRtl ? 'آخر الإصدارات والمقالات' : 'Latest Insights'}</h2>
            <p className="text-sm text-muted-foreground font-light mt-1">{isRtl ? 'تصفح أحدث التحليلات والتقارير الميدانية المصاغة بخبرات هندسية' : 'Browse highly curated engineering papers and on-site logs'}</p>
          </div>
        </div>

        {loading ? (
          <PremiumSkeletonGrid />
        ) : articles.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card/20 backdrop-blur-md border border-dashed border-border/60 rounded-[32px] max-w-md mx-auto p-8">
            <p className="text-muted-foreground text-sm font-light">{isRtl ? 'لا توجد مستندات أو مقالات مضافة حالياً.' : 'No engineering records found.'}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {articles.map((article, idx) => (
              <PremiumArticleCard key={article.id} article={article} index={idx} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* ================= CORE STRATEGIC SECTION (WHY CHOOSE US / VALUES) ================= */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-12 bg-muted/10 border-y border-border/40 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

          {/* Mission & Vision Left Block */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8 lg:sticky lg:top-32"
          >
            <div>
              <span className="text-xs tracking-[0.2em] font-semibold text-primary uppercase block mb-2">// {isRtl ? 'رسالتنا ورؤيتنا' : 'Identity Framework'}</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-foreground">{isRtl ? 'القيادة المعرفية الرقمية' : 'The Paradigm of Authority'}</h2>
            </div>

            <div className="p-6 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <Target className="w-5 h-5" />
                <h4 className="font-semibold text-sm tracking-wide">{isRtl ? 'رسالتنا' : 'Our Mission'}</h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                {isRtl ? 'تمكين قطاعات الإنشاءات والمقاولات من بنية معلوماتية فائقة الأمان تحمي الأصول التشغيلية وتضمن استدامة سلاسل الإمداد الميداني.' : 'To reinforce construction sectors with flawless informational security architectures, maintaining structural resilience.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-3 text-amber-500">
                <Compass className="w-5 h-5" />
                <h4 className="font-semibold text-sm tracking-wide">{isRtl ? 'رؤيتنا' : 'Our Vision'}</h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                {isRtl ? 'أن نصبح المرجع التكنولوجي الأول في الشرق الأوسط لربط هندسة البناء التقليدية بأنظمة الحماية والتحليل البرمجي الفعال.' : 'To become the supreme Middle-Eastern portal converging standard machinery tasks with automated secure testing vectors.'}
              </p>
            </div>
          </motion.div>

          {/* Core Values & Why Choose Us Interleaved List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs tracking-[0.3em] font-bold uppercase text-muted-foreground mb-4">{isRtl ? 'لماذا تختار لمعة أبيات؟ / قيمنا الجوهرية' : 'Strategic Pillars & Values'}</h3>

            {[
              { titleAr: "النزاهة والمصداقية الهندسية", titleEn: "Engineering Authenticity", descAr: "نلتزم بتقديم تقارير وحقائق مبنية على قياسات دقيقة واختبارات فنية حقيقية.", descEn: "All evaluations originate strictly from precise algorithmic measures and true dynamic test suites.", icon: Award },
              { titleAr: "الأمان السيبراني الشامل للأصول", titleEn: "Asset Cyber Defense", descAr: "نحمي أنظمة تشغيل المعدات وسيرفرات التحكم من أي اختراقات أو تلاعب بالشبكات اللاسلكية.", descEn: "Securing operational fleet telemetry from deep packet injectors and wireless network exploitation.", icon: ShieldCheck },
              { titleAr: "الابتكار التكنولوجي المستمر", titleEn: "Persistent Tech Evolution", descAr: "ندمج أدوات الذكاء الاصطناعي المحلي والأتمتة لتسريع وتيرة اتخاذ القرار داخل المواقع.", descEn: "Deploying local containerized models and advanced shell automations to shorten lifecycle times.", icon: CheckCircle2 }
            ].map((item, index) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ x: isRtl ? -6 : 6 }}
                  className="p-6 rounded-[24px] border border-border/40 bg-card/10 backdrop-blur-md flex gap-5 items-start transition-all duration-300 hover:border-primary/30"
                >
                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary flex-shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold tracking-tight text-foreground">{isRtl ? item.titleAr : item.titleEn}</h4>
                    <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed">{isRtl ? item.descAr : item.descEn}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= INTERACTIVE EXPERIENCE TIMELINE SECTION ================= */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto w-full z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-semibold tracking-widest text-primary">// {isRtl ? 'رحلتنا المعرفية' : 'Historical Trajectory'}</span>
          <h2 className="text-3xl font-serif font-light mt-2">{isRtl ? 'التطور التاريخي والزمني للمؤسسة' : 'Milestone Development Timeline'}</h2>
        </div>

        <div className="relative border-s border-border/60 ms-4 md:ms-32 space-y-12">
          {[
            { date: "2024", titleAr: "تأسيس البوابة اللوجستية", titleEn: "Logistical Infrastructure Launch", textAr: "إطلاق ذراع النقل الثقيل وإدارة مجموعات الحمولات المتكاملة الإقليمية بين المدن.", textEn: "Inauguration of regional multi-axle logistics services and commercial fleet routing frameworks." },
            { date: "2025", titleAr: "التحول الشامل للأنظمة السحابية", titleEn: "Cloud Enterprise Scale", textAr: "بناء أنظمة مخصصة عبر Laravel و Next.js لربط طلبات التسعير والتحكم بالعملاء إلكترونياً.", textEn: "Developing custom architecture with Next.js and robust secure layers to centralize quotation data flows." },
            { date: "2026", titleAr: "تكامل الحماية وهندسة الأتمتة", titleEn: "Cyber Security & Automated Operations", textAr: "تفعيل طبقات فحص واختبار اختراق الشبكات مع تشغيل نماذج الذكاء الاصطناعي Ollama محلياً.", textEn: "Enforcing advanced packet analysis pipelines, wireless penetration testing blueprints, and localized AI." }
          ].map((time, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="relative ps-8 group"
            >
              {/* Timeline point indicator */}
              <div className="absolute -start-[6.5px] top-1.5 w-3 h-3 rounded-full bg-border border border-background transition-all duration-300 group-hover:bg-primary group-hover:scale-125 group-hover:ring-4 group-hover:ring-primary/20" />

              {/* Floating year tag */}
              <div className="md:absolute md:-start-28 md:top-0 font-serif font-bold text-sm tracking-widest text-primary/40 group-hover:text-primary transition-colors">
                [{time.date}]
              </div>

              <div className="p-6 rounded-2xl border border-border/30 bg-card/10 backdrop-blur-md space-y-1 group-hover:border-border/80 transition-all duration-300">
                <h4 className="text-sm font-semibold tracking-wide text-foreground">{isRtl ? time.titleAr : time.titleEn}</h4>
                <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed">{isRtl ? time.textAr : time.textEn}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= HIGH-END LUXURY CTA SECTION ================= */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full z-10 mb-16">
        <div className="relative rounded-[40px] border border-border/40 bg-gradient-to-br from-card/60 via-card/20 to-primary/5 backdrop-blur-3xl p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl text-center space-y-8">

          {/* Decorative internal ambient lamps */}
          <div className="absolute -top-12 -end-12 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-12 -start-12 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-tight">
              {isRtl ? 'هل لديك مشروع يحتاج إلى صياغة وحماية استشارية؟' : 'Ready to Reinforce Your Infrastructure?'}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
              {isRtl
                ? 'تواصل مع الطاقم التنفيذي في لمعة أبيات الآن، لنقوم بدراسة متطلباتك الهندسية وتوفير حلول برمجية وميدانية معززة بأعلى درجات الكفاءة.'
                : 'Initiate a tactical layout session with Lamat Abyat expert taskforce. Let us align your physical fleet assets and local server environments.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto relative group overflow-hidden px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl text-xs sm:text-sm tracking-widest uppercase shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-none"
            >
              <Link href="/contact" className="flex items-center justify-center gap-2 cursor-none">
                <MessageSquare className="w-4 h-4" />
                {isRtl ? 'طلب استشارة تنفيذية فورية' : 'Consult Our Engineers'}
              </Link>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto px-8 py-4 border border-border/80 hover:border-foreground/60 text-foreground font-semibold rounded-xl text-xs sm:text-sm tracking-widest uppercase backdrop-blur-sm transition-all duration-300 cursor-none"
            >
              <Link href="/shop" className="flex items-center justify-center gap-2 cursor-none">
                {isRtl ? 'تصفح قائمة الخدمات والمعدات' : 'Explore Heavy Assets'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.button>
          </div>

        </div>
      </section>

    </div>
  );
}