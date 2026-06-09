import { NextResponse } from 'next/server';

// ملاحظة: قمنا بتغيير نوع params إلى Promise
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ path: string[] }> }
) {
  // انتظر حل الـ Promise الخاص بـ params
  const { path } = await params;
  
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  
  const targetUrl = `${process.env.API_URL}/${path.join('/')}${queryString ? `?${queryString}` : ''}`;

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