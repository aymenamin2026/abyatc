import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductBySlug, fetchProducts, fetchSettings, fetchAttributes, getImageUrl } from "@/lib/api";
import ProductClient from "./ProductClient";

// 1. استخدام ISR بدلاً من force-dynamic: 
// سيتم كاش الصفحة وتحديثها في الخلفية كل 60 ثانية إذا كان هناك زيارات، مما يمنحك سرعة خيالية (Static) مع بيانات محدثة (Dynamic)
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await fetchProducts();
    if (!Array.isArray(products)) return [];

    return products.map((product: any) => ({
      id: product.slug || product.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// 2. توليد الـ SEO والـ Metadata ديناميكياً لكل منتج لرفع الأرشفة
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return { title: 'المعدة غير متوفر | Product Not Found' };
  }

  // استخدام اللغة الإنجليزية كاحتياطي في حال عدم توفر العربية للـ Metadata
  const title = product.name?.ar || product.name?.en || product.name;
  const rawDescription = product.description?.ar || product.description?.en || product.description || "";
  // تنظيف الوصف من وسوم HTML لمحركات البحث
  const cleanDescription = rawDescription.replace(/<[^>]*>?/gm, '').substring(0, 160);
  const image = product.images?.[0] ? getImageUrl(product.images[0]) : '';

  return {
    title,
    description: cleanDescription,
    openGraph: {
      title,
      description: cleanDescription,
      images: image ? [{ url: image, alt: title }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: image ? [image] : [],
    }
  };
}

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;

  const [product, settings, attributes, allProducts] = await Promise.all([
    fetchProductBySlug(slug),
    fetchSettings(),
    fetchAttributes(),
    fetchProducts()
  ]);

  if (!product) {
    notFound();
  }

  // فلترة المعدةات ذات الصلة بكفاءة عالية
  const categoryId = product.categories?.[0]?.id;
  const relatedProducts = Array.isArray(allProducts)
    ? allProducts
      .filter((p: any) => p.id !== product.id && p.categories?.some((cat: any) => cat.id === categoryId))
      .slice(0, 4)
    : [];

  const currencySymbol = settings?.currency_symbol || "$";
  const productName = product.name?.ar || product.name?.en || product.name;
  const productImage = product.images?.[0] ? getImageUrl(product.images[0]) : '';
  const productPrice = product.base_price || product.price || (product.variations?.[0]?.price) || 0;

  // 3. إضافة البيانات المهيكلة (JSON-LD) ليقوم جوجل بعرض السعر وصورة المعدة مباشرة في صفحة البحث (Rich Snippets)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "image": productImage ? [productImage] : [],
    "description": product.description?.ar?.replace(/<[^>]*>?/gm, '') || "",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "SAR", // يمكن جعلها ديناميكية بناءً على الإعدادات
      "price": productPrice,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient
        product={product}
        attributes={attributes}
        currencySymbol={currencySymbol}
        relatedProducts={relatedProducts}
        settings={settings}
      />
    </>
  );
}