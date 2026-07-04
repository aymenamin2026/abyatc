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

  // أداء عالي: استخدام متغيرات CSS لتحديث موقع الإضاءة بدون Re-renders
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
      className="relative overflow-hidden bg-background text-foreground transition-colors duration-500 border-t border-border/40 mt-10"
    >
      {/* LIGHT FOLLOW EFFECT (CSS-Driven) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 lg:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(9, 63, 137, 0.06), transparent 45%)`,
        }}
      />

      {/* BACKGROUND AMBIENT LAYERS - دمج ألوان الهوية */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-25%] start-[-10%] w-[800px] h-[800px] bg-[#093f89]/5 dark:bg-[#093f89]/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-35%] end-[-10%] w-[900px] h-[900px] bg-[#fbc70f]/5 dark:bg-[#fbc70f]/5 blur-[200px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01] bg-[url('/noise.png')]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-12 py-20 md:py-28">

        {/* LUXURY GLASSMORPHISM CARD */}
        <div className="relative rounded-[32px] md:rounded-[48px] border border-border/60 bg-card/60 backdrop-blur-3xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-8 sm:p-12 md:p-20 overflow-hidden">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-20 relative z-10">

            {/* BRANDING AREA */}
            <div className="md:col-span-2">
              <div className="flex flex-col items-start gap-4 mb-6">
                <Link href="/" className="flex flex-col items-start gap-3 tracking-[0.15em] group">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={siteName}
                      width={200}
                      height={80}
                      className="h-16 md:h-20 w-auto object-contain transition-transform group-hover:scale-105 duration-500"
                    />
                  ) : (
                    <h2 className="text-2xl md:text-3xl font-bold font-serif mt-1 leading-tight text-[#093f89] dark:text-[#fbc70f]">
                      {siteName}
                    </h2>
                  )}
                </Link>
              </div>

              <div
                className="text-sm max-w-md leading-relaxed font-light text-foreground
  group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f]
  transition-colors duration-300"
                dangerouslySetInnerHTML={{ __html: decodeHTML(desc) }}
              />
              {/* SOCIAL ICONS - تأثيرات فخمة باللون الكحلي والذهبي */}
              <div className="flex gap-3 mt-10 flex-wrap">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-muted/50 border border-border/60 text-muted-foreground hover:bg-[#093f89] hover:text-[#fbc70f] hover:border-[#093f89] dark:hover:bg-[#fbc70f] dark:hover:text-[#093f89] dark:hover:border-[#fbc70f] hover:shadow-[0_8px_20px_rgba(9,63,137,0.2)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <s.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] text-foreground uppercase mb-6 flex items-center gap-3">
                <span className="w-6 h-[3px] bg-[#fbc70f] rounded-full"></span>
                {t('quick_links', lang)}
              </h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li>
                  <Link href="/shop" className="hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:translate-s-1 transition-all duration-300 inline-block">
                    {t('shop_collection', lang)}
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:translate-s-1 transition-all duration-300 inline-block">
                    {t('categories', lang)}
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:translate-s-1 transition-all duration-300 inline-block">
                    {t('about', lang)}
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:translate-s-1 transition-all duration-300 inline-block">
                    {t('faq', lang)}
                  </Link>
                </li>
              </ul>
            </div>

            {/* CONTACT INFO */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] text-foreground uppercase mb-6 flex items-center gap-3">
                <span className="w-6 h-[3px] bg-[#fbc70f] rounded-full"></span>
                {t('contact', lang)}
              </h4>
              <div className="space-y-6 text-sm text-muted-foreground">

                {settings?.support_email && (
                  <div className="flex items-start gap-4 group">
                    <div className="mt-0.5 p-2.5 rounded-2xl bg-[#093f89]/5 dark:bg-[#fbc70f]/10 text-[#093f89] dark:text-[#fbc70f] group-hover:bg-[#093f89] group-hover:text-[#fbc70f] dark:group-hover:bg-[#fbc70f] dark:group-hover:text-[#093f89] transition-colors duration-300 shadow-sm">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5 font-bold">
                        {t('email', lang)}
                      </span>
                      <a href={`mailto:${settings.support_email}`} className="text-sm font-semibold text-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors duration-300">
                        {settings.support_email}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.contact_phone && (
                  <div className="flex items-start gap-4 group">
                    <div className="mt-0.5 p-2.5 rounded-2xl bg-[#093f89]/5 dark:bg-[#fbc70f]/10 text-[#093f89] dark:text-[#fbc70f] group-hover:bg-[#093f89] group-hover:text-[#fbc70f] dark:group-hover:bg-[#fbc70f] dark:group-hover:text-[#093f89] transition-colors duration-300 shadow-sm">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5 font-bold">
                        {t('phone', lang)}
                      </span>
                      <a dir="ltr" href={`tel:${settings.contact_phone.replace(/\D/g, "")}`} className="text-sm font-semibold text-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors duration-300">
                        {settings.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* خريطة الموقع بتأثير الزجاج */}
                <a
                  href="https://maps.app.goo.gl/Kh4V7FyiMAP8dUSr9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-muted/40 hover:bg-[#093f89]/5 dark:hover:bg-[#fbc70f]/5 border border-border/40 hover:border-[#093f89]/20 dark:hover:border-[#fbc70f]/20 transition-all duration-300 group shadow-sm"
                >
                  <div className="flex-shrink-0 p-2 rounded-xl bg-background border border-border/60 shadow-sm text-[#093f89] dark:text-[#fbc70f] group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5 font-bold">
                      {t('address', lang)}
                    </span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors duration-300">
                      {t('location', lang)}
                    </span>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground border-t border-border/40 gap-4">
          <p className="text-center md:text-start font-medium">
            © {new Date().getFullYear()} <span className="text-foreground font-bold">{siteName}</span>. {lang === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
          </p>

          <div className="flex items-center gap-8 font-semibold">
            <Link className="hover:text-[#093f89] dark:hover:text-[#fbc70f] transition-colors duration-300" href="/privacy">
              {t('privacy', lang)}
            </Link>
            <Link className="hover:text-[#093f89] dark:hover:text-[#fbc70f] transition-colors duration-300" href="/terms">
              {t('termst', lang)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}