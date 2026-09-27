// 브라우저에서 나는 에러를 Sentry로 보낸다.
// 결제창이 뜨지 않았다거나, 버튼을 눌렀는데 터졌다거나 하는 것들이다.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
});

// 화면을 이동하는 도중에 난 에러도 놓치지 않고 잡는다.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
