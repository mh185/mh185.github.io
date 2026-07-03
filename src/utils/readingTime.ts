import calculateReadingTime, { type IReadTimeResults } from "reading-time";
import { getPlainTextFromMarkdown } from "./plainTextFromMarkdown";

export function getReadingTime(
  text: string,
  plainText?: string,
): IReadTimeResults | undefined {
  if (!text || !text.length) return undefined;

  try {
    const source = plainText ?? getPlainTextFromMarkdown(text);
    const stats = calculateReadingTime(source);
    return stats;
  } catch (e) {
    console.error("Could not calculate reading time: ", e);
    return undefined;
  }
}
