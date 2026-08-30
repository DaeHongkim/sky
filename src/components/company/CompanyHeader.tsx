"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCompanyLanguage } from "@/lib/company/LanguageContext";
import { COMPANY_LANG_FLAGS, COMPANY_LANG_LABELS, CompanyLang } from "@/lib/company/i18n";

const LANGS: CompanyLang[] = ["ko", "en", "cn", "jp", "vn", "id"];

export default function CompanyHeader() {
  const pathname = usePathname();
  const { lang, setLang, t } = useCompanyLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const isRecruit = pathname?.startsWith("/company/recruit");

  return (
    <header className="hh-navbar">
      <div className="hh-container hh-nav-container">
        <Link href="/company" className="hh-brand-logo">
          <div className="hh-brand-symbol">H</div>
          <div className="hh-brand-name">
            하이홍화토 <span>HAIHONG HWATO</span>
          </div>
        </Link>

        <ul className="hh-nav-menu">
          <li>
            <Link href="/company" className={`hh-nav-link ${!isRecruit ? "hh-active" : ""}`}>
              {t.nav_home}
            </Link>
          </li>
          <li>
            <Link
              href="/company/recruit"
              className={`hh-nav-link ${isRecruit ? "hh-active" : ""}`}
              style={{ color: "var(--hh-red)", fontWeight: 800 }}
            >
              {t.nav_recruit}
            </Link>
          </li>
        </ul>

        <div className="hh-nav-actions">
          <div className="hh-lang-select-box">
            <button
              type="button"
              className="hh-lang-btn"
              onClick={() => setMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            >
              🌐 <span>{COMPANY_LANG_LABELS[lang]}</span> ▾
            </button>
            <div className={`hh-lang-menu ${menuOpen ? "hh-show" : ""}`}>
              {LANGS.map((l) => (
                <div
                  key={l}
                  className={`hh-lang-item ${lang === l ? "hh-active" : ""}`}
                  onMouseDown={() => {
                    setLang(l);
                    setMenuOpen(false);
                  }}
                >
                  {COMPANY_LANG_FLAGS[l]} {COMPANY_LANG_LABELS[l]}
                </div>
              ))}
            </div>
          </div>
          <Link href="/company/recruit" className="hh-btn-hero-main hh-btn-sm">
            ✈️ <span>{t.top_apply_btn}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
