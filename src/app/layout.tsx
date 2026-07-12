import { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import PopupManager from "@/components/PopupManager";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { ThemeProvider } from "@/components/ThemeProvider";
import PwaPrompt from "@/components/PwaPrompt";

// Context Providers
import { LanguageProvider } from "@/components/LanguageContext";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";

// Utils & APIs
import { fetchSettings, fetchPopups, getImageUrl } from "@/lib/api";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const defaultTitle = "شركة لمعة أبيات للمقاولات | Lamea Abyat";
  const defaultDesc = "شركة متخصصة في مجالات المقاولات والتشييد والبناء في مدينة الرياض. نقدم خدمات إدارة المشاريع، التصميم، وتأجير المعدات الثقيلة بجميع أنواعها.";

  try {
    const settings = await fetchSettings(); // تأكد من أن هذه الدالة تجلب البيانات من Laravel API بنجاح
    const siteName = settings?.site_name || defaultTitle;
    const desc = settings?.site_description || defaultDesc;
    const favicon = settings?.favicon_path ? getImageUrl(settings.favicon_path) : undefined;

    return {
      title: {
        default: siteName,
        template: `%s | ${siteName}`,
      },
      description: desc,
      icons: favicon ? { icon: favicon, apple: favicon } : undefined,
      keywords: [
        "شركة لمعة أبيات",
        "شركة مقاولات الرياض",
        "التشييد والبناء",
        "تأجير معدات ثقيلة",
        "موبايل كرين",
        "بوم ترك",
        "حفارات للإيجار",
        "سطحة لوبد",
        "Lamea Abyat"
      ],
      verification: {
        google: "lmIKN52OiFTPztUqMTFK-x0V2-HjS-13VkITipqkc3U", // رمز التحقق الخاص بك
      },
      openGraph: {
        title: siteName,
        description: desc,
        siteName: siteName,
        locale: 'ar_SA',
        type: 'website',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    // بيانات احتياطية في حال فشل الاتصال بالباك اند
    return {
      title: defaultTitle,
      description: defaultDesc,
      keywords: ["شركة لمعة أبيات", "مقاولات", "تأجير معدات ثقيلة الرياض", "بناء وتشييد"],
      robots: "index, follow",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsPromise = fetchSettings();
  const popupsPromise = fetchPopups();
  const cookieStorePromise = cookies();

  const [settings, popups, cookieStore] = await Promise.all([
    settingsPromise,
    popupsPromise,
    cookieStorePromise,
  ]);

  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const fallbackLang = settings?.default_language || "ar";
  const lang = (localeCookie?.value === "en" ? "en" : "ar");
  const dir = lang === "ar" ? "rtl" : "ltr";

  // إعداد متغيرات الألوان بناءً على الحقول الجديدة الديناميكية لوجود الوضعين
  const themeStyles = {
    '--royal-blue': '#093f89',
    '--golden-yellow': '#fbc70f',
    '--primary': settings?.primary_color || '#093f89',

    // ألوان الوضع الفاتح الافتراضية أو القادمة من قاعدة البيانات
    '--bg-light': settings?.bg_color_light || '#ffffff',
    '--text-light': settings?.text_color_light || '#1c1917',
    '--btn-bg-light': settings?.btn_bg_light || '#093f89',
    '--btn-text-light': settings?.btn_text_light || '#ffffff',

    // ألوان الوضع الداكن الافتراضية أو القادمة من قاعدة البيانات
    '--bg-dark': settings?.bg_color_dark || '#1c1917',
    '--text-dark': settings?.text_color_dark || '#fafafa',
    '--btn-bg-dark': settings?.btn_bg_dark || '#fbc70f',
    '--btn-text-dark': settings?.btn_text_dark || '#093f89',
  } as React.CSSProperties;

  return (
    // إضافة scroll-smooth لتجربة تنقل ناعمة بين أقسام الصفحة
    <html lang={lang} dir={dir} className="scroll-smooth" suppressHydrationWarning>
      <head>
        <Script id="cookieyes" src="https://cdn-cookieyes.com/client_data/61f1305000a86ee6e3a1f93f/script.js" strategy="beforeInteractive" />
        <link rel="manifest" href="/manifest.json" />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P69C8QCM');
          `}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background min-h-screen flex flex-col selection:bg-[#fbc70f]/30 selection:text-[#093f89] dark:selection:text-[#fbc70f] dark:selection:bg-[#093f89]/50`}
        style={themeStyles}
      >
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P69C8QCM" height="0" width="0" className="hidden invisible"></iframe>
        </noscript>

        <ThemeProvider attribute="class" defaultTheme={settings?.default_theme || "system"} enableSystem disableTransitionOnChange>
          <LanguageProvider lang={lang}>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <Navbar settings={settings} />
                  <main className="flex-1 w-full flex flex-col relative z-0 overflow-x-hidden">
                    {/* طبقة إضاءة خلفية ناعمة لتعزيز الفخامة في الوضعين الداكن والفاتح */}
                    <div className="absolute inset-0 z-[-1] pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#093f89]/10 via-background to-background dark:from-[#093f89]/15 dark:via-background dark:to-background"></div>
                    {children}
                  </main>
                  <Footer settings={settings} />
                  <MobileBottomNav />
                  <PopupManager popups={popups} settings={settings} />
                  <WhatsAppFloat settings={settings} />
                  <PwaPrompt />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}