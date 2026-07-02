"use client";

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// المعرفات اللونية الرسمية للبراند
const COLOR_PRIMARY = "#093f89"; // الأزرق الكحلي
const COLOR_ACCENT = "#fbc70f";  // الأصفر الذهبي

interface CategoriesSliderProps {
  categories: any[];
  lang: 'en' | 'ar';
  settings?: any;
}

export default function CategoriesSlider({ categories, lang, settings }: CategoriesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const isRtl = lang === 'ar';
  const showDescription = settings?.categories_show_description ?? true;
  const showDots = settings?.categories_slider_dots ?? true;
  const autoplay = settings?.categories_slider_autoplay ?? false;
  const autoplayTime = settings?.categories_slider_autoplay_time ?? 3000;

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const absoluteScroll = Math.abs(scrollLeft);

    if (isRtl) {
      setCanScrollLeft(absoluteScroll < scrollWidth - clientWidth - 10);
      setCanScrollRight(absoluteScroll > 5);
    } else {
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }

    if (showDots && scrollRef.current.children.length > 0) {
      const itemWidth = scrollRef.current.children[0]?.clientWidth || 320;
      const gap = 24;
      const index = Math.round(absoluteScroll / (itemWidth + gap));
      setActiveIndex(Math.min(index, categories.length - 1));
    }
  }, [isRtl, showDots, categories.length]);

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        checkScroll();
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [checkScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [onScroll, checkScroll]);

  useEffect(() => {
    if (!autoplay || categories.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const absoluteScroll = Math.abs(scrollLeft);

        if (absoluteScroll + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const itemWidth = scrollRef.current.children[0]?.clientWidth || 320;
          const scrollAmount = isRtl ? -(itemWidth + 24) : (itemWidth + 24);
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, autoplayTime);

    return () => clearInterval(interval);
  }, [autoplay, autoplayTime, categories.length, isRtl]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.children[0]?.clientWidth || 320;
      let scrollAmount = direction === 'left' ? -(itemWidth + 24) : (itemWidth + 24);

      if (isRtl) scrollAmount = -scrollAmount;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!categories?.length) return null;

  return (
    <div className="relative group w-full">

      {/* زر التنقل الأيسر: خلفية بيضاء ناصعة تتحول للكحلي عند الهوفير والأيقونة تصبح ذهبية */}
      <button
        onClick={() => scroll('left')}
        style={{ borderColor: `${COLOR_PRIMARY}20` }}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-10 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white shadow-xl rounded-full p-3 transition-all duration-300 hidden md:block border hover:bg-[#093f89] dark:hover:bg-[#093f89] hover:text-[#fbc70f] dark:hover:text-[#fbc70f] ${canScrollLeft ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* زر التنقل الأيمن: مطابقة لنفس الفلسفة الاحترافية للزر الأيسر */}
      <button
        onClick={() => scroll('right')}
        style={{ borderColor: `${COLOR_PRIMARY}20` }}
        className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-10 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white shadow-xl rounded-full p-3 transition-all duration-300 hidden md:block border hover:bg-[#093f89] dark:hover:bg-[#093f89] hover:text-[#fbc70f] dark:hover:text-[#fbc70f] ${canScrollRight ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        disabled={!canScrollRight}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-6 pt-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {categories.map((category: any) => {
          const catName = category.name?.[lang] || category.name?.en || category.name;
          const catDesc = category.description?.[lang] || category.description?.en;

          return (
            <Link
              href={`/shop?category=${encodeURIComponent(catName)}`}
              key={category.id}
              className="group/card cursor-pointer block shrink-0 w-[80vw] sm:w-[320px] lg:w-[350px] snap-center sm:snap-start"
            >
              {/* الكرت الأساسي: أبيض ناصع في الفاتح لمنع المشاكل الرمادية وداكن متناسق في المظلم */}
              <div className="relative h-[320px] md:h-[400px] rounded-3xl overflow-hidden shadow-md dark:shadow-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                <Image
                  src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                  alt={catName}
                  fill
                  sizes="(max-width: 768px) 80vw, (max-width: 1200px) 320px, 350px"
                  className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                />

                {/* تدرج الظل الأسود المعتمد لضمان مقروئية النصوص الفاتحة فوق أي صورة */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-85 transition-opacity duration-300 group-hover/card:opacity-95" />

                <div className="absolute inset-x-0 bottom-0 flex flex-col p-6 text-white text-start z-10">
                  <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 drop-shadow-md">
                    {catName}
                  </h3>

                  <div className="grid grid-rows-[0fr] group-hover/card:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                    <div className="overflow-hidden">
                      {showDescription && catDesc && (
                        <p className="text-slate-300 text-xs md:text-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-75 line-clamp-2 mb-4 font-normal">
                          {catDesc}
                        </p>
                      )}

                      {/* زر استكشف: تمييزه باللون الأصفر الذهبي #fbc70f ليكون جذاباً جداً وواضحاً فوق الخلفية المعتمة */}
                      <div className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100 inline-block mb-1">
                        <span
                          style={{ borderColor: COLOR_ACCENT, color: COLOR_ACCENT }}
                          className="inline-block border-b pb-0.5 text-xs md:text-sm font-bold tracking-wider uppercase"
                        >
                          {isRtl ? 'استكشف الآن ←' : 'Explore Now →'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {showDots && categories.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 pb-2">
          {categories.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (scrollRef.current) {
                  const itemWidth = scrollRef.current.children[0]?.clientWidth || 320;
                  const targetScroll = idx * (itemWidth + 24);
                  scrollRef.current.scrollTo({
                    left: isRtl ? -targetScroll : targetScroll,
                    behavior: 'smooth'
                  });
                }
              }}
              /* الدوتس التفاعلية: النقطة النشطة تظهر بالذهبي البراق والأخرى بالكحلي الخفيف لضمان مظهر براند أنيق */
              style={{
                backgroundColor: activeIndex === idx ? COLOR_ACCENT : `${COLOR_PRIMARY}30`
              }}
              className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 shadow-sm' : 'w-2 hover:bg-[#093f89]/60'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}