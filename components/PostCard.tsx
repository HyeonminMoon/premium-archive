import Link from "next/link";
import type { PostSummary } from "@/data/posts";
import PostBadge from "./PostBadge";

// 홈 목록의 글 카드 하나. 본문 없이 요약 정보만 받는다.
export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block rounded-2xl bg-card p-5 shadow-[0_1px_3px_rgba(30,27,51,0.06)] transition hover:shadow-[0_6px_20px_rgba(108,92,231,0.12)]"
    >
      <div className="flex items-center gap-2">
        <PostBadge isPremium={post.isPremium} />
        <span className="text-xs text-muted">{post.publishedAt}</span>
      </div>

      <h2 className="mt-3 text-lg font-bold leading-snug">{post.title}</h2>

      {/* 요약의 줄바꿈은 지키지 않는다. 화면 폭에 맞춰 자연스럽게 흐르게 둔다. */}
      <p className="mt-2 text-sm leading-relaxed text-muted">{post.summary}</p>

      <span className="mt-4 inline-block text-sm font-semibold text-accent">
        읽어보기 →
      </span>
    </Link>
  );
}
