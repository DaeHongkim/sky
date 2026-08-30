"use client";

import Link from "next/link";
import { useCompanyLanguage } from "@/lib/company/LanguageContext";

export default function HeroSection() {
  const { t } = useCompanyLanguage();

  return (
    <section className="hh-hero-section">
      <video className="hh-hero-video-bg" autoPlay muted loop playsInline>
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-architecture-and-interior-41551-large.mp4"
          type="video/mp4"
        />
      </video>
      <div className="hh-hero-overlay" />

      <div className="hh-container hh-hero-content">
        <div className="hh-hero-badge">
          <span>✨</span> <span>{t.hero_badge}</span>
        </div>
        <h1 className="hh-hero-title">
          {t.hero_title_main}
          <br />
          <span className="hh-highlight">{t.hero_title_highlight}</span>
        </h1>
        <p className="hh-hero-desc">{t.hero_desc}</p>
        <div className="hh-hero-btn-group">
          <Link href="/company/recruit" className="hh-btn-hero-main">
            <span>{t.hero_btn_rec}</span> <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
