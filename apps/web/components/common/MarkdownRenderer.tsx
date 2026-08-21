import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Pre-process content so bullet points and headings render with optimal Markdown spacing
  const formattedContent = (content || '')
    .replace(/\n•\s*/g, '\n\n- ')
    .replace(/^•\s*/gm, '- ');

  return (
    <div className={`prose-custom text-xs md:text-sm leading-relaxed text-[var(--text-primary)] space-y-3 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed text-[var(--text-secondary)] last:mb-0">
              {children}
            </p>
          ),

          // Headers
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-[var(--text-primary)] mt-3 mb-2 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-1.5 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-[var(--text-primary)] mt-3 mb-1.5 flex items-center gap-1.5 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs md:text-sm font-bold text-[#FC6508] mt-2.5 mb-1.5 flex items-center gap-1.5 tracking-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-bold text-[var(--text-primary)] mt-2 mb-1">
              {children}
            </h4>
          ),

          // Bold text highlights
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text-primary)]">
              {children}
            </strong>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1.5 my-2 text-[var(--text-secondary)] pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1.5 my-2 text-[var(--text-secondary)] pl-1 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-xs leading-relaxed text-[var(--text-secondary)]">
              <span className="text-[var(--text-primary)]">{children}</span>
            </li>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#FC6508] bg-[#FC6508]/10 px-3.5 py-2.5 rounded-r-xl my-2.5 text-xs text-[var(--text-primary)] font-medium leading-relaxed">
              {children}
            </blockquote>
          ),

          // Code blocks & Inline code
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isCodeBlock = Boolean(match || (codeString && codeString.includes('\n')) || (className && className.includes('language-')));

            if (isCodeBlock) {
              return (
                <div className="relative group my-2.5 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
                    <span>{match ? match[1] : 'code'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(codeString, Math.random())}
                      className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                    >
                      {copiedIndex !== null ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 text-[10px]">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-xs font-mono text-[var(--text-primary)] overflow-x-auto">
                    <code>{codeString}</code>
                  </pre>
                </div>
              );
            }

            return (
              <code
                className="font-mono text-[11.5px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-1.5 py-0.5 rounded font-semibold inline-block mx-0.5 align-middle"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Tables (Scientific, clear and modern financial table)
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-sm">
              <table className="w-full text-xs text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--bg-card)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase font-bold text-[10px] tracking-wider">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.02] transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-bold text-[var(--text-primary)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 font-medium">
              {children}
            </td>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FC6508] hover:underline underline-offset-2 transition-colors font-semibold"
            >
              {children}
            </a>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="border-t border-[var(--border-subtle)] my-3" />
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
};
