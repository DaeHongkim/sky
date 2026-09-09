"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRecruitI18n } from "@/lib/recruit/i18n";

export function MobileTabBar({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const { t } = useRecruitI18n();

  const seekerTabs = [
    { href: "/recruit", label: t("navHome"), icon: "⌂" },
    { href: "/recruit/jobs", label: t("navJobs"), icon: "⌕" },
    { href: "/recruit/seeker/applications", label: t("navApps"), icon: "☰" },
    { href: "/recruit/notifications", label: t("navNoti"), icon: "◉" },
    { href: "/recruit/seeker", label: t("navMy"), icon: "☺" },
  ];

  const companyTabs = [
    { href: "/recruit/company", label: t("navHome"), icon: "⌂" },
    { href: "/recruit/company/jobs", label: t("navJobMgmt"), icon: "☰" },
    { href: "/recruit/company/applicants", label: t("navApplicants"), icon: "◎" },
    { href: "/recruit/company/talents", label: t("navTalents"), icon: "⌕" },
    { href: "/recruit/company/my", label: t("navCompanyMy"), icon: "☺" },
  ];

  const tabs = role === "COMPANY" ? companyTabs : seekerTabs;

  return (
    <nav className="hr-tabbar" aria-label="bottom menu">
      {tabs.map((tab) => {
        const active =
          tab.href === "/recruit" || tab.href === "/recruit/company"
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`hr-tab ${active ? "active" : ""}`}
          >
            <span className="hr-tab-icon" aria-hidden>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
