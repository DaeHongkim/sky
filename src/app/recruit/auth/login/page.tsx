"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, useRecruitAuth } from "@/lib/recruit/client-auth";
import { Button, Card, Input, PageHeader } from "@/components/recruit/ui";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useRecruitAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const res = await api<{ role: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error || "로그인 실패");
      return;
    }
    await refresh();
    if (res.data?.role === "COMPANY") router.push("/recruit/company");
    else if (res.data?.role === "ADMIN" || res.data?.role === "SUPER_ADMIN")
      router.push("/recruit/admin");
    else router.push("/recruit");
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <PageHeader title="로그인" subtitle="HIHONG RECRUIT 계정으로 로그인" />
      <Card>
        <form onSubmit={onSubmit}>
          <Input
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? (
            <p style={{ color: "var(--hr-danger)", fontSize: "0.85rem" }}>{error}</p>
          ) : null}
          <Button type="submit" disabled={pending} style={{ width: "100%" }}>
            {pending ? "처리 중…" : "로그인"}
          </Button>
        </form>
        <div style={{ marginTop: 14, fontSize: "0.85rem", color: "var(--hr-muted)" }}>
          <Link href="/recruit/auth/signup">회원가입</Link>
          {" · "}
          <Link href="/recruit/auth/reset">비밀번호 찾기</Link>
        </div>
      </Card>
    </div>
  );
}
