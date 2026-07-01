"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle,
  Phone,
  Music,
  Ghost,
  MapPin,
  Mail,
  X,
} from "lucide-react";

import { t } from "@/lib/translations";
import { getImageUrl } from "@/lib/api";
import { useLanguage } from "./LanguageContext";

export default function Footer({ settings }: { settings?: any }) {
  const footerRef = useRef<HTMLDivElement>(null);

  // 1. حل مشكلة الـ Hydration Error: الاعتماد على الـ Context بدلاً من document.cookie
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  const siteName = settings?.site_name || "Luluh.sa";
  const logoUrl = settings?.logo_path ? getImageUrl(settings.logo_path) : null;

  const desc = lang === "ar"
    ? settings?.site_description_ar || settings?.site_description || ""
    : settings?.site_description?.en || settings?.site_description || "";

  const decodeHTML = (html: string) =>
    !html ? "" : html.replace(/</g, "<").replace(/>/g, ">").replace(/&/g, "&");

  const socialLinks = [
    { href: settings?.tiktok_url, icon: Music, name: "TikTok" },
    { href: settings?.snapchat_url, icon: Ghost, name: "Snapchat" },
    {
      href: settings?.whatsapp_number
        ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
        : null,
      icon: MessageCircle,
      name: "WhatsApp"
    },
    { href: settings?.facebook_url, icon: Facebook, name: "Facebook" },
    { href: settings?.instagram_url, icon: Instagram, name: "Instagram" },
    { href: settings?.twitter_url, icon: X, name: "X (Twitter)" },
    { href: settings?.youtube_url, icon: Youtube, name: "YouTube" },
    { href: settings?.linkedin_url, icon: Linkedin, name: "LinkedIn" },
  ].filter((s) => Boolean(s.href));

  // 2. تحسين الأداء: استخدام CSS Variables بدلاً من State لتحديث تأثير الماوس
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      el.style.setProperty('--mouse-x', `${x}%`);
      el.style.setProperty('--mouse-y', `${y}%`);
    };

    el.addEventListener("mousemove", handleMove, { passive: true });
    return () => el.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-background text-foreground transition-colors duration-500 border-t border-border/50"
    >
      {/* LIGHT FOLLOW EFFECT (CSS-Driven) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 lg:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--primary-rgb),0.08), transparent 45%)`,
        }}
      />

      {/* BACKGROUND AMBIENT LAYERS */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-25%] start-[-10%] w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-35%] end-[-10%] w-[900px] h-[900px] bg-cyan-500/10 blur-[200px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-12 py-24 md:py-36">
        {/* CARD CONTAINER */}
        <div className="relative rounded-[32px] md:rounded-[44px] border border-border bg-card/60 backdrop-blur-3xl shadow-xl p-8 sm:p-12 md:p-20 overflow-hidden">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-20 relative z-10">
            {/* BRANDING AREA */}
            <div className="md:col-span-2">
              <div className="flex flex-col items-start gap-4 mb-6">
                <Link href="/" className="flex flex-col items-start gap-3 tracking-[0.15em] group">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={siteName}
                      width={200}
                      height={80}
                      className="h-16 md:h-20 w-auto object-contain transition-transform group-hover:scale-105 duration-500"
                    />
                  )}
                  <h2 className="text-lg md:text-xl tracking-[0.2em] font-light font-serif mt-1 leading-tight text-foreground/90">
                    {siteName}
                  </h2>
                </Link>
              </div>

              <div
                className="text-sm text-muted-foreground max-w-md leading-relaxed"
                dangerouslySetInnerHTML={{ __html: decodeHTML(desc) }}
              />

              {/* SOCIAL ICONS */}
              <div className="flex gap-3 mt-10 flex-wrap">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-muted/50 border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <s.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h4 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-foreground uppercase mb-6 flex items-center gap-2">
                <span className="w-6 h-[2px] bg-primary rounded-full"></span>
                {t('quick_links', lang)}
              </h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/shop" className="hover:text-primary hover:translate-s-1 transition-all inline-block">{t('shop_collection', lang)}</Link></li>
                <li><Link href="/collections" className="hover:text-primary hover:translate-s-1 transition-all inline-block">{t('categories', lang)}</Link></li>
                <li><Link href="/about" className="hover:text-primary hover:translate-s-1 transition-all inline-block">{t('about', lang)}</Link></li>
                <li><Link href="/faq" className="hover:text-primary hover:translate-s-1 transition-all inline-block">{t('faq', lang)}</Link></li>
              </ul>
            </div>

            {/* CONTACT INFO */}
            <div>
              <h4 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-foreground uppercase mb-6 flex items-center gap-2">
                <span className="w-6 h-[2px] bg-primary rounded-full"></span>
                {t('contact', lang)}
              </h4>
              <div className="space-y-5 text-sm text-muted-foreground">
                {settings?.support_email && (
                  <div className="flex items-start gap-3 group">
                    <div className="mt-0.5 p-2 rounded-full bg-muted border border-border group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">
                        {t('email', lang)}
                      </p>
                      <a href={`mailto:${settings.support_email}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {settings.support_email}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.contact_phone && (
                  <div className="flex items-start gap-3 group">
                    <div className="mt-0.5 p-2 rounded-full bg-muted border border-border group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">
                        {t('phone', lang)}
                      </p>
                      <a dir="ltr" href={`tel:${settings.contact_phone.replace(/\D/g, "")}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {settings.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* 3. إصلاح ألوان الوضع الداكن في خريطة الموقع */}
                <a
                  href="https://maps.app.goo.gl/63S3Fk5VMAofLt9J7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all w-fit group"
                >
                  <div className="flex-shrink-0 p-2 rounded-full bg-background border border-border shadow-sm group-hover:text-primary transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">
                      {t('address', lang)}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {t('location', lang)}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground border-t border-border/50 gap-4">
          <p className="text-center md:text-start">
            © {new Date().getFullYear()} {siteName}. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
          </p>

          <div className="flex items-center gap-6">
            <Link className="hover:text-foreground transition-colors font-medium" href="/privacy">{t('privacy', lang)}</Link>
            <Link className="hover:text-foreground transition-colors font-medium" href="/terms">{t('termst', lang)}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}