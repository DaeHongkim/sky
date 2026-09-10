"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/recruit/ui/Input";
import Button from "@/components/recruit/ui/Button";

export default function CompanySignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    businessRegistrationNumber: "",
    contactName: "",
    contactPhone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "COMPANY", ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "회원가입에 실패했습니다.");
        return;
      }
      router.push("/recruit/company");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-xl font-bold text-slate-900">기업회원 회원가입</h1>
      <p className="mt-1 text-sm text-slate-500">
        가입 후 관리자 인증(PENDING → VERIFIED) 절차를 거쳐야 채용공고를 게시할 수 있습니다.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          id="companyName"
          label="회사명"
          required
          value={form.companyName}
          onChange={(e) => update("companyName", e.target.value)}
        />
        <Input
          id="brn"
          label="사업자등록번호"
          required
          placeholder="123-45-67890"
          value={form.businessRegistrationNumber}
          onChange={(e) => update("businessRegistrationNumber", e.target.value)}
        />
        <Input
          id="contactName"
          label="담당자명"
          required
          value={form.contactName}
          onChange={(e) => update("contactName", e.target.value)}
        />
        <Input
          id="contactPhone"
          label="담당자 연락처"
          required
          value={form.contactPhone}
          onChange={(e) => update("contactPhone", e.target.value)}
        />
        <Input
          id="email"
          type="email"
          label="이메일 (로그인 아이디)"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          autoComplete="email"
        />
        <Input
          id="password"
          type="password"
          label="비밀번호"
          required
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
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
