"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { useRecruitAuth } from "@/components/recruit/RecruitShell";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useRecruitAuth();
  const [role, setRole] = useState<"JOB_SEEKER" | "COMPANY">(
    params.get("role") === "COMPANY" ? "COMPANY" : "JOB_SEEKER",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      role,
      companyName: String(fd.get("companyName") || "") || undefined,
      businessNumber: String(fd.get("businessNumber") || "") || undefined,
    };
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.ok) {
      setError(json.error || "회원가입 실패");
      return;
    }
    await refresh();
    router.push(role === "COMPANY" ? "/recruit/company" : "/recruit/my");
  }

  return (
    <div className="hr-card" style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1 className="hr-title">회원가입</h1>
      <p className="hr-sub">역할별 계정을 생성합니다. 권한은 서버에서만 결정됩니다.</p>
      <div className="hr-tabs">
        <button type="button" className={`hr-tab ${role === "JOB_SEEKER" ? "active" : ""}`} onClick={() => setRole("JOB_SEEKER")}>구직자</button>
        <button type="button" className={`hr-tab ${role === "COMPANY" ? "active" : ""}`} onClick={() => setRole("COMPANY")}>기업</button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="hr-field"><label className="hr-label">이름</label><input className="hr-input" name="name" required /></div>
        <div className="hr-field"><label className="hr-label">이메일</label><input className="hr-input" name="email" type="email" required /></div>
        <div className="hr-field"><label className="hr-label">비밀번호 (영문+숫자 8자+)</label><input className="hr-input" name="password" type="password" required minLength={8} /></div>
        {role === "COMPANY" && (
          <>
            <div className="hr-field"><label className="hr-label">회사명</label><input className="hr-input" name="companyName" required /></div>
            <div className="hr-field"><label className="hr-label">사업자번호</label><input className="hr-input" name="businessNumber" /></div>
          </>
        )}
        {error && <p style={{ color: "#a83a2a", fontWeight: 700 }}>{error}</p>}
        <button className="hr-btn hr-btn-primary" disabled={loading} type="submit" style={{ width: "100%" }}>
          {loading ? "처리 중..." : "가입하기"}
        </button>
      </form>
      <p className="hr-sub" style={{ marginTop: 14 }}>
        이미 계정이 있나요? <Link href="/recruit/auth/login">로그인</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
