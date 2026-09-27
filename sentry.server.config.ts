// 서버에서 나는 에러를 Sentry로 보낸다.
// 글 상세를 그리다 난 에러, 결제 승인 중에 난 에러 같은 것들이다.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  // dsn 이 비어 있으면 아무것도 보내지 않는다.
  // 내 컴퓨터에서 개발하는 동안은 비어 있어서 저절로 꺼진다.
  enabled: Boolean(dsn),
});
