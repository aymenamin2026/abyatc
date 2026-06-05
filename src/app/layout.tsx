import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import "./globals.css";
import Script from 'next/script'; 
import WhatsAppFloat from "@/components/WhatsAppFloat";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

import { fetchSettings, fetchPopups, getImageUrl } from "@/lib/api";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/LanguageContext";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import PopupManager from "@/components/PopupManager";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettings();
  
  const siteName = settings?.site_name || "لؤلؤة للزي الموحد | Luluh Uniform | luluh.sa";
  const desc = settings?.site_description || "وجهتكم الأولى في السعودية للزي الموحد الطبي، المدرسي، الفندقي، وزي الشركات بجودة استثنائية.";
  const favicon = settings?.favicon_path ? getImageUrl(settings.favicon_path) : undefined;

  return {
    title: siteName,
    description: desc,
    icons: favicon ? { icon: favicon } : undefined,
    keywords: ["زي موحد", "سكراب طبي", "زي مدرسي السعودية", "لبس مهني", "Luluh Uniform", "الزي الموحد الخبر"],
    verification: {
      google: "lmIKN52OiFTPztUqMTFK-x0V2-HjS-13VkITipqkc3U",
    },
    viewport: "width=device-width, initial-scale=1",
    robots: "index, follow",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await fetchSettings();
  const popups = await fetchPopups();

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const fallbackLang = settings?.default_language || "ar"; 
  const lang = (localeCookie?.value ? (localeCookie.value === "ar" ? "ar" : "en") : fallbackLang) as "en" | "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";
  
  const primaryColor = settings?.primary_color || "#cda485";
  const themeStyles: any = {
    '--primary': primaryColor,
    '--btn-bg': settings?.button_bg_color || primaryColor,
    '--btn-text': settings?.button_text_color || "#ffffff",
  };

  if (settings?.text_color) themeStyles['--foreground'] = settings.text_color;
  if (settings?.background_color) themeStyles['--background'] = settings.background_color;

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/61f1305000a86ee6e3a1f93f/script.js"
          strategy="beforeInteractive"
        />

        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id=GTM-P69C8QCM'+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P69C8QCM');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background min-h-screen flex flex-col`} style={themeStyles as React.CSSProperties}>
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-P69C8QCM"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <ThemeProvider attribute="class" defaultTheme={settings?.default_theme || "system"} enableSystem disableTransitionOnChange>
          <LanguageProvider lang={lang}>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <Navbar settings={settings} />
                  <main className="flex-1">{children}</main>
                  <Footer settings={settings} />
                  <MobileBottomNav />
                  <PopupManager popups={popups} settings={settings} />
                  
                  {/* زر الواتساب العائم */}
<WhatsAppFloat settings={settings} />                  
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}