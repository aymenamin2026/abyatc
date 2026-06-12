"use client";

import { useEffect, useState } from "react";
import { fetchArticles, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ArticlesPage() {
  const { lang } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-muted py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4"
          >
            {lang === 'en' ? 'Our Blogs' : 'مدونتنا'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-primary font-medium tracking-wide uppercase"
          >
            {lang === 'en' ? 'Insights, Tips & Trends' : 'رؤى ونصائح واتجاهات'}
          </motion.p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : articles.length === 0 ? (
          <p className="text-center text-muted-foreground">{lang === 'en' ? 'No articles found.' : 'لا توجد مقالات مضافة.'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => {
              const title = article.title?.[lang] || article.title?.en || article.title;
              const excerpt = article.excerpt?.[lang] || article.excerpt?.en || article.excerpt;
              const image = getImageUrl(article.image);
              const authorName = article.author?.name?.[lang] || article.author?.name?.en || 'Admin';
              const categoryName = article.category?.name?.[lang] || article.category?.name?.en || 'General';

              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
                >
                  <Link href={`/blogs/${article.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-muted">
                    <img 
                      src={image} 
                      alt={title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.jpg'; }}
                    />
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-xs text-primary font-bold mb-2 uppercase tracking-wide">
                      {categoryName}
                    </div>
                    <Link href={`/blogs/${article.slug}`} className="block group-hover:text-primary transition-colors">
                      <h3 className="text-xl font-bold text-foreground mb-3 font-serif line-clamp-2">
                        {title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                      {excerpt}
                    </p>
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{authorName}</span>
                      <span>{article.published_at ? new Date(article.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : ''}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
