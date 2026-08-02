"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { getImageUrl } from "@/lib/api";

interface Slide {
  id: number;
  title: any;
  subtitle: any;
  btn_text: any;
  btn_link: string;
  image_path: string;
  video_path: string;
  video_source: string;
  video_url: string;
  type: 'image' | 'video';
  settings?: any;
}

interface SliderProps {
  position: string;
  lang: 'en' | 'ar';
  initialSliders: any[];
}

export default function Slider({ position, lang, initialSliders }: SliderProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const activeSlider = useMemo(
    () => initialSliders.find((slider: any) => slider.is_active) || initialSliders[0],
    [initialSliders]
  );

  const slides = useMemo<Slide[]>(
    () => initialSliders.flatMap((slider: any) => slider.slides || []),
    [initialSliders]
  );

  const sliderSettings = useMemo(() => ({
    cover_header: activeSlider?.cover_header || position === 'home_hero',
    animation: activeSlider?.animation || 'fade',
    height: activeSlider?.height || (position === 'home_hero' ? 'full' : 'medium')
  }), [activeSlider, position]);

  const isRtl = lang === 'ar';

  const getYouTubeId = useCallback((url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, []);

  const getVimeoId = useCallback((url: string) => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
    return match ? match[1] : null;
  }, []);

  const heightMap: Record<string, string> = {
    full: 'h-[100dvh]',
    large: 'h-[90dvh]',
    medium: 'h-[80dvh]',
    small: 'h-[60dvh]',
  };

  const vAlignMap: Record<string, string> = {
    top: 'items-start pt-32',
    center: 'items-center',
    bottom: 'items-end pb-32 mb-10',
  };

  const hAlignMap: Record<string, string> = {
    left: 'text-start items-start', // استخدام start/end لدعم RTL
    center: 'text-center items-center',
    right: 'text-end items-end',
  };

  // 2. تحسين مؤقت التمرير التلقائي ليتوقف عند قراءة المستخدم (Pause on Hover)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  // قم بتغيير الدالة إلى هذا الشكل:
  const getAnimationProps = () => {
    switch (sliderSettings.animation) {
      case 'slide':
        return {
          initial: { x: lang === 'ar' ? -100 : 100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: lang === 'ar' ? 100 : -100, opacity: 0 },
          // الحل هنا: إضافة as const لجعل القيم ثابتة (Literal Types)
          transition: { type: "spring" as const, stiffness: 300, damping: 30 }
        };
      case 'zoom':
        return {
          initial: { scale: 1.1, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.95, opacity: 0 },
          transition: { duration: 1.5, ease: "easeOut" as const }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 1.2, ease: "linear" as const }
        };
    }
  };

  const animProps = getAnimationProps();
  const heightClass = sliderSettings.cover_header ? 'h-[100dvh]' : (heightMap[sliderSettings.height] || 'h-[70vh]');

  if (slides.length === 0) return null;

  return (
    <section
      className={`relative w-full overflow-hidden ${heightClass} group/slider`}
      aria-roledescription={isRtl ? "عارض شرائح" : "carousel"}
      aria-label={isRtl ? "العروض الرئيسية" : "Featured offers"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className={sliderSettings.cover_header ? "pt-20" : ""}></div>
      <AnimatePresence mode="wait" initial={false}>
        {slides.map((slide, index) => {
          const vAlign = slide.settings?.v_align || 'center';
          const hAlign = slide.settings?.h_align || 'center';

          return index === current && (
            <motion.div
              key={slide.id}
              {...animProps}
              className={`absolute inset-0 flex ${vAlignMap[vAlign] || 'items-center'} justify-center`}
            >
              {/* Background */}
              <div className="absolute inset-0 z-0 bg-black">
                {slide.type === 'image' ? (
                  <Image
                    src={getImageUrl(slide.image_path)}
                    alt={slide.title?.[lang] || slide.title?.en || 'Slide Image'}
                    fill
                    sizes="100vw"
                    quality={70}
                    // The uploaded hero is already a small WebP. Sending it
                    // directly avoids a cold Vercel image-optimizer hop.
                    unoptimized={index === 0}
                    className="object-cover object-center"
                    {...(index === 0
                      ? { preload: true }
                      : { loading: "lazy" as const })}
                  />
                ) : (
                  <div className="relative w-full h-full pointer-events-none overflow-hidden">
                    {slide.video_source === 'youtube' && getYouTubeId(slide.video_url) ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeId(slide.video_url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeId(slide.video_url)}&background=1&modestbranding=1&showinfo=0`}
                        className="absolute w-full h-full scale-[1.3] md:scale-[1.5] pointer-events-none"
                        title="YouTube Video"
                        frameBorder="0"
                        allow="autoplay; fullscreen"
                      />
                    ) : slide.video_source === 'vimeo' && getVimeoId(slide.video_url) ? (
                      <iframe
                        src={`https://player.vimeo.com/video/${getVimeoId(slide.video_url)}?autoplay=1&muted=1&loop=1&background=1`}
                        className="absolute w-full h-full scale-[1.3] md:scale-[1.5] pointer-events-none"
                        title="Vimeo Video"
                        frameBorder="0"
                        allow="autoplay; fullscreen"
                      />
                    ) : (
                      <video
                        src={getImageUrl(slide.video_path)}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                {/* طبقة التعتيم الثابتة لضمان قراءة النصوص في جميع الأوضاع */}
                <div className="absolute inset-0 bg-black/40 dark:bg-black/50" />
              </div>

              {/* Content */}
              <div className={`container relative z-10 px-4 sm:px-6 lg:px-8 flex flex-col text-white ${hAlignMap[hAlign] || 'text-center items-center'} ${sliderSettings.cover_header ? "pt-24" : ""}`}>
                {slide.title && (
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 sm:mb-6 drop-shadow-2xl leading-tight"
                    dangerouslySetInnerHTML={{ __html: slide.title?.[lang] || slide.title?.en }}
                  />
                )}

                {slide.subtitle && (
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    className="text-base sm:text-lg md:text-2xl max-w-3xl mb-8 sm:mb-10 text-gray-100/90 drop-shadow-xl font-light leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: slide.subtitle?.[lang] || slide.subtitle?.en }}
                  />
                )}

                {slide.btn_link && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.7 }}
                  >
                    <Link
                      href={slide.btn_link}
                      className="group inline-flex items-center gap-3 bg-white text-black hover:bg-primary hover:text-primary-foreground px-8 py-4 sm:px-10 sm:py-5 rounded-full font-bold transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <span>{slide.btn_text?.[lang] || slide.btn_text?.en || (isRtl ? 'تسوق الآن' : 'Shop Now')}</span>
                      <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Navigation Controls (Visible on Hover for Desktop) */}
      {slides.length > 1 && (
        <>
          {/* 5. استخدام start-6 و end-6 لتتوافق الأزرار مع اتجاه اللغة تلقائياً */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label={isRtl ? "الشريحة السابقة" : "Previous slide"}
            className="absolute start-4 sm:start-6 top-1/2 -translate-y-1/2 z-20 size-12 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xl border border-white/20 hover:bg-white hover:text-black transition-all duration-300 group opacity-0 md:group-hover/slider:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isRtl ? (
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
            ) : (
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
            )}
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label={isRtl ? "الشريحة التالية" : "Next slide"}
            className="absolute end-4 sm:end-6 top-1/2 -translate-y-1/2 z-20 size-12 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xl border border-white/20 hover:bg-white hover:text-black transition-all duration-300 group opacity-0 md:group-hover/slider:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isRtl ? (
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
            ) : (
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
            )}
          </button>

          {/* Indicators */}
          <div className="absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex" aria-label={isRtl ? "اختيار الشريحة" : "Choose slide"}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={isRtl ? `الانتقال إلى الشريحة ${i + 1}` : `Go to slide ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
                className="grid size-12 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
