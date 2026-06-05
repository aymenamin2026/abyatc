"use client";

import React, { createContext, useContext, ReactNode } from "react";

type LanguageContextType = {
  lang: "en" | "ar";
};

const LanguageContext = createContext<LanguageContextType>({ lang: "en" });

export function LanguageProvider({
  children,
  lang,
}: {
  children: ReactNode;
  lang: "en" | "ar";
}) {
  return (
    <LanguageContext.Provider value={{ lang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
