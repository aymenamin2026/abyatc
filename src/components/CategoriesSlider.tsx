"use client";

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
      {/* Navigation Buttons - Luxury Glassmorphism */}
      <button
        onClick={() => scroll('left')}
        className={`absolute start-0 top-1/2 -translate-y-1/2 -ms-5 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl text-[#093f89] dark:text-[#fbc70f] hover:bg-[#093f89] hover:text-[#fbc70f] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/40 dark:border-white/10 rounded-full p-3 transition-all duration-300 hidden md:flex items-center justify-center hover:scale-110 active:scale-95 ${canScrollLeft ? 'opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
      >
        <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
      </button>

      <button
        onClick={() => scroll('right')}
        className={`absolute end-0 top-1/2 -translate-y-1/2 -me-5 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl text-[#093f89] dark:text-[#fbc70f] hover:bg-[#093f89] hover:text-[#fbc70f] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/40 dark:border-white/10 rounded-full p-3 transition-all duration-300 hidden md:flex items-center justify-center hover:scale-110 active:scale-95 ${canScrollRight ? 'opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        disabled={!canScrollRight}
        aria-label="Scroll right"
      >
        <ChevronRight className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
      </button>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-8 pt-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {categories.map((category: any) => {
          const catName = category.name?.[lang] || category.name?.en || category.name;
          const catDesc = category.description?.[lang] || category.description?.en;

          return (
            <Link
              href={`/shop?category=${encodeURIComponent(catName)}`}
              key={category.id}
              className="group/card cursor-pointer block shrink-0 w-[80vw] sm:w-[320px] lg:w-[360px] snap-center sm:snap-start"
            >
              <div className="relative h-[340px] md:h-[420px] rounded-[2rem] overflow-hidden shadow-lg ring-1 ring-gray-900/5 dark:ring-white/10 bg-card transition-all duration-500 ease-in-out hover:shadow-2xl hover:-translate-y-2 hover:shadow-[#093f89]/20">
                <Image
                  src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                  alt={catName}
                  fill
                  sizes="(max-width: 768px) 80vw, (max-width: 1200px) 320px, 360px"
                  className="object-cover transition-transform duration-700 ease-in-out group-hover/card:scale-110"
                />

                {/* Royal Blue Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#093f89]/95 via-black/40 to-transparent opacity-80 transition-opacity duration-500 group-hover/card:opacity-95" />

                <div className="absolute inset-x-0 bottom-0 flex flex-col p-6 sm:p-8 text-white text-start">
                  <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2 drop-shadow-xl relative z-10 transition-colors duration-500 group-hover/card:text-[#fbc70f]">
                    {catName}
                  </h3>

                  <div className="grid grid-rows-[0fr] group-hover/card:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                    <div className="overflow-hidden">
                      {showDescription && catDesc && (
                        <p className="text-gray-200 text-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2 mb-4 font-light leading-relaxed">
                          {catDesc}
                        </p>
                      )}

                      <div className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-200 inline-block mt-2">
                        <span className="inline-block border-b-2 border-[#fbc70f] pb-1 text-xs font-bold uppercase tracking-widest text-[#fbc70f]">
                          {isRtl ? 'استكشف المجموعة' : 'Explore Collection'}
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

      {/* Pagination Dots */}
      {showDots && categories.length > 1 && (
        <div className="flex justify-center items-center gap-2.5 mt-2 pb-2">
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
              className={`h-2 rounded-full transition-all duration-500 ease-out ${activeIndex === idx
                  ? 'w-8 bg-[#fbc70f] shadow-[0_0_10px_rgba(251,199,15,0.5)]'
                  : 'w-2 bg-[#093f89]/20 dark:bg-white/20 hover:bg-[#093f89]/50 dark:hover:bg-white/40'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}