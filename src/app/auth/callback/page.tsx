'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

export default function AuthCallback() {
    const router = useRouter();
    const { login } = useAuth();
    const isProcessed = useRef(false);

    useEffect(() => {
        if (isProcessed.current) return;

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        if (token) {
            isProcessed.current = true;

            localStorage.setItem('auth_token', token);

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.abyatc.com/api';

            fetch(`${API_URL}/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
                    'X-SECRET-KEY': process.env.NEXT_PUBLIC_SECRET_KEY || ''
                }
            })
                .then((res) => {
                    if (!res.ok) throw new Error('فشل جلب بيانات العميل');
                    return res.json();
                })
                .then((customerData) => {
                    if (typeof login === 'function') {
                        login(customerData, token);
                    }

                    // 🛠️ التعديل هنا: قراءة الصفحة التي جاء منها ومسحها من الذاكرة المؤقتة
                    const redirectTo = sessionStorage.getItem('redirect_after_login') || '/';
                    sessionStorage.removeItem('redirect_after_login');

                    // إذا كان قادماً من صفحة تسجيل الدخول نفسها، لا نعيده إليها بل نرسله للرئيسية
                    const finalTarget = redirectTo.includes('/login') ? '/' : redirectTo;

                    router.push(finalTarget);
                })
                .catch((err) => {
                    console.error("خطأ أثناء جلب بيانات العميل الحقيقية:", err);
                    localStorage.removeItem('auth_token');
                    router.push('/login?error=fetch_user_failed');
                });

        } else if (error) {
            console.error("فشل تسجيل الدخول عبر جوجل:", error);
            router.push('/login?error=google_failed');
        }
    }, [router, login]);

    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-lg font-semibold animate-pulse">جاري جلب بيانات حسابك ومزامنتها...</p>
            </div>
        </div>
    );
}