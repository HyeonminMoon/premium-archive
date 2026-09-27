import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  // Sentry 주소(DSN)를 브라우저 코드에도 넣어 준다.
  // 브라우저는 NEXT_PUBLIC_ 이 붙은 값만 읽을 수 있는데,
  // 여기에 적으면 접두사 없이도 넣어 준다.
  //
  // 실제 배포(production)일 때만 값을 채운다.
  // 내 컴퓨터와 미리보기 배포에서는 빈 값이 되어 에러 수집이 꺼진다.
  env: {
    SENTRY_DSN:
      process.env.VERCEL_ENV === "production"
        ? (process.env.SENTRY_DSN ?? "")
        : "",
  },
};

export default withSentryConfig(nextConfig, {
  // 빌드할 때 Sentry 로 소스맵을 올릴지 정하는 설정.
  // 소스맵이 있어야 에러 위치가 압축된 코드 대신 원래 코드로 보인다.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // 빌드 로그를 조용하게 유지한다.
  silent: !process.env.CI,
});
