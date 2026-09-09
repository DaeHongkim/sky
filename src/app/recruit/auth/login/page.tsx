"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useRecruitAuth } from "@/components/recruit/RecruitShell";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useRecruitAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(fd.get("email") || ""),
        password: String(fd.get("password") || ""),
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.ok) {
      setError(json.error || "로그인 실패");
      return;
    }
    await refresh();
    const role = json.data.role;
    router.push(role === "COMPANY" ? "/recruit/company" : role === "ADMIN" || role === "SUPER_ADMIN" ? "/recruit/admin" : "/recruit/my");
  }

  return (
    <div className="hr-card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1 className="hr-title">로그인</h1>
      <p className="hr-sub">세션은 HttpOnly 쿠키로 유지됩니다.</p>
      <form onSubmit={onSubmit}>
        <div className="hr-field"><label className="hr-label">이메일</label><input className="hr-input" name="email" type="email" required /></div>
        <div className="hr-field"><label className="hr-label">비밀번호</label><input className="hr-input" name="password" type="password" required /></div>
        {error && <p style={{ color: "#a83a2a", fontWeight: 700 }}>{error}</p>}
        <button className="hr-btn hr-btn-primary" disabled={loading} type="submit" style={{ width: "100%" }}>
          {loading ? "확인 중..." : "로그인"}
        </button>
      </form>
      <p className="hr-sub" style={{ marginTop: 14 }}>
        <Link href="/recruit/auth/forgot">비밀번호 찾기</Link> · <Link href="/recruit/auth/signup">회원가입</Link>
      </p>
    </div>
  );
}
