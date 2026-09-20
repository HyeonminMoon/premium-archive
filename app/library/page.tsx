import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 5. 내 서재 - 내 멤버십 상태를 확인한다.
export default async function LibraryPage() {
  const supabase = await createClient();

  // 로그인 여부를 서버에서 확인한다. 화면에서 숨기는 게 아니라
  // 애초에 로그인하지 않은 사람은 이 아래 코드까지 오지 못한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, is_member")
    .eq("id", user.id)
    .single();

  const isMember = profile?.is_member ?? false;

  return (
    <div>
      <div className="rounded-2xl bg-card p-6 shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
        <span className="text-xs font-bold tracking-wide text-accent">내 서재</span>
        <h1 className="mt-2 text-2xl font-bold">{profile?.nickname}님</h1>
        <p className="mt-2 text-sm text-muted">{user.email}</p>

        <dl className="mt-6 flex items-center justify-between rounded-xl border border-line px-4 py-3">
          <dt className="text-sm font-semibold">멤버십</dt>
          <dd
            className={
              isMember
                ? "rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent"
                : "rounded-full bg-background px-3 py-1 text-xs font-bold text-muted"
            }
          >
            {isMember ? "멤버십 회원" : "무료 회원"}
          </dd>
        </dl>

        {isMember ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            프리미엄 글을 전부 읽을 수 있습니다. 새 글이 올라오면 바로 확인해 보세요.
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              아직 멤버십 회원이 아닙니다. 멤버십에 가입하면 프리미엄 글을 전부 읽을 수
              있습니다.
            </p>
            <Link
              href="/membership"
              className="mt-5 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              멤버십 보러 가기
            </Link>
          </>
        )}
      </div>

      <p className="mt-6 text-center">
        <Link href="/" className="text-sm font-semibold text-accent">
          글 목록으로
        </Link>
      </p>
    </div>
  );
}
