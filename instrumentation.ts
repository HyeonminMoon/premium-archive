// Next.js가 서버를 켤 때 이 파일을 가장 먼저 부른다.
// 여기서 위의 두 설정 파일을 불러 Sentry를 켠다.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// 서버 컴포넌트에서 난 에러를 Sentry가 받아 가게 하는 연결 고리.
// 이 줄이 없으면 화면을 그리다 난 서버 에러가 수집되지 않는다.
export const onRequestError = Sentry.captureRequestError;
