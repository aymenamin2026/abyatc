import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Award, CalendarClock, Lightbulb, ShieldCheck } from "lucide-react";

// Utils & APIs
import { fetchCategories, fetchProducts, fetchSettings, getImageUrl, fetchSliders, fetchTestimonials } from "@/lib/api";
import { t } from "@/lib/translations";

// Components
import HomeClientWrapper, { FeaturedProductsGrid } from "@/components/HomeClientWrapper";
import Slider from "@/components/Slider";
import TestimonialsSlider from "@/components/TestimonialsSlider";
import CategoriesSlider from "@/components/CategoriesSlider";

export default async function Home() {
  const [
    categories,
    products,
    settings,
    cookieStore,
    sliders,
    testimonials
  ] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchSettings(),
    cookies(),
    fetchSliders('home_hero'),
    fetchTestimonials()
  ]);

  const featuredProducts = Array.isArray(products) ? products.slice(0, 4) : [];
  const currencySymbol = settings?.currency_symbol || "$";
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const lang = (localeCookie?.value === "en" ? "en" : "ar") as "en" | "ar";
  const isRtl = lang === "ar";

  const hasSliders = Array.isArray(sliders) && sliders.some(s => s.slides && s.slides.length > 0);

  return (
    <div className="flex flex-col w-full">
      <HomeClientWrapper featuredProducts={featuredProducts} currencySymbol={currencySymbol} lang={lang} />

      {/* Hero Section */}
      {hasSliders ? (
        <Slider position="home_hero" lang={lang} />
      ) : (
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-slate-950">
          <div className="absolute inset-0 z-0">
            <Image
              src="/no-image.jpg"
              alt="Hero Background"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-40 scale-105 animate-[pulse_15s_ease-in-out_infinite_alternate]"
              priority
            />
            {/* تدرج لوني يدمج الأزرق الملكي بقوة مع الظلام لإبراز النصوص */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#093f89]/50 via-black/70 to-black/95" />
          </div>

          <div className="container mx-auto relative z-10 px-4 md:px-6 pt-20 text-center text-white flex flex-col items-center">
            {/* Glassmorphism Badge */}
            <span className="mb-6 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[#fbc70f] text-sm font-medium tracking-widest uppercase shadow-[0_0_15px_rgba(251,199,15,0.2)] animate-in fade-in slide-in-from-bottom-4 duration-700">
              {lang === 'ar' ? 'التميز في الزي الموحد' : 'Excellence in Uniforms'}
            </span>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-5 duration-1000">
              {t('hero_title', lang)}
            </h1>
            <p className="text-lg md:text-2xl max-w-2xl mx-auto mb-12 text-gray-200 drop-shadow-md animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200 font-light leading-relaxed">
              {t('hero_subtitle', lang)}
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500">
              <Link
                href="/shop"
                className="group relative inline-flex items-center gap-3 bg-[#093f89] text-white overflow-hidden px-10 py-4 md:py-5 rounded-full font-bold transition-all duration-300 ease-in-out shadow-[0_8px_30px_rgba(9,63,137,0.4)] hover:shadow-[0_8px_40px_rgba(251,199,15,0.5)] hover:-translate-y-1 hover:scale-105 border border-[#093f89] hover:border-[#fbc70f]"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                <span className="relative z-10 group-hover:text-[#fbc70f] transition-colors duration-300">{t('shop_collection', lang)}</span>
                <ArrowRight className={`relative z-10 w-5 h-5 group-hover:text-[#fbc70f] transition-all duration-300 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section - Glassmorphism & Depth */}
      <section className="py-24 md:py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#fbc70f]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#093f89]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#093f89] to-[#093f89]/70 dark:from-white dark:to-gray-400">
              {t('categories', lang)}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg font-light">
              {t('shop_by_category', lang)}
            </p>
          </div>

          {(!settings?.categories_layout || settings?.categories_layout === 'grid') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {categories?.map((category: any) => {
                const catName = category.name?.[lang] || category.name?.en || category.name;
                const catDesc = category.description?.[lang] || category.description?.en || category.description;

                return (
                  <Link
                    href={`/shop?category=${encodeURIComponent(catName)}`}
                    key={category.id}
                    className="group cursor-pointer block h-full"
                  >
                    <div className="relative h-[350px] md:h-[400px] rounded-[2rem] overflow-hidden shadow-lg ring-1 ring-border/50 bg-secondary transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 hover:ring-[#fbc70f]/50">
                      <Image
                        src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                        alt={catName}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#093f89] via-[#093f89]/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

                      <div className="absolute inset-x-4 bottom-4 p-5 md:p-6 rounded-2xl bg-white/10 dark:bg-gray-900/40 backdrop-blur-md border border-white/20 flex flex-col items-center md:items-start text-white transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                        <h3 className="font-serif text-xl md:text-2xl font-bold mb-1 drop-shadow-md text-white group-hover:text-[#fbc70f] transition-colors duration-300">
                          {catName}
                        </h3>

                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out w-full">
                          <div className="overflow-hidden">
                            {(settings?.categories_show_description ?? true) && catDesc && (
                              <p
                                className="text-gray-200 text-sm font-light line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 mt-2"
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

          {settings?.categories_layout === 'slider' && (
            <CategoriesSlider categories={categories} lang={lang} settings={settings} />
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32 bg-muted/30 dark:bg-muted/10 border-y border-border/40 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-16 gap-6">
            <div className="text-center md:text-start">
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-3 md:mb-4 text-foreground">
                {t('featured_products', lang)}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">{t('shop_collection', lang)}</p>
            </div>
            <Link
              href="/shop"
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-background border border-border/80 shadow-sm hover:shadow-lg hover:border-[#093f89]/40 text-foreground font-medium transition-all duration-300 ease-in-out hover:-translate-y-1"
            >
              <span className="group-hover:text-[#093f89] transition-colors">{t('view_all_products', lang)}</span>
              <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:text-[#093f89] transition-all duration-300 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </Link>
          </div>

          <FeaturedProductsGrid products={featuredProducts} currencySymbol={currencySymbol} />
        </div>
      </section>

      {/* Testimonials Slider */}
      {Array.isArray(testimonials) && testimonials.length > 0 && (
        <TestimonialsSlider testimonials={testimonials} lang={lang} />
      )}

      {/* Why Choose Us - Ultimate Glassmorphism & Brand Integration */}
      <section className="py-24 md:py-32 bg-background relative overflow-hidden">
        {/* خلفية تجميلية للقسم */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(9,63,137,0.05)_0%,_transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="text-[#fbc70f] font-bold tracking-widest uppercase text-xs md:text-sm mb-4 block">لماذا لمعة أبيات؟</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground">
              معايير الجودة التي نصنعها
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
            {[
              { icon: ShieldCheck, title: t('premium_quality', lang), desc: t('premium_quality_desc', lang) },
              { icon: CalendarClock, title: t('tailored_fit', lang), desc: t('tailored_fit_desc', lang) },
              { icon: Lightbulb, title: t('easy_care', lang), desc: t('easy_care_desc', lang) }
            ].map((item, index) => (
              <div
                key={index}
                className="group relative p-[2px] rounded-[2.5rem] overflow-hidden transition-all duration-500 ease-in-out hover:-translate-y-3 shadow-sm hover:shadow-2xl hover:shadow-[#093f89]/20"
              >
                {/* الإطار الدوار الفخم المدمج بالألوان */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `conic-gradient(from 0deg, transparent, transparent, #fbc70f, #093f89, transparent, transparent)` }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-[spin_4s_linear_infinite]"
                  style={{ background: `conic-gradient(from 180deg, transparent, transparent, #093f89, #fbc70f, transparent, transparent)` }}
                />

                {/* البطاقة الزجاجية الداخلية */}
                <div className="relative bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl p-8 md:p-10 rounded-[2.4rem] h-full flex flex-col items-center text-center z-10 transition-colors border border-border/50 group-hover:border-transparent">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner transition-all duration-500 ease-out group-hover:scale-110 group-hover:shadow-lg bg-gradient-to-br from-[#093f89]/10 to-transparent dark:from-[#093f89]/20 text-[#093f89] group-hover:from-[#093f89] group-hover:to-[#093f89] group-hover:text-[#fbc70f]">
                    <item.icon className="w-10 h-10 transition-transform duration-300" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-light text-sm md:text-base">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}