import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

import { SITE_SETTINGS } from "../site.config";

export async function GET(context: APIContext) {
  const blogPosts = await getCollection("blog", ({ data }) => !data.draft);
  const projects = await getCollection("projects", ({ data }) => !data.draft);

  const allEntries = [...blogPosts, ...projects].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: SITE_SETTINGS.title,
    description: SITE_SETTINGS.description,
    site: context.site ?? "",
    items: allEntries.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.pubDate,
      description: entry.data.description,
      link: `/posts/${entry.id}/`,
      enclosure: {
        url: entry.data.image.src,
        type: "image/webp",
        length: 1,
      },
      ...(entry.data.tags.length > 0 && { categories: entry.data.tags }),
      author: "noreply@truedaniyyel.com (Daniel Adrian)",
    })),
    customData: `<language>en-us</language>`,
  });
}
