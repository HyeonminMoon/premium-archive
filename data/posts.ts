import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------
// 글 데이터를 Supabase에서 읽어 온다.
//
// 표가 두 개로 나뉘어 있는 게 핵심이다.
//   posts       : 제목 · 요약 · 맛보기 (본문 없음)  → 누구나 읽는다
//   post_bodies : 본문만                            → 볼 수 있는 사람에게만 보인다
//
// 그래서 "화면에서 가린다"가 아니라 "애초에 보내지 않는다"가 된다.
// ---------------------------------------------------------------

/** 홈 목록에 쓸 데이터. 본문은 애초에 이 표에 없다. */
export type PostSummary = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string; // YYYY-MM-DD
  isPremium: boolean;
};

/** 글 상세에 쓸 데이터. locked가 true면 body는 맛보기뿐이다. */
export type PostForReader = PostSummary & {
  body: string;
  locked: boolean;
};

/** 홈 목록. posts 표에는 본문이 없으므로 전부 공개해도 안전하다. */
export async function getPostsForList(): Promise<PostSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, summary, is_premium, published_at")
    .order("published_at", { ascending: false }); // 최신순

  if (error) throw error;

  return (data ?? []).map((row) => ({
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    publishedAt: row.published_at.slice(0, 10),
    isPremium: row.is_premium,
  }));
}

/** 글 상세. 주소에 들어간 slug로 찾는다. 없는 글이면 null. */
export async function getPostForReader(
  slug: string,
): Promise<PostForReader | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, slug, title, summary, is_premium, preview, published_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!post) return null;

  // 본문 표는 보안 규칙이 걸려 있다.
  // 권한이 없으면 "에러"가 아니라 "0건"이 돌아온다.
  // 우리가 잠글지 말지 판단하는 게 아니라, 데이터베이스가 이미 판단해서 보내준 것이다.
  const { data: bodyRow, error: bodyError } = await supabase
    .from("post_bodies")
    .select("body")
    .eq("post_id", post.id)
    .maybeSingle();

  if (bodyError) throw bodyError;

  return {
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    publishedAt: post.published_at.slice(0, 10),
    isPremium: post.is_premium,
    // 본문이 안 왔으면 맛보기를 보여준다. 본문은 서버까지도 오지 않았다.
    body: bodyRow?.body ?? post.preview,
    locked: !bodyRow,
  };
}

/** 글 조회수를 1 올린다. 글 상세 화면이 열릴 때마다 부른다. */
export async function countView(slug: string): Promise<void> {
  const supabase = await createClient();

  // 화면 코드가 posts 표를 직접 고치지는 못한다.
  // 데이터베이스에 만들어 둔 함수만 부를 수 있고, 그 함수는 1 올리는 일만 한다.
  // 그래서 숫자를 마음대로 바꿔치기할 수 없다.
  const { error } = await supabase.rpc("increment_view_count", {
    post_slug: slug,
  });

  // 조회수 기록이 실패했다고 글을 못 보여줄 이유는 없다. 기록만 남기고 넘어간다.
  if (error) console.error("조회수 기록 실패:", slug, error.message);
}

/** 관리자 통계에 쓸 조회수 상위 글. */
export type TopPost = {
  slug: string;
  title: string;
  isPremium: boolean;
  viewCount: number;
};

export async function getTopPostsByViews(limit = 10): Promise<TopPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, is_premium, view_count")
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    slug: row.slug,
    title: row.title,
    isPremium: row.is_premium,
    viewCount: row.view_count ?? 0,
  }));
}
