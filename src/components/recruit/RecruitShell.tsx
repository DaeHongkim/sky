"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthUser = {
  id: string;
  email: string;
  role: "JOB_SEEKER" | "COMPANY" | "ADMIN" | "SUPER_ADMIN";
  name: string | null;
  jobSeekerProfile?: unknown;
  companyProfile?: { companyName: string; verificationStatus: string } | null;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function useRecruitAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRecruitAuth must be used within RecruitProviders");
  return ctx;
}

export function RecruitProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const json = await res.json();
    setUser(json.data?.user ?? null);
    setLoading(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(() => ({ user, loading, refresh, logout }), [user, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function navFor(role?: string) {
  if (role === "COMPANY") {
    return [
      { href: "/recruit/company", label: "홈", icon: "🏠" },
      { href: "/recruit/company/jobs", label: "공고", icon: "📋" },
      { href: "/recruit/company/applicants", label: "지원자", icon: "👥" },
      { href: "/recruit/company/talents", label: "인재검색", icon: "🔎" },
      { href: "/recruit/company/my", label: "기업MY", icon: "🏢" },
    ];
  }
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return [
      { href: "/recruit/admin", label: "대시보드", icon: "🛠" },
      { href: "/recruit/admin?section=users", label: "회원", icon: "👤" },
      { href: "/recruit/admin?section=companies", label: "기업", icon: "🏢" },
      { href: "/recruit/admin?section=jobs", label: "공고", icon: "📋" },
      { href: "/recruit/admin?section=audit", label: "감사", icon: "📜" },
    ];
  }
  return [
    { href: "/recruit", label: "홈", icon: "🏠" },
    { href: "/recruit/jobs", label: "채용", icon: "💼" },
    { href: "/recruit/my/applications", label: "지원현황", icon: "📄" },
    { href: "/recruit/my/notifications", label: "알림", icon: "🔔" },
    { href: "/recruit/my", label: "MY", icon: "👤" },
  ];
}

export function RecruitChrome({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useRecruitAuth();
  const pathname = usePathname();
  const router = useRouter();
  const items = navFor(user?.role);

  return (
    <div className="hr-root">
      <div className="hr-shell">
        <aside className="hr-sidebar">
          <Link href="/recruit" className="hr-brand">
            <div className="hr-brand-mark">H</div>
            <div>
              <strong>HIHONG RECRUIT</strong>
              <span>채용 플랫폼 베타</span>
            </div>
          </Link>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href || pathname.startsWith(item.href + "/") ? "active" : ""}
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <div style={{ marginTop: 24 }}>
            {!loading && user ? (
              <button className="hr-btn hr-btn-ghost" style={{ width: "100%" }} onClick={() => logout().then(() => router.push("/recruit/auth/login"))}>
                로그아웃
              </button>
            ) : (
              <Link className="hr-btn hr-btn-primary" href="/recruit/auth/login" style={{ width: "100%" }}>
                로그인
              </Link>
            )}
          </div>
        </aside>

        <div>
          <header className="hr-header">
            <Link href="/recruit" className="hr-brand" style={{ color: "inherit", margin: 0 }}>
              <div className="hr-brand-mark">H</div>
              <div>
                <strong>HIHONG RECRUIT</strong>
                <span>채용 플랫폼</span>
              </div>
            </Link>
            {!loading && (
              user ? (
                <button className="hr-btn hr-btn-ghost" onClick={() => logout()}>로그아웃</button>
              ) : (
                <Link className="hr-btn hr-btn-primary" href="/recruit/auth/login">로그인</Link>
              )
            )}
          </header>
          <main className="hr-main">{children}</main>
        </div>
      </div>

      <nav className="hr-bottom-nav">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href || (item.href !== "/recruit" && pathname.startsWith(item.href)) ? "active" : ""}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
