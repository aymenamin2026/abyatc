"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/api";

const content = {
  en: {
    heroTitle: "Return and Exchange Policy",
    heroSubtitle: "Lulu’a Uniforms Store",
    intro: "To ensure our customers’ satisfaction and trust, Lulu’a Uniforms Store provides the following return and exchange policy:",
    sections: [
      {
        title: "1. Conditions for Returns and Exchanges",
        items: [
          "The customer must request a return or exchange within 7 days of receiving the order.",
          "The product must be unused, unwashed, and in its original condition.",
          "All original tags must remain attached to the product.",
          "Attach the purchase invoice or provide the order number."
        ]
      },
      {
        title: "2. Non-Returnable or Non-Exchangeable Products",
        items: [
          "Uniforms custom-made or modified according to the customer’s measurements.",
          "Products that have been used, washed, or damaged.",
          "Discounted products or items in special promotions (if indicated)."
        ]
      },
      {
        title: "3. Acceptable Return Cases",
        items: [
          "Products with manufacturing defects.",
          "Receiving a product different from the order.",
          "Damage caused during shipping.",
          "In these cases, the store bears all shipping costs."
        ]
      },
      {
        title: "4. Return and Exchange Procedures",
        items: [
          "Contact customer service within the specified period.",
          "Provide the order number and clear photos of the product (if defective).",
          "Wait for store approval and follow shipping instructions.",
          "After receiving and inspecting the product, the return or exchange will be processed."
        ]
      },
      {
        title: "5. Refunds",
        items: [
          "Refunds will be issued via the same payment method used for the purchase.",
          "Refund processing takes 5 to 14 business days depending on the payment provider.",
          "If the return is not due to a defect or store error, the customer bears the shipping cost."
        ]
      },
      {
        title: "6. Exchanges",
        items: [
          "Products can be exchanged for another product based on availability.",
          "Any price difference will be either paid by or refunded to the customer.",
          "The customer bears shipping costs for regular exchanges."
        ]
      },
      {
        title: "7. Order Cancellation",
        items: [
          "Orders can only be canceled before shipping.",
          "Once shipped, the order cannot be canceled and must follow the return policy."
        ]
      }
    ],
    contactTitle: "8. Contact Us",
    contactIntro: "For inquiries or to request a return or exchange:",
    emailLabel: "Email",
    phoneLabel: "Phone",
  },
  ar: {
    heroTitle: "سياسة الاستبدال والاسترجاع",
    heroSubtitle: "متجر لؤلؤة للأزياء الموحدة",
    intro: "لضمان رضا وثقة عملائنا، يوفر متجر لؤلؤة للأزياء الموحدة سياسة الاستبدال والاسترجاع التالية:",
    sections: [
      {
        title: "1. شروط الاستبدال والاسترجاع",
        items: [
          "يجب على العميل طلب الاسترجاع أو الاستبدال خلال 7 أيام من استلام الطلب.",
          "يجب أن يكون المنتج غير مستخدم، غير مغسول، وبحالته الأصلية.",
          "يجب أن تظل جميع الملصقات الأصلية مرفقة بالمنتج.",
          "إرفاق فاتورة الشراء أو تقديم رقم الطلب."
        ]
      },
      {
        title: "2. المنتجات غير القابلة للاسترجاع أو الاستبدال",
        items: [
          "الأزياء الموحدة المصممة أو المعدلة خصيصاً وفقاً لمقاسات العميل.",
          "المنتجات التي تم استخدامها، غسلها، أو إتلافها.",
          "المنتجات المخفضة أو المشمولة في عروض ترويجية خاصة (إذا تم التنويه لذلك)."
        ]
      },
      {
        title: "3. حالات الاسترجاع المقبولة",
        items: [
          "المنتجات التي تحتوي على عيوب مصنعية.",
          "استلام منتج مختلف عن الطلب.",
          "التلف الناتج أثناء الشحن.",
          "في هذه الحالات، يتحمل المتجر كافة تكاليف الشحن."
        ]
      },
      {
        title: "4. إجراءات الاستبدال والاسترجاع",
        items: [
          "التواصل مع خدمة العملاء خلال الفترة المحددة.",
          "تقديم رقم الطلب وصور واضحة للمنتج (في حال وجود عيب).",
          "انتظار موافقة المتجر واتباع تعليمات الشحن.",
          "بعد استلام المنتج وفحصه، ستتم معالجة الاسترجاع أو الاستبدال."
        ]
      },
      {
        title: "5. استرداد الأموال",
        items: [
          "سيتم استرداد الأموال عبر نفس وسيلة الدفع المستخدمة في الشراء.",
          "تستغرق معالجة استرداد الأموال من 5 إلى 14 يوم عمل حسب مزود خدمة الدفع.",
          "إذا لم يكن الاسترجاع بسبب عيب أو خطأ من المتجر، يتحمل العميل تكلفة الشحن."
        ]
      },
      {
        title: "6. الاستبدال",
        items: [
          "يمكن استبدال المنتجات بمنتج آخر بناءً على التوفر.",
          "سيتم دفع أي فرق في السعر من قبل العميل أو استرداده له.",
          "يتحمل العميل تكاليف الشحن للاستبدال العادي."
        ]
      },
      {
        title: "7. إلغاء الطلب",
        items: [
          "يمكن إلغاء الطلبات فقط قبل الشحن.",
          "بمجرد شحن الطلب، لا يمكن إلغاؤه ويجب اتباع سياسة الاسترجاع."
        ]
      }
    ],
    contactTitle: "8. اتصل بنا",
    contactIntro: "للاستفسارات أو لطلب استرجاع أو استبدال:",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
  }
};

export default function ReturnsPage() {
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
