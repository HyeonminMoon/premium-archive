import Link from "next/link";

// 글 상세와 멤버십 안내 아래에 붙는 "목록으로" 링크.
export default function BackToListLink() {
  return (
    <div className="mt-10 border-t border-neutral-200 pt-6">
      <Link href="/" className="text-sm text-neutral-600 hover:underline">
        ← 글 목록으로
      </Link>
    </div>
  );
}
