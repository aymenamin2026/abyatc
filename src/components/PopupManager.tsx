"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getImageUrl } from '@/lib/api';

export default function PopupManager({ popups, settings }: { popups: any[], settings: any }) {
  const pathname = usePathname();
  const [queue, setQueue] = useState<any[]>([]);
  const [currentPopup, setCurrentPopup] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !popups || popups.length === 0) return;
    if (settings?.popups_active === 0) return;

    // Get cache
    let sessionCache: number[] = [];
    let everCache: number[] = [];
    try {
      sessionCache = JSON.parse(sessionStorage.getItem('displayed_popups_session') || '[]');
      everCache = JSON.parse(localStorage.getItem('displayed_popups_ever') || '[]');
    } catch (e) { }

    // Filter popups
    const isHomepage = pathname === '/' || pathname === '';

    let activePopups = popups.filter(p => {
      // 1. Check if it should show on this page
      let pageMatch = false;
      if (isHomepage && p.show_on_homepage) {
        pageMatch = true;
      }

      if (!pageMatch && p.show_on_pages && Array.isArray(p.show_on_pages)) {
        const pathNoSlash = pathname.replace(/^\//, '');
        for (let rule of p.show_on_pages) {
          rule = rule.trim().replace(/^\//, '');
          if (!rule) continue;
          if (rule === '*') { pageMatch = true; break; }
          const regexStr = '^' + rule.replace(/\*/g, '.*') + '$';
          const regex = new RegExp(regexStr);
          if (regex.test(pathNoSlash)) {
            pageMatch = true;
            break;
          }
        }
      }

      if (!pageMatch) return false;

      // 2. Check Display Rules
      if (p.display_rule === 'once_per_session' && sessionCache.includes(p.id)) {
        return false;
      }
      if (p.display_rule === 'once_ever' && everCache.includes(p.id)) {
        return false;
      }

      return true;
    });

    if (activePopups.length === 0) return;

    // Sort or Randomize
    const mode = settings?.popup_display_mode || 'sequential';
    if (mode === 'random') {
      activePopups = activePopups.sort(() => 0.5 - Math.random());
    } else {
      activePopups = activePopups.sort((a, b) => a.display_order - b.display_order);
    }

    setQueue(activePopups);

    // Tiny delay before popping the first one
    const timer = setTimeout(() => {
      showNext(activePopups);
    }, 1000);

    return () => clearTimeout(timer);
  }, [mounted, pathname, popups, settings]);

  const showNext = (currentQueue = queue) => {
    if (currentQueue.length === 0) {
      setIsOpen(false);
      setCurrentPopup(null);
      return;
    }

    const nextPopup = currentQueue[0];
    const newQueue = currentQueue.slice(1);

    setCurrentPopup(nextPopup);
    setQueue(newQueue);
    setIsOpen(true);

    // Save to cache
    if (nextPopup.display_rule === 'once_per_session') {
      const sessionCache = JSON.parse(sessionStorage.getItem('displayed_popups_session') || '[]');
      if (!sessionCache.includes(nextPopup.id)) {
        sessionStorage.setItem('displayed_popups_session', JSON.stringify([...sessionCache, nextPopup.id]));
      }
    } else if (nextPopup.display_rule === 'once_ever') {
      const everCache = JSON.parse(localStorage.getItem('displayed_popups_ever') || '[]');
      if (!everCache.includes(nextPopup.id)) {
        localStorage.setItem('displayed_popups_ever', JSON.stringify([...everCache, nextPopup.id]));
      }
    }
  };

  const closeCurrent = () => {
    setIsOpen(false);
    setTimeout(() => {
      showNext(queue);
    }, 400); // Wait for exit animation
  };

  if (!mounted || !currentPopup) return null;

  const isVideo = currentPopup.media_type === 'video';
  const isImage = currentPopup.media_type === 'image';
  const isYouTube = currentPopup.media_type === 'youtube';

  const formatYoutubeUrl = (url: string) => {
    if (!url) return '';
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}?autoplay=1&mute=1&loop=1`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const style = currentPopup.style || 'default';

  // 1. BOTTOM BANNER STYLE
  if (style === 'bottom_banner') {
    return (
      <div className={`fixed bottom-0 inset-x-0 z-[100] transition-all duration-500 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="bg-primary text-primary-foreground shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative">
          <button onClick={closeCurrent} className="absolute top-1/2 -translate-y-1/2 right-4 p-2 hover:bg-black/10 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="container mx-auto px-4 py-4 md:py-3 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 pr-12">
            <div className="text-center md:text-left flex-1">
              {currentPopup.title && <h3 className="font-bold text-lg">{currentPopup.title}</h3>}
              {currentPopup.content && (
                <p
                  className="text-sm opacity-90 mt-0.5"
                  dangerouslySetInnerHTML={{ __html: currentPopup.content }}
                />
              )}
            </div>
            {currentPopup.button_text && currentPopup.button_url && (
              <a href={currentPopup.button_url} className="shrink-0 bg-background text-foreground px-6 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-md">
                {currentPopup.button_text}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ALL OTHER MODAL STYLES (default, minimal, center_cover)
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={closeCurrent}></div>

      {style === 'minimal' && (
        <div className={`relative bg-background rounded-3xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col transition-all duration-500 transform ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
          <button onClick={closeCurrent} className="absolute top-4 right-4 z-20 bg-muted hover:bg-muted-foreground/20 text-foreground rounded-full p-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center w-full mt-2">
            {currentPopup.title && <h2 className="text-2xl font-serif font-bold text-foreground mb-4">{currentPopup.title}</h2>}
            {currentPopup.content && <div className="text-muted-foreground mb-8 text-sm leading-relaxed">{currentPopup.content}</div>}
            {currentPopup.button_text && currentPopup.button_url && (
              <a href={currentPopup.button_url} className="inline-flex justify-center flex-shrink-0 items-center px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold w-full hover:bg-primary/90 transition-all shadow-lg active:scale-95">
                {currentPopup.button_text}
              </a>
            )}
          </div>
        </div>
      )}

      {style === 'center_cover' && (
        <div className={`relative bg-black rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl min-h-[400px] flex flex-col transition-all duration-500 transform ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
          <button onClick={closeCurrent} className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-md transition-colors border border-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {currentPopup.media_type !== 'none' && (
            <div className="absolute inset-0 z-0">
              {isImage && <img src={getImageUrl(currentPopup.media_path)} alt="" className="absolute inset-0 w-full h-full object-cover" />}
              {isVideo && <video src={getImageUrl(currentPopup.media_path)} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover"></video>}
              {isYouTube && <iframe src={formatYoutubeUrl(currentPopup.media_url || currentPopup.media_path)} className="absolute inset-0 w-full h-full pointer-events-none scale-150" allow="autoplay; encrypted-media"></iframe>}
              <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>
          )}

          <div className="relative z-10 p-8 md:p-12 flex flex-col items-center justify-center text-center w-full h-full my-auto text-white">
            {currentPopup.title && <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 drop-shadow-lg">{currentPopup.title}</h2>}
            {currentPopup.content && <div className="mb-8 text-base md:text-lg text-gray-200 drop-shadow max-w-lg">{currentPopup.content}</div>}
            {currentPopup.button_text && currentPopup.button_url && (
              <a href={currentPopup.button_url} className="inline-flex justify-center items-center px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-all shadow-xl active:scale-95">
                {currentPopup.button_text}
              </a>
            )}
          </div>
        </div>
      )}

      {style === 'default' && (
        <div className={`relative bg-background rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row transition-all duration-500 transform ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
          <button onClick={closeCurrent} className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors border border-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {currentPopup.media_type !== 'none' && (
            <div className="w-full md:w-1/2 bg-muted relative min-h-[250px] md:min-h-[450px]">
              {isImage && <img src={getImageUrl(currentPopup.media_path)} alt="" className="absolute inset-0 w-full h-full object-cover" />}
              {isVideo && <video src={getImageUrl(currentPopup.media_path)} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover"></video>}
              {isYouTube && <iframe src={formatYoutubeUrl(currentPopup.media_url || currentPopup.media_path)} className="absolute inset-0 w-full h-full pointer-events-none scale-150" allow="autoplay; encrypted-media"></iframe>}
            </div>
          )}

          <div className={`p-8 md:p-12 flex flex-col justify-center w-full ${currentPopup.media_type !== 'none' ? 'md:w-1/2' : ''}`}>
            {currentPopup.title && <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-4 leading-tight">{currentPopup.title}</h2>}
            {currentPopup.content && <div className="text-muted-foreground mb-8 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{currentPopup.content}</div>}
            {currentPopup.button_text && currentPopup.button_url && (
              <a href={currentPopup.button_url} className="inline-flex justify-center items-center px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full w-full md:w-auto text-center hover:bg-primary/90 transition-all shadow-lg active:scale-95">
                {currentPopup.button_text}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
