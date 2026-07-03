'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

export default function AuthCallback() {
    const router = useRouter();
    const { login } = useAuth();
    const isProcessed = useRef(false); // لمنع التكرار أثناء الـ StrictMode

    useEffect(() => {
        if (isProcessed.current) return;

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        if (token) {
            isProcessed.current = true;

            // 1. حفظ التوكن في المتصفح
            localStorage.setItem('auth_token', token);

            // 2. فك تشفير التوكن أو جلب بيانات المستخدم الأساسية (تعتمد على هيكلة مشروعك)
            // إذا كان الـ API يرسل بيانات العميل مع الرابط يمكنك استقبالها،
            // أو نمرر كائن افتراضي وتقوم دالة الـ login بالتحقق من الـ API لاحقاً
            // 2. تجهيز بيانات افتراضية متوافقة مع نوع المستخدم لتفادي أخطاء TypeScript
            const dummyCustomer = {
                id: 0,
                first_name: 'Google User',
                last_name: '',
                email: urlParams.get('email') || '',
                customer_type: 'customer'
            };

            // 3. تفعيل حالة تسجيل الدخول في السياق (Context)
            if (typeof login === 'function') {
                login(dummyCustomer as any, token);
            }
            // 4. التوجيه فوراً إلى صفحة الـ checkout مع إضافة query param لتحديث البيانات
            router.push('/checkout?from=auth');
        } else if (error) {
            console.error("فشل تسجيل الدخول عبر جوجل:", error);
            router.push('/login?error=google_failed');
        }
    }, [router, login]);

    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-lg font-semibold animate-pulse">جاري مزامنة حسابك، يرجى الانتظار...</p>
            </div>
        </div>
    );
}