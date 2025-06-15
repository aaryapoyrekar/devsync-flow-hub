
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
}
const mentionStyle = "text-primary font-semibold bg-accent px-1 rounded";
function renderers() {
  return {
    text: (node: any) => {
      // Style mentions: @username
      if (typeof node.children === "string" && node.children.startsWith("@")) {
        return <span className={mentionStyle}>{node.children}</span>;
      }
      return node.children;
    },
    code: ({ inline, children, className }: any) =>
      inline ? (
        <code className="bg-muted px-1 py-0.5 rounded text-[0.96em]">{children}</code>
      ) : (
        <pre className="bg-muted border p-3 rounded overflow-auto text-sm my-2">
          <code className="">{children}</code>
        </pre>
      ),
  };
}
export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={renderers()}
      className="prose dark:prose-invert max-w-none break-words"
    >
      {content}
    </ReactMarkdown>
  );
}
