import type { CollectionEntry } from "astro:content";

export type SiteSettings = {};

export type ContentEntry =
  | CollectionEntry<"blog">
  | CollectionEntry<"projects">;

export type AllContentEntry =
  | CollectionEntry<"blog">
  | CollectionEntry<"projects">
  | CollectionEntry<"legal">;

export type ContentCollections = "blog" | "projects" | "legal";

export interface PostMeta {
  plainText: string;
  readingTimeText: string;
}

export type WithMeta<T> = T & { meta: PostMeta };

export type ImageLoading = "eager" | "lazy" | null;
