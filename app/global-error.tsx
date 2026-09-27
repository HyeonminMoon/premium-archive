"use client";

// 화면 전체가 무너질 만큼 큰 에러가 났을 때 뜨는 화면.
// 여기까지 온 에러는 Next.js가 다른 곳에서 잡아 주지 못하므로,
// 이 파일에서 직접 Sentry로 보내야 수집된다.
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
          문제가 생겼습니다
        </h1>
        <p style={{ marginTop: "0.75rem", color: "#666", fontSize: "0.875rem" }}>
          잠시 후 다시 시도해 주세요. 계속 같은 화면이 나오면 알려 주세요.
        </p>
        <a
          href="/"
          style={{ display: "inline-block", marginTop: "1.5rem", color: "#6d4aff", fontWeight: 600, fontSize: "0.875rem" }}
        >
          글 목록으로
        </a>
      </body>
    </html>
  );
}
