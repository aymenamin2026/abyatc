"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, User, ArrowLeft, ArrowRight, Eye, Sparkles } from "lucide-react";

import { fetchArticles, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";

// المسميات الافتراضية للفئات الملونة
const categoryColorMap: Record<string, string> = {
  general: "from-[#093f89] to-[#093f89]/80",
  construction: "from-[#093f89] to-[#fbc70f]",
  equipment: "from-[#fbc70f] to-amber-600",
  security: "from-[#093f89]/80 to-[#093f89]",
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
// --- Premium Article Card Component ---
function PremiumArticleCard({ article, index, lang }: { article: any; index: number; lang: 'ar' | 'en' }) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(article.image) || '/no-image.jpg');

  const title = article.title?.[lang] || article.title?.en || article.title;
  const excerpt = article.excerpt?.[lang] || article.excerpt?.en || article.excerpt;
  const authorName = article.author?.name?.[lang] || article.author?.name?.en || 'Admin';
  const categoryName = article.category?.name?.[lang] || article.category?.name?.en || 'General';
  const catKey = (article.category?.slug || 'general').toLowerCase();
  const gradientClass = categoryColorMap[catKey] || "from-[#093f89] to-[#fbc70f]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.4), ease: "easeOut" }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-border/40 dark:border-white/5 bg-card/40 backdrop-blur-xl p-4 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(9,63,137,0.2)] dark:hover:shadow-[0_20px_40px_-15px_rgba(251,199,15,0.1)] transition-all duration-500 h-full w-full"
    >
      {/* إطار مضيء يظهر عند تمرير الماوس (Hover Glow) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[32px] bg-gradient-to-br from-[#093f89]/20 via-transparent to-[#fbc70f]/20" />

      {/* Image Container */}
      <div className="relative z-10 w-full aspect-[16/10] rounded-[24px] overflow-hidden bg-muted/30 mb-6 shadow-inner">
        <Link href={`/blogs/${article.slug}`} className="block w-full h-full relative">
          <Image
            src={imgSrc}
            alt={title || "Article Image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
            onError={() => setImgSrc('/no-image.jpg')}
          />

          {/* تأثير اللمعان الزجاجي */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#093f89]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

          {/* أيقونة العرض (Eye) تظهر بنعومة */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
            <div className="w-14 h-14 rounded-full bg-[#fbc70f]/90 backdrop-blur-sm text-[#093f89] shadow-2xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-500">
              <Eye className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
        </Link>

        {/* Floating Badge */}
        <span className={`absolute top-4 start-4 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase text-white bg-gradient-to-r ${gradientClass} rounded-full shadow-md border border-white/20 backdrop-blur-md z-30`}>
          {categoryName}
        </span>
      </div>

      {/* Typography & Metadata */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-2">
        <div className="space-y-3">
          <Link href={`/blogs/${article.slug}`} className="block">
            <h3 className="text-xl md:text-2xl font-bold text-foreground font-serif tracking-tight line-clamp-2 leading-tight group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors duration-300">
              {title}
            </h3>
          </Link>
          <p className="text-muted-foreground text-sm font-light leading-relaxed line-clamp-3">
            {excerpt}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#093f89] dark:text-[#fbc70f]" />
              <span className="font-medium max-w-[100px] truncate">{authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 opacity-60" />
              <span className="font-medium">
                {article.published_at
                  ? new Date(article.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : ''}
              </span>
            </div>
          </div>

          <Link
            href={`/blogs/${article.slug}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border text-foreground hover:bg-[#093f89] hover:text-[#fbc70f] hover:border-[#093f89] transition-all duration-300 shadow-sm"
          >
            {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
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