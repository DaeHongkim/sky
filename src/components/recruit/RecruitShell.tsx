"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { RecruitAuthProvider, useRecruitAuth } from "@/lib/recruit/client-auth";
import {
  RECRUIT_LANGS,
  RecruitI18nProvider,
  useRecruitI18n,
} from "@/lib/recruit/i18n";
import { BrandLink, Button } from "@/components/recruit/ui";
import { MobileTabBar } from "@/components/recruit/MobileTabBar";
import { PwaRegister } from "@/components/recruit/PwaRegister";

function ShellInner({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useRecruitAuth();
  const { t, lang, setLang } = useRecruitI18n();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/recruit/auth");

  const seekerLinks = [
    { href: "/recruit", label: t("navHome") },
    { href: "/recruit/jobs", label: t("navJobs") },
    { href: "/recruit/seeker/applications", label: t("navApps") },
    { href: "/recruit/seeker/resumes", label: t("navResumes") },
    { href: "/recruit/notifications", label: t("navNoti") },
    { href: "/recruit/seeker", label: t("navMy") },
  ];

  const companyLinks = [
    { href: "/recruit/company", label: t("navDash") },
    { href: "/recruit/company/jobs", label: t("navJobMgmt") },
    { href: "/recruit/company/applicants", label: t("navApplicants") },
    { href: "/recruit/company/talents", label: t("navTalents") },
    { href: "/recruit/company/scouts", label: t("navScouts") },
    { href: "/recruit/company/my", label: t("navCompanyMy") },
  ];

  const adminLinks = [
    { href: "/recruit/admin", label: t("navAdmin") },
    { href: "/recruit/jobs", label: t("navJobs") },
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="hr-lang-switch" aria-label="Language">
            {RECRUIT_LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`hr-lang-btn ${lang === l.code ? "active" : ""}`}
                onClick={() => setLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
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
            {!loading && !user ? <Link href="/recruit/auth/login">{t("login")}</Link> : null}
            {user ? (
              <Button variant="ghost" onClick={() => void logout()}>
                {t("logout")}
              </Button>
            ) : null}
          </nav>
        </div>
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
                    style={{ width: "100%", marginTop: 8 }}
                    onClick={() => void logout()}
                  >
                    {t("logout")}
                  </Button>
                ) : (
                  <Link href="/recruit/auth/login">{t("login")}</Link>
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
      <RecruitI18nProvider>
        <ShellInner>{children}</ShellInner>
      </RecruitI18nProvider>
    </RecruitAuthProvider>
  );
}
