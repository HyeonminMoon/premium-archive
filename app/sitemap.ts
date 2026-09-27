import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getPostsForList } from "@/data/posts";

// 사이트맵을 만들어 준다. 주소는 /sitemap.xml 이다.
// 검색엔진에게 "우리 사이트에 이런 주소들이 있다"고 목록으로 알려 주는 파일이다.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostsForList();

  // 무료 글만 넣는다. 프리미엄 글은 본문이 회원 전용이므로 목록에 올리지 않는다.
  const freePosts = posts.filter((post) => !post.isPremium);

  return [
    { url: siteUrl, lastModified: new Date(), priority: 1 },
    { url: `${siteUrl}/membership`, lastModified: new Date(), priority: 0.8 },
    ...freePosts.map((post) => ({
      url: `${siteUrl}/posts/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      priority: 0.6,
    })),
  ];
}
