import JobPostForm, { emptyJobPostForm } from "@/components/recruit/JobPostForm";

export default function NewJobPostPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-slate-900">새 채용공고</h1>
      <JobPostForm initial={emptyJobPostForm} mode="create" />
    </div>
  );
}
