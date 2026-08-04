/**
 * Markdown renderer for glass chat bubbles (GFM tables, bold, lists, code).
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function ChatMarkdown({ text = "" }) {
  if (!text) return null;
  return (
    <div className="chat-md">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{text}</ReactMarkdown>
    </div>
  );
}
