// 모든 화면 아래에 붙는 푸터.
export default function Footer() {
  return (
    <footer className="mt-4">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">프리미엄 아카이브 · AI 시대의 일하는 법</p>

        {/* 후원 버튼. 다른 사이트로 나가므로 새 탭에서 연다.
            rel 은 새 탭이 우리 페이지를 건드리지 못하게 막는 안전장치다. */}
        <a
          href="https://buymeacoffee.com/premiumarchive"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
        >
          <span aria-hidden="true">☕</span>
          커피 한 잔 사주기
        </a>
      </div>
    </footer>
  );
}
