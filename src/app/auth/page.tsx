'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // استخراج الـ token والخطأ من الرابط (URL)
        const token: string | null = searchParams.get('token');
        const error: string | null = searchParams.get('error');

        if (token) {
            // حفظ الـ Token في الـ LocalStorage
            localStorage.setItem('auth_token', token);

            // توجيه المستخدم إلى الصفحة الرئيسية للمتجر
            router.push('/');
        } else if (error) {
            console.error("فشل تسجيل الدخول:", error);
            router.push('/login?error=google_failed');
        }
    }, [searchParams, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <p className="text-lg font-semibold animate-pulse">جاري تسجيل الدخول، يرجى الانتظار...</p>
            </div>
        </div>
    );
}

// في Next.js (App Router)، استخدام useSearchParams يتطلب تدوير المكون داخل Suspense
export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg">جاري التحميل...</p>
            </div>
        }>
            <AuthCallbackComponent />
        </Suspense>
    );
}