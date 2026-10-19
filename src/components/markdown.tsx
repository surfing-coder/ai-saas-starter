import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:mt-3 prose-headings:mb-2 prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5 prose-li:my-0.5 prose-pre:bg-background prose-pre:text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
