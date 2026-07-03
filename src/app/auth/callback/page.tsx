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

            // 1. حفظ التوكن أولاً في الـ LocalStorage ليتم اعتماده في الطلبات
            localStorage.setItem('auth_token', token);

            // 2. جلب بيانات العميل الحقيقية من الباك إند باستخدام التوكن
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.abyatc.com/api';

            fetch(`${API_URL}/user`, { // أو المسار المخصص لديك في لارافل لجلب بيانات الـ customer الحالي مثل /customer أو /me
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
                    // 3. تفعيل تسجيل الدخول بالبيانات الحقيقية الكاملة القادمة من قاعدة البيانات
                    // اعتماداً على هيكلة الـ API لديك، قد تكون البيانات داخل كائن مثل customerData.customer أو customerData مباشرة
                    const actualCustomer = customerData.customer || customerData;

                    if (typeof login === 'function') {
                        login(actualCustomer, token);
                    }

                    // 4. التوجيه الفوري إلى صفحة الـ checkout وهو مسجل دخول رسمياً في كل الموقع
                    router.push('/checkout?from=auth');
                })
                .catch((err) => {
                    console.error("خطأ أثناء جلب بيانات العميل الحقيقية:", err);
                    // إذا فشل جلب البيانات، نقوم بمسح التوكن وإعادته لصفحة تسجيل الدخول
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