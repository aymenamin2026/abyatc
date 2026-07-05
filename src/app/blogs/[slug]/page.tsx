"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchArticleBySlug, getImageUrl, submitComment } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageSquare, Send, CornerDownRight, X, ShieldCheck, RefreshCw, User, Calendar } from "lucide-react";
import Script from "next/script";

export default function ArticleDetailPage() {
  const { lang } = useLanguage();
  const { user, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
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
      fetchArticleBySlug(params.slug as string).then(data => {
        if (!data) {
          router.push('/404');
        } else {
          setArticle(data);
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setCommentMessage("");

    try {
      const res = await submitComment(article.id, {
        comment: commentText,
        name: user ? undefined : name,
        email: user ? undefined : email,
        parent_id: replyingTo ? replyingTo.id : null,
        captcha_answer: captchaAnswer,
        captcha_question_id: mathCaptcha?.id,
        g_recaptcha_response: gRecaptchaResponse
      }, token);

      setCommentMessage(res.message);
      setCommentText("");
      setReplyingTo(null);
      setCaptchaAnswer("");
      setGRecaptchaResponse(null);
      if (!user) {
        setName("");
        setEmail("");
      }
    } catch (err: any) {
      setCommentMessage(err.message || "Failed to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!article) return null;

  const title = article.title?.[lang] || article.title?.en || article.title;
  const content = article.content?.[lang] || article.content?.en || article.content;
  const image = getImageUrl(article.image);
  const categoryName = article.category?.name?.[lang] || article.category?.name?.en || 'General';
  const authorName = article.author?.name?.[lang] || article.author?.name?.en || 'Admin';

  const allComments = article.comments || [];
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
          href="/blogs"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-4 py-2 rounded-full border border-border/40 backdrop-blur-sm mb-10 group"
        >
          {lang === 'ar' ? <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />}
          <span>{lang === 'en' ? 'Back to Blogs' : 'العودة للمدونة'}</span>
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
              <span>{article.published_at ? new Date(article.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium' }) : ''}</span>
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
        <div className="mt-20" id="comments-section">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span>{lang === 'en' ? 'Discussion' : 'النقاش والتعليقات'} <span className="text-primary font-sans text-xl ml-1">({allComments.length})</span></span>
          </h3>

          {/* نموذج كتابة تعليق جديد زجاجي فخم */}
          <div className="bg-card/40 backdrop-blur-xl border border-border/80 rounded-[24px] p-5 sm:p-8 shadow-xl relative overflow-hidden mb-14" id="comment-form">
            {/* 👈 فخامة: الخط المضيء العلوي أصبح يتدرج عبر لونك الأصفر الذهبي المميز */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#fbc70f]/40 to-transparent" />

            <h4 className="font-bold text-lg mb-5 text-foreground tracking-wide">
              {replyingTo ? (lang === 'en' ? `Reply to ${replyingTo.name}` : `الرد على ${replyingTo.name}`) : (lang === 'en' ? 'Leave a Comment' : 'شاركنا برأيك')}
            </h4>

            <form onSubmit={handleSubmitComment} className="space-y-4 relative z-10">
              {replyingTo && (
                // 👈 تعديل شارة الرد: ألوان متناسقة بالأصفر الفخم
                <div className="flex items-center justify-between bg-[#fbc70f]/10 px-4 py-2.5 rounded-xl border border-[#fbc70f]/20 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="text-foreground/80 flex items-center gap-2">
                    <CornerDownRight className="w-3.5 h-3.5 text-[#d8aa0d]" />
                    <span>{lang === 'en' ? 'Replying to' : 'جاري الرد على'} <span className="font-bold text-[#d8aa0d]">{replyingTo.name}</span></span>
                  </span>
                  <button type="button" onClick={() => setReplyingTo(null)} className="p-1 text-muted-foreground hover:text-rose-500 rounded-full hover:bg-muted transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder={lang === 'en' ? 'Your Name' : 'اسمك الكريم'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      // 👈 إضاءة الحقل عند التركيز أصبحت بلون الـ focus:ring-[#fbc70f]/30
                      className="w-full h-12 px-4 bg-muted/40 backdrop-blur-sm border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/30 focus:border-[#fbc70f]/50 text-foreground transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="email"
                      placeholder={lang === 'en' ? 'Your Email' : 'بريدك الإلكتروني'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      // 👈 إضاءة الحقل عند التركيز
                      className="w-full h-12 px-4 bg-muted/40 backdrop-blur-sm border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/30 focus:border-[#fbc70f]/50 text-foreground transition-all"
                    />
                  </div>
                </div>
              )}

              <textarea
                placeholder={lang === 'en' ? 'Type your thoughts beautifully here...' : 'اكتب تعليقك أو استفسارك هنا...'}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                rows={4}
                // 👈 إضاءة منطقة النص عند التركيز
                className="w-full p-4 bg-muted/40 backdrop-blur-sm border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/30 focus:border-[#fbc70f]/50 text-foreground resize-none transition-all leading-relaxed"
              ></textarea>

              {/* الكابتشا بتنسيق عصري وفخم */}
              {article.captcha_type !== 'none' && article.captcha_on_comments && (
                <div className="py-1">
                  {article.captcha_type === 'math' && mathCaptcha ? (
                    // 👈 الكابتشا الرياضية: خلفية صفراء ناعمة جداً مع حدود متناسقة وشعار كحلي
                    <div className="inline-flex items-center gap-4 bg-[#fbc70f]/5 p-3.5 px-4 rounded-xl border border-[#fbc70f]/20 shadow-inner">
                      <div className="flex items-center gap-2 text-sm text-[#093f89] font-bold">
                        <ShieldCheck className="w-4 h-4 text-[#d8aa0d]" />
                        <span className="font-sans">{mathCaptcha.question}</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="?"
                        className="w-16 h-9 px-2 bg-background border border-border rounded-lg text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/30 text-foreground"
                      />
                      <button
                        type="button"
                        onClick={refreshMathCaptcha}
                        disabled={fetchingCaptcha}
                        className="p-1.5 hover:bg-[#fbc70f]/10 rounded-lg text-[#093f89] transition-colors disabled:opacity-50"
                        title="Refresh Captcha"
                      >
                        <RefreshCw className={`w-4 h-4 ${fetchingCaptcha ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  ) : article.captcha_type === 'google' && (
                    <div className="flex flex-col gap-2">
                      <Script
                        src={`https://www.google.com/recaptcha/api.js?hl=${lang}`}
                        onLoad={() => {
                          const win = window as any;
                          if (win.grecaptcha) {
                            win.grecaptcha.render('recaptcha-main', {
                              'sitekey': article.recaptcha_site_key,
                              'callback': (response: string) => setGRecaptchaResponse(response),
                              'theme': 'dark'
                            });
                          }
                        }}
                      />
                      <div id="recaptcha-main" className="overflow-hidden rounded-xl border border-border/40 inline-block"></div>
                    </div>
                  )}
                </div>
              )}

              {/* 👈 زر الإرسال الفخم والمضمون: خلفية صفراء ثابتة، نص أسود، وتمرير ذكي ناعم */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 h-12 bg-[#fbc70f] text-black font-semibold text-sm rounded-xl hover:brightness-95 transition-all shadow-md shadow-[#fbc70f]/10 active:scale-[0.98] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? (lang === 'en' ? 'Posting...' : 'جاري النشر...') : (lang === 'en' ? 'Post Comment' : 'إرسال التعليق')}</span>
              </button>

              {commentMessage && (
                <p className={`text-xs font-semibold mt-2 px-3 py-2 rounded-lg inline-block ${commentMessage.includes('posted') || commentMessage.includes('Submitted') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                  {commentMessage}
                </p>
              )}
            </form>
          </div>

          {/* قائمة التعليقات السلسة والشجرية */}
          <div className="space-y-8">
            {comments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border/60 rounded-[24px] bg-card/10">
                <p className="text-muted-foreground text-sm font-medium">{lang === 'en' ? 'No comments yet. Be the first to start the conversation!' : 'لا توجد تعليقات بعد. شارك برأيك لتكون الأول!'}</p>
              </div>
            ) : (
              comments.map((cmt: any) => (
                <div key={cmt.id} className="space-y-4 group/item">

                  {/* كارد التعليق الأساسي الفاخر */}
                  <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[22px] p-5 sm:p-6 shadow-sm hover:border-primary/20 transition-all duration-300 flex flex-col relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-bold text-foreground text-sm flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20 shadow-sm">
                          {(cmt.user?.first_name?.[0] || cmt.name?.[0] || 'G').toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-foreground font-semibold">{cmt.user ? `${cmt.user.first_name || ''} ${cmt.user.last_name || ''}`.trim() : cmt.name}</span>
                          <span className="text-[10px] text-muted-foreground font-normal mt-0.5">{formatTimeAgo(cmt.created_at)}</span>
                        </div>
                      </div>

                      {/* تاريخ تفصيلي أنيق عند الماوس */}
                      <div className="relative group/time flex items-center">
                        <div className="absolute opacity-0 group-hover/time:opacity-100 transition-opacity duration-200 bg-foreground text-background text-[10px] px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none z-10 bottom-full end-0 mb-2 font-medium">
                          {new Date(cmt.created_at).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>

                    <p className="text-foreground/90 text-sm leading-relaxed mb-4 pl-0 sm:pl-10">
                      {cmt.comment}
                    </p>

                    <button
                      onClick={() => {
                        if (inlineReplyId === cmt.id) {
                          setInlineReplyId(null);
                          setReplyingTo(null);
                        } else {
                          setInlineReplyId(cmt.id);
                          setReplyingTo({ id: cmt.id, name: cmt.user ? cmt.user.first_name : cmt.name });
                        }
                      }}
                      className="text-xs text-primary font-bold hover:underline self-start flex items-center gap-1.5 sm:ml-10 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/10 transition-colors"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Reply' : 'رد سريع'}</span>
                    </button>

                    {/* نموذج الرد المضمن الأنيق */}
                    {inlineReplyId === cmt.id && (
                      <div className="mt-4 sm:ml-10 p-4 sm:p-5 bg-background/80 border border-border rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <textarea
                          placeholder={lang === 'en' ? 'Write your reply...' : 'اكتب ردك المباشر هنا...'}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          required
                          rows={3}
                          className="w-full p-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none transition-all leading-relaxed"
                        ></textarea>

                        {!user && (
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder={lang === 'en' ? 'Name' : 'اسمك'}
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="w-full h-10 px-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                            />
                            <input
                              type="email"
                              placeholder={lang === 'en' ? 'Email' : 'بريدك'}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="w-full h-10 px-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                            />
                          </div>
                        )}

                        {/* الكابتشا داخل الرد */}
                        {article.captcha_type !== 'none' && article.captcha_on_replies && (
                          <div className="py-1">
                            {article.captcha_type === 'math' && mathCaptcha ? (
                              <div className="inline-flex items-center gap-3 bg-primary/5 p-2 px-3 rounded-lg border border-primary/10 text-xs">
                                <div className="flex items-center gap-1.5 text-primary font-bold">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span className="font-sans">{mathCaptcha.question}</span>
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={captchaAnswer}
                                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                                  placeholder="?"
                                  className="w-14 h-8 bg-background border border-border rounded-md text-center font-bold text-xs text-foreground"
                                />
                                <button
                                  type="button"
                                  onClick={refreshMathCaptcha}
                                  disabled={fetchingCaptcha}
                                  className="p-1 hover:bg-primary/10 rounded-md text-primary transition-colors disabled:opacity-50"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${fetchingCaptcha ? 'animate-spin' : ''}`} />
                                </button>
                              </div>
                            ) : article.captcha_type === 'google' && (
                              <div className="scale-90 origin-left">
                                <Script
                                  src={`https://www.google.com/recaptcha/api.js?hl=${lang}`}
                                  onLoad={() => {
                                    const win = window as any;
                                    if (win.grecaptcha) {
                                      win.grecaptcha.render(`recaptcha-reply-${cmt.id}`, {
                                        'sitekey': article.recaptcha_site_key,
                                        'callback': (response: string) => setGRecaptchaResponse(response),
                                        'theme': 'dark'
                                      });
                                    }
                                  }}
                                />
                                <div id={`recaptcha-reply-${cmt.id}`} className="rounded-lg overflow-hidden border border-border/40 inline-block"></div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => { setInlineReplyId(null); setReplyingTo(null); }} className="px-4 h-9 text-xs font-semibold border border-border hover:bg-muted rounded-xl text-muted-foreground transition-colors">
                            {lang === 'en' ? 'Cancel' : 'إلغاء'}
                          </button>
                          <button type="button" onClick={handleSubmitComment} disabled={isSubmitting} className="px-4 h-9 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-sm transition-all">
                            {isSubmitting ? '...' : (lang === 'en' ? 'Post Reply' : 'إرسال الرد')}
                          </button>
                        </div>

                        {commentMessage && (
                          <p className={`text-xs font-medium mt-1 ${commentMessage.includes('posted') || commentMessage.includes('Submitted') ? 'text-green-500' : 'text-rose-500'}`}>
                            {commentMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* شجرة الردود الفرعية المنسقة جداً */}
                  {cmt.replies && cmt.replies.length > 0 && (
                    <div className="ms-6 md:ms-12 space-y-4 border-s-2 border-primary/20 ps-4 md:ps-6 transition-all">
                      {cmt.replies.map((reply: any) => (
                        <div key={reply.id} className="bg-muted/30 border border-border/40 rounded-[18px] p-4 flex flex-col hover:border-border transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-semibold text-foreground text-xs flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/20">
                                {(reply.user?.first_name?.[0] || reply.name?.[0] || 'G').toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-foreground/90 font-bold">{reply.user ? `${reply.user.first_name || ''} ${reply.user.last_name || ''}`.trim() : reply.name}</span>
                                <span className="text-[9px] text-muted-foreground font-normal mt-0.5">{formatTimeAgo(reply.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-foreground/80 text-sm leading-relaxed pl-8">
                            {reply.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}