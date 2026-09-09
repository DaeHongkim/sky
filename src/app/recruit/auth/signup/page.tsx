"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, useRecruitAuth } from "@/lib/recruit/client-auth";
import { Button, Card, Input, PageHeader, Select } from "@/components/recruit/ui";

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useRecruitAuth();
  const [role, setRole] = useState<"JOB_SEEKER" | "COMPANY">("JOB_SEEKER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const res = await api<{ role: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        role,
        name,
        companyName: role === "COMPANY" ? companyName : undefined,
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error || "회원가입 실패");
      return;
    }
    await refresh();
    router.push(role === "COMPANY" ? "/recruit/company" : "/recruit/seeker");
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <PageHeader title="회원가입" subtitle="구직자 또는 기업회원으로 가입" />
      <Card>
        <form onSubmit={onSubmit}>
          <Select
            label="회원 유형"
            value={role}
            onChange={(e) => setRole(e.target.value as "JOB_SEEKER" | "COMPANY")}
          >
            <option value="JOB_SEEKER">구직자</option>
            <option value="COMPANY">기업회원</option>
          </Select>
          <Input label="이름 / 담당자명" value={name} onChange={(e) => setName(e.target.value)} />
          {role === "COMPANY" ? (
            <Input
              label="회사명"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          ) : null}
          <Input
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="비밀번호 (영문+숫자 8자 이상)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? (
            <p style={{ color: "var(--hr-danger)", fontSize: "0.85rem" }}>{error}</p>
          ) : null}
          <Button type="submit" disabled={pending} style={{ width: "100%" }}>
            {pending ? "가입 중…" : "가입하기"}
          </Button>
        </form>
        <p style={{ marginTop: 12, fontSize: "0.85rem" }}>
          이미 계정이 있나요? <Link href="/recruit/auth/login">로그인</Link>
        </p>
        <p style={{ fontSize: "0.78rem", color: "var(--hr-muted)" }}>
          소셜 로그인(Google/Kakao/Naver/Apple) 확장 구조는 OAuthAccount 모델로 준비되어 있습니다.
        </p>
      </Card>
    </div>
  );
}
