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
        <Link href={`/blogs/${article.slug}`} className="block w-full h-full  ">
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
            <Link href={`/blogs/${article.slug}`} className=" "><Eye className="w-5 h-5" /></Link>
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
          <Link href={`/blogs/${article.slug}`} className="block  ">
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
            <Link href={`/blogs/${article.slug}`} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted/60 border border-border/60 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300  ">
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
    <div ref={containerRef} dir={isRtl ? "rtl" : "ltr"} className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden md:  select-none">

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
            {isRtl ? 'مدونة لمعة أبيات ' : 'Lamat Abyat Blog'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground font-light leading-relaxed opacity-90"
          >
            {isRtl
              ? ' اكتشف مقالاتنا المتخصصة حول أحدث تقنيات البناء، نصائح تشغيل وصيانة المعدات الثقيلة، وأفضل الممارسات لإدارة مشاريعك بنجاح.'
              : 'Discover our expert articles on the latest construction technologies, heavy equipment operation and maintenance tips, and best practices for successful project management.'}
          </motion.p>
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
              <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-foreground">{isRtl ? 'ريادة البناء والتشييد' : 'The Paradigm of Construction'}</h2>
            </div>

            <div className="p-6 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <Target className="w-5 h-5" />
                <h4 className="font-semibold text-sm tracking-wide">{isRtl ? 'رسالتنا' : 'Our Mission'}</h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                {isRtl ? 'تقديم حلول إنشائية متكاملة وخدمات تأجير معدات ثقيلة تلبي تطلعات عملائنا، والمساهمة الفعالة في النهضة العمرانية للمملكة العربية السعودية بما يتوافق مع رؤية 2030.' : 'To provide integrated construction solutions and heavy equipment rentals that meet customer aspirations, contributing to the Kingdom\'s development in alignment with Vision 2030.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-3 text-amber-500">
                <Compass className="w-5 h-5" />
                <h4 className="font-semibold text-sm tracking-wide">{isRtl ? 'رؤيتنا' : 'Our Vision'}</h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                {isRtl ? 'أن نكون الشركة الرائدة والأكثر موثوقية في قطاع المقاولات وتوفير المعدات الثقيلة، من خلال تقديم أعلى معايير الجودة والابتكار في تنفيذ المشاريع.' : 'To be the leading and most trusted contracting and heavy equipment firm through top-tier quality standards and project innovation.'}
              </p>
            </div>
          </motion.div>

          {/* Core Values & Why Choose Us Interleaved List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs tracking-[0.3em] font-bold uppercase text-muted-foreground mb-4">{isRtl ? 'لماذا تختار لمعة أبيات؟ / قيمنا الجوهرية' : 'Strategic Pillars & Values'}</h3>

            {[
              { titleAr: "النزاهة والشفافية المطلقة", titleEn: "Absolute Integrity", descAr: "نلتزم بالوضوح التام والمصداقية في كافة تعاملاتنا العقودية، وحساب التكاليف، وإدارة المشاريع الميدانية.", descEn: "We maintain total transparency and credibility across all contractual agreements, cost estimations, and field construction workflows.", icon: Award },
              { titleAr: "الالتزام التام بمعايير السلامة", titleEn: "Uncompromising Safety", descAr: "نضع سلامة الكوادر البشرية وتأمين المواقع وتشغيل المعدات الثقيلة في مقدمة أولوياتنا التشغيلية بدون استثناء.", descEn: "Prioritizing human resource safety, site security, and heavy machinery operations above all operational metrics.", icon: ShieldCheck },
              { titleAr: "الاستدامة والحلول الصديقة للبيئة", titleEn: "Sustainability Focus", descAr: "نتبنى أحدث ممارسات البناء المستدام وطرق التشغيل الفعالة لتقليل الأثر البيئي وتعظيم كفاءة الموارد.", descEn: "Adopting modern eco-friendly construction methods and resource-efficient operations to support green building goals.", icon: CheckCircle2 }
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
          <span className="text-xs uppercase font-semibold tracking-widest text-primary">// {isRtl ? 'مسيرتنا الإنشائية' : 'Corporate Journey'}</span>
          <h2 className="text-3xl font-serif font-light mt-2">{isRtl ? 'التطور التاريخي والزمني للمؤسسة' : 'Milestone Development Timeline'}</h2>
        </div>

        <div className="relative border-s border-border/60 ms-4 md:ms-32 space-y-12">
          {[
            { date: "2024", titleAr: "تأسيس الأسطول اللوجستي للمعدات", titleEn: "Heavy Asset Fleet Foundation", textAr: "تأسيس النواة الأولى للشركة عبر توفير شاحنات النقل الثقيل والمعدات التخصصية وبدء تشغيل خدمات النقل والإمداد الميداني بين المدن.", textEn: "Launching our core logistical operations by introducing heavy duty lowbeds and specialized transport equipment for regional cross-city routing." },
            { date: "2025", titleAr: "التوسع في قطاع المقاولات العامة", titleEn: "General Contracting Scale", textAr: "دخول قطاع التشييد والبناء وتوقيع شراكات استراتيجية لتنفيذ البنى التحتية والمشاريع الإنشائية بالاعتماد على أسطولنا المتكامل الكفاءة.", textEn: "Expanding directly into structural building, infrastructure works, and general contracting via our highly reliable integrated machinery fleet." },
            { date: "2026", titleAr: "أتمتة العمليات والحلول الرقمية للمشاريع", titleEn: "Smart Fleet Management & Vision 2030 Aligned", textAr: "دمج أنظمة المتابعة الذكية لإدارة المعدات وتوسيع نطاق العمل لدعم مشاريع التنمية الكبرى بالمملكة العربية السعودية وفق أرقى معايير الجودة.", textEn: "Integrating digital heavy fleet tracking systems while scaling project executions to strongly back major infrastructure goals aligned with Vision 2030." }
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
              {isRtl ? 'هل تبحث عن شريك موثوق لتنفيذ مشروعك القادم؟' : 'Ready to Elevate Your Next Construction Project?'}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
              {isRtl
                ? 'تواصل مع فريق الخبراء والمهندسين في لمعة أبيات الآن، لنقوم بدراسة مخططاتك الهندسية وتوفير أحدث المعدات الثقيلة والحلول الإنشائية لضمان نجاح مشروعك.'
                : 'Get in touch with Lamat Abyat engineering and heavy machinery experts today. Let us review your requirements and secure optimal construction workflows.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto relative group overflow-hidden px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl text-xs sm:text-sm tracking-widest uppercase shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              <Link href="/contact" className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {isRtl ? 'طلب تسعير ومناقشة المشروع' : 'Request Quote & Consultation'}
              </Link>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto px-8 py-4 border border-border/80 hover:border-foreground/60 text-foreground font-semibold rounded-xl text-xs sm:text-sm tracking-widest uppercase backdrop-blur-sm transition-all duration-300"
            >
              <Link href="/shop" className="flex items-center justify-center gap-2">
                {isRtl ? 'تصفح المعدات والخدمات المتاحة' : 'Explore Fleet & Services'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.button>
          </div>

        </div>
      </section>

    </div>
  );
}