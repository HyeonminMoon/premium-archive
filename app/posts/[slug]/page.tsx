import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostBadge from "@/components/PostBadge";
import BackToListLink from "@/components/BackToListLink";
import { getPostForReader } from "@/data/posts";

// 글마다 제목과 설명이 달라지므로, 고정값 대신 함수로 만든다.
// Next.js 가 화면을 그리기 전에 이 함수를 먼저 불러서 <head> 를 채운다.
export async function generateMetadata({
  params,
}: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostForReader(slug);

  if (!post) return { title: "글을 찾을 수 없습니다" };

  const url = `/posts/${slug}`;

  // 요약문에 들어 있는 줄바꿈을 공백 한 칸으로 바꾼다.
  // 메타태그는 한 줄이어야 검색 결과에 깔끔하게 나온다.
  const description = post.summary.replace(/\s+/g, " ").trim();

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

// 2. 글 상세 - 글을 읽는다 / 멤버십의 필요성을 느낀다.
export default async function PostDetailPage({ params }: PageProps<"/posts/[slug]">) {
  const { slug } = await params;

  // 멤버십 여부를 여기서 판단하지 않는다.
  // 로그인 쿠키를 실어 보내고, 본문을 보내줄지 말지는 데이터베이스가 정한다.
  const post = await getPostForReader(slug);
  if (!post) notFound();

  return (
    <article>
      <div className="rounded-2xl bg-card p-6 shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
        <div className="flex items-center gap-2">
          <PostBadge isPremium={post.isPremium} />
          <span className="text-xs text-muted">{post.publishedAt}</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold leading-snug">{post.title}</h1>

        <div className="mt-6 space-y-5 leading-[1.9] text-foreground/90">
          {post.body.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* locked가 true면 위 본문은 맛보기 한 문단뿐이다. 나머지는 서버에서 보내지 않았다. */}
        {post.locked && (
          <div className="mt-8 rounded-2xl bg-accent-soft p-6 text-center">
            <p className="text-base font-bold text-accent">
              멤버십 회원 전용 콘텐츠입니다
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              멤버십에 가입하면 이 글의 전문과 모든 프리미엄 글을 읽을 수 있습니다.
            </p>
            <Link
              href="/membership"
              className="mt-5 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              멤버십 알아보기
            </Link>
          </div>
        )}
      </div>

      <BackToListLink />
    </article>
  );
}
