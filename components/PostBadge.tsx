// 무료 / 프리미엄 배지. 홈 목록과 글 상세에서 똑같이 쓴다.
export default function PostBadge({ isPremium }: { isPremium: boolean }) {
  if (isPremium) {
    return (
      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold tracking-wide text-accent">
        🔒 PREMIUM
      </span>
    );
  }

  return (
    <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-bold tracking-wide text-muted">
      무료
    </span>
  );
}
