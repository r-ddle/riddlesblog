const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

/**
 * Lightweight inline markdown renderer for editor previews.
 * Handles emphasis, links, inline code, strikethrough, underline, and line breaks.
 */
export function renderInlineMarkdown(value: string): string {
  const escaped = escapeHtml(value || "")

  return escaped
    // inline code first so we do not style inside tokens
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">$1</code>')
    // bold + italic (***text*** or ___text___)
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/___(.+?)___/g, "<strong><em>$1</em></strong>")
    // bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // underline (custom)
    .replace(/__(.+?)__/g, "<u>$1</u>")
    // italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // links
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    // line breaks
    .replace(/\n/g, "<br />")
}
