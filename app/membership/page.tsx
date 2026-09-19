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
      <h1 className="text-2xl font-bold">멤버십</h1>
      <p className="mt-2 text-neutral-600">
        프리미엄 글을 전부 읽을 수 있는 월 구독입니다.
      </p>

      <div className="mt-8 rounded-xl border border-neutral-200 p-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">9,900원</span>
          <span className="text-neutral-500">/ 월</span>
        </div>

        <ul className="mt-6 space-y-2 text-neutral-800">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex gap-2">
              <span className="text-neutral-400">✓</span>
              {benefit}
            </li>
          ))}
        </ul>

        {/* 결제 연동은 아직 붙이지 않았다. 버튼 자리만 만들어 둔 상태다. */}
        <button
          type="button"
          disabled
          className="mt-8 w-full rounded-full bg-neutral-900 px-5 py-3 font-medium text-white disabled:bg-neutral-300"
        >
          결제하기 (준비 중)
        </button>
      </div>

      <BackToListLink />
    </div>
  );
}
