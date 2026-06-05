"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const content = {
  en: {
    heroTitle: "Frequently Asked Questions",
    heroSubtitle: "Lulu’a Uniforms",
    intro: "Find answers to our most common questions below. If you need further assistance, feel free to contact us.",
    faqs: [
      {
        question: "Why Choose Lulu’a Uniforms?",
        answer: "We are a Saudi brand specialized in designing and supplying uniforms with a high level of professionalism, combining elegance, quality, and practical comfort."
      },
      {
        question: "What is the quality of the materials used?",
        answer: "We use high-quality materials designed to withstand daily use, with excellent color durability and practical cuts that last long."
      },
      {
        question: "Are the designs suitable for different sectors?",
        answer: "Yes, we provide integrated uniform solutions serving multiple sectors including hospitality, hotels, restaurants, reception, companies, and offices."
      },
      {
        question: "Do you pay attention to execution details?",
        answer: "Absolutely. We pay close attention to the finest details such as cuts, color durability, and ease of care, ensuring our clients receive a product worthy of their name."
      },
      {
        question: "Do you commit to delivery timelines?",
        answer: "Yes, at Lulu’a Uniforms, we are committed to credibility, precision in execution, and strict respect for time and delivery schedules."
      },
      {
        question: "Do you provide after-sales service?",
        answer: "Yes, we strive to build long-term partnerships by delivering a reliable experience and high-standard products backed by dedicated support and an easy return/exchange policy."
      },
      {
        question: "Do you have experience in the Saudi market?",
        answer: "Yes, as a proud Saudi brand, we deeply understand local requirements, culture, and practical needs in the workplace across the Kingdom."
      }
    ]
  },
  ar: {
    heroTitle: "الأسئلة الشائعة",
    heroSubtitle: "لؤلؤة للأزياء الموحدة",
    intro: "اعثر على إجابات لأسئلتنا الأكثر شيوعاً أدناه. إذا كنت بحاجة إلى مزيد من المساعدة، فلا تتردد في الاتصال بنا.",
    faqs: [
      {
        question: "لماذا تختار لؤلؤة للأزياء الموحدة؟",
        answer: "نحن علامة تجارية سعودية متخصصة في تصميم وتوريد الأزياء الموحدة بمستوى عالٍ من الاحترافية، مع الجمع بين الأناقة والجودة والراحة العملية."
      },
      {
        question: "ما هي جودة الخامات المستخدمة؟",
        answer: "نستخدم خامات عالية الجودة مصممة لتحمل الاستخدام اليومي، مع ثبات ممتاز للألوان وقصات عملية تدوم طويلاً."
      },
      {
        question: "هل التصاميم مناسبة لقطاعات مختلفة؟",
        answer: "نعم، نقدم حلولاً متكاملة للأزياء الموحدة تخدم قطاعات متعددة تشمل الضيافة، الفنادق، المطاعم، الاستقبال، الشركات والمكاتب."
      },
      {
        question: "هل تهتمون بتفاصيل التنفيذ؟",
        answer: "بكل تأكيد. نولي اهتماماً دقيقاً لأدق التفاصيل مثل القصات، ثبات الألوان، وسهولة العناية، مما يضمن حصول عملائنا على منتج يليق باسمهم."
      },
      {
        question: "هل تلتزمون بمواعيد التسليم؟",
        answer: "نعم، في لؤلؤة للأزياء الموحدة، نلتزم بالمصداقية والدقة في التنفيذ واحترام الوقت وجداول التسليم الصارمة."
      },
      {
        question: "هل تقدمون خدمات ما بعد البيع؟",
        answer: "نعم، نسعى لبناء شراكات طويلة الأمد من خلال تقديم تجربة موثوقة ومنتجات ذات معايير عالية مدعومة بدعم مخصص وسياسة استرجاع/استبدال سهلة."
      },
      {
        question: "هل لديكم خبرة في السوق السعودي؟",
        answer: "نعم، بصفتنا علامة تجارية سعودية فخورة، فإننا نفهم بعمق المتطلبات المحلية والثقافة والاحتياجات العملية في بيئة العمل في جميع أنحاء المملكة."
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
