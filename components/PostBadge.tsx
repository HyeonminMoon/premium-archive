// 무료 / 프리미엄 배지. 홈 목록과 글 상세에서 똑같이 쓴다.
export default function PostBadge({ isPremium }: { isPremium: boolean }) {
  if (isPremium) {
    return (
      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
        🔒 PREMIUM
      </span>
    );
  }

  return (
    <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
      무료
    </span>
  );
}
