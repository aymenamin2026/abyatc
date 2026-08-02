"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const TestimonialsSlider = dynamic(() => import("./TestimonialsSlider"), {
  ssr: false,
  loading: () => <div className="min-h-[420px]" aria-hidden="true" />,
});

export default function DeferredTestimonials(props: {
  testimonials: any[];
  lang: "en" | "ar";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-[420px]">
      {visible && <TestimonialsSlider {...props} />}
    </div>
  );
}
