import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, CalendarClock, Lightbulb } from "lucide-react";
import { fetchCategories, fetchProducts, fetchSettings, getImageUrl, fetchSliders, fetchTestimonials } from "@/lib/api";
import { cookies } from "next/headers";
import { t } from "@/lib/translations";
import HomeClientWrapper, { FeaturedProductsGrid } from "@/components/HomeClientWrapper";
import Slider from "@/components/Slider";
import TestimonialsSlider from "@/components/TestimonialsSlider";
import CategoriesSlider from "@/components/CategoriesSlider";

export default async function Home() {
  const categories = await fetchCategories();
  const products = await fetchProducts();
  const featuredProducts = Array.isArray(products) ? products.slice(0, 4) : [];

  const settings = await fetchSettings();
  const currencySymbol = settings?.currency_symbol || "$";

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const lang = (localeCookie?.value === "ar" ? "ar" : "en") as "en" | "ar";

  const sliders = await fetchSliders('home_hero');
  const hasSliders = Array.isArray(sliders) && sliders.some(s => s.slides && s.slides.length > 0);

  const testimonials = await fetchTestimonials();

  return (
    <div className="flex flex-col min-h-screen">
      <HomeClientWrapper featuredProducts={featuredProducts} currencySymbol={currencySymbol} lang={lang} />

      {/* Hero Section */}
      {hasSliders ? (
        <Slider position="home_hero" lang={lang} />
      ) : (
        <section className="relative w-full h-screen overflow-hidden -mt-20">
          <div className="absolute inset-0 z-0 bg-slate-900">
            <Image
              src="/no-image.jpg"
              alt="Hero Background"
              fill
              className="object-cover object-center opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="container relative z-10 px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6 drop-shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-1000">
              {t('hero_title', lang)}
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-gray-100 drop-shadow-md animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200 fill-mode-both">
              {t('hero_subtitle', lang)}
            </p>
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500 fill-mode-both">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-btn-bg text-btn-text hover:bg-btn-bg/90 px-8 py-4 rounded-full font-medium transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                {t('shop_collection', lang)} <ArrowRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">{t('categories', lang)}</h2>
            <p className="text-muted-foreground text-lg">
              {t('shop_by_category', lang)}
            </p>
          </div>

          {(!settings?.categories_layout || settings?.categories_layout === 'grid') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {categories?.map((category: any) => (
                <Link
                  href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en || category.name)}`}
                  key={category.id}
                  className="group cursor-pointer block h-full"
                >
                  <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-md bg-secondary h-full">
                    <Image
                      src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                      alt={category.name?.[lang] || category.name?.en || category.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors duration-500" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col p-6 text-white text-center md:text-left">
                      <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 drop-shadow-md relative z-10 transition-transform duration-500">{category.name?.[lang] || category.name?.en || category.name}</h3>

                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                        <div className="overflow-hidden">
                          {(settings?.categories_show_description ?? true) && (
                            <p
                              className="text-gray-200 text-xs md:text-sm shadow-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mt-1"
                              dangerouslySetInnerHTML={{ __html: category.description?.[lang] || category.description?.en || category.description }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {settings?.categories_layout === 'slider' && (
            <CategoriesSlider categories={categories} lang={lang} settings={settings} />
          )}

          {settings?.categories_layout === 'masonry' && (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
              {categories?.map((category: any, index: number) => {
                const heightClass = index % 3 === 0 ? 'h-[400px]' : index % 2 === 0 ? 'h-[250px]' : 'h-[320px]';
                return (
                  <Link
                    href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en || category.name)}`}
                    key={category.id}
                    className={`group cursor-pointer block relative ${heightClass} rounded-2xl overflow-hidden shadow-md bg-secondary break-inside-avoid`}
                  >
                    <Image
                      src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                      alt={category.name?.[lang] || category.name?.en || category.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors duration-500" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end p-6 text-center text-white">
                      <h3 className="font-serif text-2xl font-bold mb-3 drop-shadow-md relative z-10 transition-transform duration-500">{category.name?.[lang] || category.name?.en || category.name}</h3>

                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out w-full">
                        <div className="overflow-hidden flex flex-col items-center">
                          {(settings?.categories_show_description ?? true) && (
                            <p
                              className="text-gray-200 text-xs shadow-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
                              dangerouslySetInnerHTML={{ __html: category.description?.[lang] || category.description?.en || category.description }}
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
      <section className="py-24 bg-muted border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">{t('featured_products', lang)}</h2>
              <p className="text-muted-foreground">{t('shop_collection', lang)}</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-1 text-foreground font-medium hover:text-foreground/80 transition-colors">
              {t('view_all_products', lang)} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <FeaturedProductsGrid products={featuredProducts} currencySymbol={currencySymbol} />
        </div>
      </section>

      {/* Testimonials Slider */}
      {Array.isArray(testimonials) && testimonials.length > 0 && (
        <TestimonialsSlider testimonials={testimonials} lang={lang} />
      )}

      {/* Features/Why Choose Us */}


      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {[
              { icon: Award, title: t('premium_quality', lang), desc: t('premium_quality_desc', lang) },
              { icon: CalendarClock, title: t('tailored_fit', lang), desc: t('tailored_fit_desc', lang) },
              { icon: Lightbulb, title: t('easy_care', lang), desc: t('easy_care_desc', lang) }
            ].map((item, index) => (
              <div key={index} className="relative p-[2px] rounded-[32px] overflow-hidden group">

                {/* عنصر الضوء الدوار (الخلفية المضيئة) */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-spin-border opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* محتوى البطاقة */}
                <div className="relative bg-white p-8 rounded-[30px] h-full shadow-lg">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>
    </div>
  );
}
