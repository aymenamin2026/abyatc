import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get('position') || '';
  
  // هنا نتصل بالسيرفر الخارجي مباشرة من السيرفر (لا وجود لـ CORS في اتصالات السيرفر للسيرفر)
  const res = await fetch(`https://api.abyatc.com/api/sliders?position=${position}`, {
    headers: {
      'Accept': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_SECRET_KEY || '', 
    },
  });

  const data = await res.json();
  return NextResponse.json(data);
}