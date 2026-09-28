import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";

// 3. 회원가입 - 회원이 된다.
//
// 폼을 서버에서 처리한다. 비밀번호가 브라우저 자바스크립트를 거치지 않고
// 바로 서버로 간다. 자바스크립트가 꺼져 있어도 가입이 된다.
async function signUp(formData: FormData) {
  "use server";

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const nickname = String(formData.get("nickname")).trim();

  if (nickname.length === 0) {
    redirect("/signup?error=" + encodeURIComponent("닉네임을 입력해 주세요."));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // 여기 담아 보낸 닉네임을 데이터베이스가 받아서 profiles 줄을 만든다.
    options: { data: { nickname } },
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  // 가입이 끝났으니 환영 메일을 보낸다.
  // 이 코드는 "use server" 안이라 서버에서만 돈다. 메일 키가 브라우저로 가지 않는다.
  //
  // 메일이 실패해도 가입은 이미 끝났다. 그래서 결과를 확인만 하고 넘어간다.
  // 여기서 redirect 를 막거나 에러를 띄우면, 가입은 됐는데 실패한 것처럼 보인다.
  const mail = await sendWelcomeEmail(email, nickname);
  if (!mail.ok) {
    console.error("환영 메일 발송 실패:", email, mail.reason);
  }

  // 이메일 확인 설정이 켜져 있으면 가입 직후에는 로그인 상태가 아니다.
  // 이때는 메일함을 확인하라고 안내한다.
  if (!data.session) {
    redirect("/signup?sent=1");
  }

  redirect("/");
}

export const metadata: Metadata = {
  title: "회원가입",
  description: "프리미엄 아카이브 계정을 만듭니다.",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const { error, sent } = await searchParams;

  if (sent) {
    return (
      <div className="mx-auto max-w-sm rounded-2xl bg-card p-6 text-center shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
        <h1 className="text-xl font-bold">메일함을 확인해 주세요</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          가입 확인 메일을 보냈습니다. 메일 속 링크를 누르면 가입이 끝납니다.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          로그인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm rounded-2xl bg-card p-6 shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
      <h1 className="text-xl font-bold">회원가입</h1>
      <p className="mt-2 text-sm text-muted">
        가입하면 멤버십을 결제하고 프리미엄 글을 읽을 수 있습니다.
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <form action={signUp} className="mt-6 space-y-4">
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
            minLength={6}
            autoComplete="new-password"
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <span className="mt-1 block text-xs text-muted">6자 이상</span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">닉네임</span>
          <input
            type="text"
            name="nickname"
            required
            maxLength={20}
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          가입하기
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        이미 회원이신가요?{" "}
        <Link href="/login" className="font-semibold text-accent">
          로그인
        </Link>
      </p>
    </div>
  );
}
