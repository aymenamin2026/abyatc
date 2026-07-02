import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Award, CalendarClock, Lightbulb } from "lucide-react";

// Utils & APIs
import { fetchCategories, fetchProducts, fetchSettings, getImageUrl, fetchSliders, fetchTestimonials } from "@/lib/api";
import { t } from "@/lib/translations";

// Components
import HomeClientWrapper, { FeaturedProductsGrid } from "@/components/HomeClientWrapper";
import Slider from "@/components/Slider";
import TestimonialsSlider from "@/components/TestimonialsSlider";
import CategoriesSlider from "@/components/CategoriesSlider";

export default async function Home() {
  // 1. الجلب المتوازي (Parallel Data Fetching): تقليل وقت الاستجابة بشكل جذري
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
      {/* Client Wrapper */}
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
              sizes="100vw" // تحسين أداء LCP للصور الكبيرة
              className="object-cover object-center opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="container relative z-10 px-4 pt-20 text-center text-white">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6 drop-shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-1000">
              {t('hero_title', lang)}
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-gray-200 drop-shadow-md animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200 fill-mode-both">
              {t('hero_subtitle', lang)}
            </p>
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500 fill-mode-both">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-btn-bg text-btn-text hover:opacity-90 px-8 py-4 rounded-full font-medium transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                {t('shop_collection', lang)}
                <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('categories', lang)}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('shop_by_category', lang)}
            </p>
          </div>

          {(!settings?.categories_layout || settings?.categories_layout === 'grid') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {categories?.map((category: any) => {
                const catName = category.name?.[lang] || category.name?.en || category.name;
                const catDesc = category.description?.[lang] || category.description?.en || category.description;

                return (
                  <Link
                    href={`/shop?category=${encodeURIComponent(catName)}`}
                    key={category.id}
                    className="group cursor-pointer block h-full"
                  >
                    <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-md bg-secondary">
                      <Image
                        src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                        alt={catName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" // تحسين أداء تحميل الصور
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 transition-colors duration-500" />
                      <div className="absolute inset-x-0 bottom-0 flex flex-col p-6 text-white text-center md:text-start">
                        <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 drop-shadow-md relative z-10 transition-transform duration-500">
                          {catName}
                        </h3>

                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                          <div className="overflow-hidden">
                            {(settings?.categories_show_description ?? true) && catDesc && (
                              <p
                                className="text-gray-300 text-xs md:text-sm shadow-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mt-1"
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

          {settings?.categories_layout === 'masonry' && (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
              {categories?.map((category: any, index: number) => {
                const heightClass = index % 3 === 0 ? 'h-[400px]' : index % 2 === 0 ? 'h-[250px]' : 'h-[320px]';
                const catName = category.name?.[lang] || category.name?.en || category.name;
                const catDesc = category.description?.[lang] || category.description?.en || category.description;

                return (
                  <Link
                    href={`/shop?category=${encodeURIComponent(catName)}`}
                    key={category.id}
                    className={`group cursor-pointer block relative ${heightClass} rounded-2xl overflow-hidden shadow-md bg-secondary break-inside-avoid`}
                  >
                    <Image
                      src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                      alt={catName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 transition-colors duration-500" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end p-6 text-center text-white">
                      <h3 className="font-serif text-2xl font-bold mb-3 drop-shadow-md relative z-10 transition-transform duration-500">
                        {catName}
                      </h3>

                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out w-full">
                        <div className="overflow-hidden flex flex-col items-center">
                          {(settings?.categories_show_description ?? true) && catDesc && (
                            <p
                              className="text-gray-300 text-xs shadow-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
                              dangerouslySetInnerHTML={{ __html: catDesc }}
                            />
                          )}
                          <span className="text-xs font-medium tracking-wider uppercase border border-white/50 px-4 py-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 inline-block mb-1">
                            {t('shop_collection', lang)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                {t('featured_products', lang)}
              </h2>
              <p className="text-muted-foreground">{t('shop_collection', lang)}</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-1 text-foreground font-medium hover:text-primary transition-colors">
              {t('view_all_products', lang)}
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <FeaturedProductsGrid products={featuredProducts} currencySymbol={currencySymbol} />
        </div>
      </section>

      {/* Testimonials Slider */}
      {Array.isArray(testimonials) && testimonials.length > 0 && (
        <TestimonialsSlider testimonials={testimonials} lang={lang} />
      )}

      {/* Features/Why Choose Us - متوافق بالكامل مع الوضع الليلي والنهار بألوان البراند */}
      <section className="py-20bg-muted/10 dark:bg-background transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: t('premium_quality', lang), desc: t('premium_quality_desc', lang) },
              { icon: CalendarClock, title: t('tailored_fit', lang), desc: t('tailored_fit_desc', lang) },
              { icon: Lightbulb, title: t('easy_care', lang), desc: t('easy_care_desc', lang) }
            ].map((item, index) => (
              <div key={index} className="relative p-[2px] rounded-[32px] overflow-hidden group">

                {/* عنصر الضوء الدوار: يدمج الآن الكحلي (#093f89) والذهبي (#fbc70f) بلمسة متوهجة احترافية عند الهوفير */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary to-primary/60 animate-spin-border opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, #093f89 0%, #fbc70f 50%, #093f89 100%)`
                  }}
                />

                {/* محتوى البطاقة: تم ضبطه ليكون أبيض ناصع في الفاتح وداكن عميق في المظلم لضمان تباين مذهل */}
                <div className="relative bg-card p-8 rounded-[30px] h-full shadow-lg border border-border/50 group-hover:border-transparent transition-colors">

                  {/* حاوية الأيقونة: تعتمد على الكحلي كمظهر أساسي وتتحول للذهبي أو الكحلي الكامل عند التفاعل */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300 text-[#093f89] dark:text-blue-400 bg-[#093f89]/10 group-hover:bg-[#093f89] group-hover:text-white dark:group-hover:bg-[#fbc70f] dark:group-hover:text-zinc-950"
                  >
                    <item.icon className="w-7 h-7" />
                  </div>

                  {/* العنوان: تباين عالي يتغير ليعكس هوية البراند الكحلية عند تمرير الماوس */}
                  <h3 className="ttext-xl font-bold text-card-foreground mb-3 mb-3 group-hover:text-[#093f89] dark:group-hover:text-amber-400 transition-colors duration-300">
                    {item.title}
                  </h3>

                  {/* الوصف: رمادي ناعم ومقروء تماماً في كلا الوضعين بدون أي تداخل ألوان مزعج */}
                  <p className="text-muted-foreground leading-relaxed">
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