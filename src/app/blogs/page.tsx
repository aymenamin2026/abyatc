"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, User, ArrowLeft, ArrowRight, Eye, Sparkles } from "lucide-react";

import { fetchArticles, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";

// التدرجات اللونية للشارات مبنية على الهوية البصرية الفخمة
const categoryColorMap: Record<string, string> = {
  general: "from-[#093f89] to-[#093f89]/80",
  construction: "from-[#093f89] to-[#fbc70f]",
  equipment: "from-[#fbc70f] to-amber-600",
  security: "from-[#093f89]/80 to-[#093f89]",
};

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

// --- Skeleton Loader ---
function PremiumSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 w-full">
      {[1, 2, 3].map((idx) => (
        <div key={idx} className="p-4 rounded-[32px] border border-border/30 bg-card/20 space-y-5 w-full relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#093f89]/5 dark:via-[#fbc70f]/5 to-transparent skew-x-12 z-10" />
          <div className="bg-muted/50 rounded-[24px] aspect-[16/10] w-full animate-pulse" />
          <div className="space-y-4 px-2">
            <div className="h-5 bg-muted/50 rounded-md w-1/3 animate-pulse" />
            <div className="h-4 bg-muted/50 rounded-md w-full animate-pulse" />
            <div className="h-4 bg-muted/50 rounded-md w-3/4 animate-pulse" />
            <div className="h-12 bg-muted/50 rounded-xl w-full mt-4 animate-pulse" />
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

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const bgTransformY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    fetchArticles().then(data => {
      setArticles(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div ref={containerRef} dir={isRtl ? "rtl" : "ltr"} className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden w-full relative">

      {/* Ambient Background Lights */}
      <motion.div style={{ y: bgTransformY }} className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] end-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-[#093f89]/10 dark:bg-[#093f89]/15 blur-[120px] md:blur-[180px] rounded-full animate-[pulse_8s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[40%] start-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#fbc70f]/10 dark:bg-[#fbc70f]/5 blur-[120px] md:blur-[150px] rounded-full animate-[pulse_10s_ease-in-out_infinite_alternate_reverse]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] bg-[url('/noise.png')] mix-blend-overlay" />
      </motion.div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-40 pb-28 px-4 sm:px-6 lg:px-12 text-center overflow-hidden border-b border-border/40 z-10 w-full flex flex-col items-center justify-center">
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#093f89]/5 dark:bg-[#fbc70f]/5 border border-[#093f89]/20 dark:border-[#fbc70f]/20 backdrop-blur-xl text-[#093f89] dark:text-[#fbc70f] text-xs sm:text-sm font-bold tracking-widest uppercase shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {isRtl ? 'رؤى هندسية وأخبار المقاولات' : 'Construction Insights & Tech Trends'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight drop-shadow-sm"
          >
            {isRtl ? 'مدونة لمعة أبيات' : 'Lamat Abyat Blog'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto text-base sm:text-lg text-muted-foreground font-light leading-relaxed px-4"
          >
            {isRtl
              ? 'اكتشف مقالاتنا المتخصصة حول أحدث تقنيات البناء، نصائح تشغيل وصيانة المعدات الثقيلة، وأفضل الممارسات لإدارة مشاريعك بنجاح.'
              : 'Discover our expert articles on the latest construction technologies, heavy equipment operation and maintenance tips, and best practices for successful project management.'}
          </motion.p>
        </div>
      </section>

      {/* ================= ARTICLES GRID AREA ================= */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-12 max-w-[1400px] mx-auto w-full z-10">
        <div className="mb-16 flex flex-col items-center text-center space-y-4 border-b border-border/30 pb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            {isRtl ? 'آخر الإصدارات والمقالات' : 'Latest Insights'}
          </h2>
          <p className="text-base text-muted-foreground font-light max-w-2xl">
            {isRtl ? 'تصفح أحدث التحليلات والتقارير الميدانية المصاغة بخبرات هندسية' : 'Browse highly curated engineering papers and on-site logs'}
          </p>
        </div>

        {loading ? (
          <PremiumSkeletonGrid />
        ) : articles.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 bg-card/30 backdrop-blur-xl border border-dashed border-[#093f89]/30 dark:border-[#fbc70f]/30 rounded-[40px] max-w-2xl mx-auto p-10 w-full shadow-lg">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">{isRtl ? 'قريباً...' : 'Coming Soon...'}</h3>
            <p className="text-muted-foreground text-base font-light">{isRtl ? 'لا توجد مستندات أو مقالات مضافة حالياً. جاري التحديث.' : 'No engineering records found currently. Updating soon.'}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 w-full">
            {articles.map((article, idx) => (
              <PremiumArticleCard key={article.id} article={article} index={idx} lang={lang} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}