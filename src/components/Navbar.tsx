"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "사주보기" },
  { href: "/guide", label: "읽는 법" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/30 bg-[rgba(238,243,247,0.72)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]">
            하늘사주
          </span>
          <span className="hidden text-xs tracking-[0.2em] text-[var(--ink-soft)] sm:inline">
            SKY
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm transition-colors ${
                  active
                    ? "text-[var(--ink)]"
                    : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/#saju-form"
            className="ml-2 rounded-md bg-[var(--ink)] px-3 py-2 text-sm text-[var(--paper)] transition-opacity hover:opacity-90"
          >
            시작
          </Link>
        </div>
      </div>
    </nav>
  );
}
