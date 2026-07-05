"use client";

import { useEffect, useState, useRef } from "react";
import { fetchProjects, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Calendar, User, ArrowLeft, ArrowRight, Eye, Sparkles } from "lucide-react";

// التدرجات اللونية للشارات بناءً على الهوية البصرية للموقع
const categoryColorMap: Record<string, string> = {
  general: "from-[#093f89] to-[#093f89]/80",
  infrastructure: "from-[#093f89] to-[#fbc70f]",
  heavy_equipment: "from-[#fbc70f] to-amber-600",
};

// --- Premium Project Card Component with Spotlight Glow & Animated Gradient Border ---
function PremiumProjectCard({ project, index, lang }: { project: any; index: number; lang: 'ar' | 'en' }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const title = project.title?.[lang] || project.title?.en || project.title;
  const excerpt = project.excerpt?.[lang] || project.excerpt?.en || project.excerpt;
  const image = getImageUrl(project.image);
  const authorName = project.author?.name?.[lang] || project.author?.name?.en || 'Admin';
  const categoryName = project.category?.name?.[lang] || project.category?.name?.en || 'General';
  const catKey = (project.category?.slug || 'general').toLowerCase();
  const gradientClass = categoryColorMap[catKey] || "from-[#093f89] to-[#fbc70f]";

  return (
    <motion.article
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-border/40 bg-card/40 backdrop-blur-xl p-4 shadow-xl hover:shadow-3xl dark:hover:shadow-[#093f89]/5 transition-all duration-500 h-full w-full"
    >
      {/* 1. Animated Moving Gradient Border using Brand Identity Colors */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[32px] p-[1.5px] bg-gradient-to-r from-[#093f89] via-[#fbc70f] to-[#093f89] bg-[length:200%_auto] animate-gradient-shift" />

      {/* Image Container with Cinematic Shine & Zoom */}
      <div className="relative z-10 w-full aspect-[16/10] rounded-[24px] overflow-hidden bg-muted/50 mb-5 shadow-inner">
        <Link href={`/projects/${project.slug}`} className="block w-full h-full">
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
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-full bg-[#fbc70f] text-[#093f89] shadow-2xl flex items-center justify-center">
            <Link href={`/projects/${project.slug}`} className="flex items-center justify-center w-full h-full">
              <Eye className="w-5 h-5 font-bold" />
            </Link>
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
          <Link href={`/projects/${project.slug}`} className="block">
            <h3 className="text-xl font-bold text-foreground font-serif tracking-tight line-clamp-2 leading-snug group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors duration-300">
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
              <User className="w-3.5 h-3.5 text-[#093f89]/70 dark:text-[#fbc70f]/70" />
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
            <Link href={`/projects/${project.slug}`} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted/60 border border-border/60 text-foreground group-hover:bg-[#093f89] group-hover:text-[#fbc70f] group-hover:border-[#093f89] transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(9,63,137,0.3)]">
              {lang === 'ar' ? <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" /> : <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />}
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

// --- Premium Skeleton Loader Screen Grid ---
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

export default function ProjectPage() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Parallax Mechanics via Framer Motion useScroll
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const bgTransformY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  // Hero interactive track position
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroMouse, setHeroMouse] = useState({ x: 50, y: 50 });

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data);
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
        <div className="absolute top-[-10%] end-[-10%] w-[700px] h-[700px] bg-[#093f89]/5 blur-[150px] rounded-full animate-pulse duration-10000" />
        <div className="absolute bottom-[20%] start-[-10%] w-[800px] h-[800px] bg-[#fbc70f]/5 blur-[180px] rounded-full animate-pulse duration-7000" />
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
            background: `radial-gradient(700px circle at ${heroMouse.x}% ${heroMouse.y}%, rgba(9, 63, 137, 0.12), transparent 70%)`,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#093f89]/10 border border-[#093f89]/20 backdrop-blur-xl text-[#093f89] dark:text-[#fbc70f] text-xs font-semibold tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#fbc70f]" />
            {isRtl ? 'سجل حافل بالإنجازات والتميز البنائي' : 'A proven track record of achievements'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-6xl lg:text-7xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 leading-tight"
          >
            {isRtl ? 'معرض مشاريعنا التنموية' : 'Our Legacy Projects'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm sm:text-lg text-muted-foreground font-light leading-relaxed opacity-90"
          >
            {isRtl
              ? 'نضع بصمتنا في أهم مشاريع التشييد والبنية التحتية. تصفح سابقة أعمالنا التي تعكس التزامنا التام بأعلى معايير الجودة، الدقة في التنفيذ، وقوة أسطول معداتنا في الميدان.'
              : 'We leave our mark on landmark construction and infrastructure projects. Explore our portfolio, which reflects our unwavering commitment to the highest quality standards, precision in execution, and the power of our heavy equipment fleet.'}
          </motion.p>
        </div>
      </section>

      {/* ================= PROJECTS GRID AREA ================= */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-border/30 pb-6">
          <div>
            <h2 className="text-2xl font-serif font-light tracking-wide">{isRtl ? 'المشاريع الحالية والمنفذة' : 'Portfolio Masterpieces'}</h2>
            <p className="text-sm text-muted-foreground font-light mt-1">{isRtl ? 'استكشف البنى التحتية والأعمال الهندسية المشيدة بأسطولنا الاحترافي' : 'Explore strategic infrastructures executed by our premium fleet'}</p>
          </div>
        </div>

        {loading ? (
          <PremiumSkeletonGrid />
        ) : projects.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card/20 backdrop-blur-md border border-dashed border-border/60 rounded-[32px] max-w-md mx-auto p-8 w-full">
            <p className="text-muted-foreground text-sm font-light">{isRtl ? 'لا توجد مشاريع مضافة حالياً في هذا المعرض.' : 'No project entries found.'}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 w-full">
            {projects.map((project, idx) => (
              <PremiumProjectCard key={project.id} project={project} index={idx} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}