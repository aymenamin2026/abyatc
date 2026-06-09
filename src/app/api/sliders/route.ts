import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const { searchParams } = new URL(request.url);
  
  // نستخدم المتغير الذي عرفته أنت
  const targetUrl = `${process.env.API_URL}/${path}?${searchParams.toString()}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_SECRET_KEY || '', // نستخدم السيكريت هنا
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}