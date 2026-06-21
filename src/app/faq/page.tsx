"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const content = {
  en: {
    heroTitle: "Frequently Asked Questions",
    heroSubtitle: "Abiyat Lamea Contracting Co.",
    intro: "Find answers to our most frequently asked questions about equipment rental below. If you need further assistance or would like to request a quote, please do not hesitate to contact us.",
    faqs: [
      {
        question: "Why choose Abiyat Lamea Company for equipment rental?",
        answer: "Because we provide a modern and diverse fleet of heavy equipment, with a full commitment to periodic maintenance and the highest safety standards, ensuring work continuity in your projects with high efficiency and minimal downtime."
      },
      {
        question: "What is the condition and quality of the equipment available for rent?",
        answer: "All our equipment is selected from the best global brands in the contracting sector. Each machine undergoes strict technical inspections and periodic maintenance before delivery to any work site to ensure the highest levels of performance and reliability."
      },
      {
        question: "Is your equipment suitable for different types of projects and sectors?",
        answer: "Yes, our fleet includes a wide and diverse range of heavy equipment that meets the needs of various sectors, including building and construction projects, infrastructure, roads, as well as logistical and industrial projects."
      },
      {
        question: "Do you guarantee the equipment's readiness for work upon arrival at the site?",
        answer: "Absolutely. We pay attention to the finest technical and operational details, and deliver the equipment to you fully equipped and ready for immediate operation to save your time and effort at the work site."
      },
      {
        question: "Do you commit to equipment delivery schedules?",
        answer: "We fully understand that time is a crucial factor in the success of contracting projects; therefore, we strictly commit to delivering equipment to work sites at the exact times agreed upon in the rental contract."
      },
      {
        question: "Do you provide technical support or maintenance during the rental period?",
        answer: "Yes, we provide continuous technical support throughout the rental period. In the event of any emergency breakdown, we dispatch a mobile maintenance team to handle the issue on-site, or we replace the equipment to ensure your project schedule is not affected."
      },
      {
        question: "Do you have experience in the Saudi market?",
        answer: "Yes, as a proud Saudi company, we deeply understand the requirements of the local contracting sector, occupational safety regulations, and the practical needs of work sites across the Kingdom."
      }
    ]
  },
  ar: {
    heroTitle: "الأسئلة الشائعة",
    heroSubtitle: "شركة لمعة ابيات للمقاولات",
    intro: "اعثر على إجابات لأسئلتنا الأكثر شيوعاً حول تأجير المعدات أدناه. إذا كنت بحاجة إلى مزيد من المساعدة أو طلب تسعيرة، فلا تتردد في الاتصال بنا.",
    faqs: [
      {
        question: "لماذا تختار شركة لمعة ابيات لتأجير المعدات؟",
        answer: "لأننا نوفر أسطولاً حديثاً ومتنوعاً من المعدات الثقيلة، مع التزام تام بالصيانة الدورية وأعلى معايير السلامة، لضمان استمرارية العمل في مشاريعك بكفاءة عالية وبأقل أوقات التوقف."
      },
      {
        question: "ما هي حالة وجودة المعدات المتوفرة للإيجار؟",
        answer: "جميع معداتنا مختارة من أفضل العلامات التجارية العالمية في قطاع المقاولات. تخضع كل معدة لفحوصات فنية وصيانة دورية صارمة قبل تسليمها لأي موقع عمل لضمان أعلى مستويات الأداء والموثوقية."
      },
      {
        question: "هل معداتكم مناسبة لمختلف أنواع المشاريع والقطاعات؟",
        answer: "نعم، يضم أسطولنا مجموعة واسعة ومتنوعة من المعدات الثقيلة التي تلبي احتياجات مختلف القطاعات، بما في ذلك مشاريع البناء والتشييد، البنية التحتية، الطرق، والمشاريع اللوجستية والصناعية."
      },
      {
        question: "هل تضمنون جاهزية المعدات للعمل فور وصولها للموقع؟",
        answer: "بالتأكيد. نحن نهتم بأدق التفاصيل الفنية والتشغيلية، ونسلمك المعدة مزودة بكافة التجهيزات اللازمة وجاهزة للتشغيل الفوري لتوفير وقتك وجهدك في موقع العمل."
      },
      {
        question: "هل تلتزمون بمواعيد تسليم المعدات؟",
        answer: "ندرك تماماً أن الوقت عامل حاسم في نجاح مشاريع المقاولات؛ لذا نلتزم التزاماً صارماً بتوصيل المعدات إلى مواقع العمل في المواعيد الدقيقة المتفق عليها في عقد التأجير."
      },
      {
        question: "هل تقدمون دعماً فنياً أو صيانة أثناء فترة التأجير؟",
        answer: "نعم، نوفر دعماً فنياً مستمراً طوال فترة الإيجار. في حال حدوث أي عطل طارئ، نقوم بإرسال فريق صيانة متنقل للتعامل مع المشكلة في الموقع، أو نقوم باستبدال المعدة لضمان عدم تأثر جدولك الزمني."
      },
      {
        question: "هل لديكم خبرة في السوق السعودي؟",
        answer: "نعم، بصفتنا شركة سعودية فخورة، فإننا نفهم بعمق متطلبات قطاع المقاولات المحلي، وأنظمة السلامة المهنية، والاحتياجات العملية لمواقع العمل في جميع أنحاء المملكة."
      }
    ]
  }
};

export default function FAQPage() {
  const { lang } = useLanguage();
  const text = content[lang as keyof typeof content];
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-lg text-center text-muted-foreground leading-relaxed mb-12">
            {text.intro}
          </p>

          <div className="space-y-4">
            {text.faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className={`border border-border rounded-xl overflow-hidden transition-colors duration-300 ${isOpen ? 'bg-secondary/10 border-primary/30' : 'bg-card hover:border-primary/20'}`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span className="font-serif text-lg sm:text-xl font-bold text-foreground w-[90%]">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-primary flex-shrink-0"
                    >
                      <ChevronDown className="w-6 h-6" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
