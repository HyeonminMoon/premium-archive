import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTopPostsByViews } from "@/data/posts";

export const metadata: Metadata = {
  title: "관리자 통계",
  description: "가입자와 글 조회수를 한눈에 봅니다.",
  robots: { index: false, follow: false },
};

// 관리자 전용 통계 화면.
//
// 잠금은 두 겹이다.
//   1) 이 파일에서 is_admin 을 확인하고, 아니면 404 를 보여준다.
//   2) 데이터베이스의 보안 규칙(RLS)이 관리자가 아닌 사람에게는
//      다른 사람의 프로필을 아예 보내지 않는다.
//
// 1번만 있으면 "화면에서 가린 것"이고, 진짜 방어는 2번이다.
// 이 파일이 통째로 잘못돼도 남의 가입 정보는 새어 나가지 않는다.
export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 관리자인지 확인한다. is_admin 은 본인이 켤 수 없는 값이다.
  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  // 관리자가 아니면 "이런 주소는 없다"고 답한다.
  // "권한이 없다"고 알려 주면 주소가 있다는 사실 자체가 새어 나간다.
  if (!me?.is_admin) notFound();

  // ---------- 숫자 모으기 ----------
  // head: true = 줄 내용은 받지 않고 개수만 센다.
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: memberUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_member", true);

  // 오늘 가입자. 한국 시간 기준 오늘 0시부터 센다.
  const { count: todayUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfTodayInKorea());

  const total = totalUsers ?? 0;
  const members = memberUsers ?? 0;
  // 전환율 = 멤버십 회원 / 전체 가입자. 가입자가 0명이면 0%로 둔다.
  const conversionRate = total > 0 ? (members / total) * 100 : 0;

  const topPosts = await getTopPostsByViews(10);

  return (
    <div>
      <div className="rounded-2xl bg-card p-6 shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
        <span className="text-xs font-bold tracking-wide text-accent">관리자</span>
        <h1 className="mt-2 text-2xl font-bold">통계</h1>
        <p className="mt-2 text-sm text-muted">
          가입자 현황과 글별 조회수입니다.
        </p>

        {/* 숫자 카드 4개 */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="전체 가입자" value={`${total.toLocaleString()}명`} />
          <StatCard label="멤버십 회원" value={`${members.toLocaleString()}명`} />
          <StatCard
            label="멤버십 전환율"
            value={`${conversionRate.toFixed(1)}%`}
            highlight
          />
          <StatCard
            label="오늘 가입자"
            value={`${(todayUsers ?? 0).toLocaleString()}명`}
          />
        </div>
      </div>

      {/* 조회수 상위 글 표 */}
      <div className="mt-4 rounded-2xl bg-card p-6 shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
        <h2 className="text-lg font-bold">조회수 상위 글</h2>

        {topPosts.length === 0 ? (
          <p className="mt-4 text-sm text-muted">아직 기록된 조회수가 없습니다.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="pb-2 pr-3 font-semibold">#</th>
                  <th className="pb-2 pr-3 font-semibold">제목</th>
                  <th className="pb-2 pr-3 font-semibold">구분</th>
                  <th className="pb-2 text-right font-semibold">조회수</th>
                </tr>
              </thead>
              <tbody>
                {topPosts.map((post, index) => (
                  <tr key={post.slug} className="border-b border-line last:border-0">
                    <td className="py-3 pr-3 text-muted">{index + 1}</td>
                    <td className="py-3 pr-3">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="font-semibold hover:text-accent hover:underline"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={
                          post.isPremium
                            ? "rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-accent"
                            : "rounded-full bg-background px-2.5 py-1 text-[11px] font-bold text-muted"
                        }
                      >
                        {post.isPremium ? "프리미엄" : "무료"}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums">
                      {post.viewCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// 숫자 하나를 담는 카드.
function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl bg-accent-soft px-4 py-4"
          : "rounded-xl border border-line px-4 py-4"
      }
    >
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p
        className={
          highlight
            ? "mt-1.5 text-2xl font-bold text-accent"
            : "mt-1.5 text-2xl font-bold"
        }
      >
        {value}
      </p>
    </div>
  );
}

// 한국 시간으로 오늘 0시가 세계 표준시(UTC)로 언제인지 계산한다.
// 서버가 어느 나라에 있든 "한국의 오늘"을 기준으로 세기 위함이다.
function startOfTodayInKorea(): string {
  const KOREA_OFFSET_MS = 9 * 60 * 60 * 1000;
  const nowInKorea = new Date(Date.now() + KOREA_OFFSET_MS);
  const midnightInKorea = Date.UTC(
    nowInKorea.getUTCFullYear(),
    nowInKorea.getUTCMonth(),
    nowInKorea.getUTCDate(),
  );
  return new Date(midnightInKorea - KOREA_OFFSET_MS).toISOString();
}
