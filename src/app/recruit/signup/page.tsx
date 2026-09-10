import Link from "next/link";
import Card from "@/components/recruit/ui/Card";

export default function SignupChoicePage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-xl font-bold text-slate-900">회원가입</h1>
      <p className="mt-1 text-sm text-slate-500">가입 유형을 선택하세요.</p>

      <div className="mt-6 flex flex-col gap-4">
        <Link href="/recruit/signup/seeker">
          <Card className="transition-shadow hover:shadow-md">
            <p className="font-semibold text-slate-900">구직자 회원가입</p>
            <p className="mt-1 text-sm text-slate-500">
              이력서를 작성하고 채용공고에 지원하세요.
            </p>
          </Card>
        </Link>
        <Link href="/recruit/signup/company">
          <Card className="transition-shadow hover:shadow-md">
            <p className="font-semibold text-slate-900">기업회원 회원가입</p>
            <p className="mt-1 text-sm text-slate-500">
              채용공고를 등록하고 인재를 검색하세요.
            </p>
          </Card>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/recruit/login" className="font-medium text-slate-900 underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
