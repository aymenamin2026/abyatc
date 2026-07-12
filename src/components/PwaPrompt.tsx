"use client";

import { useState, useEffect } from "react";
import { Share, PlusSquare, X } from "lucide-react"; // تأكد من وجود lucide-react أو استبدلها بأيقوناتك

export default function PwaPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIos, setIsIos] = useState(false);

    useEffect(() => {
        // 1. التحقق من أن المستخدم يتصفح من الجوال
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // 2. التحقق مما إذا كان الموقع مثبتاً بالفعل كـ تطبيق
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches
            || (navigator as any).standalone;

        // 3. التحقق من نوع النظام لإظهار إرشادات مخصصة (خصوصاً لـ iOS)
        const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        setIsIos(isApple);

        // إذا كان جوال وغير مثبت مسبقاً، نتحقق من الكاش المحلي حتى لا نكاد نضايق المستخدم في كل صفحة
        const isDismissed = localStorage.getItem("pwa_prompt_dismissed");

        if (isMobile && !isStandalone && !isDismissed) {
            // إظهار الإشعار بعد 5 ثوانٍ من دخول الموقع ليعطي تجربة مستخدم مريحة
            const timer = setTimeout(() => setShowPrompt(true), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        // حفظ خيار المستخدم لمدة يومين مثلاً حتى لا يظهر له فوراُ
        localStorage.setItem("pwa_prompt_dismissed", "true");
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-4 rounded-xl shadow-2xl flex flex-col gap-3 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <X size={18} />
            </button>

            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                    أ
                </div>
                <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">تصفح لمعة أبيات كـ تطبيق!</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">أضف الموقع للشاشة الرئيسية للوصول السريع للمعدات.</p>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg text-xs text-gray-600 dark:text-gray-300 border border-gray-150 dark:border-gray-750">
                {isIos ? (
                    <div className="flex flex-wrap items-center gap-1.5 direction-rtl">
                        <span>اضغط على زر المشاركة</span>
                        <Share size={16} className="text-blue-500 inline" />
                        <span>ثم اختر</span>
                        <span className="font-bold">"إضافة إلى الشاشة الرئيسية"</span>
                        <PlusSquare size={16} className="inline" />
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center gap-1.5 direction-rtl">
                        <span>اضغط على خيارات المتصفح (三 أو ⁝) ثم اختر</span>
                        <span className="font-bold">"تثبيت التطبيق"</span>
                        <span>أو</span>
                        <span className="font-bold">"إضافة إلى الشاشة الرئيسية"</span>
                    </div>
                )}
            </div>
        </div>
    );
}