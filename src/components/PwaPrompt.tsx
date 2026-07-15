"use client";

import { useState, useEffect } from "react";
import { Download, X, Chrome, Share } from "lucide-react";

export default function PwaPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isInsideInAppBrowser, setIsInsideInAppBrowser] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        const ua = window.navigator.userAgent || "";

        // 1. الكشف هل نظام التشغيل هو iOS (آيفون/آيباد)
        const iosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
        setIsIOS(iosDevice);

        // الكشف هل هو داخل متصفح إنستقرام/سناب شات/فيسبوك
        const isInApp = /FBAN|FBAV|Instagram|Snapchat|FBIOS|Twitter/i.test(ua);
        setIsInsideInAppBrowser(isInApp);

        // للآيفون: نتحقق هل التطبيق مثبت بالفعل في الشاشة الرئيسية (Standalone Mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        // إذا كان آيفون وغير مثبت بعد، ولم يقم بإغلاق الإشعار اليوم، نظهره تلقائياً
        if (iosDevice && !isStandalone) {
            const isDismissed = localStorage.getItem("pwa_prompt_dismissed");
            if (!isDismissed) {
                setShowPrompt(true);
            }
        }

        // للأندرويد: التقاط حدث التثبيت التلقائي
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);

            const isDismissed = localStorage.getItem("pwa_prompt_dismissed");
            if (!isDismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

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

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            console.log("User accepted the install prompt");
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem("pwa_prompt_dismissed", "true");
    };

    if (!isMounted || !showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-4 rounded-xl shadow-2xl flex flex-col gap-3 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <X size={18} />
            </button>

            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#093f89] rounded-xl flex items-center justify-center text-[#fbc70f] font-bold text-xl shadow-md">
                    ل
                </div>
                <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">تثبيت تطبيق لمعة أبيات</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {isInsideInAppBrowser
                            ? "افتح الموقع في المتصفح الرسمي لتثبيت التطبيق على جهازك."
                            : isIOS
                                ? "تصفح أسرع للمعدات والخدمات عبر تثبيته على شاشتك الرئيسية."
                                : "تصفح أسرع للمعدات والخدمات بضغطة زر واحدة."}
                    </p>
                </div>
            </div>

            {/* السيناريو الأول: تصفح من داخل تطبيق (In-App Browser) للآيفون أو الأندرويد */}
            {isInsideInAppBrowser ? (
                <div className="w-full bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-center gap-2">
                    <Chrome size={16} className="shrink-0" />
                    <span>يرجى فتح الموقع عبر متصفح <b>{isIOS ? "Safari" : "Chrome"}</b> الرسمي لتتمكن من تثبيت التطبيق بنجاح.</span>
                </div>
            ) : isIOS ? (
                /* السيناريو الثاني: زائر يستخدم آيفون من متصفح Safari */
                <div className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs p-3 rounded-lg border border-gray-150 dark:border-gray-700 flex flex-col gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">خطوات التثبيت على الآيفون:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-300">
                        <li>
                            اضغط على زر المشاركة في أسفل المتصفح
                            <span className="inline-flex items-center justify-center bg-gray-200 dark:bg-gray-700 p-1 rounded mx-1">
                                <Share size={12} className="text-blue-500" />
                            </span>
                        </li>
                        <li>قم بالتمرير للأسفل واختر <b>"إضافة إلى الشاشة الرئيسية"</b>.</li>
                        <li>اضغط على <b>"إضافة"</b> في الأعلى.</li>
                    </ol>
                </div>
            ) : (
                /* السيناريو الثالث: زائر أندرويد طبيعي */
                <button
                    onClick={handleInstallClick}
                    className="w-full bg-[#093f89] hover:bg-[#072e63] text-white font-medium text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-250 shadow-sm"
                >
                    <Download size={16} />
                    اضغط لتثبيت التطبيق على جهازك
                </button>
            )}
        </div>
    );
}