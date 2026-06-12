"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, Headset, CreditCard, Award } from "lucide-react";

const content = {
  en: {
    heroTitle: "About Us",
    heroSubtitle: "Lulu’a Uniforms",
    badge: "👑 Saudi Premium Quality",
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
    badge: "👑 فخامة وجودة سعودية",
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
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden relative">
      
      {/* ================= BACKGROUND AMBIENT GLOWS (توهج سماوي وبنفسجي واضح ومميز) ================= */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full" />
        <div className="absolute top-[15%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/20 blur-[110px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-20%] w-[500px] h-[500px] bg-cyan-500/15 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.015] bg-[url('/noise.png')]" />
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden z-10">
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md text-primary text-xs font-bold tracking-wide"
          >
            {text.badge}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70"
          >
            {text.heroTitle}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-2xl text-primary font-bold tracking-wide uppercase font-sans"
          >
            {text.heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* ================= FEATURES VALUES SECTION (GLASSMORPHIC CARDS) ================= */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {text.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="flex flex-col items-center text-center p-6 sm:p-8 bg-card/40 backdrop-blur-xl border border-border/60 rounded-[24px] shadow-sm hover:shadow-2xl hover:border-cyan-500/30 hover:shadow-cyan-500/5 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 text-primary border border-primary/20 shadow-sm relative group-hover:scale-105 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 tracking-wide">{feature.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed opacity-90">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT STORYTELLING ================= */}
      <section className="relative py-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10">
        <div className="space-y-8 text-base sm:text-lg text-foreground/85 leading-relaxed text-justify relative">
          
          {/* كارد خلفي ممتد لإعطاء مظهر متناسق ومستقر للنصوص البراجرافات */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-card/20 backdrop-blur-md border border-border/40 p-6 sm:p-10 rounded-[32px] shadow-inner space-y-6 sm:space-y-8"
          >
            {text.paragraphs.map((p, index) => {
              const isLast = index === text.paragraphs.length - 1;
              
              if (isLast) {
                return (
                  <motion.div 
                    key={index}
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative p-6 mt-12 bg-gradient-to-r from-primary/10 via-cyan-500/5 to-primary/10 border border-primary/20 rounded-2xl text-center shadow-md overflow-hidden group"
                  >
                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-cyan-500/10 blur-xl rounded-full" />
                    <Award className="w-6 h-6 text-primary mx-auto mb-3 animate-pulse" />
                    <p className="font-serif text-xl sm:text-2xl text-foreground font-extrabold tracking-wide">
                      {p}
                    </p>
                  </motion.div>
                );
              }

              return (
                <p key={index} className="leading-relaxed hover:text-foreground transition-colors duration-200">
                  {p}
                </p>
              );
            })}
          </motion.div>

        </div>
      </section>

    </div>
  );
}