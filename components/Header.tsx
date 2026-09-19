import Link from "next/link";

// 모든 화면 위에 붙는 내비게이션 바.
export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          {/* 보라색 로고 타일 */}
          <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white">
            P
          </span>
          <span className="text-base font-semibold">프리미엄 아카이브</span>
        </Link>

        <Link
          href="/membership"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          멤버십
        </Link>
      </div>
    </header>
  );
}
