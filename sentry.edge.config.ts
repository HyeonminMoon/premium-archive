// 엣지 런타임에서 나는 에러를 Sentry로 보낸다.
// 지금은 엣지에서 도는 코드가 없지만, 나중에 생겨도 빠지지 않도록 같이 둔다.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
});
