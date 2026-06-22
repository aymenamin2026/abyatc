"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/api";

const content = {
  en: {
    heroTitle: "Terms of Service",
    heroSubtitle: "Lamea Abyat Contracting Company",
    intro: "Welcome to the website of Lamea Abyat Contracting Company. By using this website or completing any rental or contracting process through it, you fully agree to the Terms of Use outlined below. If you do not agree, please do not use the website.",
    sections: [
      {
        title: "1. Definitions",
        introText: "",
        items: [
          "The Company / The Website: Lamea Abyat Contracting Company.",
          "The Client / The User: Any person or entity (individual or company) who uses the website or requests the rental of equipment or services.",
          "Equipment and Services: All heavy equipment offered solely for rental, and the related contracting services available on the website."
        ]
      },
      {
        title: "2. Eligibility",
        introText: "",
        items: [
          "The user must be 18 years of age or older and possess the legal capacity to enter into commercial contracts.",
          "The user must provide accurate and correct information upon registration, or when requesting price quotes and concluding rental contracts."
        ]
      },
      {
        title: "3. Account and Information",
        introText: "",
        items: [
          "The user is responsible for maintaining the confidentiality of their account information.",
          "The Company is not liable for any unauthorized use of the account resulting from the user's negligence.",
          "The Company reserves the right to suspend or cancel the account if it suspects a violation of the terms."
        ]
      },
      {
        title: "4. Orders and Payment (Rental and Service Contracts)",
        introText: "",
        items: [
          "All rental requests are subject to equipment availability and the approval of the Company's management.",
          "The Company reserves the right to reject or cancel any rental request or contract for a legitimate reason (such as equipment unavailability or safety-related concerns).",
          "The prices displayed or provided in quotes include Value Added Tax (VAT) unless otherwise stated.",
          "Payments are processed according to the payment terms agreed upon in the rental contract, whether through bank transfers or approved electronic payment gateways."
        ]
      },
      {
        title: "5. Transportation and Equipment Delivery",
        introText: "",
        items: [
          "Rented equipment is transported and delivered to the work sites specified by the client in the contract.",
          "Delivery times vary depending on the project location and the nature of the requested equipment.",
          "The Company is not liable for delays beyond its control caused by force majeure circumstances during transportation."
        ]
      },
      {
        title: "6. Cancellation and Modification of Rented Equipment",
        introText: "",
        items: [
          "Cancellation of rental requests or replacement of equipment on-site is subject to the Company's policy and the terms of the contract concluded between the two parties.",
          "Please review the cancellation details and terms attached to the price quote or contract prior to final approval."
        ]
      },
      {
        title: "7. Intellectual Property",
        introText: "",
        items: [
          "All website content (texts, equipment images, logos, designs) is owned by Lamat Abyat Contracting Company.",
          "Copying or reusing any content without prior written permission is strictly prohibited."
        ]
      },
      {
        title: "8. Improper Use",
        introText: "",
        items: [
          "Using the website or rented equipment for illegal purposes is prohibited, including:",
          "Violating laws, regulations, or occupational safety rules in the Kingdom of Saudi Arabia.",
          "Attempting to hack the website or manipulate its systems.",
          "Providing misleading or incorrect information regarding the nature of the project or the work site for renting the equipment."
        ]
      },
      {
        title: "9. Limitation of Liability",
        introText: "",
        items: [
          "The Company is not liable for any indirect damages or losses resulting from the misuse of the website.",
          "The Company's financial liability is strictly limited to the value of the service or rented equipment in accordance with the concluded contract."
        ]
      },
      {
        title: "10. Amendments to the Terms",
        introText: "",
        items: [
          "Lamat Abyat Contracting Company reserves the right to amend the terms of use at any time. Updates will be published on this page, and continued use of the website constitutes implicit acceptance of these changes."
        ]
      },
      {
        title: "11. Governing Law",
        introText: "",
        items: [
          "These terms are governed by and construed in accordance with the applicable laws and regulations in the Kingdom of Saudi Arabia."
        ]
      }
    ],
    contactTitle: "12. Contact Us",
    contactIntro: "For any inquiries regarding the terms of use or equipment rental contracts:",
    emailLabel: "Email",
    phoneLabel: "Phone",
  },
  ar: {
    heroTitle: "شروط الخدمة",
    heroSubtitle: "شركة لمعة ابيات للمقاولات ",
    intro: "مرحباً بكم في الموقع الإلكتروني لشركة لمعة أبيات للمقاولات. باستخدام هذا الموقع أو إتمام أي عملية تأجير أو تعاقد من خلاله، فإنك توافق تماماً على شروط الاستخدام الموضحة أدناه. إذا كنت لا توافق، يرجى عدم استخدام الموقع.",
    sections: [
      {
        title: "1. التعاريف",
        items: [
          "الشركة / الموقع: شركة لمعة ابيات للمقاولات.",
          "العميل / المستخدم: أي شخص أو جهة (فرد أو شركة) يستخدم الموقع أو يقوم بطلب استئجار معدات أو خدمات.",
          "المعدات والخدمات: جميع المعدات الثقيلة المعروضة للتأجير فقط، وخدمات المقاولات المرتبطة بها في الموقع."
        ]
      },
      {
        title: "2. الأهلية",
        items: [
          "يجب أن يكون المستخدم بالغاً من العمر 18 عاماً أو أكثر، ويمتلك الأهلية القانونية لإبرام العقود التجارية.",
          "يجب على المستخدم تقديم معلومات دقيقة وصحيحة عند التسجيل، أو عند طلب عروض الأسعار وإبرام عقود التأجير."
        ]
      },
      {
        title: "3. الحساب والمعلومات",
        items: [
          "يتحمل المستخدم مسؤولية الحفاظ على سرية معلومات حسابه.",
          "الشركة غير مسؤولة عن أي استخدام غير مصرح به للحساب نتيجة إهمال المستخدم.",
          "يحق للشركة تعليق أو إلغاء الحساب إذا اشتبهت في حدوث انتهاك للشروط."
        ]
      },
      {
        title: "4. الطلبات والدفع (عقود التأجير والخدمات)",
        items: [
          "تخضع جميع طلبات التأجير لتوفر المعدات وموافقة إدارة الشركة.",
          "يحق للشركة رفض أو إلغاء أي طلب تأجير أو عقد لسبب مشروع (مثل عدم توفر المعدة أو أسباب تتعلق بالسلامة).",
          "الأسعار المعروضة أو المقدمة في عروض الأسعار تشمل ضريبة القيمة المضافة ما لم يُنص على خلاف ذلك.",
          "تتم معالجة المدفوعات وفقاً لشروط الدفع المتفق عليها في عقد التأجير، سواء عبر الحوالات البنكية أو بوابات الدفع الإلكترونية المعتمدة."
        ]
      },
      {
        title: "5. النقل وتسليم المعدات",
        items: [
          "يتم نقل وتسليم المعدات المستأجرة إلى مواقع العمل التي يحددها العميل في العقد.",
          "تختلف أوقات التسليم حسب موقع المشروع وطبيعة المعدة المطلوبة.",
          "الشركة غير مسؤولة عن التأخير الخارج عن إرادتها والذي قد تتسبب فيه ظروف قاهرة أثناء النقل."
        ]
      },
      {
        title: "6. الإلغاء وتغيير المعدات المستأجرة",
        items: [
          "يخضع إلغاء طلبات التأجير أو استبدال المعدات في الموقع لسياسة الشركة وشروط العقد المبرم بين الطرفين.",
          "يرجى مراجعة تفاصيل وشروط الإلغاء المرفقة مع عرض السعر أو العقد قبل الاعتماد النهائي."
        ]
      },
      {
        title: "7. الملكية الفكرية",
        items: [
          "جميع محتويات الموقع (نصوص، صور للمعدات، شعارات، تصاميم) مملوكة لشركة لمعة ابيات للمقاولات.",
          "يُمنع نسخ أو إعادة استخدام أي محتوى دون إذن كتابي مسبق."
        ]
      },
      {
        title: "8. الاستخدام غير السليم",
        introText: "يُحظر استخدام الموقع أو المعدات المؤجرة لأغراض غير قانونية، بما في ذلك:",
        items: [
          "انتهاك القوانين أو اللوائح أو أنظمة السلامة المهنية في المملكة العربية السعودية.",
          "محاولة اختراق الموقع أو التلاعب بأنظمته.",
          "تقديم معلومات مضللة أو غير صحيحة حول طبيعة المشروع أو موقع العمل لتأجير المعدة."
        ]
      },
      {
        title: "9. حدود المسؤولية",
        items: [
          "الشركة غير مسؤولة عن أي أضرار أو خسائر غير مباشرة ناتجة عن سوء استخدام الموقع.",
          "تقتصر مسؤولية الشركة المادية على قيمة الخدمة أو المعدة المؤجرة وفقاً للعقد المبرم فقط."
        ]
      },
      {
        title: "10. تعديلات على الشروط",
        items: [
          "تحتفظ شركة لمعة ابيات للمقاولات بالحق في تعديل شروط الاستخدام في أي وقت. سيتم نشر التحديثات على هذه الصفحة، واستمرار استخدام الموقع يعتبر قبولاً ضمنياً لهذه التغييرات."
        ]
      },
      {
        title: "11. القانون الحاكم",
        items: [
          "تخضع هذه الشروط وتُفسر وفقاً للأنظمة والقوانين المعمول بها في المملكة العربية السعودية."
        ]
      }
    ],
    contactTitle: "12. اتصل بنا",
    contactIntro: "لأي استفسارات تتعلق بشروط الاستخدام أو عقود تأجير المعدات:",
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