"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchSliders, getImageUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

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
}

interface SliderProps {
  position: string;
  lang: 'en' | 'ar';
}

export default function Slider({ position, lang }: SliderProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sliderSettings, setSliderSettings] = useState({
    cover_header: false,
    animation: 'fade',
    height: 'medium'
  });

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVimeoId = (url: string) => {
    const match = url?.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
    return match ? match[1] : null;
  };

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
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  useEffect(() => {
    const loadSliders = async () => {
      try {
        const sliders = await fetchSliders(position);
        if (sliders.length > 0) {
          const activeSlider = sliders.find((s: any) => s.is_active) || sliders[0];
          setSliderSettings({
            cover_header: activeSlider.cover_header || position === 'home_hero',
            animation: activeSlider.animation || 'fade',
            height: activeSlider.height || (position === 'home_hero' ? 'full' : 'medium')
          });

          const allSlides = sliders.flatMap((slider: any) => slider.slides || []);
          setSlides(allSlides);
        }
      } catch (error) {
        console.error("Error loading sliders:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSliders();
  }, [position]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const getAnimationProps = () => {
    switch (sliderSettings.animation) {
      case 'slide':
        return {
          initial: { x: lang === 'ar' ? -1000 : 1000, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: lang === 'ar' ? 1000 : -1000, opacity: 0 },
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
          transition: { duration: 1.2 }
        };
    }
  };

  const animProps = getAnimationProps();
  const heightClass = sliderSettings.cover_header ? 'h-screen' : (heightMap[sliderSettings.height] || 'h-[70vh]');

  if (loading) return <div className={`${heightClass} w-full bg-slate-900 animate-pulse`} />;
  if (slides.length === 0) return null;

  return (
    <section className={`relative w-full overflow-hidden ${heightClass}`}>
      <div className={sliderSettings.cover_header ? "pt-20" : ""}></div>
      <AnimatePresence mode="wait">
        {slides.map((slide, index) => {
          const vAlign = (slide as any).settings?.v_align || 'center';
          const hAlign = (slide as any).settings?.h_align || 'center';

          return index === current && (
            <motion.div
              key={slide.id}
              {...animProps}
              className={`absolute inset-0 flex ${vAlignMap[vAlign] || 'items-center'} justify-center`}
            >
              {/* Background */}
              <div className="absolute inset-0 z-0">
                {slide.type === 'image' ? (
                  <Image
                    src={getImageUrl(slide.image_path)}
                    alt={slide.title?.[lang] || 'Slide'}
                    fill
                    className="object-cover object-center"
                    priority
                  />
                ) : (
                  <div className="relative w-full h-full pointer-events-none overflow-hidden bg-black">
                    {slide.video_source === 'youtube' && getYouTubeId(slide.video_url) ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeId(slide.video_url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeId(slide.video_url)}&background=1&modestbranding=1&showinfo=0`}
                        className="absolute w-full h-full scale-[1.5] pointer-events-none"
                        title="YouTube Video"
                        frameBorder="0"
                        allow="autoplay; fullscreen"
                      />
                    ) : slide.video_source === 'vimeo' && getVimeoId(slide.video_url) ? (
                      <iframe
                        src={`https://player.vimeo.com/video/${getVimeoId(slide.video_url)}?autoplay=1&muted=1&loop=1&background=1`}
                        className="absolute w-full h-full scale-[1.5] pointer-events-none"
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
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Content */}
              <div className={`container relative z-10 px-4 sm:px-6 lg:px-8 flex flex-col text-white ${hAlignMap[hAlign] || 'text-center items-center'} ${sliderSettings.cover_header ? "pt-24" : ""}`}>
                <motion.h2
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 drop-shadow-2xl"
                  dangerouslySetInnerHTML={{ __html: slide.title?.[lang] || slide.title?.en }}
                />
                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-lg md:text-2xl max-w-3xl mb-10 text-gray-100/90 drop-shadow-xl font-light"
                  dangerouslySetInnerHTML={{ __html: slide.subtitle?.[lang] || slide.subtitle?.en }}
                />
                {slide.btn_link && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  >
                    <Link
                      href={slide.btn_link}
                      className="group inline-flex items-center gap-3 bg-white text-black hover:bg-black hover:text-white px-10 py-5 rounded-full font-bold transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <span>{slide.btn_text?.[lang] || slide.btn_text?.en || 'Shop Now'}</span>
                      <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xl border border-white/10 hover:bg-white hover:text-black transition-all duration-300 group"
          >
            <ChevronLeft className="w-6 h-6 transition-transform group-hover:scale-110" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xl border border-white/10 hover:bg-white hover:text-black transition-all duration-300 group"
          >
            <ChevronRight className="w-6 h-6 transition-transform group-hover:scale-110" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-10 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}