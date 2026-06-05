"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { t } from "@/lib/translations";
import { useLanguage } from "@/components/LanguageContext";

export default function NotFound() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-background text-foreground overflow-hidden">
      <div className="max-w-xl w-full text-center relative">
        {/* Animated Background Element */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        >
          <span className="text-[20rem] font-serif font-bold text-primary select-none">404</span>
        </motion.div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-8xl md:text-9xl font-serif font-black mb-4 bg-gradient-to-b from-primary to-primary/40 bg-clip-text text-transparent italic">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t('page_not_found_title', lang)}
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto leading-relaxed">
              {t('page_not_found_desc', lang)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-medium hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 group"
            >
              <Home className="w-4 h-4" />
              {t('back_to_home', lang)}
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-muted text-foreground px-8 py-3.5 rounded-full font-medium hover:bg-muted/80 transition-all group"
            >
              <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${lang === 'ar' ? 'rotate-180' : ''}`} />
              {lang === 'en' ? 'Go Back' : 'الرجوع للخلف'}
            </button>
          </motion.div>
        </div>

        {/* Floating Decorative Orbs */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
    </div>
  );
}
