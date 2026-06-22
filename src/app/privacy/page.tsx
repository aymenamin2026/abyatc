"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/api";

const content = {
  en: {
    heroTitle: "Privacy Policy",
    heroSubtitle: "Lamea Abyat Contracting Company",
    intro: "Welcome to the website of Lamea Abyat Contracting Company. We respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit our website, and our practices for collecting, using, maintaining, protecting, and disclosing that information.",
    sections: [
      {
        title: "1. Information We Collect",
        items: [
          "Personal Contact Information: (Name, email, phone number, work site locations, or equipment delivery addresses) provided during requests for price quotes, contract conclusions, or account registration.",
          "Payment Details: Processed securely via third-party gateways (we do not directly store credit card numbers or bank accounts).",
          "Browsing Data: Such as IP addresses, browser types, and interaction logs through cookies and tracking tools to improve the platform's user experience."
        ]
      },
      {
        title: "2. How We Use Your Information",
        items: [
          "To process and fulfill rental or purchase requests, including sending booking confirmations, contract details, and equipment delivery schedules to work sites.",
          "To provide technical support, customer service, and to respond to inquiries related to equipment and projects.",
          "To send important updates and special offers related to the contracting sector (only if you have subscribed to receive them).",
          "To improve our website design and expand our equipment fleet based on market demands and customer requirements."
        ]
      },
      {
        title: "3. Information Sharing",
        items: [
          "We do not sell, trade, or rent your personally identifiable information to any third parties.",
          "We may share generic, aggregated demographic information not linked to any personally identifiable information with our strategic partners.",
          "We may use third-party service providers to help us operate our business (such as logistics companies specialized in heavy equipment, or electronic payment gateways), and we may share your information with them strictly to the extent necessary to fulfill your order."
        ]
      },
      {
        title: "4. Data Security",
        items: [
          "We adopt strict technical and administrative practices for data collection, storage, and processing, along with robust security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information and contracts.",
          "Sensitive and private data exchange between the website and its users occurs over a secured communication channel encrypted with an SSL protocol."
        ]
      },
      {
        title: "5. Your Rights",
        items: [
          "You have the right to request access to the personal data we hold about you and your project history with us.",
          "You can request the correction or update of any inaccurate data via your account dashboard or by contacting us directly.",
          "You may request the deletion of your account and associated data, subject to legal and accounting retention requirements for commercial contracts."
        ]
      },
      {
        title: "6. Changes to This Policy",
        items: [
          "The management of Lamat Abyat Contracting Company reserves the right to update this privacy policy at any time to align with technical or regulatory updates.",
          "When any update occurs, we will revise the updated date at the bottom of this page.",
          "We encourage our clients to review this page periodically to stay informed about how we protect their information."
        ]
      }
    ],
    contactTitle: "7. Contact Us",
    contactIntro: "If you have any questions about this Privacy Policy, the practices of our site, or details regarding contracts and equipment, please contact us at:",
    emailLabel: "Email",
    phoneLabel: "Phone",
  },
  ar: {
    heroTitle: "سياسة الخصوصية",
    heroSubtitle: "شركة لمعة ابيات للمقاولات",
    intro: "مرحباً بكم في الموقع الإلكتروني لشركة لمعة أبيات للمقاولات. نحن نقدر خصوصيتك ونلتزم بحمايتها من خلال امتثالنا لهذه السياسة. تصف هذه السياسة أنواع المعلومات التي قد نجمعها منك أو التي قد تقدمها عند زيارتك لموقعنا الإلكتروني، وممارساتنا في جمع تلك المعلومات واستخدامها والمحافظة عليها وحمايتها والإفصاح عنها.",
    sections: [
      {
        title: "1. المعلومات التي نجمعها",
        items: [
          "معلومات الاتصال الشخصية: (الاسم، البريد الإلكتروني، رقم الهاتف، مواقع العمل أو عناوين تسليم المعدات) المقدمة أثناء طلب عروض الأسعار، إبرام العقود، أو تسجيل الحساب.",
          "تفاصيل الدفع: التي تتم معالجتها بشكل آمن عبر بوابات طرف ثالث (نحن لا نخزن أرقام بطاقات الائتمان أو الحسابات البنكية المباشرة).",
          "بيانات التصفح: مثل عناوين IP، وأنواع المتصفحات، وسجلات التفاعل من خلال ملفات تعريف الارتباط وأدوات التتبع لتحسين تجربة استخدام المنصة."
        ]
      },
      {
        title: "2. كيف نستخدم معلوماتك",
        items: [
          "لمعالجة طلبات التأجير أو الشراء والوفاء بها، بما في ذلك إرسال رسائل تأكيد الحجز، تفاصيل العقود، ومواعيد تسليم المعدات إلى مواقع العمل.",
          "لتقديم الدعم الفني، وخدمة العملاء، والرد على الاستفسارات المتعلقة بالمعدات والمشاريع.",
          "إلرسال التحديثات الهامة، والعروض الخاصة بقطاع المقاولات (فقط إذا قمت بالاشتراك).",
          "لتحسين تصميم موقعنا، وتوسيع أسطول المعدات بناءً على متطلبات السوق وعملائنا."
        ]
      },
      {
        title: "3. مشاركة المعلومات",
        items: [
          "نحن لا نبيع أو نتاجر أو نؤجر معلومات الهوية الشخصية الخاصة بك لأي جهات خارجية.",
          "قد نشارك معلومات ديموغرافية مجمعة عامة غير مرتبطة بأي معلومات هوية شخصية مع شركائنا الاستراتيجيين.",
          "قد نستخدم مزودي خدمات من أطراف ثالثة لمساعدتنا في تشغيل أعمالنا (مثل شركات النقل اللوجستي المتخصصة بالمعدات الثقيلة، أو بوابات الدفع الإلكتروني) وقد نشارك معلوماتك معهم في حدود ما تقتضيه مصلحة العمل لإتمام طلبك."
        ]
      },
      {
        title: "4. أمان البيانات",
        items: [
          "نحن نتبنى ممارسات تقنية وإدارية صارمة لجمع البيانات وتخزينها ومعالجتها، وتدابير أمنية للحماية من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف لمعلوماتك الشخصية وعقودك.",
          "يتم تبادل البيانات الحساسة والخاصة بين الموقع ومستخدميه عبر قنوات اتصال مشفرة ومؤمنة ببروتوكول SSL."
        ]
      },
      {
        title: "5. حقوقك",
        items: [
          "لديك الحق في طلب الوصول إلى البيانات الشخصية التي نحتفظ بها عنك وعن سجل مشاريعك معنا.",
          "يمكنك طلب تصحيح أو تحديث لأي بيانات غير دقيقة عبر لوحة تحكم حسابك أو عن طريق التواصل المباشر معنا.",
          "يجوز لك طلب حذف حسابك والبيانات المرتبطة به، رهناً بمتطلبات الاحتفاظ القانونية والمحاسبية الخاصة بالعقود التجارية."
        ]
      },
      {
        title: "6. التغييرات على هذه السياسة",
        items: [
          "تمتلك إدارة شركة لمعة ابيات للمقاولات الحق في تحديث سياسة الخصوصية هذه في أي وقت لتتوافق مع التحديثات التقنية أو التنظيمية.",
          "عند حدوث أي تحديث، سنقوم بتعديل تاريخ المراجعة في أسفل هذه الصفحة.",
          "نشجع عملاءنا على مراجعة هذه الصفحة بشكل دوري للبقاء على اطلاع دائم بكيفية حمايتنا لمعلوماتهم."
        ]
      }
    ],
    contactTitle: "7. خيارات الاتصال",
    contactIntro: "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، أو ممارسات موقعنا، أو تفاصيل العقود والمعدات، يرجى التواصل معنا عبر:",
    emailLabel: "البريد الإلكتروني: alrwnyhsn505@gmail.com",
    phoneLabel: "الهاتف: 0536060450",
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
    <div className="flex flex-col min-h-screen pt-32">
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
