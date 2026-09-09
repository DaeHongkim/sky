"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Button, Card, Input, PageHeader } from "@/components/recruit/ui";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [devToken, setDevToken] = useState("");
  const [message, setMessage] = useState("");

  async function requestReset(e: FormEvent) {
    e.preventDefault();
    const res = await api<{ sent: boolean; devResetToken?: string }>(
      "/api/auth/password-reset",
      { method: "POST", body: JSON.stringify({ email }) },
    );
    if (res.ok) {
      setMessage("재설정 안내가 발송되었습니다.");
      if (res.data?.devResetToken) {
        setDevToken(res.data.devResetToken);
        setToken(res.data.devResetToken);
      }
    } else {
      setMessage(res.error || "요청 실패");
    }
  }

  async function confirmReset(e: FormEvent) {
    e.preventDefault();
    const res = await api<{ reset: boolean }>("/api/auth/password-reset", {
      method: "PUT",
      body: JSON.stringify({ token, password }),
    });
    setMessage(res.data?.reset ? "비밀번호가 변경되었습니다." : "토큰이 유효하지 않습니다.");
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <PageHeader title="비밀번호 찾기" subtitle="이메일로 재설정 토큰을 요청하세요" />
      <Card>
        <form onSubmit={requestReset}>
          <Input label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit">재설정 요청</Button>
        </form>
        {devToken ? (
          <p style={{ fontSize: "0.8rem", color: "var(--hr-muted)", marginTop: 10 }}>
            개발용 토큰: {devToken}
          </p>
        ) : null}
      </Card>
      <Card style={{ marginTop: 12 }}>
        <form onSubmit={confirmReset}>
          <Input label="토큰" value={token} onChange={(e) => setToken(e.target.value)} />
          <Input
            label="새 비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            비밀번호 변경
          </Button>
        </form>
        {message ? <p style={{ marginTop: 10 }}>{message}</p> : null}
      </Card>
    </div>
  );
}
