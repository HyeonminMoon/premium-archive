import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function logOut() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// 모든 화면 위에 붙는 내비게이션 바.
export default async function Header() {
  const supabase = await createClient();

  // getUser()는 쿠키를 그대로 믿지 않고 Supabase 서버에 한 번 물어본다.
  // 쿠키만 읽는 getSession()과 달라서, 위조된 쿠키로는 로그인한 척할 수 없다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 닉네임은 profiles 표에서 가져온다. 내 줄만 읽히도록 데이터베이스가 막아 둔다.
  const { data: profile } = user
    ? await supabase.from("profiles").select("nickname").eq("id", user.id).single()
    : { data: null };

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          {/* 보라색 로고 타일 */}
          <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white">
            P
          </span>
          <span className="text-base font-semibold">프리미엄 아카이브</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/membership"
            className="text-sm font-semibold text-muted transition hover:text-foreground"
          >
            멤버십
          </Link>

          {user ? (
            <>
              <span className="text-sm font-semibold">{profile?.nickname}</span>
              <form action={logOut}>
                <button
                  type="submit"
                  className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
