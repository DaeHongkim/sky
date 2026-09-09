"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRecruitAuth } from "@/components/recruit/RecruitShell";

type Resume = { id: string; title: string; isPrimary: boolean };

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useRecruitAuth();
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [showApply, setShowApply] = useState(false);
  const [toast, setToast] = useState("");
  const [translated, setTranslated] = useState("");

  useEffect(() => {
    fetch(`/api/job-posts/${id}`).then((r) => r.json()).then((j) => setJob(j.data));
  }, [id]);

  async function scrap() {
    const res = await fetch("/api/job-scraps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobPostId: id }),
    });
    const json = await res.json();
    setToast(json.ok ? "스크랩되었습니다" : json.error);
  }

  async function openApply() {
    const res = await fetch("/api/resumes");
    const json = await res.json();
    if (!json.ok) {
      setToast(json.error || "이력서를 불러올 수 없습니다");
      return;
    }
    setResumes(json.data || []);
    const primary = (json.data || []).find((r: Resume) => r.isPrimary) || json.data?.[0];
    setResumeId(primary?.id || "");
    setShowApply(true);
  }

  async function apply(e: FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/job-posts/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId }),
    });
    const json = await res.json();
    setToast(json.ok ? "지원 완료" : json.error);
    if (json.ok) setShowApply(false);
  }

  async function translate() {
    if (!job) return;
    const res = await fetch("/api/translations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: String(job.description || ""),
        targetLang: "en",
        sourceType: "job_post",
        sourceId: id,
      }),
    });
    const json = await res.json();
    if (json.ok) setTranslated(json.data.translatedText);
    else setToast(json.error);
  }

  function share() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: String(job?.title || ""), url });
    else {
      navigator.clipboard.writeText(url);
      setToast("링크가 복사되었습니다");
    }
  }

  if (!job) return <div className="hr-empty">불러오는 중...</div>;
  const company = job.company as { companyName: string; description?: string; address?: string };

  return (
    <div>
      <div className="hr-card">
        <span className="hr-badge">{company?.companyName}</span>
        <h1 className="hr-title">{String(job.title)}</h1>
        <div className="hr-job-meta">
          {Boolean(job.workLocation) && <span className="hr-badge">{String(job.workLocation)}</span>}
          {Boolean(job.employmentType) && <span className="hr-badge">{String(job.employmentType)}</span>}
          {Boolean(job.foreignerAllowed) && <span className="hr-badge">외국인 가능</span>}
        </div>
        <p className="hr-sub" style={{ marginTop: 12 }}>조회수 {String(job.views ?? 0)} · 마감 {job.deadline ? new Date(String(job.deadline)).toLocaleDateString("ko-KR") : "상시"}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {user?.role === "JOB_SEEKER" && <button className="hr-btn hr-btn-primary" onClick={openApply}>지원하기</button>}
          {user?.role === "JOB_SEEKER" && <button className="hr-btn hr-btn-ghost" onClick={scrap}>스크랩</button>}
          <button className="hr-btn hr-btn-ghost" onClick={share}>공유</button>
          <button className="hr-btn hr-btn-ghost" onClick={translate}>번역</button>
        </div>
      </div>

      <div className="hr-card">
        <h2 className="hr-title" style={{ fontSize: "1.05rem" }}>공고 내용</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{String(job.description)}</p>
        {translated && <p style={{ whiteSpace: "pre-wrap", marginTop: 12, color: "#6b6b6b" }}>{translated}</p>}
      </div>

      <div className="hr-card">
        <h2 className="hr-title" style={{ fontSize: "1.05rem" }}>근무조건 / 혜택</h2>
        <p>급여: {String(job.salaryMin ?? "-")} ~ {String(job.salaryMax ?? "-")} ({String(job.salaryType || "협의")})</p>
        <p>근무일: {String(job.workDays || "-")} / 근무시간: {String(job.workHours || "-")}</p>
        <p>비자: {String(job.visaConditions || "-")} / 한국어: {String(job.koreanLevel || "-")}</p>
        <p>숙소 {job.housingSupport ? "O" : "X"} · 식사 {job.mealSupport ? "O" : "X"} · 교통 {job.transportationSupport ? "O" : "X"}</p>
      </div>

      <div className="hr-card">
        <h2 className="hr-title" style={{ fontSize: "1.05rem" }}>회사정보</h2>
        <p>{company?.description || "회사 소개가 등록되지 않았습니다."}</p>
        <p className="hr-sub">{company?.address}</p>
      </div>

      {showApply && (
        <div className="hr-modal-backdrop" onClick={() => setShowApply(false)}>
          <div className="hr-drawer" onClick={(e) => e.stopPropagation()}>
            <h2 className="hr-title" style={{ fontSize: "1.1rem" }}>이력서 선택</h2>
            {resumes.length === 0 ? (
              <p className="hr-sub">이력서가 없습니다. MY에서 먼저 작성해 주세요.</p>
            ) : (
              <form onSubmit={apply}>
                <select className="hr-select" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}{r.isPrimary ? " (대표)" : ""}</option>
                  ))}
                </select>
                <button className="hr-btn hr-btn-primary" style={{ width: "100%", marginTop: 12 }} type="submit">지원 제출</button>
              </form>
            )}
          </div>
        </div>
      )}

      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
