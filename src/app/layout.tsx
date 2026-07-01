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

// Context Providers
import { LanguageProvider } from "@/components/LanguageContext";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";

// Utils & APIs
import { fetchSettings, fetchPopups, getImageUrl } from "@/lib/api";
import "./globals.css";

// 1. تحسين أداء الخطوط باستخدام display: "swap" لمنع تأخير ظهور النص (FOIT)
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
  const defaultTitle = "لمعة ابيات | Lamaa Abyat";
  const defaultDesc = "وجهتكم الأولى في السعودية للزي الموحد الطبي، المدرسي، الفندقي، وزي الشركات بجودة استثنائية.";

  try {
    const settings = await fetchSettings();
    const siteName = settings?.site_name || defaultTitle;
    const desc = settings?.site_description || defaultDesc;
    const favicon = settings?.favicon_path ? getImageUrl(settings.favicon_path) : undefined;

    return {
      title: {
        default: siteName,
        template: `%s | ${siteName}`, // أفضل ممارسات SEO لتوحيد شكل العناوين في الصفحات الفرعية
      },
      description: desc,
      icons: favicon ? { icon: favicon, apple: favicon } : undefined, // دعم أيقونات أجهزة Apple
      keywords: ["زي موحد", "سكراب طبي", "زي مدرسي السعودية", "لبس مهني", "Luluh Uniform", "الزي الموحد الخبر", "لمعة ابيات"],
      verification: {
        google: "lmIKN52OiFTPztUqMTFK-x0V2-HjS-13VkITipqkc3U",
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
    return {
      title: defaultTitle,
      description: defaultDesc,
      keywords: ["زي موحد", "سكراب طبي", "زي مدرسي السعودية", "لبس مهني", "Luluh Uniform"],
      robots: "index, follow",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 2. الجلب المتوازي (Parallel Data Fetching): تقليل وقت الاستجابة (TTFB) بنسبة كبيرة
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
  const lang = (localeCookie?.value === "en" ? "en" : "ar"); // تبسيط منطق التحقق
  const dir = lang === "ar" ? "rtl" : "ltr";

  const primaryColor = settings?.primary_color || "#cda485";
  const themeStyles = {
    '--primary': primaryColor,
    '--btn-bg': settings?.button_bg_color || primaryColor,
    '--btn-text': settings?.button_text_color || "#ffffff",
    ...(settings?.text_color && { '--foreground': settings.text_color }),
    ...(settings?.background_color && { '--background': settings.background_color }),
  } as React.CSSProperties;

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
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P69C8QCM');
          `}
        </Script>
      </head>
      {/* 3. تحسينات Tailwind: إضافة selection لتغيير لون تظليل النص بما يتناسب مع الهوية البصرية */}
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background min-h-screen flex flex-col selection:bg-primary/30 selection:text-foreground`}
        style={themeStyles}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P69C8QCM"
            height="0"
            width="0"
            className="hidden invisible" // 4. استبدال الـ inline styles بكلاسات Tailwind
          ></iframe>
        </noscript>

        <ThemeProvider attribute="class" defaultTheme={settings?.default_theme || "system"} enableSystem disableTransitionOnChange>
          <LanguageProvider lang={lang}>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <Navbar settings={settings} />
                  {/* 5. إزالة min-h-screen المكررة هنا، فئة flex-1 تقوم بالمهمة بامتياز داخل flex-col */}
                  <main className="flex-1 w-full flex flex-col">
                    {children}
                  </main>
                  <Footer settings={settings} />
                  <MobileBottomNav />
                  <PopupManager popups={popups} settings={settings} />
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