import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "프리미엄 아카이브",
  description: "AI 시대의 일하는 법. 무료 글은 누구나, 프리미엄 글은 멤버십 회원만.",
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
