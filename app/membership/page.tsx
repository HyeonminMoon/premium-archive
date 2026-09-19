import BackToListLink from "@/components/BackToListLink";

// 4. 멤버십 안내 - 결제를 결심한다.
export default function MembershipPage() {
  const benefits = [
    "프리미엄 글 전문 열람",
    "새 글이 올라오면 바로 읽기",
    "지난 글 아카이브 전체 공개",
  ];

  return (
    <div>
      <div className="rounded-2xl bg-card p-6 shadow-[0_1px_3px_rgba(30,27,51,0.06)] sm:p-8">
        <span className="text-xs font-bold tracking-wide text-accent">
          멤버십
        </span>
        <h1 className="mt-2 text-2xl font-bold">
          프리미엄 글을 전부 읽으세요
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          언제든 해지할 수 있는 월 구독입니다.
        </p>

        <div className="mt-6 flex items-baseline gap-1 border-t border-line pt-6">
          <span className="text-4xl font-bold">9,900원</span>
          <span className="text-muted">/ 월</span>
        </div>

        <ul className="mt-6 space-y-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        {/* 결제 연동은 아직 붙이지 않았다. 버튼 자리만 만들어 둔 상태다. */}
        <button
          type="button"
          disabled
          className="mt-8 w-full rounded-full bg-accent px-5 py-3.5 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:bg-line disabled:text-muted disabled:shadow-none"
        >
          결제하기 (준비 중)
        </button>
      </div>

      <BackToListLink />
    </div>
  );
}
