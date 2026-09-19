import Link from "next/link";
import type { PostSummary } from "@/data/mock-posts";
import PostBadge from "./PostBadge";

// 홈 목록의 글 카드 하나. 본문 없이 요약 정보만 받는다.
export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="block rounded-xl border border-neutral-200 p-5 hover:border-neutral-400"
    >
      <div className="flex items-center gap-2">
        <PostBadge isPremium={post.isPremium} />
        <span className="text-xs text-neutral-500">{post.createdAt}</span>
      </div>

      <h2 className="mt-3 text-lg font-semibold">{post.title}</h2>

      {/* 요약은 줄바꿈이 있어서 whitespace-pre-line으로 그대로 보여준다 */}
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
        {post.summary}
      </p>
    </Link>
  );
}
