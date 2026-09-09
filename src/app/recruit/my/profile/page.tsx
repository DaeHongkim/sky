"use client";

import { FormEvent, useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/profiles/job-seeker").then((r) => r.json()).then((j) => setProfile(j.data?.profile));
  }, []);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/profiles/job-seeker", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(fd.get("name") || ""),
        phone: String(fd.get("phone") || ""),
        residenceRegion: String(fd.get("residenceRegion") || ""),
        desiredWorkRegions: String(fd.get("desiredWorkRegions") || "").split(",").map((s) => s.trim()).filter(Boolean),
        desiredJobCategories: String(fd.get("desiredJobCategories") || "").split(",").map((s) => s.trim()).filter(Boolean),
        desiredSalaryMin: Number(fd.get("desiredSalaryMin") || 0) || null,
        introduction: String(fd.get("introduction") || ""),
        skills: String(fd.get("skills") || "").split(",").map((s) => s.trim()).filter(Boolean),
        careerYears: Number(fd.get("careerYears") || 0),
        nationality: String(fd.get("nationality") || ""),
        koreaResident: fd.get("koreaResident") === "on",
        koreanLevel: String(fd.get("koreanLevel") || ""),
        preferredLanguage: String(fd.get("preferredLanguage") || "ko"),
        autoTranslateEnabled: fd.get("autoTranslateEnabled") === "on",
      }),
    });
    const json = await res.json();
    setToast(json.ok ? "저장되었습니다" : json.error);
    if (json.ok) setProfile(json.data);
  }

  if (!profile) return <div className="hr-empty">불러오는 중...</div>;

  return (
    <div>
      <h1 className="hr-title">프로필</h1>
      <form className="hr-card" onSubmit={save}>
        <div className="hr-field"><label className="hr-label">이름</label><input className="hr-input" name="name" defaultValue={String(profile.name || "")} /></div>
        <div className="hr-field"><label className="hr-label">연락처</label><input className="hr-input" name="phone" defaultValue={String(profile.phone || "")} /></div>
        <div className="hr-field"><label className="hr-label">거주지역</label><input className="hr-input" name="residenceRegion" defaultValue={String(profile.residenceRegion || "")} /></div>
        <div className="hr-field"><label className="hr-label">희망근무지역 (쉼표)</label><input className="hr-input" name="desiredWorkRegions" defaultValue={(profile.desiredWorkRegions as string[] | undefined)?.join(", ") || ""} /></div>
        <div className="hr-field"><label className="hr-label">희망직종 (쉼표)</label><input className="hr-input" name="desiredJobCategories" defaultValue={(profile.desiredJobCategories as string[] | undefined)?.join(", ") || ""} /></div>
        <div className="hr-field"><label className="hr-label">희망급여(최소)</label><input className="hr-input" type="number" name="desiredSalaryMin" defaultValue={String(profile.desiredSalaryMin || "")} /></div>
        <div className="hr-field"><label className="hr-label">경력년수</label><input className="hr-input" type="number" name="careerYears" defaultValue={String(profile.careerYears || 0)} /></div>
        <div className="hr-field"><label className="hr-label">국적</label><input className="hr-input" name="nationality" defaultValue={String(profile.nationality || "")} /></div>
        <div className="hr-field"><label className="hr-label">한국어 수준</label><input className="hr-input" name="koreanLevel" defaultValue={String(profile.koreanLevel || "")} /></div>
        <div className="hr-field"><label className="hr-label">선호 언어</label><input className="hr-input" name="preferredLanguage" defaultValue={String(profile.preferredLanguage || "ko")} /></div>
        <div className="hr-field"><label className="hr-label">보유기술 (쉼표)</label><input className="hr-input" name="skills" defaultValue={(profile.skills as string[] | undefined)?.join(", ") || ""} /></div>
        <div className="hr-field"><label className="hr-label">자기소개</label><textarea className="hr-textarea" name="introduction" defaultValue={String(profile.introduction || "")} /></div>
        <label style={{ display: "flex", gap: 8, marginBottom: 8 }}><input type="checkbox" name="koreaResident" defaultChecked={Boolean(profile.koreaResident)} /> 한국 체류</label>
        <label style={{ display: "flex", gap: 8, marginBottom: 12 }}><input type="checkbox" name="autoTranslateEnabled" defaultChecked={Boolean(profile.autoTranslateEnabled)} /> 자동번역</label>
        <button className="hr-btn hr-btn-primary" type="submit">저장</button>
      </form>
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
