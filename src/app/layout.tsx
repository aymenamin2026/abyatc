// layout.tsx
export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import "./globals.css";
import Script from 'next/script'; 
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { fetchSettings, fetchPopups, getImageUrl } from "@/lib/api";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/LanguageContext";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import PopupManager from "@/components/PopupManager";

// الخطوط يتم تعريفها خارج الـ Component لمنع إعادة تحميلها
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export async function generateMetadata(): Promise<Metadata> {
  // ... (احتفظ بنفس كود الميتا الحالي الخاص بك)
  return { title: "Luluh Uniform", description: "..." }; 
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // جلب البيانات الأساسية
  const [settings, popups] = await Promise.all([fetchSettings(), fetchPopups()]);

  const cookieStore = await cookies();
  const lang = (cookieStore.get("NEXT_LOCALE")?.value === "en" ? "en" : "ar");
  
  // دمج الألوان في متغيرات CSS لسهولة التحكم فيها في الـ Dark Mode
  const themeStyles = {
    '--primary': settings?.primary_color || "#cda485",
    '--bg-glass': 'rgba(255, 255, 255, 0.7)', // للوضع الفاتح
    '--bg-glass-dark': 'rgba(15, 23, 42, 0.7)', // للوضع الداكن
  } as React.CSSProperties;

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-gray-50 dark:bg-slate-950 transition-colors duration-300`}>
        
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider lang={lang}>
            {/* بقية الـ Providers ... */}
            <div className="relative min-h-screen flex flex-col">
              <Navbar settings={settings} />
              <main className="flex-1">{children}</main>
              <Footer settings={settings} />
              <MobileBottomNav />
            </div>
            <PopupManager popups={popups} settings={settings} />
            <WhatsAppFloat settings={settings} />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}