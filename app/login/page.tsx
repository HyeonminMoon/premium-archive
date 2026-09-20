import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 3. 로그인 - 회원이 된다.
async function logIn(formData: FormData) {
  "use server";

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // 어느 쪽이 틀렸는지는 알려주지 않는다.
    // "이메일은 맞다"는 정보만으로도 가입 여부가 새어 나간다.
    redirect(
      "/login?error=" +
        encodeURIComponent("이메일 또는 비밀번호가 올바르지 않습니다."),
    );
  }

  redirect("/");
}

export default async function LogInPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm rounded-2xl bg-card p-6 shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
      <h1 className="text-xl font-bold">로그인</h1>

      {error && (
        <p className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <form action={logIn} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold">이메일</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">비밀번호</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          로그인
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" className="font-semibold text-accent">
          회원가입
        </Link>
      </p>
    </div>
  );
}
