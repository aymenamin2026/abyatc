"use client";

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import { ChevronLeft, ChevronRight, CornerRightDown } from 'lucide-react';

interface CategoriesSliderProps {
  categories: any[];
  lang: 'en' | 'ar';
  settings?: any;
}

export default function CategoriesSlider({ categories, lang, settings }: CategoriesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // تحديث حالة أزرار التنقل
  const updateArrows = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  // وظيفة التمرير السلس
  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  if (!categories?.length) return null;

  return (
    <div className="relative w-full py-12 px-2 overflow-hidden group">
      
      {/* عنوان الـ Slider - 
        تصميم متناسق مع "تأثير الزجاج" للأيقونة (Light/Dark Mode friendly)
      */}
      <div className="flex items-center gap-4 mb-10 text-xl md:text-2xl font-bold px-6 text-cyan-900 dark:text-cyan-100">
        <span className="p-3 md:p-4 rounded-3xl backdrop-blur-2xl bg-cyan-100/30 dark:bg-cyan-800/20 border border-cyan-100/40 dark:border-cyan-800/40 shadow-xl shadow-cyan-100/5 dark:shadow-black/20">
            <CornerRightDown className="w-5 h-5 md:w-6 md:h-6 text-cyan-800 dark:text-cyan-300" />
        </span>
        {lang === 'ar' ? 'اكتشف التصنيفات' : 'Explore Categories'}
      </div>

      {/* Navigation Buttons - Glassmorphism Style from Image (Light/Dark Mode friendly) */}
      <button 
        onClick={() => scroll(lang === 'ar' ? 'right' : 'left')}
        className={`absolute left-4 top-[55%] -translate-y-1/2 z-30 p-4 rounded-3xl backdrop-blur-2xl bg-cyan-50/20 dark:bg-cyan-900/30 border border-cyan-100/40 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-300 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${!canScrollLeft && 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={24} />
      </button>

      {/* Slider Container with Native Snap Scroll */}
      <div 
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex gap-6 pb-6 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar px-6"
      >
        {categories.map((category: any, index: number) => (
          <Link 
            href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en)}`}
            key={category.id}
            className="flex-shrink-0 w-[80vw] sm:w-[350px] h-[480px] snap-start group/card relative rounded-[32px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-100/10 dark:hover:shadow-cyan-900/10"
          >
            {/* Card Main Container: Subt Gradient + Light/Dark Mode Color Tones */}
            <div className="relative h-full w-full rounded-[32px] overflow-hidden backdrop-blur-2xl border border-cyan-100/30 dark:border-cyan-800/30 bg-gradient-to-br from-cyan-50/5 via-cyan-50/10 to-transparent dark:from-cyan-950/5 dark:via-cyan-950/10 dark:to-transparent shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-all duration-500 group-hover/card:bg-cyan-100/10 dark:group-hover/card:bg-cyan-900/20 group-hover/card:border-cyan-100/60 dark:group-hover/card:border-cyan-800/60">
                
                {/* تصميم داخلي - مستوحى من فكرة الـ Footer في الصورة: 
                  تقسيم المساحة بدقة، استخدام ألوان الـ Dark Mode
                */}
                <div className="p-8 h-full flex flex-col justify-between relative z-20">
                    <div className="flex flex-col items-start gap-4">
                        {/* أيقونة تصنيف "زجاجية" صغيرة */}
                        <div className="p-4 rounded-2xl bg-cyan-100/30 dark:bg-cyan-800/20 backdrop-blur-sm border border-cyan-100/50 dark:border-cyan-800/50 shadow-innershadow-white/5">
                            <span className="text-xl">🛠️</span> 
                        </div>
                        <h3 className="text-2xl font-bold text-cyan-900 dark:text-cyan-100 drop-shadow-sm">
                            {category.name?.[lang] || category.name?.en}
                        </h3>
                    </div>

                    <div className="flex flex-col items-end gap-3 text-cyan-800/80 dark:text-cyan-200/90">
                        {/* زر "استكشف" عصري ومتجاوب */}
                        <div className="flex items-center gap-2 text-sm font-medium transition-transform group-hover/card:translate-x-2">
                           {lang === 'ar' ? 'استكشف الآن' : 'Explore Now'}
                           <span className="p-2 rounded-full backdrop-blur-lg bg-cyan-100/20 dark:bg-cyan-800/20 border border-cyan-100/40 dark:border-cyan-800/40">
                             <ChevronRight className="w-4 h-4 text-cyan-800 dark:text-cyan-200" />
                           </span>
                        </div>
                        {/* خط زخرفي متدرج متناسق */}
                        <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-primary rounded-full transition-all group-hover/card:w-20" />
                    </div>
                </div>

                {/* صورة الخلفية (خيار جديد) 
                  للحفاظ على جمالية الشفافية، نضع الصورة كـ "قناع" شفاف في الأسفل
                */}
                <div className="absolute inset-0 z-10 opacity-60 dark:opacity-40 transition-opacity group-hover/card:opacity-80 dark:group-hover/card:opacity-60">
                    <Image
                    src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                    alt={category.name?.[lang] || category.name?.en}
                    fill
                    priority={index < 2}
                    className="object-cover object-bottom transition-transform duration-700 group-hover/card:scale-105"
                    sizes="(max-width: 768px) 80vw, 350px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover/card:from-black/10 transition-colors" />
                </div>
            </div>
          </Link>
        ))}
      </div>

      <button 
        onClick={() => scroll(lang === 'ar' ? 'left' : 'right')}
        className={`absolute right-4 top-[55%] -translate-y-1/2 z-30 p-4 rounded-3xl backdrop-blur-2xl bg-cyan-50/20 dark:bg-cyan-900/30 border border-cyan-100/40 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-300 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${!canScrollRight && 'opacity-0 pointer-events-none'}`}
      >
        <ChevronRight size={24} />
      </button>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}