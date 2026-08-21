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

  return (
    <div className={`prose-custom text-sm leading-relaxed text-[#f1f5f9] space-y-2.5 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed text-[#e2e8f0] last:mb-0">
              {children}
            </p>
          ),

          // Headers
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-white mt-3 mb-1.5 flex items-center gap-2 border-b border-white/10 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-indigo-200 mt-2.5 mb-1 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-purple-300 mt-2 mb-1">
              {children}
            </h3>
          ),

          // Bold text highlights
          strong: ({ children }) => (
            <strong className="font-semibold text-white bg-white/5 px-1 py-0.5 rounded border border-white/10">
              {children}
            </strong>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-1.5 text-[#cbd5e1] pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-1.5 text-[#cbd5e1] pl-1 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-xs leading-relaxed text-[#cbd5e1]">
              <span className="text-slate-200">{children}</span>
            </li>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-400 bg-indigo-950/30 px-3 py-2 rounded-r-lg my-2 text-xs text-indigo-200 italic">
              {children}
            </blockquote>
          ),

          // Code blocks & Inline code
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline) {
              return (
                <div className="relative group my-2.5 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.12)] bg-[#05070e]">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10 text-[11px] font-mono text-[#94a3b8]">
                    <span>{match ? match[1] : 'code'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(codeString, Math.random())}
                      className="flex items-center gap-1 hover:text-white transition-colors"
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
                  <pre className="p-3 text-xs font-mono text-[#38bdf8] overflow-x-auto">
                    <code>{codeString}</code>
                  </pre>
                </div>
              );
            }

            return (
              <code
                className="font-mono text-[12px] bg-purple-950/60 border border-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#080d1a]">
              <table className="w-full text-xs text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/5 border-b border-white/10 text-[#94a3b8] uppercase font-semibold text-[10.5px] tracking-wider">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5 text-[#cbd5e1]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.03] transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2 font-semibold text-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2">
              {children}
            </td>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors font-medium"
            >
              {children}
            </a>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="border-t border-white/10 my-3" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
