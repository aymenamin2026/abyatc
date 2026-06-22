export const dynamic = 'force-dynamic';
import { fetchProductBySlug, fetchProducts, fetchSettings, fetchAttributes } from "@/lib/api";
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";
export async function generateStaticParams() {
  const products = await fetchProducts();
  if (!Array.isArray(products)) return [];

  return products.map((product: any) => ({
    id: product.slug,
  }));
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

  // Filter related products (same category, excluding current product)
  const categoryId = product.categories?.[0]?.id;
  const relatedProducts = Array.isArray(allProducts)
    ? allProducts.filter((p: any) =>
      p.id !== product.id &&
      p.categories?.some((cat: any) => cat.id === categoryId)
    ).slice(0, 4)
    : [];

  const currencySymbol = settings?.currency_symbol || "$";

  return (
    <ProductClient
      product={product}
      attributes={attributes}
      currencySymbol={currencySymbol}
      relatedProducts={relatedProducts}
      settings={settings} // <-- قمنا بإضافة تمرير الإعدادات هنا لكي يستقبلها ملف العميل بنجاح
    />
  );
}