"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/api";

const content = {
  en: {
    heroTitle: "Privacy Policy",
    heroSubtitle: "Lulu’a Uniforms Store",
    intro: "Welcome to Lulu’a Uniforms Store. We value your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit our website, and our practices for collecting, using, maintaining, protecting, and disclosing that information.",
    sections: [
      {
        title: "1. Information We Collect",
        items: [
          "Personal Contact Information (Name, Email, Phone Number, Shipping Address) provided during checkout or registration.",
          "Payment Details, processed securely via third-party gateways (we do not store direct credit card numbers).",
          "Browsing Data such as IP addresses, browser types, and interaction logs through cookies and tracking tools."
        ]
      },
      {
        title: "2. How We Use Your Information",
        items: [
          "To process and fulfill your orders, including sending you emails to confirm your order status and shipment.",
          "To provide customer support and respond to inquiries.",
          "To send promotional emails and news (only if you have opted in).",
          "To improve our website layout, product offerings, and customer service."
        ]
      },
      {
        title: "3. Information Sharing",
        items: [
          "We do not sell, trade, or rent your personal identification information to others.",
          "We may share generic aggregated demographic information not linked to any personal identification information with our business partners.",
          "We may use third-party service providers to help us operate our business (e.g., shipping companies, payment gateways) and may share your information with them for those limited purposes."
        ]
      },
      {
        title: "4. Data Security",
        items: [
          "We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.",
          "Sensitive and private data exchange between the site and its users happens over an SSL-secured communication channel."
        ]
      },
      {
        title: "5. Your Rights",
        items: [
          "You have the right to request access to the personal data we hold about you.",
          "You can request corrections to any inaccurate data via your account dashboard or by contacting us.",
          "You may request the deletion of your account and associated personal data, subject to legal and accounting retention requirements."
        ]
      },
      {
        title: "6. Changes to This Policy",
        items: [
          "Lulu’a Uniforms Store has the discretion to update this privacy policy at any time.",
          "When we do, we will revise the updated date at the bottom of this page.",
          "We encourage Users to frequently check this page for any changes to stay informed about how we are helping to protect the personal information we collect."
        ]
      }
    ],
    contactTitle: "7. Contact Options",
    contactIntro: "If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at:",
    emailLabel: "Email",
    phoneLabel: "Phone",
  },
  ar: {
    heroTitle: "سياسة الخصوصية",
    heroSubtitle: "متجر لؤلؤة للأزياء الموحدة",
    intro: "مرحباً بكم في متجر لؤلؤة للأزياء الموحدة. نحن نقدر خصوصيتك ونلتزم بحمايتها من خلال امتثالنا لهذه السياسة. تصف هذه السياسة أنواع المعلومات التي قد نجمعها منك أو التي قد تقدمها عند زيارتك لموقعنا الإلكتروني، وممارساتنا في جمع تلك المعلومات واستخدامها والمحافظة عليها وحمايتها والإفصاح عنها.",
    sections: [
      {
        title: "1. المعلومات التي نجمعها",
        items: [
          "معلومات الاتصال الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف، عنوان الشحن) المقدمة أثناء الدفع أو التسجيل.",
          "تفاصيل الدفع، التي تتم معالجتها بشكل آمن عبر بوابات طرف ثالث (نحن لا نخزن أرقام بطاقات الائتمان المباشرة).",
          "بيانات التصفح مثل عناوين IP، وأنواع المتصفحات، وسجلات التفاعل من خلال ملفات تعريف الارتباط وأدوات التتبع."
        ]
      },
      {
        title: "2. كيف نستخدم معلوماتك",
        items: [
          "لمعالجة طلباتك والوفاء بها، بما في ذلك إرسال رسائل بريد إلكتروني لتأكيد حالة طلبك وشحنه.",
          "لتقديم دعم العملاء والرد على الاستفسارات.",
          "لإرسال رسائل بريد إلكتروني ترويجية وأخبار (فقط إذا قمت بالاشتراك).",
          "لتحسين تصميم موقعنا، وعروض منتجاتنا، وخدمة العملاء."
        ]
      },
      {
        title: "3. مشاركة المعلومات",
        items: [
          "نحن لا نبيع أو نتاجر أو نؤجر معلومات الهوية الشخصية الخاصة بك للآخرين.",
          "قد نشارك معلومات ديموغرافية مجمعة عامة غير مرتبطة بأي معلومات هوية شخصية مع شركائنا التجاريين.",
          "قد نستخدم مزودي خدمات من أطراف ثالثة لمساعدتنا في تشغيل أعمالنا (مثل شركات الشحن، بوابات الدفع) وقد نشارك معلوماتك معهم لهذه الأغراض المحدودة."
        ]
      },
      {
        title: "4. أمان البيانات",
        items: [
          "نحن نتبنى ممارسات مناسبة لجمع البيانات وتخزينها ومعالجتها وتدابير أمنية للحماية من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف لمعلوماتك الشخصية.",
          "يتم تبادل البيانات الحساسة والخاصة بين الموقع ومستخدميه عبر قناة اتصال مؤمنة بـ SSL."
        ]
      },
      {
        title: "5. حقوقك",
        items: [
          "لديك الحق في طلب الوصول إلى البيانات الشخصية التي نحتفظ بها عنك.",
          "يمكنك طلب تصحيحات لأي بيانات غير دقيقة عبر لوحة تحكم حسابك أو عن طريق الاتصال بنا.",
          "يجوز لك طلب حذف حسابك والبيانات الشخصية المرتبطة به، رهناً بمتطلبات الاحتفاظ القانونية والمحاسبية."
        ]
      },
      {
        title: "6. التغييرات على هذه السياسة",
        items: [
          "يمتلك متجر لؤلؤة للأزياء الموحدة حرية تحديث سياسة الخصوصية هذه في أي وقت.",
          "عندما نقوم بذلك، سنقوم بمراجعة التاريخ المحدث في أسفل هذه الصفحة.",
          "نشجع المستخدمين على التحقق بشكل متكرر من هذه الصفحة لمعرفة أي تغييرات للبقاء على اطلاع دائم بكيفية مساعدتنا في حماية المعلومات الشخصية التي نجمعها."
        ]
      }
    ],
    contactTitle: "7. خيارات الاتصال",
    contactIntro: "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، أو ممارسات هذا الموقع، أو تعاملاتك مع هذا الموقع، يرجى الاتصال بنا على:",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
  }
};

export default function PrivacyPolicyPage() {
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
