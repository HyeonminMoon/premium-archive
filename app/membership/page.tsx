import type { Metadata } from "next";
import Link from "next/link";
import BackToListLink from "@/components/BackToListLink";
import { createClient } from "@/lib/supabase/server";
import PaymentWidget from "./PaymentWidget";

// 4. 멤버십 안내 - 결제를 결심한다.
export const metadata: Metadata = {
  title: "멤버십",
  description:
    "월 9,900원으로 프리미엄 글 전체를 읽습니다. 언제든 해지할 수 있습니다.",
  openGraph: {
    title: "멤버십 · 프리미엄 아카이브",
    description:
      "월 9,900원으로 프리미엄 글 전체를 읽습니다. 언제든 해지할 수 있습니다.",
    url: "/membership",
  },
};

export default async function MembershipPage({
  searchParams,
}: PageProps<"/membership">) {
  // 결제가 실패하면 토스가 이 화면으로 되돌려 보내면서 사유를 주소에 붙여 준다.
  const { message } = await searchParams;

  // 토스 클라이언트 키는 서버에서 읽어서 결제 위젯에 넘긴다.
  const tossClientKey = process.env.TOSS_CLIENT_KEY;
  if (!tossClientKey) {
    throw new Error(
      "TOSS_CLIENT_KEY 가 없습니다. 내 컴퓨터에서는 .env.local 에, " +
        "Vercel 배포에서는 Project Settings > Environment Variables 에 값을 넣으세요.",
    );
  }

  const supabase = await createClient();

  // 로그인 여부와 멤버십 여부를 서버에서 확인한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("is_member").eq("id", user.id).single()
    : { data: null };

  const isMember = profile?.is_member ?? false;

  const benefits = [
    "프리미엄 글 전문 열람",
    "새 글이 올라오면 바로 읽기",
    "지난 글 아카이브 전체 공개",
  ];

  return (
    <div>
      <div className="rounded-2xl bg-card p-6 shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
        <span className="text-xs font-bold tracking-wide text-accent">
          멤버십
        </span>
        <h1 className="mt-2 text-2xl font-bold">
          프리미엄 글을 전부 읽으세요
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          한 번 결제하면 프리미엄 글이 모두 열립니다.
        </p>

        <div className="mt-6 flex items-baseline gap-1 border-t border-line pt-6">
          <span className="text-4xl font-bold">9,900원</span>
          <span className="text-muted">/ 월</span>
        </div>

        <ul className="mt-6 space-y-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        {message && (
          <p className="mt-6 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">
            결제가 완료되지 않았습니다: {message}
          </p>
        )}

        {/* 세 갈래다. 이미 회원 / 비로그인 / 결제할 수 있는 회원.
            결제창을 띄울 수 있는 건 마지막 경우뿐이다. */}
        {isMember ? (
          <div className="mt-8 rounded-xl border border-line px-4 py-4 text-center">
            <p className="text-sm font-bold">이미 이용 중입니다</p>
            <Link
              href="/library"
              className="mt-3 inline-block text-sm font-semibold text-accent"
            >
              내 서재로 가기
            </Link>
          </div>
        ) : user ? (
          <PaymentWidget
            clientKey={tossClientKey}
            customerKey={user.id}
            customerEmail={user.email ?? ""}
          />
        ) : (
          <div className="mt-8 border-t border-line pt-6 text-center">
            <p className="text-sm text-muted">
              결제하려면 먼저 로그인해야 합니다.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block w-full rounded-full bg-accent px-5 py-3.5 font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              로그인하고 시작하기
            </Link>
          </div>
        )}
      </div>

      <BackToListLink />
    </div>
  );
}
