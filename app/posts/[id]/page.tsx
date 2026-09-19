import Link from "next/link";
import { notFound } from "next/navigation";
import PostBadge from "@/components/PostBadge";
import BackToListLink from "@/components/BackToListLink";
import { getPostForReader } from "@/data/mock-posts";

// 2. 글 상세 - 글을 읽는다 / 멤버십의 필요성을 느낀다.
export default async function PostDetailPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;

  // 아직 로그인 기능이 없어서 모두 비회원으로 본다.
  // 로그인이 생기면 이 값을 서버에서 확인한 멤버십 여부로 바꾼다.
  const hasMembership = false;

  const post = getPostForReader(Number(id), hasMembership);
  if (!post) notFound();

  return (
    <article>
      <div className="flex items-center gap-2">
        <PostBadge isPremium={post.isPremium} />
        <span className="text-xs text-neutral-500">{post.createdAt}</span>
      </div>

      <h1 className="mt-3 text-2xl font-bold leading-snug">{post.title}</h1>

      <div className="mt-8 space-y-5 leading-relaxed text-neutral-800">
        {post.body.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {/* locked가 true면 위 본문은 맛보기 한 문단뿐이다. 나머지는 서버에서 보내지 않았다. */}
      {post.locked && (
        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="font-semibold text-amber-900">
            이 글은 멤버십 회원 전용입니다
          </p>
          <p className="mt-2 text-sm text-amber-800">
            멤버십에 가입하면 이 글의 전문과 모든 프리미엄 글을 읽을 수 있습니다.
          </p>
          <Link
            href="/membership"
            className="mt-5 inline-block rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            멤버십 알아보기
          </Link>
        </div>
      )}

      <BackToListLink />
    </article>
  );
}
