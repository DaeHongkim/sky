"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/recruit/ui/Input";
import Button from "@/components/recruit/ui/Button";

export default function SeekerSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "JOB_SEEKER", name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "회원가입에 실패했습니다.");
        return;
      }
      router.push("/recruit/seeker");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-xl font-bold text-slate-900">구직자 회원가입</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          id="name"
          label="이름"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
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
          autoComplete="new-password"
          placeholder="영문+숫자 포함 8자 이상"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} fullWidth>
          가입하기
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/recruit/login" className="font-medium text-slate-900 underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
