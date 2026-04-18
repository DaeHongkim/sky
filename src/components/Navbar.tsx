"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/map", label: "지도 검색" },
  { href: "/analysis", label: "상권 분석" },
  { href: "/listings", label: "매물 관리" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-blue-600 font-bold text-xl">부산점포</span>
          <span className="text-gray-400 text-sm">개발 플랫폼</span>
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
