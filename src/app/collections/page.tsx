"use client";

import { useLanguage } from "@/components/LanguageContext"; // تأكد من مسار الـ LanguageContext لديك
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { t } from "@/lib/translations";
import CategoriesSlider from "@/components/CategoriesSlider"; // تأكد من مسار الكومبوننت الصحيح

// دالة جلب مسار الصور (قم بتعديلها لتطابق الدالة المستخدمة في الصفحة الرئيسية لديك إذا كانت تختلف)
const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/no-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://your-laravel-backend.com'}/storage/${imagePath}`;
};

export default function CollectionsPage() {
    const { lang } = useLanguage();
    const [categories, setCategories] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // جلب البيانات من الـ API الخاص بـ لارافل عند تحميل الصفحة
    useEffect(() => {
        const fetchCollectionsData = async () => {
            try {
                // يمكنك تعديل مسارات الـ API هنا لتطابق روابط الـ Backend الخاص بمتجرك
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://your-laravel-backend.com/api';

                const [categoriesRes, settingsRes] = await Promise.all([
                    fetch(`${apiUrl}/categories`),
                    fetch(`${apiUrl}/settings`)
                ]);

                if (categoriesRes.ok) {
                    const categoriesData = await categoriesRes.json();
                    // تأكد من هيكلة البيانات القادمة (إن كانت داخل مصفوفة مباشرة أو داخل كائن مثل data.categories)
                    setCategories(categoriesData.data || categoriesData);
                }

                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    setSettings(settingsData.data || settingsData);
                }
            } catch (error) {
                console.error("Error fetching collections data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCollectionsData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/20 pb-24">
            {/* Categories Section */}
            <section className="py-24 bg-background flex-1">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                            {t('categories', lang) || 'الفئات'}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {t('shop_by_category', lang) || 'تسوق حسب الفئة'}
                        </p>
                    </div>

                    {/* 1. Grid Layout */}
                    {(!settings?.categories_layout || settings?.categories_layout === 'grid') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                            {categories?.map((category: any) => (
                                <Link
                                    href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en || category.name)}`}
                                    key={category.id}
                                    className="group cursor-pointer block h-full"
                                >
                                    <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-md bg-secondary">
                                        <Image
                                            src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                                            alt={category.name?.[lang] || category.name?.en || category.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors duration-500" />
                                        <div className="absolute inset-x-0 bottom-0 flex flex-col p-6 text-white text-center md:text-left">
                                            <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 drop-shadow-md relative z-10 transition-transform duration-500">
                                                {category.name?.[lang] || category.name?.en || category.name}
                                            </h3>

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

                    {/* 2. Slider Layout */}
                    {settings?.categories_layout === 'slider' && (
                        <CategoriesSlider categories={categories} lang={lang} settings={settings} />
                    )}

                    {/* 3. Masonry Layout */}
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
                                            <h3 className="font-serif text-2xl font-bold mb-3 drop-shadow-md relative z-10 transition-transform duration-500">
                                                {category.name?.[lang] || category.name?.en || category.name}
                                            </h3>

                                            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out w-full">
                                                <div className="overflow-hidden flex flex-col items-center">
                                                    {(settings?.categories_show_description ?? true) && (
                                                        <p
                                                            className="text-gray-200 text-xs shadow-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
                                                            dangerouslySetInnerHTML={{ __html: category.description?.[lang] || category.description?.en || category.description }}
                                                        />
                                                    )}
                                                    <span className="text-xs font-medium tracking-wider uppercase border border-white/50 px-4 py-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 inline-block mb-1">
                                                        {t('shop_collection', lang) || 'تسوق التشكيلة'}
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
        </div>
    );
}