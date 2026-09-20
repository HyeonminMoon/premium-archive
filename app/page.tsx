import PostCard from "@/components/PostCard";
import { getPostsForList } from "@/data/posts";

// 1. 홈 - 읽을 글을 고른다.
export default async function HomePage() {
  // 본문이 없는 posts 표에서만 읽는다. 최신순 정렬은 데이터베이스가 한다.
  const posts = await getPostsForList();

  return (
    <div>
      <section className="rounded-2xl bg-card p-6 shadow-[0_1px_3px_rgba(30,27,51,0.06)]">
        <span className="text-xs font-bold tracking-wide text-accent">
          아카이브
        </span>
        <h1 className="mt-2 text-2xl font-bold leading-snug">
          AI 시대의 일하는 법
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          도구가 아니라 일하는 방식에 대한 글을 모읍니다.
        </p>
      </section>

      <p className="mt-8 px-1 text-sm font-semibold text-muted">
        전체 {posts.length}개 글
      </p>

      <ul className="mt-3 space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
