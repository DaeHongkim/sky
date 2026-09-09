"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, useRecruitAuth } from "@/lib/recruit/client-auth";
import { useRecruitI18n } from "@/lib/recruit/i18n";
import { Badge, Button, Card, Loading } from "@/components/recruit/ui";

type Job = {
  id: string;
  title: string;
  workLocation?: string | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  foreignerAllowed?: boolean;
  company?: { companyName: string };
};

export default function RecruitHomePage() {
  const { user, loading } = useRecruitAuth();
  const { t } = useRecruitI18n();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await api<Job[]>("/api/job-posts?sort=latest");
      if (res.ok && res.data) setJobs(res.data.slice(0, 6));
      setJobsLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;

  if (user?.role === "COMPANY") {
    return (
      <div>
        <section className="hr-hero">
          <div className="hr-eyebrow">{t("heroEyebrow")}</div>
          <h2>{t("companyHeroTitle")}</h2>
          <p>{t("companyHeroDesc")}</p>
          <div className="hr-hero-actions">
            <Link href="/recruit/company">
              <Button>{t("ctaCompanyDash")}</Button>
            </Link>
            <Link href="/recruit/company/jobs">
              <Button variant="ghost">{t("ctaCompanyJobs")}</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const cats = [
    { title: t("cat1"), en: "F&B Service & Kitchen Staff" },
    { title: t("cat2"), en: "Lodging Housekeeping" },
    { title: t("cat3"), en: "Manufacturing & Production" },
    { title: t("cat4"), en: "Logistics & Warehouse" },
  ];

  const process = [
    t("p1"),
    t("p2"),
    t("p3"),
    t("p4"),
    t("p5"),
    t("p6"),
    t("p7"),
    t("p8"),
    t("p9"),
  ];

  const reqs = [
    t("reqNat"),
    t("reqKor"),
    t("reqExp"),
    t("reqRegion"),
    t("reqResume"),
    t("reqVisa"),
  ];

  return (
    <div>
      <section className="hr-hero">
        <div className="hr-eyebrow">{t("heroEyebrow")}</div>
        <h2>{t("heroTitle")}</h2>
        <p>{t("heroDesc")}</p>
        <div className="hr-lang-chips">
          <span className="hr-lang-chip">한국어</span>
          <span className="hr-lang-chip">English</span>
          <span className="hr-lang-chip">中文</span>
          <span className="hr-lang-chip">日本語</span>
          <span className="hr-lang-chip">Tiếng Việt</span>
          <span className="hr-lang-chip">Bahasa Indonesia</span>
        </div>
        <div className="hr-hero-actions">
          {user ? (
            <>
              <Link href="/recruit/jobs">
                <Button>{t("ctaJobs")}</Button>
              </Link>
              <Link href="/recruit/seeker/resumes">
                <Button variant="ghost">{t("ctaResume")}</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/recruit/auth/signup">
                <Button>{t("ctaSignup")}</Button>
              </Link>
              <Link href="/recruit/auth/login">
                <Button variant="ghost">{t("ctaLogin")}</Button>
              </Link>
            </>
          )}
          <a href="#process">
            <Button variant="ghost">{t("ctaProcess")}</Button>
          </a>
        </div>
      </section>

      <section className="hr-section">
        <span className="hr-badge hr-badge-accent">{t("sampleBadge")}</span>
        <h2 style={{ marginTop: 10 }}>{t("jobsTitle")}</h2>
        <p>{t("jobsSub")}</p>
        <div className="hr-cat-grid">
          {cats.map((c) => (
            <div key={c.en} className="hr-cat-card">
              <h3>{c.title}</h3>
              <div className="en">{c.en}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <Link href="/recruit/jobs">
            <Button variant="ghost">{t("viewAll")}</Button>
          </Link>
        </div>
        {jobsLoading ? (
          <Loading />
        ) : (
          <div className="hr-grid hr-grid-2">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/recruit/jobs/${job.id}`}
                className="hr-job-item hr-card"
              >
                <div className="hr-meta">
                  <span>{job.company?.companyName || "HIHONG"}</span>
                  {job.foreignerAllowed ? (
                    <Badge tone="accent">Foreign OK</Badge>
                  ) : null}
                </div>
                <h3>{job.title}</h3>
                <div className="hr-meta">
                  <span>{job.workLocation || "-"}</span>
                  <span>{job.employmentType || "-"}</span>
                </div>
              </Link>
            ))}
            {!jobs.length ? (
              <Card>
                <p style={{ color: "var(--hr-muted)", margin: 0 }}>{t("emptyJobs")}</p>
              </Card>
            ) : null}
          </div>
        )}
      </section>

      <section className="hr-section" style={{ background: "var(--hr-accent-soft)", padding: 16, borderRadius: 4 }}>
        <h2>{t("reqTitle")}</h2>
        <p>{t("reqSub")}</p>
        <div className="hr-req-grid">
          {reqs.map((r) => (
            <div key={r} className="hr-req-item">
              <strong>{r}</strong>
            </div>
          ))}
        </div>
        <p className="hr-legal">{t("legalNote")}</p>
      </section>

      <section className="hr-section" id="process">
        <h2>{t("processTitle")}</h2>
        <p>{t("processSub")}</p>
        <div className="hr-process">
          {process.map((step, i) => (
            <div key={step} className="hr-process-step">
              <div className="num">{String(i + 1).padStart(2, "0")}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
        <p className="hr-legal">{t("hqNote")}</p>
      </section>

      <section className="hr-section">
        <h2>{t("contactTitle")}</h2>
        <div className="hr-contact-panel">
          <div className="hr-contact-row">
            <strong>HIHONG PEOPLE</strong>
            <span>{t("contactDept")}</span>
          </div>
          <div className="hr-contact-row">
            <strong>TEL</strong>
            <span>{t("contactPhone")}</span>
          </div>
          <div className="hr-contact-row">
            <strong>ADDR</strong>
            <span>{t("contactAddr")}</span>
          </div>
          <div className="hr-contact-row">
            <strong>LANG</strong>
            <span>{t("contactLang")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
