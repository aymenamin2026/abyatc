"use client";

import { useEffect, useState, useRef } from "react";
import { fetchProjects, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, User, ArrowLeft, ArrowRight } from "lucide-react";

export default function ProjectPage() {
  const { lang } = useLanguage();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // إعدادات تتبع حركة الماوس لإعطاء تأثير الإضاءة التفاعلية في الـ Hero
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data);
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">

      {/* ================= HERO SECTION (AMBIENT GLOW STYLE) ================= */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-border/40 bg-gradient-to-b from-muted/20 to-transparent"
      >
        {/* تأثير الضوء التفاعلي الحركي خلف النص */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-40 mix-blend-screen dark:mix-blend-normal"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(var(--primary-rgb), 0.15), transparent 60%)`,
          }}
        />

        {/* طبقات الإضاءة الملونة الجانبية المتوهجة */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.02] bg-[url('/noise.png')]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md text-primary text-xs font-semibold tracking-wider uppercase"
          >
            ✨ {lang === 'en' ? 'Insights, Tips & Trends' : 'رؤى ونصائح واتجاهات'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70"
          >
            {lang === 'en' ? 'Our Blogs' : 'مدونتنا الإلكترونية'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            {lang === 'en'
              ? 'Explore our beautifully curated articles regarding modern strategies, inspiration, and elite professional tips.'
              : 'استكشف مقالاتنا المنسقة بعناية حول أحدث الاستراتيجيات، الإلهام، والنصائح الاحترافية الحصرية.'}
          </motion.p>
        </div>
      </section>

      {/* ================= ARTICLES GRID SECTION ================= */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">

        {loading ? (
          /* شاشة تحميل أنيقة متناغمة */
          <div className="flex flex-col justify-center items-center h-80 gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
              {lang === 'en' ? 'Loading latest stories...' : 'جاري تحميل أحدث المقالات...'}
            </p>
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-card/40 backdrop-blur-xl border border-border/60 rounded-[32px] p-8 max-w-md mx-auto"
          >
            <p className="text-muted-foreground font-medium">{lang === 'en' ? 'No articles found.' : 'لا توجد مقالات مضافة حالياً.'}</p>
          </motion.div>
        ) : (
          /* شبكة المقالات بستايل الفلوتينج كارد الزجاجي */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {projects.map((project, index) => {
              const title = project.title?.[lang] || project.title?.en || project.title;
              const excerpt = project.excerpt?.[lang] || project.excerpt?.en || project.excerpt;
              const image = getImageUrl(project.image);
              const authorName = project.author?.name?.[lang] || project.author?.name?.en || 'Admin';
              const categoryName = project.category?.name?.[lang] || project.category?.name?.en || 'General';

              return (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.3) }}
                  whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                  className="group relative bg-card/50 backdrop-blur-xl border border-border/60 rounded-[28px] overflow-hidden shadow-md hover:shadow-2xl hover:border-primary/20 transition-all duration-300 flex flex-col"
                >
                  {/* حاوية الصورة مع تأثير زووم سينمائي وقناع الفئة العلوي */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted m-3 rounded-[20px] shadow-inner">
                    <Link href={`/projects/${project.slug}`} className="block w-full h-full">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.jpg'; }}
                      />
                    </Link>

                    {/* شارة الفئة المضيئة العائمة فوق الصورة */}
                    <span className="absolute top-3 start-3 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-primary bg-background/80 backdrop-blur-md rounded-full shadow-sm border border-border/40">
                      {categoryName}
                    </span>
                  </div>

                  {/* تفاصيل الكارد */}
                  <div className="p-6 pt-3 flex flex-col flex-1">

                    {/* العنوان مع تفاعل الألوان عند التحويم */}
                    <Link href={`/projects/${project.slug}`} className="block mt-2">
                      <h3 className="text-xl font-bold text-foreground font-serif line-clamp-2 leading-snug tracking-tight group-hover:text-primary transition-colors duration-300">
                        {title}
                      </h3>
                    </Link>

                    {/* المقتطف النصي */}
                    <p className="text-muted-foreground text-sm leading-relaxed mt-3 mb-6 line-clamp-3 font-normal opacity-85">
                      {excerpt}
                    </p>

                    {/* الفوتر الخاص بالكارد (الكاتب والتاريخ + زر قراءة المزيد التفاعلي) */}
                    <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary/70" />
                          <span className="font-medium truncate max-w-[100px]">{authorName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                          <span>
                            {project.published_at
                              ? new Date(project.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
                              : ''}
                          </span>
                        </div>
                      </div>

                      {/* سهم حركي يظهر عند الـ hover لمزيد من الفخامة */}
                      <Link href={`/projects/${project.slug}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        {lang === 'ar' ? <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" /> : <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />}
                      </Link>
                    </div>

                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}