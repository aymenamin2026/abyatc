import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: any }) {
  try {
    const resolvedParams = await params;
    const pathArray = resolvedParams.path || [];
    const path = pathArray.join('/');
    const { searchParams } = new URL(request.url);
    
    // تأكد من وجود الرابط الأساسي
    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: "API_URL is not configured" }, { status: 500 });
    }

    const targetUrl = `${baseUrl}/${path}?${searchParams.toString()}`;

    const res = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_SECRET_KEY || '',
      },
    });

    if (!res.ok) {
      // إرجاع الخطأ الحقيقي من السيرفر الخارجي لتراه في Network Tab
      return NextResponse.json({ error: `External API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}