"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { COMPANY_DICT, CompanyDict, CompanyLang } from "./i18n";

interface LanguageContextValue {
  lang: CompanyLang;
  setLang: (lang: CompanyLang) => void;
  t: CompanyDict;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<CompanyLang>("ko");

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: COMPANY_DICT[lang] }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useCompanyLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useCompanyLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
