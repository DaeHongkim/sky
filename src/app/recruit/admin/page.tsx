"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function AdminInner() {
  const params = useSearchParams();
  const section = params.get("section") || "overview";
  const [data, setData] = useState<unknown>(null);
  const [toast, setToast] = useState("");

  async function load() {
    const res = await fetch(`/api/admin?section=${section}`);
    const json = await res.json();
    setData(json.data);
  }

  useEffect(() => {
    load();
  }, [section]);

  async function verifyCompany(companyId: string, status: "VERIFIED" | "REJECTED") {
    const res = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify_company", companyId, status }),
    });
    const json = await res.json();
    setToast(json.ok ? "처리됨" : json.error);
    load();
  }

  return (
    <div>
      <h1 className="hr-title">관리자 · {section}</h1>
      <div className="hr-tabs">
        {["overview", "users", "companies", "jobs", "applications", "visas", "scouts", "interviews", "contracts", "translations", "notifications", "reports", "audit"].map((s) => (
          <a key={s} className={`hr-tab ${section === s ? "active" : ""}`} href={`/recruit/admin?section=${s}`}>{s}</a>
        ))}
      </div>
      <div className="hr-card">
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem", maxHeight: 480, overflow: "auto" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
      {section === "companies" && Array.isArray(data) && (
        <div>
          {(data as Array<Record<string, unknown>>).map((c) => (
            <div key={String(c.id)} className="hr-card">
              <strong>{String(c.companyName)}</strong> · {String(c.verificationStatus)}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button className="hr-btn hr-btn-primary" onClick={() => verifyCompany(String(c.id), "VERIFIED")}>인증</button>
                <button className="hr-btn hr-btn-ghost" onClick={() => verifyCompany(String(c.id), "REJECTED")}>거절</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminInner />
    </Suspense>
  );
}
