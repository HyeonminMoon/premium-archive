import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteUrl, siteName } from "@/lib/site";
import "./globals.css";

const description =
  "AI 시대의 일하는 법. 무료 글은 누구나, 프리미엄 글은 멤버십 회원만.";

// 모든 화면이 물려받는 기본 메타 정보.
// 화면마다 따로 적은 값이 있으면 그 값이 이 값을 덮어쓴다.
export const metadata: Metadata = {
  // 주소를 절대 주소로 만들 때 쓰는 기준점. OG 태그에는 전체 주소가 들어가야 한다.
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    // 다른 화면 제목 뒤에 사이트 이름을 자동으로 붙여 준다. 예: "로그인 · 프리미엄 아카이브"
    template: `%s · ${siteName}`,
  },
  description,
  // 카카오톡·SNS 에 링크를 붙여 넣었을 때 보이는 미리보기 정보.
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName,
    title: siteName,
    description,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
  },
};

// 구글 애널리틱스 측정 ID.
//
// 실제 배포된 사이트에서만 켠다. 내 컴퓨터에서 개발하는 동안이나
// 미리보기 배포에서 돌아다닌 기록이 방문자 통계에 섞이면 안 되기 때문이다.
// VERCEL_ENV 는 Vercel 이 자동으로 채워 준다 ("production" / "preview" / "development").
// 내 컴퓨터에는 이 값이 아예 없으므로 추적이 저절로 꺼진다.
const gaId =
  process.env.VERCEL_ENV === "production"
    ? process.env.GA_MEASUREMENT_ID
    : undefined;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-5">
          {children}
        </main>

        <Footer />

        {/* 구글 애널리틱스. gaId 가 없으면 아무것도 넣지 않는다. */}
        {gaId && (
          <>
            {/* 구글이 주는 측정 스크립트를 받아 온다.
                afterInteractive = 화면이 다 그려진 뒤에 받는다. 첫 화면이 느려지지 않는다. */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            {/* 받아 온 스크립트를 우리 측정 ID로 켠다. */}
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
