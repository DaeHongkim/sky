"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, useRecruitAuth } from "@/lib/recruit/client-auth";
import { Button, Card, Loading, PageHeader } from "@/components/recruit/ui";

export default function SeekerMyPage() {
  const { user, loading, logout } = useRecruitAuth();
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!loading && (!user || user.role !== "JOB_SEEKER")) {
      router.replace("/recruit/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    void (async () => {
      const res = await api<Array<{ id: string }>>("/api/notifications?unread=1");
      if (res.ok && res.data) setUnread(res.data.length);
    })();
  }, []);

  if (loading || !user) return <Loading />;

  const links = [
    { href: "/recruit/seeker/profile", label: "프로필" },
    { href: "/recruit/seeker/resumes", label: "이력서" },
    { href: "/recruit/seeker/applications", label: "지원현황" },
    { href: "/recruit/seeker/scraps", label: "스크랩" },
    { href: "/recruit/seeker/scouts", label: "스카우트" },
    { href: "/recruit/seeker/interviews", label: "면접" },
    { href: "/recruit/seeker/offers", label: "Offer" },
    { href: "/recruit/seeker/contracts", label: "계약" },
    { href: "/recruit/seeker/visa", label: "비자 / 외국인 정보" },
    { href: "/recruit/notifications", label: `알림${unread ? ` (${unread})` : ""}` },
  ];

  return (
    <div>
      <PageHeader
        title={user.name || "마이페이지"}
        subtitle={user.email}
        action={
          <Button variant="ghost" onClick={() => void logout()}>
            로그아웃
          </Button>
        }
      />
      <div className="hr-grid">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="hr-card" style={{ textDecoration: "none", color: "inherit" }}>
            {l.label}
          </Link>
        ))}
      </div>
      <Card style={{ marginTop: 12 }}>
        <Button
          variant="danger"
          onClick={async () => {
            if (!confirm("정말 탈퇴하시겠습니까?")) return;
            await api("/api/auth/withdraw", { method: "POST" });
            router.push("/recruit");
          }}
        >
          회원 탈퇴
        </Button>
      </Card>
    </div>
  );
}
