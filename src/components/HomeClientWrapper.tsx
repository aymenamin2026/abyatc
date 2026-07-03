"use client";

import { useState, useEffect, useCallback } from "react";
import ProductQuickView from "./ProductQuickView";
import ProductCard from "./ProductCard";

interface HomeClientWrapperProps {
  featuredProducts: any[];
  currencySymbol: string;
  lang: string;
}

export default function HomeClientWrapper({ featuredProducts, currencySymbol, lang }: HomeClientWrapperProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  // تحسين اصطياد الحدث وتغليفه بـ useCallback لمنع إعادة تعريفه
  const handleQuickViewClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-quickview]') as HTMLElement;

    if (btn) {
      const productId = btn.getAttribute('data-quickview');
      if (productId) {
        // استخدام السلسلة النصية لضمان تطابق الأنواع أثناء البحث
        const product = featuredProducts.find(p => String(p.id) === productId);
        if (product) {
          setQuickViewProduct(product);
        }
      }
    }
  }, [featuredProducts]);

  useEffect(() => {
    // التقاط الحدث في مرحلة الـ Capture لضمان عدم إيقافه بـ stopPropagation من مكونات أخرى
    document.addEventListener('click', handleQuickViewClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleQuickViewClick, { capture: true });
    };
  }, [handleQuickViewClick]);

  return (
    <>
      {/* عرض الـ Modal فقط إذا كان هناك منتج محدد لتحسين الأداء */}
      {quickViewProduct && (
        <ProductQuickView
          isOpen={true}
          onClose={() => setQuickViewProduct(null)}
          product={quickViewProduct}
        />
      )}
    </>
  );
}

// فصلت المكون المصدر (Exported) ليكون واضحاً
interface FeaturedProductsGridProps {
  products: any[];
  currencySymbol: string;
  settings?: any;
}

export function FeaturedProductsGrid({ products, currencySymbol, settings }: FeaturedProductsGridProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product: any, index: number) => (
        <ProductCard
          key={product.id}
          product={product}
          currencySymbol={currencySymbol}
          index={index}
          settings={settings}
        />
      ))}
    </div>
  );
}