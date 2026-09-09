"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const seekerTabs = [
  { href: "/recruit", label: "홈", icon: "⌂" },
  { href: "/recruit/jobs", label: "채용", icon: "⌕" },
  { href: "/recruit/seeker/applications", label: "지원", icon: "☰" },
  { href: "/recruit/notifications", label: "알림", icon: "◉" },
  { href: "/recruit/seeker", label: "MY", icon: "☺" },
];

const companyTabs = [
  { href: "/recruit/company", label: "홈", icon: "⌂" },
  { href: "/recruit/company/jobs", label: "공고", icon: "☰" },
  { href: "/recruit/company/applicants", label: "지원자", icon: "◎" },
  { href: "/recruit/company/talents", label: "인재", icon: "⌕" },
  { href: "/recruit/company/my", label: "기업MY", icon: "☺" },
];

export function MobileTabBar({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const tabs = role === "COMPANY" ? companyTabs : seekerTabs;

  return (
    <nav className="hr-tabbar" aria-label="하단 메뉴">
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
