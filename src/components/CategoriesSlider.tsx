"use client";

import { useRef, useState } from 'react';
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
    <div className="relative w-full py-10 overflow-hidden group">
      {/* Navigation Buttons */}
      <button 
        onClick={() => scroll(lang === 'ar' ? 'right' : 'left')}
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all hover:bg-white/20 ${!canScrollLeft && 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={24} />
      </button>

      {/* Slider */}
      <div 
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex gap-6 px-6 pb-6 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
      >
        {categories.map((category: any, index: number) => (
          <Link 
            href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en)}`}
            key={category.id}
            className="flex-shrink-0 w-[80vw] sm:w-[350px] h-[450px] snap-start group/card relative rounded-[32px] overflow-hidden"
          >
            {/* Image with Priority optimization */}
            <Image
              src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
              alt={category.name?.[lang] || category.name?.en}
              fill
              priority={index < 2}
              className="object-cover transition-transform duration-700 group-hover/card:scale-110"
              sizes="(max-width: 768px) 80vw, 350px"
            />
            
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
              <div className="backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 transform transition-transform duration-500 group-hover/card:-translate-y-2">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {category.name?.[lang] || category.name?.en}
                </h3>
                <div className="w-12 h-1 bg-primary rounded-full transition-all group-hover/card:w-20" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <button 
        onClick={() => scroll(lang === 'ar' ? 'left' : 'right')}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all hover:bg-white/20 ${!canScrollRight && 'opacity-0 pointer-events-none'}`}
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