"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { fetchArticles, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform, useInView } from "framer-motion"; import Link from "next/link";

import { Calendar, User, ArrowRight, ArrowLeft, Eye, ShieldCheck, Target, Award, Compass, Zap } from "lucide-react";
import { t } from "@/lib/translations";
export default function ArticlesPage() {
  const { lang } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // إعدادات تتبع حركة الماوس لإعطاء تأثير الإضاءة التفاعلية في الـ Hero
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    fetchArticles().then(data => {
      setArticles(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };
  // --- HOOK: تتبع الماوس للمؤشرات المخصصة والتوهج اللامع ---
  function useGlobalMouse() {
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);
    const [isHoveredClickable, setIsHoveredClickable] = useState(false);

    useEffect(() => {
      const handleMove = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        const target = e.target as HTMLElement;
        setIsHoveredClickable(!!target.closest("button, a, select, input, [role='button']"));
      };
      window.addEventListener("mousemove", handleMove);
      return () => window.removeEventListener("mousemove", handleMove);
    }, [mouseX, mouseY]);

    return { mouseX, mouseY, isHoveredClickable };
  }

  // --- COMPONENT: كرت مقال ثلاثي الأبعاد تفاعلي (Tilt & Spotlight Floating Card) ---
  function PremiumArticleCard({ article, lang, index }: { article: any; lang: "ar" | "en"; index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const localX = useMotionValue(0);
    const localY = useMotionValue(0);

    // تأثير الـ Tilt ثلاثي الأبعاد المعتمد على موضع الماوس الفعلي فوق الكرت
    const rotateX = useTransform(localY, [0, 350], [6, -6]);
    const rotateY = useTransform(localX, [0, 300], [-6, 6]);

    const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
    const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

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

    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.93, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ type: "spring", stiffness: 60, damping: 15, delay: Math.min(index * 0.08, 0.25) }}
        className="h-full"
      >
        <motion.article
          ref={cardRef}
          onMouseMove={handleMouseMove}
          style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
          whileHover={{ y: -6, scale: 1.01 }}
          className="group relative h-full flex flex-col overflow-hidden rounded-[32px] border border-border/40 bg-card/30 backdrop-blur-2xl shadow-xl transition-all duration-300"
        >
          {/* إطار الإضاءة المتدرج المتحرك ببطء Animated Gradient Border */}
          <div className="absolute inset-0 p-[1px] rounded-[32px] bg-gradient-to-tr from-primary/30 via-transparent to-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />

          {/* كشاف تسليط الضوء الداخلي المرتبط بالماوس SpotLight Effect */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(180px circle at ${localX.get()}px ${localY.get()}px, rgba(var(--primary-rgb, 140, 100, 255), 0.12), transparent 80%)`,
            }}
          />

          {/* حاوية الصورة مع اللمعان الخاطف Shine Effect */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted m-3.5 rounded-[24px] z-10 shadow-md">
            <Link href={`/blogs/${article.slug}`} className="block w-full h-full relative group/img">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.jpg'; }}
              />
              {/* تأثير اللمعان الكريستالي العابر عند التحويم Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/img:animate-shine pointer-events-none" />
            </Link>
            <span className="absolute top-3.5 start-3.5 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-primary bg-background/90 backdrop-blur-md rounded-full shadow-sm border border-border/40">
              {categoryName}
            </span>
          </div>

          {/* تفاصيل المقال */}
          <div className="p-6 pt-2 flex flex-col flex-1 z-10" style={{ transform: "translateZ(20px)" }}>
            <Link href={`/blogs/${article.slug}`} className="block mt-2">
              <h3 className="text-xl font-bold text-foreground font-serif line-clamp-2 leading-snug tracking-tight group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed mt-3 mb-6 line-clamp-3 font-light opacity-85">
              {excerpt}
            </p>

            <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary/70" />
                  <span className="font-medium truncate max-w-[100px]">{authorName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                  <span>
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
                      : ''}
                  </span>
                </div>
              </div>

              {/* زر السهم الدائري التفاعلي المدعوم بـ Ripple Elastic effect */}
              <Link href={`/blogs/${article.slug}`} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted/40 border border-border/40 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm">
                {lang === 'ar' ? <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" /> : <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />}
              </Link>
            </div>
          </div>
        </motion.article>
      </motion.div>
    );
  }

  // --- COMPONENT: عداد رقمي متحرك متناغم وانسيابي عند التمرير ---
  function AnimatedCounter({ value, title }: { value: number; title: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isInView) return;
      let start = 0;
      const duration = 1.5;
      const end = value;
      const totalMiliseconds = duration * 1000;
      const stepTime = Math.abs(Math.floor(totalMiliseconds / end));

      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, Math.max(stepTime, 20));

      return () => clearInterval(timer);
    }, [isInView, value]);

    return (
      <div ref={ref} className="text-center p-6 rounded-2xl bg-card/10 border border-border/20 backdrop-blur-md">
        <motion.div className="text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight">
          {count}+
        </motion.div>
        <div className="text-xs tracking-wider uppercase font-medium text-muted-foreground">{title}</div>
      </div>
    );
  }

  // --- COMPONENT: هيكل عظمي تحميل فخم ومتحرك Premium Skeleton Grid ---
  function PremiumSkeletonGrid() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="p-4 rounded-[32px] border border-border/40 bg-card/20 space-y-5 animate-pulse w-full">
            <div className="bg-muted rounded-[24px] aspect-[16/10] w-full" />
            <div className="space-y-3 px-2">
              <div className="h-5 bg-muted rounded-md w-3/4" />
              <div className="h-3 bg-muted rounded-md w-full" />
              <div className="h-3 bg-muted rounded-md w-5/6" />
              <div className="h-10 bg-muted rounded-xl w-full pt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ==========================================
  //                 MAIN COMPONENT
  // ==========================================
  export default function BlogClient({ articles = [], lang = 'ar', loading = false }: { articles: any[]; lang?: 'ar' | 'en'; loading?: boolean }) {
    const isRtl = lang === "ar";
    const heroRef = useRef<HTMLDivElement>(null);

    // تفعيل كشاف الفأرة العام والمؤشر الفخم
    const { mouseX, mouseY, isHoveredClickable } = useGlobalMouse();
    const smoothCursorX = useSpring(mouseX, { stiffness: 380, damping: 26 });
    const smoothCursorY = useSpring(mouseY, { stiffness: 380, damping: 26 });

    // تتبع إحداثيات الماوس الموضعية للهيرو
    const [heroMouse, setHeroMouse] = useState({ x: 50, y: 50 });
    const handleHeroMouseMove = (e: React.MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setHeroMouse({ x, y });
    };

    // المخطط الزمني التفاعلي للشركة لزيادة المصداقية والاستعراض الفخم
    const timelineData = useMemo(() => [
      { year: "2018", titleAr: "تأسيس لمعة ابيات", titleEn: "Establishment of Lamat Abyat", descAr: "بدأنا برؤية طموحة لتغيير معايير جودة المقاولات الإنشائية وتجهيز البنى التحتية.", descEn: "Started with an ambitious vision to reshape construction quality standards." },
      { year: "2021", titleAr: "توسيع أسطول المعدات", titleEn: "Expanding Equipment Fleet", descAr: "تم جلب أحدث الآليات الثقيلة لضمان السرعة والدقة المتناهية في التنفيذ المعماري.", descEn: "Procured the latest heavy machinery to guarantee speed and absolute precision." },
      { year: "2024", titleAr: "الريادة الرقمية والحلول الذكية", titleEn: "Digital Leadership & Smart Solutions", descAr: "أطلقنا أنظمة متابعة المشاريع الذكية لبناء تجربة تواصل شفافة ولحظية مع عملائنا.", descEn: "Launched smart project tracking systems for total real-time transparency." },
      { year: "2026", titleAr: "بناء المستقبل المستدام", titleEn: "Building a Sustainable Future", descAr: "نقود اليوم مشاريع إنشائية عملاقة تتبنى معايير الأبنية المستدامة والصديقة للبيئة.", descEn: "Leading mega-projects adopting sustainable, eco-friendly standards." },
    ], []);

    return (
      <div className="relative flex flex-col min-h-screen bg-background text-foreground overflow-hidden md:cursor-none selection:bg-primary/20">

        {/* 1. GLOBAL CUSTOM ELASTIC CURSOR (مؤشر فأرة فخم مستجيب) */}
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block rounded-full border border-primary/40 bg-primary/5 backdrop-blur-[1.5px] w-7 h-7 -ml-3.5 -mt-3.5"
          style={{ x: smoothCursorX, y: smoothCursorY }}
          animate={{
            scale: isHoveredClickable ? 1.8 : 1,
            borderColor: isHoveredClickable ? "var(--primary)" : "rgba(var(--primary-rgb), 0.4)",
            backgroundColor: isHoveredClickable ? "rgba(var(--primary-rgb), 0.08)" : "rgba(var(--primary-rgb), 0.03)",
          }}
          transition={{ type: "tween", ease: "backOut", duration: 0.2 }}
        />

        {/* 2. GLOBAL CURSOR GLOW SPOTLIGHT EFFECT (توهج عائم يتبع حركة الماوس) */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-15 dark:opacity-20 blur-[130px] hidden md:block"
          style={{
            background: `radial-gradient(circle 350px at ${mouseX.get()}px ${mouseY.get()}px, var(--primary), transparent 80%)`,
          }}
        />

        {/* ================= HERO SECTION (AMBIENT GLOW STYLE) ================= */}
        <section
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-border/40 bg-gradient-to-b from-muted/30 via-background to-background"
        >
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-700 opacity-50 mix-blend-screen dark:mix-blend-normal"
            style={{
              background: `radial-gradient(700px circle at ${heroMouse.x}% ${heroMouse.y}%, rgba(var(--primary-rgb), 0.18), transparent 60%)`,
            }}
          />

          {/* BACKGROUND AMBIENT LAYERS */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] start-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full animate-pulse duration-[6000ms]" />
            <div className="absolute bottom-[-15%] end-[-5%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse duration-[8000ms]" />
            <div className="absolute inset-0 opacity-[0.015] bg-[url('/noise.png')] pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-primary/10 border border-primary/25 backdrop-blur-xl text-primary text-xs font-bold tracking-widest uppercase shadow-sm"
            >
              ✨ {lang === 'en' ? 'CONSTRUCTION INSIGHTS & ENGINEERING' : 'رؤى الهندسة والمقاولات الحديثة'}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 leading-tight"
            >
              {lang === 'en' ? 'Lamat Abyat Hub' : 'منصة لمعة أبيات المعرفية'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground font-light leading-relaxed opacity-90"
            >
              {lang === 'en'
                ? 'Explore architectural analysis, advanced project strategy updates, and premium execution standards curated by industry visionaries.'
                : 'نضع بين يديك خلاصة خبراتنا الميدانية في إدارة المشاريع الهندسية، أحدث تقنيات التشييد، والحلول الإنشائية المبتكرة لبناء مستقبل مستدام.'}
            </motion.p>
          </div>
        </section>

        {/* ================= ARTICLES GRID SECTION WITH PREMIUM FALLBACK ================= */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
          <div className="mb-12 flex items-center justify-between border-b border-border/30 pb-5">
            <div className="space-y-1">
              <h2 className="text-sm font-bold tracking-[0.25em] uppercase text-primary">
                {lang === 'en' ? 'LATEST CHRONICLES' : 'آخر إصداراتنا المدونة'}
              </h2>
              <p className="text-xs text-muted-foreground font-light">{lang === 'en' ? 'Fresh perspectives updated weekly' : 'مقالات متجددة تثري معرفتك الإنشائية'}</p>
            </div>
          </div>

          {loading ? (
            <PremiumSkeletonGrid />
          ) : articles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-card/20 backdrop-blur-xl border border-dashed border-border/60 rounded-[32px] p-8 max-w-md mx-auto shadow-inner"
            >
              <p className="text-muted-foreground font-medium tracking-wide">{lang === 'en' ? 'No chronicles found.' : 'لم نقم بنشر أي مقالات في هذا القسم حالياً.'}</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {articles.map((article, index) => (
                <PremiumArticleCard key={article.id} article={article} lang={lang} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* ================= MISSION, VISION, & CORE VALUES SECTION (Advanced Glass Morphism) ================= */}
        <section className="relative py-24 bg-muted/10 border-y border-border/30 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-[32px] border border-border/40 bg-card/10 backdrop-blur-xl shadow-lg flex flex-col justify-between hover:border-primary/30 transition-colors group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif">{lang === 'en' ? 'Our Mission' : 'رسالتنا'}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {lang === 'en'
                    ? 'To deliver unparalleled construction and equipment solutions exceeding standard safety and quality thresholds, empowering urban ecosystems.'
                    : 'تقديم حلول إنشائية وتجهيزات للمشاريع بمستويات جودة تتجاوز التوقعات، مع الالتزام التام بأعلى معايير السلامة المهنية لضمان ديمومة البناء.'}
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 rounded-[32px] border border-border/40 bg-card/10 backdrop-blur-xl shadow-lg flex flex-col justify-between hover:border-primary/30 transition-colors group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif">{lang === 'en' ? 'Our Vision' : 'رؤيتنا'}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {lang === 'en'
                    ? 'To become the premier pioneering hallmark in the regional civil engineering arena, fostering technological integration and green workflows.'
                    : 'أن نكون الخيار الأول والاسم الأكثر موثوقية في عالم المقاولات وإدارة المعدات الثقيلة إقليمياً، عبر دمج الحلول الذكية والممارسات المستدامة.'}
                </p>
              </div>
            </motion.div>

            {/* Core Values */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 rounded-[32px] border border-border/40 bg-card/10 backdrop-blur-xl shadow-lg flex flex-col justify-between hover:border-primary/30 transition-colors group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif">{lang === 'en' ? 'Core Values' : 'قيمنا الجوهرية'}</h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground font-light">
                  <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> {lang === 'en' ? 'Absolute Integrity' : 'النزاهة والمصداقية المطلقة'}</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> {lang === 'en' ? 'Engineering Innovation' : 'الابتكار والحلول الهندسية الفعالة'}</li>
                  <li className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> {lang === 'en' ? 'Flawless Craftsmanship' : 'الجودة والإتقان في أدق التفاصيل'}</li>
                </ul>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ================= WHY CHOOSE US & ANIMATED COUNTERS ================= */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase">{lang === 'en' ? 'WHY LAMAT ABYAT' : 'لماذا لمعة أبيات؟'}</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                {lang === 'en' ? 'Engineering Mastery with Bulletproof Commitments' : 'الريادة الميدانية المدعومة بالالتزام الصارم'}
              </h2>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                {lang === 'en'
                  ? 'We govern operations via structural analytics, an immense proprietary heavy machinery fleet, and robust execution teams that map zero-fault projects.'
                  : 'نحن لا نبني جدراناً فقط، بل نؤسس ركائز استراتيجية مستدامة لمشروعك. نضمن التحكم الكامل بكافة مراحل العمل بفضل أسطولنا الضخم الخاص من المعدات الثقيلة ونخبة من المهندسين المشرفين.'}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <AnimatedCounter value={140} title={lang === 'en' ? "Completed Projects" : "المشاريع المنجزة"} />
              <AnimatedCounter value={45} title={lang === 'en' ? "Heavy Machinery Fleet" : "المعدات الثقيلة"} />
              <AnimatedCounter value={18} title={lang === 'en' ? "Strategic Partners" : "شريكاً استراتيجياً"} />
              <AnimatedCounter value={100} title={lang === 'en' ? "Client Satisfaction %" : "نسبة رضا عملائنا"} />
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE TIMELINE (تاريخ الشركة المشرق) ================= */}
        <section className="relative py-24 bg-muted/5 border-t border-border/30 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto w-full relative z-10">
            <div className="text-center space-y-2 mb-16">
              <span className="text-xs font-bold text-primary tracking-[0.25em] uppercase">{lang === 'en' ? 'OUR TIMELINE' : 'مسيرتنا الإنشائية عبر السنين'}</span>
              <h2 className="text-3xl font-serif font-bold">{lang === 'en' ? 'Steps of Impact' : 'خطوات ثابتة تركت أثراً'}</h2>
            </div>

            <div className="relative border-s border-border/60 ms-4 md:ms-32 space-y-12">
              {timelineData.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative ps-8"
                >
                  {/* علامة الدائرة المضيئة على المخطط الزمني */}
                  <div className="absolute -start-2 top-1.5 w-4 h-4 rounded-full bg-primary ring-4 ring-background shadow-md shadow-primary/40 animate-pulse" />

                  {/* عرض السنة العائمة بشكل رائع جانبي للشاشات الكبيرة */}
                  <div className="md:absolute md:-start-36 md:top-1 font-serif text-xl font-black text-primary/80 tracking-wider">
                    {item.year}
                  </div>

                  <div className="space-y-1 bg-card/20 p-5 rounded-2xl border border-border/30 backdrop-blur-sm hover:border-primary/20 transition-colors">
                    <h4 className="text-base font-bold text-foreground">{lang === 'ar' ? item.titleAr : item.titleEn}</h4>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">{lang === 'ar' ? item.descAr : item.descEn}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= LUXURIOUS CALL TO ACTION (CTA فاخر جداً) ================= */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
            className="relative overflow-hidden rounded-[40px] border border-primary/20 bg-gradient-to-br from-card via-primary/5 to-card p-8 sm:p-12 md:p-16 text-center shadow-2xl"
          >
            {/* تأثير توهج خلفي ناعم داخل الكارد */}
            <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.08), transparent 70%) pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                {lang === 'en' ? 'Ready to Construct Your Vision Into Reality?' : 'هل أنت جاهز لتحويل رؤيتك المعمارية إلى واقع ملموس؟'}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base font-light leading-relaxed opacity-90">
                {lang === 'en'
                  ? 'Get in touch with our commercial engineering department today for an absolute, zero-obligation technical estimation.'
                  : 'تواصل مع قسم الاستشارات الهندسية والمشاريع لدينا اليوم، ودعنا نناقش تفاصيل مشروعك القادم ونقدم لك دراسة أولية شاملة.'}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
                {/* أزرار احترافية مدعومة بـ Scale & Glow & Ripple Effect */}
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.04, boxShadow: "0 10px 25px -5px rgba(var(--primary-rgb), 0.3)" }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-primary/10"
                >
                  {lang === 'en' ? 'Initiate Consultation' : 'ابدأ استشارتك المجانية الآن'}
                </motion.a>
                <motion.a
                  href="/portfolio"
                  whileHover={{ scale: 1.04, backgroundColor: "rgba(var(--foreground-rgb), 0.04)" }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center border border-border/80 text-foreground font-medium px-8 py-4 rounded-xl text-sm backdrop-blur-md transition-all duration-300"
                >
                  {lang === 'en' ? 'View Works' : 'تصفح سجل مشاريعنا الإنشائية'}
                </motion.a>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    );
  }
}