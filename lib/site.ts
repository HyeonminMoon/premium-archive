// 사이트 주소. 메타태그·사이트맵·robots.txt 가 같은 값을 쓴다.
//
// 배포하면 Vercel 이 VERCEL_PROJECT_PRODUCTION_URL 을 알아서 채워 준다.
// (환경 변수를 따로 등록할 필요가 없다. 내 컴퓨터에서는 localhost 를 쓴다.)
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const siteName = "프리미엄 아카이브";
