import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownContent = ({ content }) => {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D2957] mb-2" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-xl md:text-2xl font-semibold text-[#1D2957] mb-1.5" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-lg font-semibold text-[#1D2957] mb-1" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="whitespace-pre-wrap leading-relaxed" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold text-[#1D2957]" {...props} />
          ),
          em: ({ ...props }) => <em className="italic" {...props} />,
          ul: ({ ...props }) => (
            <ul className="list-disc pl-5 my-2" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-5 my-2" {...props} />
          ),
          li: ({ ...props }) => <li className="mb-1" {...props} />,
          a: ({ ...props }) => (
            <a
              className="text-[#00BDB6] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          code({ inline, children, ...props }) {
            const isBlock = !inline;
            if (isBlock) {
              return (
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto text-sm">
                  <code className="font-mono" {...props}>
                    {children}
                  </code>
                </pre>
              );
            }
            return (
              <code className="font-mono text-sm px-1.5 py-0.5 bg-gray-100 rounded" {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 pl-3 my-2 text-gray-600 italic"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border border-gray-200 text-sm" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th className="bg-gray-50 border border-gray-200 px-2 py-1 text-left" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="border border-gray-200 px-2 py-1" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
