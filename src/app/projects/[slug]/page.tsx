"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProjectBySlug, getImageUrl, submitComment } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageSquare, Send, CornerDownRight, X, ShieldCheck, RefreshCw, User, Calendar } from "lucide-react";
import Script from "next/script";

export default function ProjectDetailPage() {
  const { lang } = useLanguage();
  const { user, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Comment States
  const [commentText, setCommentText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);
  const [inlineReplyId, setInlineReplyId] = useState<number | null>(null);

  // Captcha States
  const [mathCaptcha, setMathCaptcha] = useState<{ question: string; id: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [gRecaptchaResponse, setGRecaptchaResponse] = useState<string | null>(null);
  const [fetchingCaptcha, setFetchingCaptcha] = useState(false);

  const refreshMathCaptcha = async () => {
    setFetchingCaptcha(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/captcha/math`, {
        headers: {
          'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
          'X-SECRET-KEY': process.env.NEXT_PUBLIC_SECRET_KEY || '',
        }
      });
      const data = await res.json();
      setMathCaptcha({ question: data.question, id: data.question_id });
      setCaptchaAnswer("");
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingCaptcha(false);
    }
  };

  useEffect(() => {
    if (params.slug) {
      fetchProjectBySlug(params.slug as string).then(data => {
        if (!data) {
          router.push('/404');
        } else {
          setProject(data);
          if (data.captcha_type === 'math') {
            setMathCaptcha({ question: data.captcha_question, id: data.captcha_question_id });
          }
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [params.slug]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return lang === 'en' ? 'just now' : 'الآن';
    } else if (diffInMinutes === 1) {
      return lang === 'en' ? '1 min ago' : 'قبل دقيقة';
    } else if (diffInMinutes < 60) {
      return lang === 'en' ? `${diffInMinutes} mins ago` : `قبل ${diffInMinutes} دقيقة`;
    } else if (diffInHours === 1) {
      return lang === 'en' ? '1 hr ago' : 'قبل ساعة';
    } else if (diffInHours < 24) {
      return lang === 'en' ? `${diffInHours} hrs ago` : `قبل ${diffInHours} ساعة`;
    } else if (diffInDays === 1) {
      return lang === 'en' ? 'yesterday' : 'أمس';
    } else if (diffInDays < 7) {
      return lang === 'en' ? `${diffInDays} days ago` : `قبل ${diffInDays} يوم`;
    } else {
      return past.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US');
    }
  };

  // const handleSubmitComment = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!commentText.trim()) return;

  //   setIsSubmitting(true);
  //   setCommentMessage("");

  //   try {
  //     const res = await submitComment(project.id, {
  //       comment: commentText,
  //       name: user ? undefined : name,
  //       email: user ? undefined : email,
  //       parent_id: replyingTo ? replyingTo.id : null,
  //       captcha_answer: captchaAnswer,
  //       captcha_question_id: mathCaptcha?.id,
  //       g_recaptcha_response: gRecaptchaResponse
  //     }, token);

  //     setCommentMessage(res.message);
  //     setCommentText("");
  //     setReplyingTo(null);
  //     setCaptchaAnswer("");
  //     setGRecaptchaResponse(null);
  //     if (!user) {
  //       setName("");
  //       setEmail("");
  //     }
  //   } catch (err: any) {
  //     setCommentMessage(err.message || "Failed to submit comment");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 bg-background">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const title = project.title?.[lang] || project.title?.en || project.title;
  const content = project.content?.[lang] || project.content?.en || project.content;
  const image = getImageUrl(project.image);
  const categoryName = project.category?.name?.[lang] || project.category?.name?.en || 'General';
  const authorName = project.author?.name?.[lang] || project.author?.name?.en || 'Admin';

  const allComments = project.comments || [];
  const parentComments = allComments.filter((cmt: any) => !cmt.parent_id);
  const comments = parentComments.map((parent: any) => ({
    ...parent,
    replies: allComments.filter((cmt: any) => cmt.parent_id === parent.id)
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">

      {/* BACKGROUND AMBIENT LAYERS - لضمان نفس روح الأنيميشن الفخم */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 blur-[130px] rounded-full" />
        <div className="absolute top-[50%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/15 blur-[130px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.015] bg-[url('/noise.png')]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full relative z-10">

        {/* زر العودة الذكي */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-4 py-2 rounded-full border border-border/40 backdrop-blur-sm mb-10 group"
        >
          {lang === 'ar' ? <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />}
          <span>{lang === 'en' ? 'Back to Our Project' : 'العودة الئ مشاريعنا'}</span>
        </Link>

        {/* غلاف المقال عائم وسينمائي */}
        {image && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="aspect-[21/10] md:aspect-[21/9] rounded-[32px] overflow-hidden mb-10 bg-muted shadow-2xl border border-border/50 relative group"
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.02] transition-transform duration-1000 ease-out"
              onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.jpg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </motion.div>
        )}

        {/* تفاصيل العنوان والبيانات التعريفية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-5"
        >
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-muted-foreground">
            {/* 👈 تعديل الشارة: خلفية صفراء خفيفة، حدود صفراء، ونص ذهبي داكن فخم */}
            <span className="bg-[#fbc70f]/10 text-[#d8aa0d] border border-[#fbc70f]/20 px-3.5 py-1 rounded-full font-bold tracking-wide uppercase">
              {categoryName}
            </span>
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1 rounded-full border border-border/30">
              {/* 👈 تعديل أيقونة الكاتب لتصبح كحلية فخمة لتتناسق مع البراند */}
              <User className="w-3.5 h-3.5 text-[#093f89]/70" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1 rounded-full border border-border/30">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span>{project.published_at ? new Date(project.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium' }) : ''}</span>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-[1.2] tracking-tight">
            {title}
          </h1>
        </motion.div>

        {/* محتوى المقال الفاخر */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="prose prose-base sm:prose-lg dark:prose-invert max-w-none mt-12 text-foreground/80 leading-relaxed whitespace-pre-line border-b border-border/60 pb-12 font-normal tracking-wide
            prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground
            prose-p:mb-6 prose-a:text-primary hover:prose-a:underline
            prose-strong:text-foreground prose-strong:font-bold"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* ================= SECTION COMMENTS (GLASSMORPHISM STYLE) ================= */}

      </div>
    </div>
  );
}