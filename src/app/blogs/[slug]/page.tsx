"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchArticleBySlug, getImageUrl, submitComment } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageSquare, Send, CornerDownRight, X, ShieldCheck, RefreshCw } from "lucide-react";
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    <div className="flex flex-col min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline mb-8">
          {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {lang === 'en' ? 'Back to Blogs' : 'العودة للمدونة'}
        </Link>

        {image && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-[21/9] rounded-2xl overflow-hidden mb-8 bg-muted shadow-lg"
          >
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.jpg'; }}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              {categoryName}
            </span>
            <span>{authorName}</span>
            <span>•</span>
            <span>{article.published_at ? new Date(article.published_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : ''}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {title}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none mt-10 text-muted-foreground leading-relaxed whitespace-pre-line border-b border-border pb-10"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* --- Comments Section --- */}
        <div className="mt-16" id="comments-section">
          <h3 className="font-serif text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>{lang === 'en' ? 'Comments' : 'التعليقات'} ({allComments.length})</span>
          </h3>

          {/* Comment Form */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-12" id="comment-form">
            <h4 className="font-semibold text-lg mb-4 text-foreground">
              {replyingTo ? (lang === 'en' ? `Reply to ${replyingTo.name}` : `الرد على ${replyingTo.name}`) : (lang === 'en' ? 'Leave a Comment' : 'اترك تعليقاً')}
            </h4>
            
            <form onSubmit={handleSubmitComment} className="space-y-4">
              {replyingTo && (
                <div className="flex items-center justify-between bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 text-xs">
                  <span className="text-slate-300 flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3 text-primary" />
                    <span>{lang === 'en' ? 'Replying to' : 'جاري الرد على'} <span className="font-bold text-primary">{replyingTo.name}</span></span>
                  </span>
                  <button type="button" onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {!user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'Your Name' : 'اسمك'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-11 px-4 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="email"
                    placeholder={lang === 'en' ? 'Your Email' : 'بريدك الإلكتروني'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 px-4 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

                <textarea
                placeholder={lang === 'en' ? 'Write your comment here...' : 'اكتب تعليقك هنا...'}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                rows={4}
                className="w-full p-4 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              ></textarea>

              {/* Captcha - Main Comment */}
              {article.captcha_type !== 'none' && article.captcha_on_comments && (
                <div className="py-2">
                  {article.captcha_type === 'math' && mathCaptcha ? (
                    <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <ShieldCheck className="w-5 h-5" />
                        <span>{mathCaptcha.question}</span>
                      </div>
                      <input 
                        type="text" 
                        required 
                        value={captchaAnswer} 
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="?"
                        className="w-20 h-10 px-3 bg-card border border-border rounded-lg text-center font-bold focus:ring-2 focus:ring-primary/20"
                      />
                      <button 
                        type="button" 
                        onClick={refreshMathCaptcha}
                        disabled={fetchingCaptcha}
                        className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors disabled:opacity-50"
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
                              'sitekey' : article.recaptcha_site_key,
                              'callback' : (response: string) => setGRecaptchaResponse(response),
                              'theme': 'dark'
                            });
                          }
                        }}
                      />
                      <div id="recaptcha-main"></div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 h-11 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? (lang === 'en' ? 'Posting...' : 'جاري الإرسال...') : (lang === 'en' ? 'Post Comment' : 'نشر التعليق')}</span>
              </button>

              {commentMessage && (
                <p className={`text-sm font-medium mt-2 ${commentMessage.includes('posted') || commentMessage.includes('Submitted') ? 'text-green-600' : 'text-rose-600'}`}>
                  {commentMessage}
                </p>
              )}
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">{lang === 'en' ? 'No comments yet. Be the first!' : 'لا توجد تعليقات بعد. كن أول من يعلق!'}</p>
            ) : (
              comments.map((cmt: any) => (
                <div key={cmt.id} className="space-y-4">
                  {/* Parent Comment */}
                  <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-bold text-foreground text-sm flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                           {(cmt.user?.first_name?.[0] || cmt.name?.[0] || 'G').toUpperCase()}
                         </div>
                         <span>{cmt.user ? `${cmt.user.first_name || ''} ${cmt.user.last_name || ''}`.trim() : cmt.name}</span>
                      </div>
                      <div className="relative group flex items-center">
                        <span className="text-[11px] text-muted-foreground cursor-help">
                          {formatTimeAgo(cmt.created_at)}
                        </span>
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/90 backdrop-blur-md text-white text-[10px] px-2 py-1.5 rounded-lg shadow-2xl border border-white/10 whitespace-nowrap pointer-events-none z-10 bottom-full left-1/2 -translate-x-1/2 mb-2">
                          {new Date(cmt.created_at).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950/90"></div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
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
                      className="text-xs text-primary font-medium hover:underline self-start flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      <span>{lang === 'en' ? 'Reply' : 'رد'}</span>
                    </button>

                    {/* Inline Response Form node */}
                    {inlineReplyId === cmt.id && (
                      <div className="mt-4 p-4 bg-card border border-border rounded-xl space-y-3">
                        <textarea
                          placeholder={lang === 'en' ? 'Write your reply...' : 'اكتب ردك هنا...'}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          required
                          rows={3}
                          className="w-full p-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        ></textarea>
                        
                        {!user && (
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder={lang === 'en' ? 'Name' : 'اسمك'}
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="w-full h-9 px-3 bg-muted border border-border rounded-xl text-xs focus:outline-none"
                            />
                            <input
                              type="email"
                              placeholder={lang === 'en' ? 'Email' : 'بريدك'}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="w-full h-9 px-3 bg-muted border border-border rounded-xl text-xs focus:outline-none"
                            />
                          </div>
                        )}

                        {/* Captcha - Reply */}
                        {article.captcha_type !== 'none' && article.captcha_on_replies && (
                          <div className="py-2">
                            {article.captcha_type === 'math' && mathCaptcha ? (
                              <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10 text-xs">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>{mathCaptcha.question}</span>
                                </div>
                                <input 
                                  type="text" 
                                  required 
                                  value={captchaAnswer} 
                                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                                  placeholder="?"
                                  className="w-16 h-8 bg-card border border-border rounded-lg text-center font-bold focus:ring-2 focus:ring-primary/20"
                                />
                                <button 
                                  type="button" 
                                  onClick={refreshMathCaptcha}
                                  disabled={fetchingCaptcha}
                                  className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors disabled:opacity-50"
                                  title="Refresh Captcha"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${fetchingCaptcha ? 'animate-spin' : ''}`} />
                                </button>
                              </div>
                            ) : article.captcha_type === 'google' && (
                              <div className="flex flex-col gap-2 scale-90 origin-left">
                                <Script 
                                  src={`https://www.google.com/recaptcha/api.js?hl=${lang}`}
                                  onLoad={() => {
                                    const win = window as any;
                                    if (win.grecaptcha) {
                                      win.grecaptcha.render(`recaptcha-reply-${cmt.id}`, {
                                        'sitekey' : article.recaptcha_site_key,
                                        'callback' : (response: string) => setGRecaptchaResponse(response),
                                        'theme': 'dark'
                                      });
                                    }
                                  }}
                                />
                                <div id={`recaptcha-reply-${cmt.id}`}></div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => { setInlineReplyId(null); setReplyingTo(null); }} className="px-3 h-8 text-xs border border-border hover:bg-muted rounded-lg text-muted-foreground">
                            {lang === 'en' ? 'Cancel' : 'إلغاء'}
                          </button>
                          <button type="button" onClick={handleSubmitComment} disabled={isSubmitting} className="px-3 h-8 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                            {isSubmitting ? '...' : (lang === 'en' ? 'Post Reply' : 'إرسال')}
                          </button>
                        </div>

                        {commentMessage && (
                          <p className={`text-xs font-medium mt-1 ${commentMessage.includes('posted') || commentMessage.includes('Submitted') ? 'text-green-600' : 'text-rose-600'}`}>
                            {commentMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Nested Replies */}
                  {cmt.replies && cmt.replies.length > 0 && (
                    <div className="ms-8 md:ms-12 space-y-3 border-s border-border/60 ps-4 md:ps-6">
                      {cmt.replies.map((reply: any) => (
                        <div key={reply.id} className="bg-muted/15 border border-border/30 rounded-xl p-4 flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-semibold text-foreground text-xs flex items-center gap-2">
                               <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
                                 {(reply.user?.first_name?.[0] || reply.name?.[0] || 'G').toUpperCase()}
                               </div>
                               <span>{reply.user ? `${reply.user.first_name || ''} ${reply.user.last_name || ''}`.trim() : reply.name}</span>
                            </div>
                            <div className="relative group flex items-center">
                              <span className="text-[10px] text-slate-500 cursor-help">
                                {formatTimeAgo(reply.created_at)}
                              </span>
                              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/90 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded-md shadow-2xl border border-white/5 whitespace-nowrap pointer-events-none z-10 bottom-full left-1/2 -translate-x-1/2 mb-1.5">
                                {new Date(reply.created_at).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950/90"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed">
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
