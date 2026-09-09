"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { RecruitAuthProvider, useRecruitAuth } from "@/lib/recruit/client-auth";
import { BrandLink, Button } from "@/components/recruit/ui";
import { MobileTabBar } from "@/components/recruit/MobileTabBar";
import { PwaRegister } from "@/components/recruit/PwaRegister";

function ShellInner({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useRecruitAuth();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/recruit/auth");

  const seekerLinks = [
    { href: "/recruit", label: "홈" },
    { href: "/recruit/jobs", label: "채용공고" },
    { href: "/recruit/seeker/applications", label: "지원현황" },
    { href: "/recruit/seeker/resumes", label: "이력서" },
    { href: "/recruit/notifications", label: "알림" },
    { href: "/recruit/seeker", label: "마이페이지" },
  ];

  const companyLinks = [
    { href: "/recruit/company", label: "대시보드" },
    { href: "/recruit/company/jobs", label: "공고관리" },
    { href: "/recruit/company/applicants", label: "지원자" },
    { href: "/recruit/company/talents", label: "인재검색" },
    { href: "/recruit/company/scouts", label: "스카우트" },
    { href: "/recruit/company/my", label: "기업정보" },
  ];

  const adminLinks = [
    { href: "/recruit/admin", label: "관리자" },
    { href: "/recruit/jobs", label: "공고" },
  ];

  const links =
    user?.role === "COMPANY"
      ? companyLinks
      : user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
        ? adminLinks
        : seekerLinks;

  return (
    <>
      <header className="hr-topbar">
        <BrandLink />
        <nav className="hr-desktop-nav">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
          {!loading && !user ? (
            <Link href="/recruit/auth/login">로그인</Link>
          ) : null}
          {user ? (
            <Button variant="ghost" onClick={() => void logout()}>
              로그아웃
            </Button>
          ) : null}
        </nav>
      </header>

      <div className="hr-container">
        <div className="hr-layout">
          {!isAuthPage ? (
            <aside className="hr-sidebar">
              <div className="hr-card">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={pathname === l.href ? "active" : ""}
                  >
                    {l.label}
                  </Link>
                ))}
                {user ? (
                  <Button
                    variant="ghost"
                    className="hr-btn"
                    style={{ width: "100%", marginTop: 8 }}
                    onClick={() => void logout()}
                  >
                    로그아웃
                  </Button>
                ) : (
                  <Link href="/recruit/auth/login">로그인</Link>
                )}
              </div>
            </aside>
          ) : null}
          <main>{children}</main>
        </div>
      </div>

      {!isAuthPage ? <MobileTabBar role={user?.role} /> : null}
      <PwaRegister />
    </>
  );
}

export function RecruitShell({ children }: { children: ReactNode }) {
  return (
    <RecruitAuthProvider>
      <ShellInner>{children}</ShellInner>
    </RecruitAuthProvider>
  );
}
