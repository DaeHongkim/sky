"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRecruitAuth } from "@/components/recruit/RecruitShell";

const links = [
  ["/recruit/my/profile", "프로필"],
  ["/recruit/my/resumes", "이력서"],
  ["/recruit/my/applications", "지원현황"],
  ["/recruit/my/scraps", "스크랩"],
  ["/recruit/my/scouts", "스카우트"],
  ["/recruit/my/interviews", "면접"],
  ["/recruit/my/offers", "Offer"],
  ["/recruit/my/contracts", "계약"],
  ["/recruit/my/visa", "비자/외국인"],
  ["/recruit/my/notifications", "알림"],
  ["/recruit/my/messages", "채팅"],
];

export default function MyPage() {
  const { user, loading } = useRecruitAuth();
  const [recs, setRecs] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    fetch("/api/job-posts?sort=recommend&pageSize=5")
      .then((r) => r.json())
      .then((j) => setRecs(j.data?.items || []));
  }, []);

  if (loading) return <div className="hr-empty">로딩 중...</div>;
  if (!user) {
    return (
      <div className="hr-card">
        <h1 className="hr-title">마이페이지</h1>
        <p className="hr-sub">로그인이 필요합니다.</p>
        <Link className="hr-btn hr-btn-primary" href="/recruit/auth/login">로그인</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="hr-card">
        <h1 className="hr-title">{user.name || "구직자"}</h1>
        <p className="hr-sub">{user.email}</p>
      </div>
      <div className="hr-grid hr-grid-2">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="hr-card" style={{ textDecoration: "none", color: "inherit" }}>
            <strong>{label}</strong>
          </Link>
        ))}
      </div>
      <div className="hr-card" style={{ marginTop: 12 }}>
        <h2 className="hr-title" style={{ fontSize: "1.05rem" }}>추천공고</h2>
        {recs.map((j) => (
          <Link key={j.id} href={`/recruit/jobs/${j.id}`} style={{ display: "block", marginTop: 8 }}>
            {j.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
