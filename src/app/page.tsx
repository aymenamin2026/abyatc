import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shield, Clock, Star } from "lucide-react";
import { fetchCategories, fetchProducts, fetchSettings, getImageUrl, fetchSliders, fetchTestimonials } from "@/lib/api";
import { cookies } from "next/headers";
import { t } from "@/lib/translations";
import HomeClientWrapper, { FeaturedProductsGrid } from "@/components/HomeClientWrapper";
import Slider from "@/components/Slider";
import TestimonialsSlider from "@/components/TestimonialsSlider";
import CategoriesSlider from "@/components/CategoriesSlider";

export default async function Home() {
  // تحسين الأداء: جلب البيانات بالتوازي باستخدام Promise.all
  const [categories, products, settings, sliders, testimonials] = await Promise.all([
    fetchCategories(), fetchProducts(), fetchSettings(), fetchSliders('home_hero'), fetchTestimonials()
  ]);

  const featuredProducts = Array.isArray(products) ? products.slice(0, 4) : [];
  const currencySymbol = settings?.currency_symbol || "$";
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const lang = (localeCookie?.value === "ar" ? "ar" : "en") as "en" | "ar";
  const hasSliders = Array.isArray(sliders) && sliders.some(s => s.slides && s.slides.length > 0);

  return (
    <div className="flex flex-col min-h-screen">
      <HomeClientWrapper featuredProducts={featuredProducts} currencySymbol={currencySymbol} lang={lang} />

      {/* Hero Section */}
      {hasSliders ? (
        <Slider position="home_hero" lang={lang} />
      ) : (
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
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

          {/* تطبيق الـ Glassmorphism هنا */}
          <div className="container relative z-10 px-4 sm:px-6 lg:px-8 text-center glass-panel p-12 rounded-[2rem] mx-4">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6 drop-shadow-lg text-white">
              {t('hero_title', lang)}
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-white/90 drop-shadow-md">
              {t('hero_subtitle', lang)}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-full font-medium transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              {t('shop_collection', lang)} <ArrowRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">{t('categories', lang)}</h2>
            <p className="text-muted-foreground text-lg">{t('shop_by_category', lang)}</p>
          </div>

          {(!settings?.categories_layout || settings?.categories_layout === 'grid') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {categories?.map((category: any) => (
                <Link href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en || category.name)}`} key={category.id} className="group cursor-pointer block h-full">
                  <div className="relative h-80 md:h-96 rounded-[2rem] overflow-hidden shadow-md glass-panel h-full border-0">
                    <Image src={category.image ? getImageUrl(category.image) : '/no-image.jpg'} alt={category.name?.[lang] || category.name?.en || category.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col p-6 text-white text-center">
                      <h3 className="font-serif text-xl md:text-2xl font-bold mb-2">{category.name?.[lang] || category.name?.en || category.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {/* باقي الأكواد الخاصة بـ slider و masonry كما هي... */}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { icon: Star, title: 'premium_quality', desc: 'premium_quality_desc' },
              { icon: Shield, title: 'tailored_fit', desc: 'tailored_fit_desc' },
              { icon: Clock, title: 'easy_care', desc: 'easy_care_desc' }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-8 rounded-[2rem] flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-6">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">{t(item.title as any, lang)}</h3>
                <p className="text-muted-foreground">{t(item.desc as any, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}