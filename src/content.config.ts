import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const featuredSchema = z
  .enum(["none", "1", "2", "3"])
  .optional()
  .transform((val) => {
    if (!val || val === "none") return undefined;
    return parseInt(val, 10);
  });

const imageSchema = z.object({
  src: z.string().url(),
  alt: z.string().optional(),
});

const ogImageOptionalSchema = z
  .union([imageSchema, z.object({}).strict()])
  .optional()
  .nullable()
  .transform((v) => (v && "src" in v ? v : undefined));

const licenses = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/licenses" }),
  schema: z.object({
    name: z.string().min(1, { message: "License Name cannot be empty." }),
    description: z.string().optional(),
    url: z.string().url(),
    type: z.enum(["post", "project"]),
  }),
});

const baseSchema = z.object({
  draft: z.boolean().default(false),
  featured: featuredSchema,
  title: z.string().min(1, { message: "Title cannot be empty." }),
  description: z.string().min(1, { message: "Description cannot be empty." }),
  authors: z.array(z.string()).default([]),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  license: reference("licenses"),
  series: z.string().optional(),
  tags: z.array(z.string()).default([]),
  image: imageSchema,
  ogImage: ogImageOptionalSchema,
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: baseSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: baseSchema.extend({
    repoUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    status: z
      .enum(["completed", "in-progress", "planned"])
      .default("completed"),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lastUpdated: z.coerce.date(),
    ogImage: ogImageOptionalSchema,
  }),
});

const about = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/about" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: ogImageOptionalSchema,
  }),
});

export const collections = {
  licenses,
  blog,
  projects,
  legal,
  about,
};
