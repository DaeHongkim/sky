"use client";

import { useState } from "react";
import { useCompanyLanguage } from "@/lib/company/LanguageContext";
import { jobOpenings, positionOptions, defaultPosition } from "@/data/company/jobs";

export default function RecruitContent() {
  const { t } = useCompanyLanguage();

  const [position, setPosition] = useState<string>(defaultPosition);
  const [name, setName] = useState("김대홍");
  const [birth, setBirth] = useState("1992-03-15");
  const [phone, setPhone] = useState("010-1234-5678");
  const [email, setEmail] = useState("daehong@example.com");
  const [coverLetter, setCoverLetter] = useState(
    "경인일주의 도전적 실행력과 데이터 기반 전략 기획 역량을 바탕으로, 하이홍화토 그룹의 글로벌 HR 및 비즈니스 확장 가속화에 기여하고자 지원했습니다. 철저한 현장 밀착형 솔루션을 통해 탁월한 성과를 창출하겠습니다."
  );
  const [photo, setPhoto] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSend() {
    if (!name || !email) {
      alert("성함과 이메일을 입력해 주세요.");
      return;
    }
    setModalOpen(true);
  }

  return (
    <div className="hh-recruit-page">
      <div className="hh-container">
        <div className="hh-recruit-banner">
          <div>
            <span style={{ color: "#ff9f68", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "1px" }}>
              {t.rec_banner_tag}
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, marginTop: 6 }}>{t.rec_banner_title}</h2>
            <p style={{ color: "#b2aba0", fontSize: "0.95rem", marginTop: 6 }}>{t.rec_banner_desc}</p>
          </div>
          <a href="#hh-workspace" className="hh-btn-hero-main">
            <span>{t.rec_banner_btn}</span> <span>↓</span>
          </a>
          <a href="/recruit" className="hh-btn-hero-main" style={{ background: "transparent", border: "1px solid rgba(255,159,104,0.5)" }}>
            <span>HIHONG RECRUIT 플랫폼</span> <span>→</span>
          </a>
        </div>

        <div className="hh-job-list-grid">
          {jobOpenings.map((job) => (
            <button
              key={job.position}
              type="button"
              className={`hh-job-card ${position === job.position ? "hh-active" : ""}`}
              onClick={() => setPosition(job.position)}
            >
              <div>
                <span className="hh-job-badge">{job.badge}</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 6 }}>{job.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "#b2aba0" }}>{job.desc}</p>
              </div>
              <div style={{ marginTop: 16, fontSize: "0.8rem", color: "#ff9f68", fontWeight: 700 }}>
                ▸ 지원하기
              </div>
            </button>
          ))}
        </div>

        <div id="hh-workspace" className="hh-recruit-workspace">
          {/* Form */}
          <div className="hh-form-panel">
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: 16, color: "#ff9f68" }}>
              📝 {t.form_head}
            </h3>

            <div className="hh-form-group">
              <label className="hh-form-label">{t.lbl_photo}</label>
              <input type="file" className="hh-form-input" accept="image/*" onChange={handlePhotoUpload} />
            </div>

            <div className="hh-form-group">
              <label className="hh-form-label">{t.lbl_position}</label>
              <select
                className="hh-form-select"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                {positionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="hh-form-row">
              <div className="hh-form-group">
                <label className="hh-form-label">{t.lbl_name}</label>
                <input
                  type="text"
                  className="hh-form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="hh-form-group">
                <label className="hh-form-label">{t.lbl_birth}</label>
                <input
                  type="date"
                  className="hh-form-input"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="hh-form-row">
              <div className="hh-form-group">
                <label className="hh-form-label">{t.lbl_phone}</label>
                <input
                  type="tel"
                  className="hh-form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="hh-form-group">
                <label className="hh-form-label">{t.lbl_email}</label>
                <input
                  type="email"
                  className="hh-form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="hh-form-group">
              <label className="hh-form-label">{t.lbl_cover}</label>
              <textarea
                className="hh-form-textarea"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="hh-preview-panel">
            <div className="hh-resume-paper">
              <div className="hh-resume-header">
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div className="hh-resume-photo-box">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="Profile" />
                    ) : (
                      <span>[사진 등록]</span>
                    )}
                  </div>
                  <div>
                    <div className="hh-resume-name">{name || "-"}</div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--hh-red)", marginTop: 2 }}>
                      지원부문: {position}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.78rem", color: "#666" }}>
                  <div>📞 {phone || "-"}</div>
                  <div>✉️ {email || "-"}</div>
                  <div>🎂 {birth || "-"}</div>
                </div>
              </div>

              <div className="hh-resume-sec-title">{t.sec_edu}</div>
              <table className="hh-resume-table" style={{ marginBottom: 12 }}>
                <tbody>
                  <tr>
                    <th>학력</th>
                    <td>한국대학교 경영학과 졸업 (2015.02)</td>
                  </tr>
                  <tr>
                    <th>경력</th>
                    <td>하이비즈니스 코퍼레이션 브랜드 전략 파트장 (2018-2023)</td>
                  </tr>
                </tbody>
              </table>

              <div className="hh-resume-sec-title">{t.sec_cover}</div>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#444", fontSize: "0.84rem" }}>
                {coverLetter || "-"}
              </div>
            </div>

            <div className="hh-action-buttons-wrap">
              <button type="button" className="hh-btn-action-submit" onClick={handleSend}>
                ✈️ <span>{t.btn_send}</span>
              </button>
              <button type="button" className="hh-btn-action-print" onClick={() => window.print()}>
                🖨️ <span>{t.btn_print}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="hh-modal-overlay hh-active">
          <div className="hh-modal-card">
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#eafaf1",
                color: "#27ae60",
                fontSize: "1.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 10 }}>{t.m_title}</h3>
            <p style={{ fontSize: "0.92rem", color: "#666", marginBottom: 22 }}>{t.m_desc}</p>
            <button
              type="button"
              style={{
                width: "100%",
                padding: 12,
                background: "var(--hh-charcoal)",
                color: "white",
                fontWeight: 700,
                borderRadius: 6,
              }}
              onClick={() => setModalOpen(false)}
            >
              {t.m_btn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
