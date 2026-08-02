"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchPopups } from "@/lib/api";

const PopupManager = dynamic(() => import("./PopupManager"), {
  ssr: false,
  loading: () => null,
});

const WhatsAppFloat = dynamic(() => import("./WhatsAppFloat"), {
  ssr: false,
  loading: () => null,
});

const PwaPrompt = dynamic(() => import("./PwaPrompt"), {
  ssr: false,
  loading: () => null,
});

export default function DeferredClientUI({ settings }: { settings: any }) {
  const [ready, setReady] = useState(false);
  const [popups, setPopups] = useState<any[]>([]);

  useEffect(() => {
    // هذه الأدوات لا تدخل في المسار الحرج للرسم الأول.
    const timer = window.setTimeout(() => setReady(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;

    let active = true;
    fetchPopups()
      .then((items) => {
        if (active && Array.isArray(items)) setPopups(items);
      })
      .catch(() => {
        if (active) setPopups([]);
      });

    return () => {
      active = false;
    };
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      {popups.length > 0 && <PopupManager popups={popups} settings={settings} />}
      <WhatsAppFloat settings={settings} />
      <PwaPrompt />
    </>
  );
}
