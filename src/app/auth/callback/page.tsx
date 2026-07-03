'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        // قراءة الرابط مباشرة من المتصفح
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        if (token) {
            // حفظ الـ Token في الـ LocalStorage
            localStorage.setItem('auth_token', token);

            // التوجيه فوراً إلى صفحة الـ checkout لكي يكمل الشراء
            router.push('/checkout');
        } else if (error) {
            console.error("فشل تسجيل الدخول:", error);
            router.push('/login?error=google_failed');
        }
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <p className="text-lg font-semibold animate-pulse">جاري تسجيل الدخول، يرجى الانتظار...</p>
            </div>
        </div>
    );
}