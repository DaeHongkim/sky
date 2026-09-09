"use client";

import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"request" | "confirm">("request");

  async function requestReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(fd.get("email") || "") }),
    });
    const json = await res.json();
    setMessage("요청이 접수되었습니다. 이메일이 등록되어 있으면 재설정 링크가 발송됩니다.");
    if (json.data?.resetToken) {
      setToken(json.data.resetToken);
      setStep("confirm");
    }
  }

  async function confirmReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: String(fd.get("token") || token),
        password: String(fd.get("password") || ""),
      }),
    });
    const json = await res.json();
    setMessage(json.ok ? "비밀번호가 변경되었습니다. 다시 로그인해 주세요." : json.error);
  }

  return (
    <div className="hr-card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1 className="hr-title">비밀번호 찾기</h1>
      {step === "request" ? (
        <form onSubmit={requestReset}>
          <div className="hr-field"><label className="hr-label">이메일</label><input className="hr-input" name="email" type="email" required /></div>
          <button className="hr-btn hr-btn-primary" type="submit" style={{ width: "100%" }}>재설정 요청</button>
        </form>
      ) : (
        <form onSubmit={confirmReset}>
          <div className="hr-field"><label className="hr-label">토큰</label><input className="hr-input" name="token" defaultValue={token} required /></div>
          <div className="hr-field"><label className="hr-label">새 비밀번호</label><input className="hr-input" name="password" type="password" required minLength={8} /></div>
          <button className="hr-btn hr-btn-primary" type="submit" style={{ width: "100%" }}>비밀번호 변경</button>
        </form>
      )}
      {message && <p className="hr-sub" style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
