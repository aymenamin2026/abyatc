"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PwaPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // التقاط حدث التثبيت التلقائي من المتصفح
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            // حفظ الحدث لاستخدامه عند الضغط على الزر
            setDeferredPrompt(e);

            // التحقق مما إذا كان المستخدم قد أغلق الإشعار سابقاً اليوم
            const isDismissed = localStorage.getItem("pwa_prompt_dismissed");
            if (!isDismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // إخفاء الزر إذا تم تثبيت التطبيق بنجاح
        window.addEventListener("appinstalled", () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // إظهار نافذة التثبيت الرسمية الخاصة بالنظام (اسم الموقع + الشعار)
        deferredPrompt.prompt();

        // انتظار رد فعل المستخدم (موافق / إلغاء)
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            console.log("User accepted the install prompt");
        }

        // تنظيف المتغير وإخفاء الإشعار
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // كتم الإشعار مؤقتاً في جلسة التصفح الحالية
        localStorage.setItem("pwa_prompt_dismissed", "true");
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-2xl flex flex-col gap-3 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <X size={18} />
            </button>

            <div className="flex items-center gap-3">
                {/* يمكنك استبدال هذا الحرف بشعار موقعك الفعلي */}
                <div className="w-12 h-12 bg-[#093f89] rounded-xl flex items-center justify-center text-[#fbc70f] font-bold text-xl shadow-md">
                    ل
                </div>
                <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">تثبيت تطبيق لمعة أبيات</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">تصفح أسرع للمعدات والخدمات بضغطة زر واحدة.</p>
                </div>
            </div>

            <button
                onClick={handleInstallClick}
                className="w-full bg-[#093f89] hover:bg-[#072e63] text-white font-medium text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-250 shadow-sm"
            >
                <Download size={16} />
                اضغط لتثبيت التطبيق على جهازك
            </button>
        </div>
    );
}