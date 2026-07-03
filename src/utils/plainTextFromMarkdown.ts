import removeMd from "remove-markdown";

export function getPlainTextFromMarkdown(markdown: string): string {
  if (!markdown || !markdown.length) return "";

  try {
    const plainText = removeMd(markdown);
    return plainText;
  } catch (e) {
    console.error("Could not extract plain text from markdown: ", e);
    return "";
  }
}
