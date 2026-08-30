"use client";

import { useCompanyLanguage } from "@/lib/company/LanguageContext";
import { businessPillars } from "@/data/company/business";

export default function BusinessGrid() {
  const { t } = useCompanyLanguage();

  return (
    <section className="hh-section-pad hh-container">
      <div className="hh-section-header">
        <span className="hh-sec-tag">{t.biz_tag}</span>
        <h2 className="hh-sec-title">{t.biz_title}</h2>
      </div>

      <div className="hh-biz-grid">
        {businessPillars.map((biz) => (
          <div className="hh-biz-card" key={biz.titleKey}>
            <div className="hh-biz-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={biz.image} alt={t[biz.titleKey]} className="hh-biz-img" />
            </div>
            <div className="hh-biz-content">
              <h3 className="hh-biz-title">{t[biz.titleKey]}</h3>
              <p className="hh-biz-desc">{t[biz.descKey]}</p>
              <div className="hh-biz-tags">
                {biz.tags.map((tag) => (
                  <span className="hh-biz-tag-pill" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
