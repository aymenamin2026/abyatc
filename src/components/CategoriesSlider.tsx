"use client";

import { useRef, useState, useEffect } from 'react';
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const isRtl = lang === 'ar';
  const showDescription = settings?.categories_show_description ?? true;
  const showDots = settings?.categories_slider_dots ?? true;
  const autoplay = settings?.categories_slider_autoplay ?? false;
  const autoplayTime = settings?.categories_slider_autoplay_time ?? 3000;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // دعم المتصفحات المختلفة في وضع RTL والـ LTR
      const absoluteScroll = Math.abs(scrollLeft);

      if (isRtl) {
        // في الـ RTL السكرول يتجه لليسار بقيم سالبة أو تناقصية
        setCanScrollLeft(absoluteScroll < scrollWidth - clientWidth - 10);
        setCanScrollRight(absoluteScroll > 5);
      } else {
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
      }

      // حساب الـ Index للنقاط (Dots) بشكل مرن يدعم شاشات الموبايل
      if (showDots && scrollRef.current.children.length > 0) {
        const itemWidth = scrollRef.current.children[0]?.clientWidth || 320;
        const gap = 24;
        const index = Math.round(absoluteScroll / (itemWidth + gap));
        setActiveIndex(Math.min(index, categories.length - 1));
      }
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    console.log("Categories:", categories);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories, showDots, lang]);

  // Autoplay Logic
  useEffect(() => {
    if (!autoplay || categories.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const absoluteScroll = Math.abs(scrollLeft);

        if (absoluteScroll + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll(isRtl ? 'left' : 'right');
        }
      }
    }, autoplayTime);

    return () => clearInterval(interval);
  }, [autoplay, autoplayTime, categories.length, lang]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.children[0]?.clientWidth || 320;
      const scrollAmount = direction === 'left' ? -(itemWidth + 24) : (itemWidth + 24);
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="relative group w-full">
      {/* Scroll Buttons - مخفية تماماً على الموبايل لتوفير مساحة اللمس الطبيعية وعملية على اللابتوب */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-10 bg-background/90 hover:bg-background text-foreground shadow-lg rounded-full p-3 transition-all duration-300 hidden md:block ${canScrollLeft ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => scroll('right')}
        className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-10 bg-background/90 hover:bg-background text-foreground shadow-lg rounded-full p-3 transition-all duration-300 hidden md:block ${canScrollRight ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        disabled={!canScrollRight}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slider Container - استخدام كلاسات ترند سيلويند لمنع ظهور الاسكرول بار المتصفح */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-6 pt-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {categories.map((category: any) => (
          <Link
            href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en || category.name)}`}
            key={category.id}
            className="group/card cursor-pointer block shrink-0 w-[80vw] sm:w-[320px] lg:w-[350px] snap-center sm:snap-start"
          >
            <div className="relative h-[320px] md:h-[400px] rounded-3xl overflow-hidden shadow-md bg-secondary border border-border/50">
              <Image
                src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                alt={category.name?.[lang] || category.name?.en || category.name}
                fill
                sizes="(max-width: 768px) 80vw, (max-width: 1200px) 320px, 350px"
                className="object-cover transition-transform duration-700 group-hover/card:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover/card:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col p-6 text-white text-right">
                <h3 className="font-serif text-xl md:text-3xl font-bold mb-2 drop-shadow-lg relative z-10 transition-transform duration-500">
                  {category.name?.[lang] || category.name?.en || category.name}
                </h3>

                <div className="grid grid-rows-[0fr] group-hover/card:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                  <div className="overflow-hidden">
                    {showDescription && (category.description?.[lang] || category.description?.en) && (
                      <p className="text-gray-200 text-xs md:text-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2 mb-4">
                        {category.description?.[lang] || category.description?.en}
                      </p>
                    )}

                    <div className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-150 inline-block mb-1">
                      <span className="inline-block border-b border-white pb-1 text-sm font-medium uppercase tracking-wider text-white">
                        {isRtl ? 'استكشف' : 'Explore'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Dots */}
      {showDots && categories.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-2 pb-4">
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
              className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 bg-primary' : 'w-2 bg-primary/30 hover:bg-primary/50'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}