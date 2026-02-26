import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown renderer supporting:
 * H1 (#), H2 (##), bold (**), italics (*), blockquotes (>), bullet lists (- or *)
 */
export const MarkdownRenderer = ({ content, className = "" }: MarkdownRendererProps) => {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className={`prose-scroll ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Close list if we're no longer in one
    if (inList && !line.match(/^[\-\*]\s/)) {
      output.push("</ul>");
      inList = false;
    }

    // Headings
    if (line.startsWith("## ")) {
      output.push(`<h2 class="font-serif text-2xl font-bold text-foreground mt-8 mb-3">${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      output.push(`<h1 class="font-serif text-3xl font-bold text-foreground mt-8 mb-4">${inline(line.slice(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      output.push(`<blockquote class="border-l-2 border-primary/40 pl-4 italic text-muted-foreground my-4">${inline(line.slice(2))}</blockquote>`);
      continue;
    }

    // Bullet list
    if (line.match(/^[\-\*]\s/)) {
      if (!inList) {
        output.push('<ul class="list-disc pl-6 space-y-1 my-4 text-foreground/90">');
        inList = true;
      }
      output.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      output.push("<br />");
      continue;
    }

    // Paragraph
    output.push(`<p class="text-foreground/90 leading-relaxed mb-4">${inline(line)}</p>`);
  }

  if (inList) output.push("</ul>");
  return output.join("\n");
}

function inline(text: string): string {
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
  // Italic
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return text;
}
