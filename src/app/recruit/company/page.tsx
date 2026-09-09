"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CompanyDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/company/dashboard").then((r) => r.json()).then((j) => setData(j.data));
  }, []);

  if (!data) return <div className="hr-empty">대시보드 로딩...</div>;

  const stats = [
    ["진행중 공고", data.openJobs],
    ["오늘 지원자", data.todayApplicants],
    ["신규 지원자", data.newApplicants],
    ["면접예정", data.interviewsSoon],
    ["채용확정", data.hiredCount],
    ["마감예정", data.closingSoon],
    ["스카우트 응답", data.scoutResponses],
  ];

  return (
    <div>
      <h1 className="hr-title">기업 홈</h1>
      <div className="hr-grid hr-grid-2">
        {stats.map(([label, value]) => (
          <div key={String(label)} className="hr-stat">
            <strong>{String(value)}</strong>
            <span>{String(label)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, margin: "14px 0", flexWrap: "wrap" }}>
        <Link className="hr-btn hr-btn-primary" href="/recruit/company/jobs/new">공고 등록</Link>
        <Link className="hr-btn hr-btn-ghost" href="/recruit/company/applicants">지원자</Link>
        <Link className="hr-btn hr-btn-ghost" href="/recruit/company/talents">인재검색</Link>
      </div>
      <div className="hr-card">
        <h2 className="hr-title" style={{ fontSize: "1.05rem" }}>최근 지원자</h2>
        {(data.recentApplicants as Array<Record<string, unknown>> | undefined)?.map((a) => (
          <div key={String(a.id)} style={{ padding: "8px 0", borderBottom: "1px solid #e6ddd2" }}>
            {(a.jobSeeker as { name?: string })?.name || (a.jobSeeker as { email?: string })?.email} · {(a.jobPost as { title?: string })?.title} · {String(a.status)}
          </div>
        ))}
      </div>
    </div>
  );
}
