"use client";

import Link from "next/link";
import { useRecruitAuth } from "@/components/recruit/RecruitShell";

export default function RecruitHomePage() {
  const { user, loading } = useRecruitAuth();

  if (!loading && user?.role === "COMPANY") {
    if (typeof window !== "undefined") window.location.replace("/recruit/company");
  }
  if (!loading && (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")) {
    if (typeof window !== "undefined") window.location.replace("/recruit/admin");
  }

  return (
    <div>
      <section className="hr-card" style={{ background: "linear-gradient(135deg,#2d2623,#1a1918)", color: "#fff", border: "none" }}>
        <span className="hr-badge hr-badge-dark">HIHONG RECRUIT</span>
        <h1 className="hr-title" style={{ color: "#fff", fontSize: "1.8rem", marginTop: 10 }}>
          구직부터 채용확정까지<br />한 곳에서
        </h1>
        <p className="hr-sub" style={{ color: "#b2aba0" }}>
          이력서 · 채용공고 · 지원 · 스카우트 · 면접 · Offer · 전자근로계약
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="hr-btn hr-btn-primary" href="/recruit/jobs">채용공고 보기</Link>
          <Link className="hr-btn hr-btn-ghost" href="/recruit/auth/signup">회원가입</Link>
        </div>
      </section>

      <div className="hr-grid hr-grid-2" style={{ marginTop: 12 }}>
        <div className="hr-card">
          <h2 className="hr-title" style={{ fontSize: "1.1rem" }}>구직자</h2>
          <p className="hr-sub">프로필·이력서·지원·스카우트·비자 정보</p>
          <Link className="hr-btn hr-btn-dark" href="/recruit/auth/signup?role=JOB_SEEKER">구직자 시작</Link>
        </div>
        <div className="hr-card">
          <h2 className="hr-title" style={{ fontSize: "1.1rem" }}>기업</h2>
          <p className="hr-sub">공고·지원자 파이프라인·인재검색·스카우트</p>
          <Link className="hr-btn hr-btn-dark" href="/recruit/auth/signup?role=COMPANY">기업회원 시작</Link>
        </div>
      </div>
    </div>
  );
}
