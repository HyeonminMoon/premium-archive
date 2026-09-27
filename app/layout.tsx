import type { Metadata } from "next";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-5">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
