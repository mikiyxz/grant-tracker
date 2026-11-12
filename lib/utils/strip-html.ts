// removes tags from user text before it goes in the db.
// script/style blocks go first so their contents don't survive as plain text.
export function stripHtml(input: string): string {
  return input
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}
