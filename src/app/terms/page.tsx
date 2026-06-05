"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/api";

const content = {
  en: {
    heroTitle: "Terms of Service",
    heroSubtitle: "Lulu’a Uniforms Store",
    intro: "Welcome to Lulu’a Uniforms Store. By using this website or completing any purchase through it, you fully agree to the terms of use outlined below. If you do not agree, please do not use the site.",
    sections: [
      {
        title: "1. Definitions",
        items: [
          "Store: The Lulu’a Uniforms online store.",
          "Customer/User: Any person using the website or making a purchase.",
          "Products: All clothing and items displayed in the store."
        ]
      },
      {
        title: "2. Eligibility",
        items: [
          "The user must be 18 years or older or use the site under parental supervision.",
          "The user must provide accurate and correct information when registering or making a purchase."
        ]
      },
      {
        title: "3. Account and Information",
        items: [
          "The user is responsible for keeping their account information confidential.",
          "The store is not responsible for unauthorized account use resulting from user negligence.",
          "The store may suspend or cancel an account if it suspects a violation of the terms."
        ]
      },
      {
        title: "4. Orders and Payment",
        items: [
          "All orders are subject to product availability and store approval.",
          "The store may refuse or cancel any order for a legitimate reason.",
          "Displayed prices include VAT (if applicable) unless stated otherwise.",
          "Payments are processed through secure and approved electronic payment gateways."
        ]
      },
      {
        title: "5. Shipping and Delivery",
        items: [
          "Shipping is made to the addresses provided by the customer at checkout.",
          "Delivery times vary depending on the city and shipping company.",
          "The store is not responsible for delays outside its control caused by the shipping company."
        ]
      },
      {
        title: "6. Returns and Exchanges",
        items: [
          "Returns and exchanges are subject to the store’s approved policy.",
          "Please review the return and exchange policy before completing your purchase."
        ]
      },
      {
        title: "7. Intellectual Property",
        items: [
          "All content on the website (text, images, logos, designs) is owned or licensed by Lulu’a Uniforms Store.",
          "Copying or reusing any content without prior written permission is prohibited."
        ]
      },
      {
        title: "8. Improper Use",
        introText: "Use of the website for illegal purposes is prohibited, including:",
        items: [
          "Violating laws and regulations in the Kingdom of Saudi Arabia.",
          "Attempting to hack the website or tamper with its systems.",
          "Providing misleading or incorrect information."
        ]
      },
      {
        title: "9. Limitation of Liability",
        items: [
          "The store is not responsible for indirect damages or losses resulting from misuse of the website.",
          "The store’s liability is limited to the value of the purchased product only."
        ]
      },
      {
        title: "10. Modifications to Terms",
        items: [
          "Lulu’a Uniforms Store reserves the right to modify the terms of use at any time. Updates will be published on this page, and continued use of the site constitutes implicit acceptance of these changes."
        ]
      },
      {
        title: "11. Governing Law",
        items: [
          "These terms are governed by and interpreted according to the laws of the Kingdom of Saudi Arabia."
        ]
      }
    ],
    contactTitle: "12. Contact Us",
    contactIntro: "For any inquiries regarding the terms of use:",
    emailLabel: "Email",
    phoneLabel: "Phone",
  },
  ar: {
    heroTitle: "شروط الخدمة",
    heroSubtitle: "متجر لؤلؤة للأزياء الموحدة",
    intro: "مرحباً بكم في متجر لؤلؤة للأزياء الموحدة. باستخدام هذا الموقع أو إتمام أي عملية شراء من خلاله، فإنك توافق تماماً على شروط الاستخدام الموضحة أدناه. إذا كنت لا توافق، يرجى عدم استخدام الموقع.",
    sections: [
      {
        title: "1. التعاريف",
        items: [
          "المتجر: متجر لؤلؤة للأزياء الموحدة الإلكتروني.",
          "العميل / المستخدم: أي شخص يستخدم الموقع أو يقوم بعملية شراء.",
          "المنتجات: جميع الملابس والعناصر المعروضة في المتجر."
        ]
      },
      {
        title: "2. الأهلية",
        items: [
          "يجب أن يكون المستخدم بالغاً من العمر 18 عاماً أو أكثر، أو يستخدم الموقع تحت إشراف الوالدين.",
          "يجب على المستخدم تقديم معلومات دقيقة وصحيحة عند التسجيل أو إجراء عملية شراء."
        ]
      },
      {
        title: "3. الحساب والمعلومات",
        items: [
          "يتحمل المستخدم مسؤولية الحفاظ على سرية معلومات حسابه.",
          "المتجر غير مسؤول عن أي استخدام غير مصرح به للحساب نتيجة إهمال المستخدم.",
          "يحق للمتجر تعليق أو إلغاء الحساب إذا اشتبه في حدوث انتهاك للشروط."
        ]
      },
      {
        title: "4. الطلبات والدفع",
        items: [
          "تخضع جميع الطلبات لتوفر المنتج وموافقة المتجر.",
          "يحق للمتجر رفض أو إلغاء أي طلب لسبب مشروع.",
          "الأسعار المعروضة تشمل ضريبة القيمة المضافة (إن وجدت) ما لم يُنص على خلاف ذلك.",
          "تتم معالجة المدفوعات عبر بوابات دفع إلكترونية آمنة ومعتمدة."
        ]
      },
      {
        title: "5. الشحن والتوصيل",
        items: [
          "يتم الشحن إلى العناوين التي يقدمها العميل عند الدفع.",
          "تختلف أوقات التوصيل حسب المدينة وشركة الشحن.",
          "المتجر غير مسؤول عن التأخير الخارج عن إرادته والذي تتسبب فيه شركة الشحن."
        ]
      },
      {
        title: "6. الاستبدال والاسترجاع",
        items: [
          "يخضع الاستبدال والاسترجاع لسياسة المتجر المعتمدة.",
          "يرجى مراجعة سياسة الاستبدال والاسترجاع قبل إتمام عملية الشراء."
        ]
      },
      {
        title: "7. الملكية الفكرية",
        items: [
          "جميع محتويات الموقع (نصوص، صور، شعارات، تصاميم) مملوكة أو مرخصة لمتجر لؤلؤة للأزياء الموحدة.",
          "يُمنع نسخ أو إعادة استخدام أي محتوى دون إذن كتابي مسبق."
        ]
      },
      {
        title: "8. الاستخدام غير السليم",
        introText: "يُحظر استخدام الموقع لأغراض غير قانونية، بما في ذلك:",
        items: [
          "انتهاك القوانين أو اللوائح في المملكة العربية السعودية.",
          "محاولة اختراق الموقع أو التلاعب بأنظمته.",
          "تقديم معلومات مضللة أو غير صحيحة."
        ]
      },
      {
        title: "9. حدود المسؤولية",
        items: [
          "المتجر غير مسؤول عن أي أضرار أو خسائر غير مباشرة ناتجة عن سوء استخدام الموقع.",
          "تقتصر مسؤولية المتجر على قيمة المنتج الذي تم شراؤه فقط."
        ]
      },
      {
        title: "10. تعديلات على الشروط",
        items: [
          "يحتفظ متجر لؤلؤة للأزياء الموحدة بالحق في تعديل شروط الاستخدام في أي وقت. سيتم نشر التحديثات على هذه الصفحة، واستمرار استخدام الموقع يعتبر قبولاً ضمنياً لهذه التغييرات."
        ]
      },
      {
        title: "11. القانون الحاكم",
        items: [
          "تخضع هذه الشروط وتُفسر وفقاً لقوانين المملكة العربية السعودية."
        ]
      }
    ],
    contactTitle: "12. اتصل بنا",
    contactIntro: "لأي استفسارات تتعلق بشروط الاستخدام:",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
  }
};

