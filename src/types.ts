import type { CollectionEntry } from "astro:content";

export type SiteSettings = {};

export type ContentEntry =
  | CollectionEntry<"travel">
  | CollectionEntry<"movies">
  | CollectionEntry<"tv">;

export type AllContentEntry =
  | CollectionEntry<"travel">
  | CollectionEntry<"movies">
  | CollectionEntry<"tv">
  | CollectionEntry<"legal">;

export type ContentCollections =
  | "travel"
  | "movies"
  | "tv"
  | "legal";

export interface PostMeta {
  plainText: string;
  readingTimeText: string;
}

export type WithMeta<T> = T & { meta: PostMeta };

export type ImageLoading = "eager" | "lazy" | null;
