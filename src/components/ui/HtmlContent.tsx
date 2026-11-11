import React from "react";

interface HtmlContentProps {
  content?: string | null;
  className?: string;
  fallback?: string;
}

export function HtmlContent({
  content,
  className = "",
  fallback = "-",
}: HtmlContentProps) {
  if (!content || content.trim() === "" || content === "<p><br></p>") {
    return <span className="text-gray-400 italic text-xs">{fallback}</span>;
  }

  // Check if content looks like HTML
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);

  if (!hasHtml) {
    return (
      <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={`rich-html-content leading-relaxed break-words
        [&_p]:mb-2 [&_p:last-child]:mb-0
        [&_h1]:text-xl [&_h1]:font-black [&_h1]:mb-2 [&_h1]:tracking-tight
        [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:tracking-tight
        [&_h3]:text-base [&_h3]:font-bold [&_h3]:mb-1.5
        [&_strong]:font-black [&_b]:font-black
        [&_em]:italic [&_i]:italic
        [&_u]:underline
        [&_s]:line-through
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
        [&_li]:my-0.5
        [&_blockquote]:border-l-4 [&_blockquote]:border-black [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:text-gray-700
        [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:font-mono [&_pre]:text-xs [&_pre]:overflow-x-auto [&_pre]:my-2
        [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs
        [&_a]:text-black [&_a]:underline [&_a]:font-bold hover:[&_a]:text-neutral-600
        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-3 [&_img]:border [&_img]:border-gray-200 [&_img]:shadow-sm [&_img]:block [&_img]:cursor-pointer
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-2
        [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:p-2 [&_th]:text-left [&_th]:font-bold
        [&_td]:border [&_td]:border-gray-200 [&_td]:p-2
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
