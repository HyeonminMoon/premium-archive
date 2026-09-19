import Link from "next/link";

// 모든 화면 위에 붙는 내비게이션 바.
export default function Header() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-semibold">
          프리미엄 아카이브
        </Link>
        <Link
          href="/membership"
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          멤버십
        </Link>
      </div>
    </header>
  );
}
