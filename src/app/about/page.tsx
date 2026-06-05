"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, Headset, CreditCard } from "lucide-react";

const content = {
  en: {
    heroTitle: "About Us",
    heroSubtitle: "Lulu’a Uniforms",
    features: [
      {
        icon: Truck,
        title: "Free Shipping",
        desc: "Free shipping on orders over 250 SAR",
      },
      {
        icon: ShieldCheck,
        title: "Money-Back Guarantee",
        desc: "From 5 to 14 business days",
      },
      {
        icon: Headset,
        title: "Online Support",
        desc: "24 hours a day, 7 days a week",
      },
      {
        icon: CreditCard,
        title: "Flexible Payment",
        desc: "Pay using multiple credit cards",
      },
    ],
    paragraphs: [
      "At Lulu’a Uniforms, we are a Saudi brand specialized in designing and supplying uniforms with a high level of professionalism. We believe that a uniform is not just clothing, but an identity that reflects the image of an organization and strengthens the first impression.",
      "We provide integrated uniform solutions serving multiple sectors including hospitality, hotels, restaurants, reception, companies, and offices, while consistently combining elegance, quality, and practical comfort.",
      "We use carefully selected materials and well-studied designs suited for the work environment, paying close attention to the finest details such as cuts, color durability, and ease of care, ensuring our clients receive a product worthy of their name and aligned with their daily needs.",
      "At Lulu’a Uniforms, we are committed to credibility, precision in execution, and respect for time. We strive to build long-term partnerships by delivering a reliable experience and high-standard products.",
      "Lulu’a Uniforms… Because a professional appearance makes the difference.",
    ],
  },
  ar: {
    heroTitle: "من نحن",
    heroSubtitle: "لؤلؤة للأزياء الموحدة",
    features: [
      {
        icon: Truck,
        title: "شحن مجاني",
        desc: "شحن مجاني للطلبات أكثر من ٢٥٠ ريال",
      },
      {
        icon: ShieldCheck,
        title: "ضمان استرجاع الأموال",
        desc: "من ٥ إلى ١٤ يوم عمل",
      },
      {
        icon: Headset,
        title: "دعم عبر الإنترنت",
        desc: "٢٤ ساعة في اليوم، ٧ أيام في الأسبوع",
      },
      {
        icon: CreditCard,
        title: "دفع مرن",
        desc: "الدفع عبر بطاقات ائتمان متعددة",
      },
    ],
    paragraphs: [
      "في لؤلؤة للأزياء الموحدة، نحن علامة تجارية سعودية متخصصة في تصميم وتوريد الأزياء الموحدة بمستوى عالٍ من الاحترافية. نؤمن بأن الزي الموحد ليس مجرد ملابس، بل هو هوية تعكس صورة المؤسسة وتعزز الانطباع الأول.",
      "نقدم حلولاً متكاملة للأزياء الموحدة تخدم قطاعات متعددة تشمل الضيافة، الفنادق، المطاعم، الاستقبال، الشركات والمكاتب، مع الجمع بشكل دائم بين الأناقة والجودة والراحة العملية.",
      "نستخدم خامات مختارة بعناية وتصاميم مدروسة تتناسب مع بيئة العمل، مع إعطاء اهتمام دقيق لأدق التفاصيل مثل القصات، ثبات الألوان، وسهولة العناية، مما يضمن حصول عملائنا على منتج يليق باسمهم ويتماشى مع احتياجاتهم اليومية.",
      "في لؤلؤة للأزياء الموحدة، نلتزم بالمصداقية والدقة في التنفيذ واحترام الوقت. نسعى لبناء شراكات طويلة الأمد من خلال تقديم تجربة موثوقة ومنتجات ذات معايير عالية.",
      "لؤلؤة للأزياء الموحدة... لأن المظهر الاحترافي يصنع الفرق.",
    ],
  },
};

export default function AboutPage() {
  const { lang } = useLanguage();
  const text = content[lang as keyof typeof content];

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
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4"
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

      {/* Features Values Section */}
      <section className="bg-card py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {text.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-6 sm:space-y-8 text-lg sm:text-xl text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {text.paragraphs.map((p, index) => (
              <p key={index} className={index === text.paragraphs.length - 1 ? 'font-serif text-2xl text-foreground text-center mt-12 font-semibold' : ''}>
                {p}
              </p>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
