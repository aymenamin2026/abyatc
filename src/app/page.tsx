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
  const [categories, products, settings, sliders, testimonials] = await Promise.all([
    fetchCategories(), fetchProducts(), fetchSettings(), fetchSliders('home_hero'), fetchTestimonials()
  ]);
  
  const featuredProducts = Array.isArray(products) ? products.slice(0, 4) : [];
  const currencySymbol = settings?.currency_symbol || "$";
  const cookieStore = await cookies();
  const lang = (cookieStore.get("NEXT_LOCALE")?.value === "ar" ? "ar" : "en") as "en" | "ar";
  const hasSliders = Array.isArray(sliders) && sliders.some(s => s.slides && s.slides.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <HomeClientWrapper featuredProducts={featuredProducts} currencySymbol={currencySymbol} lang={lang} />
      
      {/* Hero Section - Glassmorphism */}
      {hasSliders ? (
        <Slider position="home_hero" lang={lang} />
      ) : (
        <section className="relative min-h-[70vh] flex items-center justify-center py-20 px-4">
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-primary/20 via-background to-primary/10" />
          <div className="container relative z-10 glass-panel p-8 md:p-16 rounded-[2rem] text-center max-w-4xl">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              {t('hero_title', lang)}
            </h1>
            <p className="text-lg md:text-xl mb-10 opacity-80 max-w-2xl mx-auto">
              {t('hero_subtitle', lang)}
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-2xl">
              {t('shop_collection', lang)} <ArrowRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </section>
      )}

      {/* Categories Section - Modern Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-center mb-16">{t('categories', lang)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.map((cat: any) => (
              <Link href={`/shop?category=${cat.id}`} key={cat.id} className="group relative h-96 rounded-[2rem] overflow-hidden glass-panel border hover:border-primary/50 transition-all">
                <Image src={getImageUrl(cat.image)} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-2xl font-bold text-white">{cat.name?.[lang]}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Floating Cards */}
    {/* Features Section - Glassmorphism Style */}
<section className="py-24">
  <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
      {[ 
          { icon: Star, title: 'premium_quality' as const }, 
          { icon: Shield, title: 'tailored_fit' as const }, 
          { icon: Clock, title: 'easy_care' as const } 
      ].map((item, i) => (
          <div key={i} className="glass-panel p-10 rounded-[2rem] flex flex-col items-center text-center hover:translate-y-[-10px] transition-all">
              <item.icon className="w-12 h-12 mb-6 text-primary" />
              {/* قمنا بإضافة as any ليتجاوز TypeScript تدقيق النوع لهذا السطر فقط */}
              <h3 className="text-xl font-bold mb-3">{t(item.title as any, lang)}</h3>
          </div>
      ))}
  </div>
</section>
    </div>
  );
}