export default function TermsPage() {
  const { lang } = useLanguage();
  const text = content[lang as keyof typeof content];
  
  const [storeEmail, setStoreEmail] = useState("support@elegance.com");
  const [storePhone, setStorePhone] = useState("+966 50 000 0000");

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchSettings();
        if (settings) {
          if (settings.support_email) setStoreEmail(settings.support_email);
          if (settings.contact_phone) setStorePhone(settings.contact_phone);
        }
      } catch (err) { }
    }
    loadSettings();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-muted py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            {text.heroTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-primary font-medium tracking-wide uppercase"
          >
            {text.heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card text-card-foreground p-8 sm:p-12 rounded-2xl shadow-sm border border-border"
        >
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            {text.intro}
          </p>

          <div className="space-y-12">
            {text.sections.map((section, idx) => (
              <div key={idx}>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">{section.title}</h2>
                {section.introText && (
                  <p className="text-muted-foreground mb-2">{section.introText}</p>
                )}
                <ul className="list-disc leading-relaxed text-muted-foreground ml-6 mr-6 space-y-2">
                  {section.items.map((item, idxi) => (
                    <li key={idxi} className="pl-1 rtl:pr-1 rtl:pl-0">{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Section */}
            <div className="pt-8 border-t border-border">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">{text.contactTitle}</h2>
              <p className="text-muted-foreground mb-4">{text.contactIntro}</p>
              
              <div className="flex flex-col gap-2 font-medium">
                <p>
                  <span className="text-foreground">{text.emailLabel}:</span> <a href={`mailto:${storeEmail}`} className="text-primary hover:underline">{storeEmail}</a>
                </p>
                <p>
                  <span className="text-foreground">{text.phoneLabel}:</span> <a href={`tel:${storePhone.replace(/\s+/g, '')}`} className="text-primary hover:underline">{storePhone}</a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
