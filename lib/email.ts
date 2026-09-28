// Resend로 이메일을 보내는 코드.
//
// 이 파일은 서버에서만 돈다. 브라우저에서 부르면 API 키가 그대로 새어 나가므로,
// 실수로 불렀을 때 바로 터지도록 맨 위에서 막아 둔다.
// ("use client" 가 붙은 파일에서 이걸 import 하면 아래 줄에서 에러가 난다)
if (typeof window !== "undefined") {
  throw new Error(
    "lib/email.ts 는 서버 전용입니다. 브라우저 코드에서 부르면 API 키가 노출됩니다.",
  );
}

// 보내는 사람 주소. Resend 대시보드에서 도메인 인증을 마쳐야 쓸 수 있다.
// 인증 전에는 Resend가 주는 onboarding@resend.dev 로만 보낼 수 있고,
// 그 주소는 내 계정 이메일로만 발송된다(테스트용).
const FROM = "프리미엄 아카이브 <onboarding@resend.dev>";

type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

/**
 * 이메일 한 통을 보낸다.
 *
 * 보내기에 실패해도 에러를 던지지 않고 결과로 돌려준다.
 * 메일이 안 갔다고 회원가입이나 결제가 실패하면 안 되기 때문이다.
 * 부르는 쪽에서 결과를 보고 어떻게 할지 정하면 된다.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  // 키가 없으면 보내지 않는다. 개발 중에는 이 상태가 정상이다.
  if (!apiKey) {
    console.warn("RESEND_API_KEY 가 없어 메일을 보내지 않았습니다:", subject);
    return { ok: false, reason: "RESEND_API_KEY 없음" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        // 키는 이 헤더에만 실린다. 응답에도, 화면에도 나가지 않는다.
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });

    const result = await response.json();

    if (!response.ok) {
      // 실패 사유는 서버 로그에만 남긴다. 화면에 내보내지 않는다.
      console.error("메일 발송 실패:", response.status, result?.message);
      return { ok: false, reason: result?.message ?? "발송 실패" };
    }

    return { ok: true, id: result.id };
  } catch (e) {
    console.error("메일 발송 중 오류:", e);
    return { ok: false, reason: "네트워크 오류" };
  }
}
