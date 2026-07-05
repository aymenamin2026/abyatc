"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { fetchArticles, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Calendar, User, ArrowLeft, ArrowRight, Eye, Sparkles, Target, Compass, Award, ShieldCheck, CheckCircle2, MessageSquare, ArrowUpRight } from "lucide-react";

// المسميات الافتراضية للفئات الملونة
const categoryColorMap: Record<string, string> = {
  general: "from-blue-500 to-cyan-500",
  construction: "from-amber-500 to-orange-600",
  equipment: "from-emerald-500 to-teal-600",
  security: "from-red-500 to-rose-600",
};

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
  const [isHovered, setIsHovered] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-border/40 bg-card/40 backdrop-blur-xl p-4 shadow-xl hover:shadow-3xl dark:hover:shadow-primary/5 transition-all duration-500 h-full w-full"
    >
      {/* 1. Animated Moving Gradient Border */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[32px] p-[1.5px] bg-gradient-to-r from-primary via-cyan-500 to-amber-500 bg-[length:200%_auto] animate-gradient-shift" />

      {/* Image Container with Cinematic Shine & Zoom */}
      <div className="relative z-10 w-full aspect-[16/10] rounded-[24px] overflow-hidden bg-muted/50 mb-5 shadow-inner">
        <Link href={`/blogs/${article.slug}`} className="block w-full h-full">
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
            <Link href={`/blogs/${article.slug}`} className="flex items-center justify-center w-full h-full"><Eye className="w-5 h-5" /></Link>
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
          <Link href={`/blogs/${article.slug}`} className="block">
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
            <Link href={`/blogs/${article.slug}`} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted/60 border border-border/60 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
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
    <div ref={containerRef} dir={isRtl ? "rtl" : "ltr"} className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden w-full">

      {/* Static Noise Background and ambient layers */}
      <motion.div style={{ y: bgTransformY }} className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] end-[-10%] w-[700px] h-[700px] bg-primary/5 blur-[150px] rounded-full animate-pulse duration-10000" />
        <div className="absolute bottom-[20%] start-[-10%] w-[800px] h-[800px] bg-cyan-500/5 blur-[180px] rounded-full animate-pulse duration-7000" />
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01] bg-[url('/noise.png')]" />
      </motion.div>

      {/* ================= HERO SECTION ================= */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-12 text-center overflow-hidden border-b border-border/40 bg-gradient-to-b from-muted/10 to-transparent z-10 w-full"
      >
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-300 opacity-50 mix-blend-screen dark:mix-blend-normal"
          style={{
            background: `radial-gradient(700px circle at ${heroMouse.x}% ${heroMouse.y}%, rgba(var(--primary-rgb), 0.12), transparent 70%)`,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl text-primary text-xs font-semibold tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {isRtl ? 'رؤى هندسية وأخبار المقاولات' : 'Construction Insights & Tech Trends'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-6xl lg:text-7xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 leading-tight"
          >
            {isRtl ? 'مدونة لمعة أبيات' : 'Lamat Abyat Blog'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm sm:text-lg text-muted-foreground font-light leading-relaxed opacity-90"
          >
            {isRtl
              ? 'اكتشف مقالاتنا المتخصصة حول أحدث تقنيات البناء، نصائح تشغيل وصيانة المعدات الثقيلة، وأفضل الممارسات لإدارة مشاريعك بنجاح.'
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card/20 backdrop-blur-md border border-dashed border-border/60 rounded-[32px] max-w-md mx-auto p-8 w-full">
            <p className="text-muted-foreground text-sm font-light">{isRtl ? 'لا توجد مستندات أو مقالات مضافة حالياً.' : 'No engineering records found.'}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 w-full">
            {articles.map((article, idx) => (
              <PremiumArticleCard key={article.id} article={article} index={idx} lang={lang} />
            ))}
          </div>
        )}
      </section>



    </div>
  );
}