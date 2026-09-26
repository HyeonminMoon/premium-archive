import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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

// 서버 전용 연결 도구. 위의 createClient 와 딱 하나가 다르다: 비밀 키를 쓴다.
//
// 비밀 키는 데이터베이스의 보안 규칙(RLS)을 통째로 무시한다.
// 그래서 쓰는 곳이 단 한 군데다 — 결제 승인이 성공한 뒤 멤버십을 켜는 코드.
// memberships/profiles 에는 "본인이 본인을 회원으로 만드는" 권한이 없으므로,
// 결제를 확인한 이 서버 코드만 멤버십을 켤 수 있다.
//
// 이 함수를 "use client" 가 붙은 파일에서 부르면 비밀 키가 브라우저로 새어 나간다.
// 서버 컴포넌트나 서버 액션에서만 쓴다.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      ".env.local 에 SUPABASE_SECRET_KEY 가 필요합니다. 값을 채운 뒤 개발 서버를 껐다 켜세요.",
    );
  }

  // 쿠키를 넘기지 않는다. 지금 요청한 사람이 누구인지와 무관하게,
  // 서버가 자기 권한으로 쓰기 때문이다.
  return createSupabaseClient(url, secretKey, {
    auth: { persistSession: false },
  });
}
