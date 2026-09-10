"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Input from "@/components/recruit/ui/Input";
import Button from "@/components/recruit/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setDevResetUrl(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-xl font-bold text-slate-900">비밀번호 찾기</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label="가입한 이메일"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" loading={loading} fullWidth>
          재설정 링크 보내기
        </Button>
      </form>
      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      {devResetUrl && (
        <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          개발 환경 전용 안내: 실제 이메일 발송 연동 전이라 링크를 여기에 표시합니다.
          <br />
          <Link href={devResetUrl} className="underline">
            {devResetUrl}
          </Link>
        </p>
      )}
    </div>
  );
}
