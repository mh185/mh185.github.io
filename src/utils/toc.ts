import type { MarkdownHeading } from "astro";

export interface TocItem extends MarkdownHeading {
  subheadings: TocItem[];
}

export interface TocOptions {
  minDepth?: number;
  maxDepth?: number;
}

export function generateToc(
  headings: MarkdownHeading[],
  options: TocOptions = {},
): TocItem[] {
  const { minDepth = 2, maxDepth = 3 } = options;

  const bodyHeadings = headings.filter(
    ({ depth }) => depth >= minDepth && depth <= maxDepth,
  );

  const toc: TocItem[] = [];

  const parentHeadings = new Map<number, TocItem>();

  bodyHeadings.forEach((h) => {
    const heading: TocItem = { ...h, subheadings: [] };

    parentHeadings.forEach((_, depth) => {
      if (depth >= heading.depth) {
        parentHeadings.delete(depth);
      }
    });

    const parent = parentHeadings.get(heading.depth - 1);

    if (parent) {
      parent.subheadings.push(heading);
    } else {
      toc.push(heading);
    }

    parentHeadings.set(heading.depth, heading);
  });

  return toc;
}
