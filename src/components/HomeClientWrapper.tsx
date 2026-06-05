"use client";

import { useState, useEffect } from "react";
import ProductQuickView from "./ProductQuickView";
import ProductCard from "./ProductCard";

export default function HomeClientWrapper({ featuredProducts, currencySymbol, lang }: { featuredProducts: any[], currencySymbol: string, lang: string }) {
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  useEffect(() => {
    const handleQuickViewClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-quickview]')) {
        const btn = target.closest('[data-quickview]') as HTMLElement;
        const productId = btn.getAttribute('data-quickview');
        if (productId) {
          const product = featuredProducts.find(p => p.id.toString() === productId);
          if (product) {
            setQuickViewProduct(product);
          }
        }
      }
    };

    document.addEventListener('click', handleQuickViewClick);
    return () => document.removeEventListener('click', handleQuickViewClick);
  }, [featuredProducts]);

  return (
    <>
      <ProductQuickView 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
        product={quickViewProduct} 
      />
    </>
  );
}

// Separate client component for the featured products grid
export function FeaturedProductsGrid({ products, currencySymbol }: { products: any[], currencySymbol: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product: any, index: number) => (
        <ProductCard
          key={product.id}
          product={product}
          currencySymbol={currencySymbol}
          index={index}
        />
      ))}
    </div>
  );
}
