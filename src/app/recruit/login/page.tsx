"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/recruit/ui/Input";
import Button from "@/components/recruit/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "로그인에 실패했습니다.");
        return;
      }
      const next = searchParams.get("next");
      router.push(
        next ??
          (data.role === "COMPANY"
            ? "/recruit/company"
            : data.role === "ADMIN"
            ? "/recruit/admin"
            : "/recruit/seeker")
      );
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-xl font-bold text-slate-900">로그인</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label="이메일"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          id="password"
          type="password"
          label="비밀번호"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          로그인 유지
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} fullWidth>
          로그인
        </Button>
      </form>
      <div className="mt-4 flex justify-between text-sm text-slate-500">
        <Link href="/recruit/forgot-password" className="underline">
          비밀번호를 잊으셨나요?
        </Link>
        <Link href="/recruit/signup" className="underline">
          회원가입
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
