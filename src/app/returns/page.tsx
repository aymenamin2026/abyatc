"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/api";

const content = {
  en: {
    heroTitle: "Cancellation and Refund Policy",
    heroSubtitle: "Lamea Abyat Contracting Company",
    intro: "To ensure our clients’ satisfaction and trust, Lamea Abyat provides the following cancellation and refund policy for our contracting services and heavy equipment rentals:",
    sections: [
      {
        title: "1. Equipment Rental Cancellations",
        items: [
          "Customers must request cancellation at least 24 hours before the scheduled equipment delivery time to receive a full refund.",
          "Cancellations made less than 24 hours before delivery may be subject to a deduction to cover mobilization and transportation costs.",
          "Please provide the contract or order number when requesting a cancellation."
        ]
      },
      {
        title: "2. Contracting Services Cancellations",
        items: [
          "Cancellation of contracting projects is subject to the specific terms outlined in the signed agreement.",
          "Initial deposits may be partially or fully non-refundable if the purchase of materials has commenced or labor has been deployed."
        ]
      },
      {
        title: "3. Equipment Replacement (Breakdowns)",
        items: [
          "If rented equipment malfunctions on-site due to mechanical failure, Lamea Abyat will replace it with a functioning unit at no additional cost.",
          "If a replacement is unavailable, the customer will receive a pro-rated refund for the unutilized rental period."
        ]
      },
      {
        title: "4. Non-Refundable Cases",
        items: [
          "Rental periods that have already been fully consumed by the client.",
          "Custom construction materials purchased specifically for a client's project.",
          "Delays caused by the client's site unpreparedness after the equipment has arrived."
        ]
      },
      {
        title: "5. Refund Procedures",
        items: [
          "Refunds will be processed via the original payment method or via bank transfer.",
          "Processing typically takes 5 to 14 business days, depending on the bank's processing times.",
          "Any damages to the rented equipment caused by client misuse will be deducted from the initial security deposit."
        ]
      }
    ],
    contactTitle: "6. Contact Us",
    contactIntro: "For inquiries or to request a cancellation or refund:",
    emailLabel: "Email",
    phoneLabel: "Phone",
  },
  ar: {
    heroTitle: "سياسة الإلغاء والاسترجاع",
    heroSubtitle: "شركة لمعة أبيات للمقاولات",
    intro: "لضمان رضا وثقة عملائنا، توفر شركة لمعة أبيات سياسة الإلغاء والاسترجاع التالية الخاصة بخدمات المقاولات وتأجير المعدات الثقيلة:",
    sections: [
      {
        title: "1. إلغاء طلبات تأجير المعدات",
        items: [
          "يجب على العميل طلب الإلغاء قبل 24 ساعة على الأقل من موعد تسليم المعدة لاسترداد المبلغ كاملاً.",
          "الإلغاء الذي يتم قبل أقل من 24 ساعة قد يخضع لخصم لتغطية تكاليف التجهيز والنقل.",
          "يرجى تقديم رقم العقد أو الطلب عند طلب الإلغاء."
        ]
      },
      {
        title: "2. إلغاء خدمات المقاولات",
        items: [
          "يخضع إلغاء مشاريع المقاولات للبنود المحددة في العقد المبرم بين الطرفين.",
          "قد تكون الدفعات المقدمة (العربون) غير مستردة جزئياً أو كلياً إذا تم البدء في شراء المواد أو حجز العمالة للمشروع."
        ]
      },
      {
        title: "3. استبدال المعدات (الأعطال)",
        items: [
          "في حال تعطل المعدة المستأجرة في الموقع بسبب خلل ميكانيكي، تلتزم الشركة باستبدالها بمعدة بديلة دون تكلفة إضافية.",
          "في حال عدم توفر معدة بديلة، سيتم استرجاع المبلغ للعميل عن الفترة الزمنية المتبقية التي لم يتم الاستفادة منها."
        ]
      },
      {
        title: "4. الحالات غير القابلة للاسترجاع",
        items: [
          "فترات التأجير التي تم استخدامها واستهلاكها بالكامل من قبل العميل.",
          "مواد البناء أو التصاميم التي تم تفصيلها وشراؤها خصيصاً لمشروع العميل.",
          "التأخيرات الناتجة عن عدم جاهزية موقع العميل بعد وصول المعدات للموقع."
        ]
      },
      {
        title: "5. إجراءات استرداد الأموال",
        items: [
          "تتم معالجة المبالغ المستردة عبر نفس وسيلة الدفع أو عبر حوالة بنكية.",
          "تستغرق معالجة استرداد الأموال من 5 إلى 14 يوم عمل حسب إجراءات البنك.",
          "أي أضرار تلحق بالمعدات المستأجرة بسبب سوء استخدام العميل سيتم خصمها من مبلغ التأمين."
        ]
      }
    ],
    contactTitle: "6. اتصل بنا",
    contactIntro: "للاستفسارات أو لطلب الإلغاء والاسترجاع:",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
  }
};

export default function ReturnsPage() {
  const { lang } = useLanguage();
  const text = content[lang as keyof typeof content];

  const [storeEmail, setStoreEmail] = useState("info@lameaabyat.com");
  const [storePhone, setStorePhone] = useState("+966 50 000 0000");

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchSettings();
        if (settings) {
          if (settings.support_email) setStoreEmail(settings.support_email);
          if (settings.contact_phone) setStorePhone(settings.contact_phone);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
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