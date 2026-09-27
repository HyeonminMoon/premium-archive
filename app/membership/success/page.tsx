import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// 결제 승인 화면. 여기는 서버에서만 돌아간다 ("use client" 가 없다).
//
// 이 화면에 도착한 것만으로는 결제가 끝난 게 아니다. 카드 "인증"만 끝난 상태다.
// 아래에서 토스에 "이 결제 승인해줘"를 우리 서버가 직접 요청해야 돈이 움직인다.
// 그리고 그 요청이 성공한 지점이 멤버십을 켜는 유일한 스위치다.
//
// 주소를 직접 쳐서 들어와도(예: ?amount=100) 멤버십은 켜지지 않는다.

// 월 구독료. 승인 요청 전에 주문 금액이 이 값과 같은지 반드시 대조한다.
const MONTHLY_PRICE = 9900;

export const metadata: Metadata = {
  title: "결제 확인",
  description: "멤버십 결제 결과를 확인합니다.",
  robots: { index: false, follow: false },
};

export default async function PaymentSuccessPage({
  searchParams,
}: PageProps<"/membership/success">) {
  const { paymentKey, orderId, amount } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 이미 회원이면 승인을 다시 요청하지 않는다.
  // (이 화면을 새로 고치면 같은 결제를 두 번 승인하려다 에러가 난다)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_member")
    .eq("id", user.id)
    .single();

  if (profile?.is_member) {
    return <Done />;
  }

  // ① 주소로 넘어온 값 확인. 브라우저에서 온 값이라 그대로 믿지 않는다.
  if (typeof paymentKey !== "string" || typeof orderId !== "string") {
    return <Failed message="결제 정보가 올바르지 않습니다." />;
  }

  // ② 금액 검증. 우리 상품은 9,900원 하나뿐이므로, 그 값과 다르면 조작된 요청이다.
  //    이 줄이 없으면 amount=100 으로 바꿔서 100원만 내고 멤버십을 가져갈 수 있다.
  if (Number(amount) !== MONTHLY_PRICE) {
    return <Failed message="주문 금액이 올바르지 않습니다." />;
  }

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      ".env.local 에 TOSS_SECRET_KEY 가 필요합니다. 값을 채운 뒤 개발 서버를 껐다 켜세요.",
    );
  }

  // ③ 승인 요청. 시크릿 키 뒤에 콜론(:)을 붙여 base64로 만든 값을 헤더에 넣는다.
  //    콜론을 빠뜨리는 게 가장 흔한 실수다.
  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(secretKey + ":").toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount: MONTHLY_PRICE }),
  });

  const payment = await response.json();

  if (!response.ok) {
    return <Failed message={payment.message ?? "결제 승인에 실패했습니다."} />;
  }

  // 토스가 승인한 금액도 한 번 더 대조한다.
  if (payment.totalAmount !== MONTHLY_PRICE) {
    return <Failed message="승인된 금액이 주문 금액과 다릅니다." />;
  }

  // ④ 승인이 성공했을 때만 도달하는 줄이다. 여기서 두 가지를 한다.
  //    이 코드는 서버에서만 돌아간다 — 파일에 "use client" 가 없고,
  //    비밀 키를 쓰는 createAdminClient 는 브라우저에서 부를 수 없다.
  const admin = createAdminClient();

  // ④-1. 결제 기록을 먼저 남긴다. 누가·언제·얼마를 결제했는지가 여기에 남는다.
  //       금액은 우리가 보낸 값이 아니라 토스가 승인한 값을 그대로 적는다.
  const { error: recordError } = await admin.from("payments").insert({
    user_id: user.id,
    order_id: orderId,
    payment_key: paymentKey,
    amount: payment.totalAmount,
    method: payment.method ?? null,
    status: payment.status,
    approved_at: payment.approvedAt,
  });

  if (recordError) {
    // 사유를 서버 로그에 남긴다. 화면에는 내부 사정을 보여주지 않는다.
    console.error("결제 기록 저장 실패:", paymentKey, recordError);
    return (
      <Failed
        message={`결제는 되었지만 결제 기록 저장에 실패했습니다. 이 번호로 문의해 주세요: ${paymentKey}`}
      />
    );
  }

  // ④-2. 멤버십을 '활성'으로 바꾼다. is_member 가 true 인 회원이 활성 회원이다.
  const { error } = await admin
    .from("profiles")
    .update({ is_member: true })
    .eq("id", user.id);

  if (error) {
    // 돈은 빠져나갔는데 우리 기록이 실패한 경우. 결제 번호를 보여줘서
    // 문의하면 손으로 복구할 수 있게 한다.
    return (
      <Failed
        message={`결제는 되었지만 멤버십 반영에 실패했습니다. 이 번호로 문의해 주세요: ${paymentKey}`}
      />
    );
  }

  return <Done />;
}

function Done() {
  return (
    <div className="rounded-2xl bg-card p-6 text-center shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
      <h1 className="text-2xl font-bold">멤버십이 시작되었습니다</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        이제 프리미엄 글을 전부 읽을 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
      >
        글 목록으로
      </Link>
    </div>
  );
}

function Failed({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-card p-6 text-center shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
      <h1 className="text-2xl font-bold">결제가 완료되지 않았습니다</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{message}</p>
      <Link
        href="/membership"
        className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
      >
        다시 시도하기
      </Link>
    </div>
  );
}
