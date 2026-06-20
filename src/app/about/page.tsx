"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";
import { Award, Briefcase, Target, Building2, CheckCircle2 } from "lucide-react";

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

    <div className="flex flex-col min-h-screen bg-white text-slate-900 overflow-hidden">


      <section className="pt-32 pb-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest">
            {text.badge}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-slate-900">
            {text.heroTitle}
          </h1>
          <p className="text-xl text-blue-600 font-semibold tracking-wide">{text.heroSubtitle}</p>
        </motion.div>
      </section>


      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {text.features.map((f, i) => (
            <div
              key={i}
              className="group relative p-[1px] rounded-[32px] bg-transparent hover:bg-gradient-to-tr from-cyan-400 via-blue-500 to-cyan-400 transition-all duration-500"
            >
              {/* هذا الـ div هو الذي سيعطي تأثير الإطار الدوار عند التحويم */}
              <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow bg-gradient-to-tr from-cyan-400 via-blue-500 to-cyan-400 blur-sm" />

              {/* البطاقة الداخلية */}
              <div className="relative p-8 bg-white rounded-[31px] h-full shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-blue-700 transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 pb-32 px-4 max-w-4xl mx-auto">
        <div className="bg-slate-50 border border-slate-100 p-10 rounded-[32px] space-y-8 text-lg leading-relaxed text-slate-600">
          {text.paragraphs.map((p, i) => (
            <p key={i} className={i === text.paragraphs.length - 1 ? "text-2xl font-serif text-blue-700 font-bold text-center pt-8" : ""}>
              {p}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}