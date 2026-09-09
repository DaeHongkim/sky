"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";

interface NavItem {
  href: string;
  label: string;
}

const seekerNav: NavItem[] = [
  { href: "/recruit", label: "홈" },
  { href: "/recruit/jobs", label: "채용" },
  { href: "/recruit/seeker/applications", label: "지원현황" },
  { href: "/recruit/notifications", label: "알림" },
  { href: "/recruit/seeker", label: "MY" },
];

const companyNav: NavItem[] = [
  { href: "/recruit/company", label: "홈" },
  { href: "/recruit/company/jobs", label: "공고" },
  { href: "/recruit/company/applicants", label: "지원자" },
  { href: "/recruit/company/talents", label: "인재검색" },
  { href: "/recruit/company", label: "기업MY" },
];

export function RecruitHeader({
  user,
}: {
  user: { role: Role; email: string } | null;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/recruit");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/recruit" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-slate-900">
            HIHONG RECRUIT
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-slate-600 md:flex">
          <Link href="/recruit/jobs" className="hover:text-slate-900">
            채용공고
          </Link>
          {user?.role === "COMPANY" && (
            <Link href="/recruit/company/talents" className="hover:text-slate-900">
              인재검색
            </Link>
          )}
          {user ? (
            <>
              {user.role !== "ADMIN" && (
                <Link
                  href={
                    user.role === "COMPANY"
                      ? "/recruit/company/messages"
                      : "/recruit/seeker/messages"
                  }
                  className="hover:text-slate-900"
                >
                  메시지
                </Link>
              )}
              <Link href="/recruit/notifications" className="hover:text-slate-900">
                알림
              </Link>
              <Link
                href={
                  user.role === "COMPANY"
                    ? "/recruit/company"
                    : user.role === "ADMIN"
                    ? "/recruit/admin"
                    : "/recruit/seeker"
                }
                className="hover:text-slate-900"
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/recruit/login" className="hover:text-slate-900">
                로그인
              </Link>
              <Link
                href="/recruit/signup"
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-800"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function RecruitBottomNav({ role }: { role: Role | null }) {
  const pathname = usePathname();
  if (!role || role === "ADMIN") return null;

  const items = role === "COMPANY" ? companyNav : seekerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white md:hidden">
      <div className="mx-auto flex max-w-6xl">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex-1 py-2.5 text-center text-xs font-medium ${
                active ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
