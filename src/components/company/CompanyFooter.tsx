"use client";

import { useCompanyLanguage } from "@/lib/company/LanguageContext";

export default function CompanyFooter() {
  const { t } = useCompanyLanguage();

  return (
    <footer className="hh-footer">
      <div className="hh-container">
        <div className="hh-footer-grid">
          <div>
            <h4>주식회사 하이홍화토</h4>
            <p>{t.footer_desc}</p>
          </div>
          <div>
            <h5>{t.f_contact}</h5>
            <p>Tel: 02-000-0000</p>
            <p>Email: recruit@haihonghwato.com</p>
          </div>
          <div>
            <h5>{t.f_hours}</h5>
            <p>Mon - Fri (09:00 - 18:00)</p>
          </div>
        </div>
        <div className="hh-footer-bottom">
          <div>&copy; {new Date().getFullYear()} HAIHONG HWATO Co., Ltd. All Rights Reserved.</div>
          <div style={{ fontSize: "0.82rem" }}>Official Website & Career Portal</div>
        </div>
      </div>
    </footer>
  );
}
