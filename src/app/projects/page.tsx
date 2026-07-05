"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, User, ArrowLeft, ArrowRight, Eye, Sparkles } from "lucide-react";

import { fetchProjects, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";

// التدرجات اللونية للشارات مبنية على الهوية البصرية الفخمة
const categoryColorMap: Record<string, string> = {
  general: "from-[#093f89] to-[#093f89]/80",
  infrastructure: "from-[#093f89] to-[#fbc70f]",
  heavy_equipment: "from-[#fbc70f] to-amber-600",
};

// --- Premium Project Card Component ---
function PremiumProjectCard({ project, index, lang }: { project: any; index: number; lang: 'ar' | 'en' }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const title = project.title?.[lang] || project.title?.en || project.title;
  const excerpt = project.excerpt?.[lang] || project.excerpt?.en || project.excerpt;
  const image = getImageUrl(project.image);
  const authorName = project.author?.name?.[lang] || project.author?.name?.en || 'Admin';
  const categoryName = project.category?.name?.[lang] || project.category?.name?.en || 'General';
  const catKey = (project.category?.slug || 'general').toLowerCase();
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
        <Link href={`/blogs/${project.slug}`} className="block w-full h-full">
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
            <Link href={`/blogs/${project.slug}`} className="flex items-center justify-center w-full h-full"><Eye className="w-5 h-5" /></Link>
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
          <Link href={`/blogs/${project.slug}`} className="block">
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
                {project.published_at
                  ? new Date(project.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
                  : ''}
              </span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link href={`/blogs/${project.slug}`} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted/60 border border-border/60 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              {lang === 'ar' ? <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" /> : <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />}
            </Link>
          </motion.div>
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

export default function ProjectPage() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const bgTransformY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data);
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
            {isRtl ? 'سجل حافل بالإنجازات والتميز البنائي' : 'A proven track record of achievements'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight drop-shadow-sm"
          >
            {isRtl ? 'معرض مشاريعنا التنموية' : 'Our Legacy Projects'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto text-base sm:text-lg text-muted-foreground font-light leading-relaxed px-4"
          >
            {isRtl
              ? 'نضع بصمتنا في أهم مشاريع التشييد والبنية التحتية. تصفح سابقة أعمالنا التي تعكس التزامنا التام بأعلى معايير الجودة، الدقة في التنفيذ، وقوة أسطول معداتنا في الميدان.'
              : 'We leave our mark on landmark construction and infrastructure projects. Explore our portfolio, reflecting our commitment to quality, precision, and heavy equipment power.'}
          </motion.p>
        </div>
      </section>

      {/* ================= PROJECTS GRID AREA ================= */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-12 max-w-[1400px] mx-auto w-full z-10">
        <div className="mb-16 flex flex-col items-center text-center space-y-4 border-b border-border/30 pb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            {isRtl ? 'المشاريع الحالية والمنفذة' : 'Portfolio Masterpieces'}
          </h2>
          <p className="text-base text-muted-foreground font-light max-w-2xl">
            {isRtl ? 'استكشف البنى التحتية والأعمال الهندسية المشيدة بأسطولنا الاحترافي' : 'Explore strategic infrastructures executed by our premium fleet'}
          </p>
        </div>

        {loading ? (
          <PremiumSkeletonGrid />
        ) : projects.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 bg-card/30 backdrop-blur-xl border border-dashed border-[#093f89]/30 dark:border-[#fbc70f]/30 rounded-[40px] max-w-2xl mx-auto p-10 w-full shadow-lg">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">{isRtl ? 'قريباً...' : 'Coming Soon...'}</h3>
            <p className="text-muted-foreground text-base font-light">{isRtl ? 'لا توجد مشاريع مضافة حالياً في هذا المعرض. جاري التحديث.' : 'No project entries found currently. Updating soon.'}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 w-full">
            {projects.map((project, idx) => (
              <PremiumProjectCard key={project.id} project={project} index={idx} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}