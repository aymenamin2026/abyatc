"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

import { t } from "@/lib/translations";

interface Testimonial {
  id: number;
  name: { en: string; ar: string } | string;
  position: { en: string; ar: string } | string | null;
  company: { en: string; ar: string } | string | null;
  content: { en: string; ar: string } | string;
  image: string | null;
  rating: number;
}

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
  lang: "en" | "ar";
}

function getLocalizedText(field: any, lang: "en" | "ar"): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] || field["en"] || "";
}

export default function TestimonialsSlider({ testimonials, lang }: TestimonialsSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const total = testimonials.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || total <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next, total]);

  if (!testimonials || testimonials.length === 0) return null;

  const testimonial = testimonials[current];
  const name = getLocalizedText(testimonial.name, lang);
  const position = getLocalizedText(testimonial.position, lang);
  const company = getLocalizedText(testimonial.company, lang);
  const content = getLocalizedText(testimonial.content, lang);
  const imageUrl = testimonial.image
    ? testimonial.image.startsWith("http") || testimonial.image.startsWith("/")
      ? testimonial.image
      : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}/storage/${testimonial.image}`
    : null;

  return (
    <section className="py-20 md:py-28 bg-muted/50 relative overflow-hidden" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#093f89]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#fbc70f]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#093f89] mb-4">
            {t('testimonials_title', lang)}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('testimonials_subtitle', lang)}
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div
            className="relative bg-background rounded-3xl shadow-xl border border-border/50 p-8 md:p-12 transition-all duration-500"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Quote Icon - تم تحديثه ليتناسب مع الهوية البصرية */}
            <div className="absolute -top-5 left-8 md:left-12 w-10 h-10 bg-[#093f89] border border-[#fbc70f]/30 rounded-full flex items-center justify-center shadow-lg shadow-[#093f89]/20">
              <Quote className="w-5 h-5 text-[#fbc70f]" />
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Avatar */}
              <div className="shrink-0">
                {imageUrl ? (
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-[#093f89]/10 shadow-lg">
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  // تم استبدال الـ Cyan باللون الأزرق الداكن الفخم لإبراز الحرف الأول بالأصفر المشع
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#093f89] border-2 border-[#fbc70f]/40 flex items-center justify-center ring-4 ring-[#093f89]/5 shadow-lg">
                    <span className="text-3xl md:text-4xl font-bold text-[#fbc70f]">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 text-center md:text-start">
                {/* Stars */}
                <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating
                        ? "fill-[#fbc70f] text-[#fbc70f]"
                        : "fill-muted text-muted-foreground/30"
                        }`}
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote
                  className="text-foreground text-lg md:text-xl leading-relaxed mb-6 font-medium"
                  dangerouslySetInnerHTML={{ __html: `&ldquo;${content}&rdquo;` }}
                />

                {/* Author Info */}
                <div>
                  <p className="font-bold text-[#093f89] text-lg">{name}</p>
                  {(position || company) && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {position}
                      {position && company && " · "}
                      {company}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {total > 1 && (
              <>
                <button
                  onClick={lang === "ar" ? next : prev}
                  className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-5 w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-[#093f89] hover:border-[#093f89]/30 transition-all hover:scale-110 active:scale-95"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={lang === "ar" ? prev : next}
                  className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-5 w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-[#093f89] hover:border-[#093f89]/30 transition-all hover:scale-110 active:scale-95"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Dots Indicator - التعديل الأساسي للنقاط يقع هنا */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2.5 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${i === current
                    ? "w-9 h-2.5 bg-[#fbc70f] shadow-[0_0_12px_rgba(251,199,15,0.6)] border border-[#093f89]/10"
                    : "w-2.5 h-2.5 bg-[#093f89]/20 hover:bg-[#093f89]/50"
                    }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}