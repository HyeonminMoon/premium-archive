import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버에서 Supabase에 접속할 때 쓰는 연결 도구.
//
// 중요한 점 하나: 여기서 쓰는 키는 "공개 키"다. 비밀 키가 아니다.
// 비밀 키로 읽으면 데이터베이스의 보안 규칙(RLS)이 통째로 꺼져서,
// 비회원에게도 프리미엄 본문이 그대로 나가 버린다.
// 공개 키 + 로그인 쿠키로 읽어야 데이터베이스가 "이 사람이 볼 수 있는 줄"만 골라 준다.
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      ".env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 가 필요합니다. " +
        "값을 채운 뒤 개발 서버를 껐다 켜세요.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      // 브라우저가 보낸 로그인 쿠키를 그대로 Supabase에 실어 보낸다.
      // 이게 있어야 "지금 요청한 사람이 누구인지"를 데이터베이스가 안다.
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // 화면을 그리는 중에는 쿠키를 새로 쓸 수 없다. 읽기만 하면 되므로 넘어간다.
        }
      },
    },
  });
}
