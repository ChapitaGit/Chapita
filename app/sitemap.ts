import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.chapita.eu";
  if (!siteUrl.startsWith("http")) siteUrl = `https://${siteUrl}`;

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
