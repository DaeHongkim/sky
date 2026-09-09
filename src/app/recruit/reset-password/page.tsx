"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/recruit/ui/Input";
import Button from "@/components/recruit/ui/Button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "재설정에 실패했습니다.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/recruit/login"), 1500);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md py-8">
        <p className="text-sm text-red-600">유효하지 않은 링크입니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-xl font-bold text-slate-900">비밀번호 재설정</h1>
      {done ? (
        <p className="mt-6 text-sm text-emerald-700">
          비밀번호가 변경되었습니다. 로그인 화면으로 이동합니다...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            id="password"
            type="password"
            label="새 비밀번호"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="영문+숫자 포함 8자 이상"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} fullWidth>
            비밀번호 변경
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
