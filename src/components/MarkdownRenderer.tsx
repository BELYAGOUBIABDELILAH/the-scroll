import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

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

    if (inList && !line.match(/^[\-\*]\s/)) {
      output.push("</ul>");
      inList = false;
    }

    if (line.startsWith("## ")) {
      output.push(`<h2 class="font-serif text-2xl font-bold mt-10 mb-4" style="color:#EBEBEB">${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      output.push(`<h1 class="font-serif text-3xl font-bold mt-10 mb-5" style="color:#EBEBEB">${inline(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith("> ")) {
      output.push(`<blockquote class="border-l-2 pl-4 italic my-6" style="border-color:#2A2A2A;color:#A1A1AA">${inline(line.slice(2))}</blockquote>`);
      continue;
    }

    if (line.match(/^[\-\*]\s/)) {
      if (!inList) {
        output.push('<ul class="list-disc pl-6 space-y-1.5 my-5" style="color:#E5E5E5">');
        inList = true;
      }
      output.push(`<li class="leading-[1.7]">${inline(line.slice(2))}</li>`);
      continue;
    }

    if (line.trim() === "") {
      output.push("<br />");
      continue;
    }

    output.push(`<p class="leading-[1.7] mb-5" style="color:#E5E5E5">${inline(line)}</p>`);
  }

  if (inList) output.push("</ul>");
  return output.join("\n");
}

function inline(text: string): string {
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold" style="color:#EBEBEB">$1</strong>');
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return text;
}
