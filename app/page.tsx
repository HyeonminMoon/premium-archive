import PostCard from "@/components/PostCard";
import { getPostsForList } from "@/data/mock-posts";

// 1. 홈 - 읽을 글을 고른다.
export default function HomePage() {
  // 본문은 담기지 않은 목록용 데이터. 최신순으로 이미 정렬되어 있다.
  const posts = getPostsForList();

  return (
    <div>
      <h1 className="text-2xl font-bold">AI 시대의 일하는 법</h1>
      <p className="mt-2 text-neutral-600">
        도구가 아니라 일하는 방식에 대한 글을 모읍니다.
      </p>

      <ul className="mt-8 space-y-4">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
