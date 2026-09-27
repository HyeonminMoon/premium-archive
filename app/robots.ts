import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// robots.txt 를 만들어 준다. 주소는 /robots.txt 다.
// 검색엔진에게 "여기는 긁어도 되고, 여기는 긁지 마라"를 알려 주는 파일이다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 회원 전용이거나 개인 정보가 걸린 화면. 검색 결과에 나오면 안 된다.
      disallow: ["/admin", "/library", "/membership/success", "/login", "/signup"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
