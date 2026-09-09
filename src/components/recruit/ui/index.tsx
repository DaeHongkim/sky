"use client";

import Link from "next/link";
import { ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button className={`hr-btn hr-btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`hr-card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warn" | "danger";
}) {
  return <span className={`hr-badge hr-badge-${tone}`}>{children}</span>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="hr-empty">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export function Loading() {
  return <div className="hr-loading">불러오는 중…</div>;
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string },
) {
  const { label, id, className = "", ...rest } = props;
  return (
    <label className="hr-field">
      {label ? <span className="hr-label">{label}</span> : null}
      <input id={id} className={`hr-input ${className}`} {...rest} />
    </label>
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string },
) {
  const { label, children, className = "", ...rest } = props;
  return (
    <label className="hr-field">
      {label ? <span className="hr-label">{label}</span> : null}
      <select className={`hr-input ${className}`} {...rest}>
        {children}
      </select>
    </label>
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string },
) {
  const { label, className = "", ...rest } = props;
  return (
    <label className="hr-field">
      {label ? <span className="hr-label">{label}</span> : null}
      <textarea className={`hr-textarea ${className}`} {...rest} />
    </label>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="hr-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function BrandLink() {
  return (
    <Link href="/recruit" className="hr-brand">
      <span className="hr-brand-mark">H</span>
      <span className="hr-brand-text">
        HIHONG <em>RECRUIT</em>
        <small>HIHONG PEOPLE</small>
      </span>
    </Link>
  );
}
