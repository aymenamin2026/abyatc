import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. استخراج المسار مباشرة من الرابط بدلاً من الاعتماد على params
    const { pathname, search } = new URL(request.url);
    // نقوم بإزالة /api/ من بداية المسار لنحصل على (sliders)
    const path = pathname.replace('/api/', ''); 
    
    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: "API_URL configuration missing" }, { status: 500 });
    }

    // 2. بناء الرابط النهائي
    const targetUrl = `${baseUrl}/${path}${search}`;

    const res = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': process.env.API_SECRET_KEY || process.env.NEXT_PUBLIC_SECRET_KEY || '',
      },
      next: { revalidate: 300, tags: ['sliders'] },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Upstream request failed' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
      },
    });
    
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
