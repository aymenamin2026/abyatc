"use client";
import { t } from "@/lib/translations";
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
  Phone,
  Music,
  Ghost,
  MapPin,
  Mail,
  Twitter,
  X,
} from "lucide-react";

export default function Footer({ settings }: { settings?: any }) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const siteName = settings?.site_name || "Luluh.sa";

  // توليد الرابط الصحيح باستخدام الدالة بناءً على كود الـ Navbar
  const logoUrl = settings?.logo_path ? getImageUrl(settings.logo_path) : null;

  const lang = typeof document !== "undefined" &&
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
    { href: settings?.tiktok_url, icon: Music },
    { href: settings?.snapchat_url, icon: Ghost },
    {
      href: settings?.whatsapp_number
        ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
        : null,
      icon: MessageCircle,
    },
    { href: settings?.facebook_url, icon: Facebook },
    { href: settings?.instagram_url, icon: Instagram },
    { href: settings?.twitter_url, icon: X },


    { href: settings?.youtube_url, icon: Youtube },
    { href: settings?.linkedin_url, icon: Linkedin },

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
                  {/* عرض الشعار مع تعديل الحجم ليكون بارزاً */}
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={siteName}
                      // أضفت أبعاداً ثابتة هنا ليتوقف الخطأ في الـ Terminal
                      width={200}
                      height={80}
                      className="h-20 w-auto object-contain transition-all hover:scale-105 duration-300"
                    />
                  )}

                  {/* عرض النص مع تعديل الحجم ليكون متناسقاً مع الشعار الكبير */}
                  <h2 className="text-lg md:text-xl tracking-[0.2em] font-light font-serif mt-1 leading-tight text-slate-700">
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
                    rel="noopener noreferrer"
                    className="
        w-12 h-12 flex items-center justify-center
        rounded-full
        bg-muted/30
        border border-border
        text-muted-foreground
        hover:bg-primary/10
        hover:text-primary
        hover:border-primary/40
        hover:shadow-lg
        hover:scale-110
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
              <h4 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-foreground uppercase mb-6 flex items-center gap-2">
                <span className="w-6 h-[1px] bg-primary"></span> {/* خط زخرفي جانبي */}
                {t('quick_links', lang)}
              </h4>

              <ul className="space-y-5 text-sm text-muted-foreground">
                <li><Link href="/shop" className="hover:text-foreground">{t('shop_collection', lang)}</Link></li>
                <li><Link href="/collections" className="hover:text-foreground">{t('categories', lang)}</Link></li>
                <li><Link href="/about" className="hover:text-foreground">{t('about', lang)}</Link></li>
                <li><Link href="/faq" className="hover:text-foreground">{t('faq', lang)}</Link></li>
              </ul>
            </div>

            {/* CONTACT */}
            <div>
              <h4 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-foreground uppercase mb-6 flex items-center gap-2">
                <span className="w-6 h-[1px] bg-primary"></span> {/* خط زخرفي جانبي */}
                {t('contact', lang)}
              </h4>
              <div className="space-y-5 text-sm text-muted-foreground">

                {/* قسم البريد الإلكتروني مع الأيقونة */}
                {settings?.support_email && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-full bg-primary/10 text-primary">
                      <Mail className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                        {t('email', lang)}
                      </p>
                      <a href={`mailto:${settings.support_email}`} className="text-sm font-semibold hover:text-primary transition-colors">
                        {settings.support_email}
                      </a>
                    </div>
                  </div>
                )}

                {/* قسم الهاتف */}
                {settings?.contact_phone && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-full bg-primary/10 text-primary">
                      <Phone className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                        {t('phone', lang)}
                      </p>
                      <a
                        dir="ltr"
                        href={`tel:${settings.contact_phone.replace(/\D/g, "")}`}
                        className="text-sm font-semibold hover:text-primary transition-colors"
                      >
                        {settings.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* قسم الموقع */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-full bg-primary/10 text-primary">
                    <MapPin className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      {t('address', lang)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {t('location', lang)}
                    </p>
                  </div>
                </div>
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