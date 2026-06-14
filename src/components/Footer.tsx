"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// استيراد دالة معالجة روابط الصور من مكتبة الـ API الخاصة بك
import { getImageUrl } from "@/lib/api"; 
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle,
  Video,
  Ghost,
  Twitter,
} from "lucide-react";

export default function Footer({ settings }: { settings?: any }) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const siteName = settings?.site_name || "Luluh.sa";
  
  // توليد الرابط الصحيح باستخدام الدالة بناءً على كود الـ Navbar
  const logoUrl = settings?.logo_path ? getImageUrl(settings.logo_path) : null;

  const lang =
    typeof document !== "undefined" &&
    document.cookie.includes("NEXT_LOCALE=ar")
      ? "ar"
      : "en";

  const desc =
    lang === "ar"
      ? settings?.site_description_ar || settings?.site_description || ""
      : settings?.site_description?.en || settings?.site_description || "";

  const decodeHTML = (html: string) =>
    !html ? "" : html.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

  const socialLinks = [
    { href: settings?.facebook_url, icon: Facebook },
    { href: settings?.instagram_url, icon: Instagram },
    { href: settings?.twitter_url, icon: Twitter },
    { href: settings?.tiktok_url, icon: Video },
    { href: settings?.snapchat_url, icon: Ghost },
    { href: settings?.youtube_url, icon: Youtube },
    { href: settings?.linkedin_url, icon: Linkedin },
    {
      href: settings?.whatsapp_number
        ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
        : null,
      icon: MessageCircle,
    },
  ].filter(Boolean);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!footerRef.current) return;

      const rect = footerRef.current.getBoundingClientRect();

      setPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };

    const el = footerRef.current;
    el?.addEventListener("mousemove", handleMove);
    return () => el?.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <footer
      ref={footerRef}
      className="
        relative overflow-hidden
        bg-background text-foreground
        transition-colors duration-500
      "
    >
      {/* LIGHT FOLLOW */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(700px circle at ${pos.x}% ${pos.y}%, rgba(var(--primary-rgb),0.12), transparent 45%)`,
        }}
      />

      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0">
        <div className="absolute top-[-25%] left-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-35%] right-[-10%] w-[900px] h-[900px] bg-cyan-500/20 blur-[200px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.04] bg-[url('/noise.png')]" />
      </div>

      <div className="relative container mx-auto px-6 lg:px-12 py-36">

        {/* CARD */}
        <div className="
          relative rounded-[44px]
          border border-border
          bg-card/60 backdrop-blur-3xl
          shadow-2xl
          p-16 md:p-20
          overflow-hidden
        ">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 relative z-10">

            {/* BRAND - تم تعديله ليحتوي على الشعار والنص معاً بدون إلغاء */}
            <div className="md:col-span-2">
              <div className="flex flex-col items-start gap-4 mb-6">
                <Link href="/" className="flex flex-col items-start gap-3 tracking-[0.15em]">
                  {/* عرض الشعار إذا كان موجوداً */}
                  {logoUrl && (
                    <img 
                      src={logoUrl} 
                      alt={siteName} 
                      className="h-12 w-auto object-contain transition-all" 
                    />
                  )}
                  {/* عرض النص دائماً لضمان عدم اختفائه كمطالبة للهوية */}
                  <h2 className="text-2xl md:text-3xl tracking-[0.25em] font-light font-serif mt-2 leading-tight">
                    {siteName}
                  </h2>
                </Link>
              </div>

              <div
                className="text-sm text-muted-foreground max-w-md leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: decodeHTML(desc),
                }}
              />

              {/* SOCIAL */}
              <div className="flex gap-3 mt-10 flex-wrap">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    className="
                      w-12 h-12 flex items-center justify-center
                      rounded-full
                      bg-muted/30
                      border border-border
                      text-muted-foreground
                      hover:text-foreground
                      hover:border-primary/40
                      hover:shadow-lg
                      transition-all duration-300
                    "
                  >
                    <s.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* LINKS */}
            <div>
              <h4 className="text-xs tracking-[0.5em] text-muted-foreground mb-8">
                QUICK LINKS
              </h4>

              <ul className="space-y-5 text-sm text-muted-foreground">
                <li><Link href="/shop" className="hover:text-foreground">Shop</Link></li>
                <li><Link href="/collections" className="hover:text-foreground">Collections</Link></li>
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>

            {/* CONTACT */}
            <div>
              <h4 className="text-xs tracking-[0.5em] text-muted-foreground mb-8">
                CONTACT
              </h4>

              <div className="space-y-5 text-sm text-muted-foreground">
                {settings?.support_email && (
                  <div>
                    <p className="text-xs text-foreground">Email</p>
                    <a href={`mailto:${settings.support_email}`}>
                      {settings.support_email}
                    </a>
                  </div>
                )}

                {settings?.contact_phone && (
                  <div>
                    <p className="text-xs text-foreground">Phone</p>
                    <a
                      dir="ltr"
                      href={`tel:${settings.contact_phone.replace(/\D/g, "")}`}
                    >
                      {settings.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM */}
        <div className="
          mt-14 pt-8
          flex flex-col md:flex-row justify-between
          text-xs text-muted-foreground
          border-t border-border
        ">
          <p>© {new Date().getFullYear()} {siteName}</p>

          <div className="flex gap-8 mt-4 md:mt-0">
            <Link className="hover:text-foreground" href="/privacy">Privacy</Link>
            <Link className="hover:text-foreground" href="/terms">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}