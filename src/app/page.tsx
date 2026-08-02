import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { ArrowRight } from "lucide-react";

import { fetchSliders } from "@/lib/api";
import { t } from "@/lib/translations";
import HomeSections from "@/components/HomeSections";
import Slider from "@/components/Slider";

function HomeSectionsFallback() {
  return (
    <div
      className="min-h-[90vh] bg-background"
      aria-hidden="true"
    />
  );
}

export default async function Home() {
  // Keep the critical request isolated: slow below-the-fold APIs must never
  // delay the first HTML chunk or the LCP image preload.
  const [cookieStore, sliders] = await Promise.all([
    cookies(),
    fetchSliders("home_hero"),
  ]);

  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const lang = (localeCookie?.value === "en" ? "en" : "ar") as "en" | "ar";
  const isRtl = lang === "ar";
  const hasSliders = Array.isArray(sliders) && sliders.some(
    (slider) => slider.slides && slider.slides.length > 0,
  );

  return (
    <div className="flex w-full flex-col">
      {hasSliders ? (
        <Slider position="home_hero" lang={lang} initialSliders={sliders} />
      ) : (
        <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-slate-950">
          <div className="absolute inset-0 z-0">
            <Image
              src="/no-image.jpg"
              alt="Hero Background"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-40"
              preload
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#093f89]/50 via-black/70 to-black/95" />
          </div>

          <div className="container relative z-10 mx-auto flex flex-col items-center px-4 pt-20 text-center text-white md:px-6">
            <span className="mb-6 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium uppercase tracking-widest text-[#fbc70f] shadow-[0_0_15px_rgba(251,199,15,0.2)] backdrop-blur-md">
              {lang === "ar" ? "التميز في الزي الموحد" : "Excellence in Uniforms"}
            </span>

            <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] md:text-7xl lg:text-8xl">
              {t("hero_title", lang)}
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed text-gray-200 drop-shadow-md md:text-2xl">
              {t("hero_subtitle", lang)}
            </p>

            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#093f89] bg-[#093f89] px-10 py-4 font-bold text-white shadow-[0_8px_30px_rgba(9,63,137,0.4)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:border-[#fbc70f] hover:shadow-[0_8px_40px_rgba(251,199,15,0.5)] md:py-5"
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-[#fbc70f]">
                {t("shop_collection", lang)}
              </span>
              <ArrowRight
                className={`relative z-10 h-5 w-5 transition-all duration-300 group-hover:text-[#fbc70f] ${
                  isRtl
                    ? "rotate-180 group-hover:-translate-x-1"
                    : "group-hover:translate-x-1"
                }`}
              />
            </Link>
          </div>
        </section>
      )}

      <Suspense fallback={<HomeSectionsFallback />}>
        <HomeSections lang={lang} />
      </Suspense>
    </div>
  );
}
