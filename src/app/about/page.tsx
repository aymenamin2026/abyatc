"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { Award, Briefcase, Target, CheckCircle2 } from "lucide-react";

const content = {
  en: {
    heroTitle: "About Us",
    heroSubtitle: "Lamea Abyat Contracting",
    badge: "🏗️ Excellence in Construction",
    features: [
      { icon: Award, title: "Quality", desc: "Highest standards in every project stage." },
      { icon: CheckCircle2, title: "Commitment", desc: "On-time and on-budget delivery." },
      { icon: Briefcase, title: "Professionalism", desc: "Expert team, highly trained efficiency." },
      { icon: Target, title: "Innovation", desc: "Solutions that enhance project value." },
    ],
    paragraphs: [
      "Lamea Abyat Company was established in the city of Riyadh, and it is a company specialized in the fields of contracting, construction and building. The company provides its services to diverse sectors including residential, commercial, and government projects.",
      "With an experienced and efficient team, Lamea Abyat strives to provide integrated construction solutions with the highest quality standards. We commit to executing projects according to schedule and taking into account the agreed budget, ensuring the satisfaction of our clients.",
      "Our vision is to be the leading contracting company in the Kingdom of Saudi Arabia through innovation and high quality in the implementation of projects.",
      "Our mission is providing integrated construction services that meet the aspirations of our customers, and contribute to the development of the Kingdom's infrastructure, with a focus on quality and sustainability.",
      "Lamea Abyat Contracting… Building the future with excellence.",
    ],
  },
  ar: {
    heroTitle: "من نحن",
    heroSubtitle: "شركة لمعة أبيات للمقاولات",
    badge: "🏗️ التميز في التشييد والبناء",
    features: [
      { icon: Award, title: "الجودة", desc: "نلتزم بأعلى معايير الجودة في كل مرحلة." },
      { icon: CheckCircle2, title: "الالتزام", desc: "تنفيذ المشاريع وفق الجداول والميزانية." },
      { icon: Briefcase, title: "الاحترافية", desc: "فريق عمل محترف ومدرب بأعلى كفاءة." },
      { icon: Target, title: "الابتكار", desc: "نقدم حلولاً مبتكرة تعزز قيمة المشاريع." },
    ],
    paragraphs: [
      "تأسست شركة لمعة أبيات في مدينة الرياض، وهي شركة متخصصة في مجالات المقاولات والتشييد والبناء. تقدم الشركة خدماتها لقطاعات متنوعة تشمل المشاريع السكنية، التجارية، والحكومية.",
      "مع فريق عمل ذو خبرة وكفاءة، تسعى شركة لمعة أبيات للمقاولات لتقديم حلول بناء متكاملة بأعلى معايير الجودة. نلتزم بتنفيذ المشاريع وفقاً للجدول الزمني المحدد مع مراعاة الميزانية المتفق عليها، مما يضمن رضا عملائنا.",
      "رؤيتنا: أن نكون الشركة الرائدة في مجال المقاولات في المملكة العربية السعودية من خلال الابتكار والجودة العالية في تنفيذ المشاريع.",
      "رسالتنا: تقديم خدمات بناء متكاملة تلبي تطلعات عملائنا، وتساهم في تطوير البنية التحتية للمملكة، مع التركيز على الجودة والاستدامة.",
      "شركة لمعة أبيات للمقاولات... نبني المستقبل بإتقان.",
    ],
  },
};

export default function AboutPage() {
  const { lang } = useLanguage();
  const text = content[lang as keyof typeof content];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500">

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
            {text.badge}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            {text.heroTitle}
          </h1>
          <p className="text-xl text-primary font-medium tracking-wide">{text.heroSubtitle}</p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {text.features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="group relative p-6 bg-card border border-border/50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Content Section with Glassmorphism */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-10 md:p-16 rounded-[40px] shadow-2xl space-y-8">
          {text.paragraphs.map((p, i) => (
            <p
              key={i}
              className={`text-lg leading-relaxed ${i === text.paragraphs.length - 1
                  ? "text-2xl font-serif text-primary font-bold text-center pt-8 border-t border-primary/20"
                  : "text-muted-foreground"
                }`}
            >
              {p}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}