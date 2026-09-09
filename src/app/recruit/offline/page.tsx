export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
      <p className="text-4xl">📡</p>
      <h1 className="text-lg font-bold text-slate-900">오프라인 상태입니다</h1>
      <p className="text-sm text-slate-500">
        인터넷 연결을 확인한 후 다시 시도해주세요. 이전에 방문한 페이지는 캐시에서
        계속 볼 수 있습니다.
      </p>
    </div>
  );
}
