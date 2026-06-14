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

  const updateArrows = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  if (!categories?.length) return null;

  return (
    <div className="relative w-full py-12 px-2 overflow-hidden group">
      
      {/* عنوان الـ Slider - 
        مستوحى من تصميم الصورة باستخدام تأثير "الزجاج" كأيقونة سهم 
      */}
      <div className="flex items-center gap-4 mb-10 text-xl font-bold px-6 text-foreground/80">
        <span className="p-3 rounded-2xl backdrop-blur-xl bg-cyan-100/20 border border-cyan-100/30 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]">
            <CornerRightDown className="w-5 h-5 text-cyan-700/80" />
        </span>
        {lang === 'ar' ? 'اكتشف التصنيفات' : 'Explore Categories'}
      </div>

      {/* Navigation Buttons - Glassmorphism Style from Image */}
      <button 
        onClick={() => scroll(lang === 'ar' ? 'right' : 'left')}
        className={`absolute left-4 top-[55%] -translate-y-1/2 z-30 p-4 rounded-3xl backdrop-blur-2xl bg-cyan-50/20 border border-cyan-100/40 text-cyan-700 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${!canScrollLeft && 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={24} />
      </button>

      {/* Slider Container with Smooth Snap Scroll */}
      <div 
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex gap-6 pb-6 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar px-6"
      >
        {categories.map((category: any, index: number) => (
          <Link 
            href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en)}`}
            key={category.id}
            className="flex-shrink-0 w-[80vw] sm:w-[320px] md:w-[350px] h-[480px] snap-start group/card relative rounded-[32px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-100/10"
          >
            {/* Card Main Container: Subt Gradient + Border-only Glow */}
            <div className="relative h-full w-full rounded-[32px] overflow-hidden backdrop-blur-xl border border-cyan-100/30 bg-gradient-to-br from-cyan-50/5 via-cyan-50/10 to-transparent shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-all duration-500 group-hover/card:bg-cyan-100/10 group-hover/card:shadow-[inset_0_0_25px_rgba(255,255,255,0.1),_0_10px_30px_rgba(0,0,0,0.1)]">
                
                {/* تصميم داخلي - مستوحى من فكرة الـ Footer: 
                  تقسيم المساحة بدقة
                */}
                <div className="p-8 h-full flex flex-col justify-between relative z-20">
                    <div className="flex flex-col items-start gap-3">
                        {/* أيقونة تصنيف "زجاجية" صغيرة */}
                        <div className="p-4 rounded-2xl bg-cyan-100/30 backdrop-blur-sm border border-cyan-100/50">
                            {/* يمكنك استبدال هذا بأيقونة مناسبة من قاعدة بياناتك */}
                            <span className="text-xl">🛠️</span> 
                        </div>
                        <h3 className="text-2xl font-bold text-cyan-800 transition-colors group-hover/card:text-cyan-900 drop-shadow-sm">
                            {category.name?.[lang] || category.name?.en}
                        </h3>
                    </div>

                    <div className="flex flex-col items-end gap-3 text-cyan-700/80">
                        {/* زر "استكشف" عصري */}
                        <div className="flex items-center gap-2 text-sm font-medium transition-transform group-hover/card:translate-x-2">
                           {lang === 'ar' ? 'استكشف الآن' : 'Explore Now'}
                           <span className="p-2 rounded-full backdrop-blur-lg bg-cyan-100/20 border border-cyan-100/40">
                             <ChevronRight className="w-4 h-4" />
                           </span>
                        </div>
                        {/* خط زخرفي متدرج */}
                        <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-primary rounded-full transition-all group-hover/card:w-20" />
                    </div>
                </div>

                {/* صورة الخلفية (خيار جديد) 
                  للحفاظ على جمالية الشفافية، نضع الصورة كـ "قناع" شفاف في الأسفل
                */}
                <div className="absolute inset-0 z-10 opacity-60 transition-opacity group-hover/card:opacity-80">
                    <Image
                    src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                    alt={category.name?.[lang] || category.name?.en}
                    fill
                    priority={index < 2}
                    className="object-cover object-bottom"
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
        className={`absolute right-4 top-[55%] -translate-y-1/2 z-30 p-4 rounded-3xl backdrop-blur-2xl bg-cyan-50/20 border border-cyan-100/40 text-cyan-700 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${!canScrollRight && 'opacity-0 pointer-events-none'}`}
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