import type { Metadata } from "next";
import "./company.css";
import { LanguageProvider } from "@/lib/company/LanguageContext";
import CompanyHeader from "@/components/company/CompanyHeader";
import CompanyFooter from "@/components/company/CompanyFooter";

export const metadata: Metadata = {
  title: "주식회사 하이홍화토 | 브랜드와 사업의 가능성을 연결합니다",
  description:
    "주식회사 하이홍화토는 F&B·프랜차이즈, 공간·인테리어, 마케팅·브랜딩, 디자인·콘텐츠, 인재매칭과 지역상권 프로젝트를 수행합니다.",
};

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="hh-root">
        <CompanyHeader />
        <main>{children}</main>
        <CompanyFooter />
      </div>
    </LanguageProvider>
  );
}
