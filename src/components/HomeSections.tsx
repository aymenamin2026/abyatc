import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarClock, Lightbulb, ShieldCheck } from "lucide-react";

import {
  fetchCategories,
  fetchProducts,
  fetchSettings,
  fetchTestimonials,
  getImageUrl,
} from "@/lib/api";
import { t } from "@/lib/translations";
import { FeaturedProductsGrid } from "@/components/HomeClientWrapper";
import DeferredTestimonials from "@/components/DeferredTestimonials";
import CategoriesSlider from "@/components/CategoriesSlider";

interface HomeSectionsProps {
  lang: "en" | "ar";
}

export default async function HomeSections({ lang }: HomeSectionsProps) {
  // These requests are intentionally inside a Suspense boundary so they can
  // stream after the hero instead of blocking the LCP element.
  const [categories, products, settings, testimonials] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchSettings(),
    fetchTestimonials(),
  ]);

  const featuredProducts = Array.isArray(products) ? products.slice(0, 4) : [];
  const currencySymbol = settings?.currency_symbol || "$";
  const isRtl = lang === "ar";

  return (
    <>
      <section className="relative overflow-hidden bg-background py-24 md:py-32">
        <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#fbc70f]/5 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#093f89]/5 blur-[100px]" />

        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-12">
          <div className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
            <h2 className="mb-4 bg-gradient-to-r from-[#093f89] to-[#093f89]/70 bg-clip-text font-serif text-4xl font-bold text-transparent dark:from-white dark:to-gray-400 md:mb-6 md:text-5xl">
              {t("categories", lang)}
            </h2>
            <p className="text-base font-light text-muted-foreground md:text-lg">
              {t("shop_by_category", lang)}
            </p>
          </div>

          {(!settings?.categories_layout || settings?.categories_layout === "grid") && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {categories?.map((category: any) => {
                const catName = category.name?.[lang] || category.name?.en || category.name;
                const catDesc = category.description?.[lang] || category.description?.en || category.description;

                return (
                  <Link
                    href={`/shop?category=${encodeURIComponent(catName)}`}
                    key={category.id}
                    className="group block h-full cursor-pointer"
                  >
                    <div className="relative h-[350px] overflow-hidden rounded-[2rem] bg-secondary shadow-lg ring-1 ring-border/50 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:ring-[#fbc70f]/50 md:h-[400px]">
                      <Image
                        src={category.image ? getImageUrl(category.image) : "/no-image.jpg"}
                        alt={catName}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#093f89] via-[#093f89]/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

                      <div className="absolute inset-x-4 bottom-4 flex translate-y-2 flex-col items-center rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-md transition-transform duration-500 group-hover:translate-y-0 dark:bg-gray-900/40 md:items-start md:p-6">
                        <h3 className="mb-1 font-serif text-xl font-bold text-white drop-shadow-md transition-colors duration-300 group-hover:text-[#fbc70f] md:text-2xl">
                          {catName}
                        </h3>

                        <div className="grid w-full grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out group-hover:grid-rows-[1fr]">
                          <div className="overflow-hidden">
                            {(settings?.categories_show_description ?? true) && catDesc && (
                              <p
                                className="mt-2 line-clamp-2 text-sm font-light text-gray-200 opacity-0 transition-opacity delay-100 duration-500 group-hover:opacity-100"
                                dangerouslySetInnerHTML={{ __html: catDesc }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {settings?.categories_layout === "slider" && (
            <CategoriesSlider categories={categories} lang={lang} settings={settings} />
          )}
        </div>
      </section>

      <section className="relative border-y border-border/40 bg-muted/30 py-24 dark:bg-muted/10 md:py-32">
        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-12">
          <div className="mb-12 flex flex-col items-center justify-between gap-6 md:mb-16 md:flex-row md:items-end">
            <div className="text-center md:text-start">
              <h2 className="mb-3 font-serif text-3xl font-bold text-foreground md:mb-4 md:text-5xl">
                {t("featured_products", lang)}
              </h2>
              <p className="text-base text-muted-foreground md:text-lg">
                {t("shop_collection", lang)}
              </p>
            </div>
            <Link
              href="/shop"
              className="group flex items-center gap-2 rounded-full border border-border/80 bg-background px-6 py-3 font-medium text-foreground shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#093f89]/40 hover:shadow-lg"
            >
              <span className="transition-colors group-hover:text-[#093f89]">
                {t("view_all_products", lang)}
              </span>
              <ArrowRight
                className={`h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-[#093f89] ${
                  isRtl
                    ? "rotate-180 group-hover:-translate-x-1"
                    : "group-hover:translate-x-1"
                }`}
              />
            </Link>
          </div>

          <FeaturedProductsGrid
            products={featuredProducts}
            currencySymbol={currencySymbol}
          />
        </div>
      </section>

      {Array.isArray(testimonials) && testimonials.length > 0 && (
        <DeferredTestimonials testimonials={testimonials} lang={lang} />
      )}

      <section className="relative overflow-hidden bg-background py-24 md:py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,_rgba(9,63,137,0.05)_0%,_transparent_70%)]" />

        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-12">
          <div className="mx-auto mb-16 max-w-2xl text-center md:mb-20">
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-[#fbc70f] md:text-sm">
              لماذا لمعة أبيات؟
            </span>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-5xl">
              معايير الجودة التي نصنعها
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-10">
            {[
              {
                icon: ShieldCheck,
                title: t("premium_quality", lang),
                desc: t("premium_quality_desc", lang),
              },
              {
                icon: CalendarClock,
                title: t("tailored_fit", lang),
                desc: t("tailored_fit_desc", lang),
              },
              {
                icon: Lightbulb,
                title: t("easy_care", lang),
                desc: t("easy_care_desc", lang),
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[2.5rem] p-[2px] shadow-sm transition-all duration-500 ease-in-out hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#093f89]/20"
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent, transparent, #fbc70f, #093f89, transparent, transparent)",
                  }}
                />
                <div
                  className="absolute inset-0 animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100"
                  style={{
                    background:
                      "conic-gradient(from 180deg, transparent, transparent, #093f89, #fbc70f, transparent, transparent)",
                  }}
                />

                <div className="relative z-10 flex h-full flex-col items-center rounded-[2.4rem] border border-border/50 bg-white/80 p-8 text-center backdrop-blur-xl transition-colors group-hover:border-transparent dark:bg-gray-900/90 md:p-10">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#093f89]/10 to-transparent text-[#093f89] shadow-inner transition-all duration-500 ease-out group-hover:scale-110 group-hover:from-[#093f89] group-hover:to-[#093f89] group-hover:text-[#fbc70f] group-hover:shadow-lg dark:from-[#093f89]/20">
                    <item.icon className="h-10 w-10 transition-transform duration-300" strokeWidth={1.5} />
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-muted-foreground md:text-base">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
