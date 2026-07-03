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

  const handleQuickViewClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-quickview]') as HTMLElement;

    if (btn) {
      const productId = btn.getAttribute('data-quickview');
      if (productId) {
        const product = featuredProducts.find(p => String(p.id) === productId);
        if (product) {
          setQuickViewProduct(product);
        }
      }
    }
  }, [featuredProducts]);

  useEffect(() => {
    document.addEventListener('click', handleQuickViewClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleQuickViewClick, { capture: true });
    };
  }, [handleQuickViewClick]);

  return (
    <>
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

interface FeaturedProductsGridProps {
  products: any[];
  currencySymbol: string;
  settings?: any;
}

export function FeaturedProductsGrid({ products, currencySymbol, settings }: FeaturedProductsGridProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8">
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