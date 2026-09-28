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

import { siteUrl } from "@/lib/site";

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

/**
 * 가입 환영 메일을 보낸다.
 *
 * 회원가입이 끝난 직후 서버에서 부른다.
 * 실패해도 가입은 이미 끝난 상태이므로 그냥 넘어간다.
 */
export async function sendWelcomeEmail(to: string, nickname: string) {
  return sendEmail({
    to,
    subject: "프리미엄 아카이브에 오신 것을 환영합니다",
    html: welcomeHtml(nickname),
  });
}

// 메일 본문. 메일 프로그램은 CSS 파일을 읽지 못하므로 스타일을 태그마다 직접 적는다.
function welcomeHtml(nickname: string) {
  const text = "#1e1b33";
  const muted = "#6b6880";
  const accent = "#6d4aff";

  return `
<div style="font-family:-apple-system,'Segoe UI',Roboto,'Malgun Gothic',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:${text};line-height:1.7">
  <p style="font-size:13px;font-weight:700;color:${accent};margin:0">프리미엄 아카이브</p>
  <h1 style="font-size:22px;margin:8px 0 0">${escapeHtml(nickname)}님, 환영합니다</h1>
  <p style="font-size:15px;color:${muted};margin:12px 0 0">
    가입이 끝났습니다. AI 시대의 일하는 법을 다루는 글들을 지금 바로 읽어 보세요.
  </p>

  <div style="border:1px solid #e8e6f0;border-radius:14px;padding:20px;margin:28px 0 0">
    <h2 style="font-size:16px;margin:0">무료 글부터 둘러보세요</h2>
    <p style="font-size:14px;color:${muted};margin:8px 0 0">
      가입만 하셔도 읽을 수 있는 글이 여러 편 있습니다.
      AI에게 일을 맡기기 전에 정리해야 할 것들, 자동화하면 안 되는 일,
      회의가 줄지 않는 이유 같은 주제를 다룹니다.
    </p>
    <a href="${siteUrl}" style="display:inline-block;margin-top:14px;background:${accent};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:999px">
      무료 글 보러 가기
    </a>
  </div>

  <div style="border:1px solid #e8e6f0;border-radius:14px;padding:20px;margin:12px 0 0;background:#f6f4ff">
    <h2 style="font-size:16px;margin:0">멤버십으로 열리는 글</h2>
    <p style="font-size:14px;color:${muted};margin:8px 0 0">
      멤버십 회원이 되면 프리미엄 글의 전문을 읽을 수 있습니다.
      아카이브 정리법, 팀 처리량을 높이는 법, 신뢰를 조정하는 법처럼
      한 편을 끝까지 읽어야 쓸모가 생기는 글들입니다.
      월 9,900원이고 언제든 그만둘 수 있습니다.
    </p>
    <a href="${siteUrl}/membership" style="display:inline-block;margin-top:14px;border:1px solid ${accent};color:${accent};text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:999px">
      멤버십 알아보기
    </a>
  </div>

  <p style="font-size:12px;color:${muted};margin:28px 0 0;border-top:1px solid #e8e6f0;padding-top:16px">
    이 메일은 프리미엄 아카이브에 가입하셔서 한 번 보내 드리는 안내입니다.
  </p>
</div>`;
}

// 닉네임에 태그 같은 글자가 들어와도 메일이 깨지지 않게 바꿔 준다.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
