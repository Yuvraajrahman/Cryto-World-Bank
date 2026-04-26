import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function MarkdownMessage({ text }: { text: string }) {
  return (
    <div
      className={[
        "prose prose-invert prose-sm max-w-none",
        "leading-relaxed text-ink-100",
        "prose-p:my-2 prose-p:leading-relaxed",
        "prose-ul:my-2 prose-ol:my-2",
        "prose-li:my-1",
        "prose-ul:list-disc prose-ol:list-decimal",
        "prose-li:pl-1 marker:text-gold-300",
        "prose-hr:my-4 prose-hr:border-ink-600/60",
        "prose-headings:my-3 prose-headings:font-display prose-headings:tracking-tight",
        "prose-strong:text-ink-100 prose-strong:font-semibold",
        "prose-blockquote:border-l-gold-700/50 prose-blockquote:text-ink-200",
        "prose-code:text-gold-200",
        "prose-pre:bg-ink-950/70 prose-pre:border prose-pre:border-ink-600/50",
        // KaTeX can overflow on small chat bubbles; allow horizontal scroll
        "prose-table:block prose-table:overflow-x-auto",
        "[&_.katex-display]:my-2 [&_.katex]:text-[0.95em]",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeKatex]}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

