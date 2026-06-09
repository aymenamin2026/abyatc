import { NextResponse } from 'next/server';

// قمنا بتغيير نوع params إلى any لتجاوز صرامة TypeScript في الـ Build
export async function GET(
  request: Request, 
  { params }: { params: any }
) {
  // نحل الـ Promise للحصول على الـ params
  const resolvedParams = await params;
  const pathArray = resolvedParams.path || [];
  const path = pathArray.join('/');
  
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  
  const targetUrl = `${process.env.API_URL}/${path}${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_SECRET_KEY || '',
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}