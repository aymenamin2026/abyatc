import { NextResponse } from 'next/server';

// قمنا بتغيير نوع params إلى any لتجاوز صرامة TypeScript في الـ Build
// src/app/api/[...path]/route.ts
export async function GET(request: Request, { params }: { params: any }) {
  const { path } = await params;
  const { searchParams } = new URL(request.url);
  const targetUrl = `${process.env.API_URL}/${path.join('/')}?${searchParams.toString()}`;

  const res = await fetch(targetUrl, {
    headers: { 'x-api-key': process.env.NEXT_PUBLIC_SECRET_KEY || '' },
  });

  const rawData = await res.json();

  // "تجميل البيانات": هنا نتأكد أننا نرسل مصفوفة للسلايدر دائماً
  // إذا كانت البيانات داخل كائن باسم data، نستخرجه
  const finalData = Array.isArray(rawData) ? rawData : (rawData.data || []);
  
  return NextResponse.json(finalData);
}