"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function CompanyMyPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/profiles/company").then((r) => r.json()).then((j) => setProfile(j.data));
  }, []);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/profiles/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: String(fd.get("companyName") || ""),
        businessNumber: String(fd.get("businessNumber") || ""),
        representative: String(fd.get("representative") || ""),
        industry: String(fd.get("industry") || ""),
        companySize: String(fd.get("companySize") || ""),
        description: String(fd.get("description") || ""),
        address: String(fd.get("address") || ""),
        website: String(fd.get("website") || ""),
        contactName: String(fd.get("contactName") || ""),
        contactPhone: String(fd.get("contactPhone") || ""),
        contactEmail: String(fd.get("contactEmail") || ""),
      }),
    });
    const json = await res.json();
    setToast(json.ok ? "저장됨" : json.error);
    if (json.ok) setProfile(json.data);
  }

  if (!profile) return <div className="hr-empty">로딩...</div>;

  return (
    <div>
      <h1 className="hr-title">기업 MY</h1>
      <div className="hr-card">
        <span className="hr-badge">인증: {String(profile.verificationStatus)}</span>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="hr-btn hr-btn-ghost" href="/recruit/company/scouts">스카우트</Link>
          <Link className="hr-btn hr-btn-ghost" href="/recruit/my/notifications">알림</Link>
          <Link className="hr-btn hr-btn-ghost" href="/recruit/my/messages">채팅</Link>
        </div>
      </div>
      <form className="hr-card" onSubmit={save}>
        <div className="hr-field"><label className="hr-label">회사명</label><input className="hr-input" name="companyName" defaultValue={String(profile.companyName || "")} /></div>
        <div className="hr-field"><label className="hr-label">사업자번호</label><input className="hr-input" name="businessNumber" defaultValue={String(profile.businessNumber || "")} /></div>
        <div className="hr-field"><label className="hr-label">대표자</label><input className="hr-input" name="representative" defaultValue={String(profile.representative || "")} /></div>
        <div className="hr-field"><label className="hr-label">업종</label><input className="hr-input" name="industry" defaultValue={String(profile.industry || "")} /></div>
        <div className="hr-field"><label className="hr-label">규모</label><input className="hr-input" name="companySize" defaultValue={String(profile.companySize || "")} /></div>
        <div className="hr-field"><label className="hr-label">소개</label><textarea className="hr-textarea" name="description" defaultValue={String(profile.description || "")} /></div>
        <div className="hr-field"><label className="hr-label">주소</label><input className="hr-input" name="address" defaultValue={String(profile.address || "")} /></div>
        <div className="hr-field"><label className="hr-label">홈페이지</label><input className="hr-input" name="website" defaultValue={String(profile.website || "")} /></div>
        <div className="hr-field"><label className="hr-label">담당자</label><input className="hr-input" name="contactName" defaultValue={String(profile.contactName || "")} /></div>
        <div className="hr-field"><label className="hr-label">담당자 연락처</label><input className="hr-input" name="contactPhone" defaultValue={String(profile.contactPhone || "")} /></div>
        <div className="hr-field"><label className="hr-label">담당자 이메일</label><input className="hr-input" name="contactEmail" defaultValue={String(profile.contactEmail || "")} /></div>
        <button className="hr-btn hr-btn-primary" type="submit">저장</button>
      </form>
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
