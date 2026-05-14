import ReactMarkdown from 'react-markdown';
import { Bot } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: 'linear-gradient(135deg, #FF4D00, #FFB800)' }}>
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div
        className="max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed"
        style={{
          background: isUser ? '#FF4D00' : 'rgba(255,255,255,0.06)',
          color: 'white',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        }}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              p: ({ children }) => <p className="my-0.5 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-1 ml-3 list-disc">{children}</ul>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
              strong: ({ children }) => <strong className="text-orange-400">{children}</strong>,
            }}
          >
            {message.content || (isStreaming ? '...' : '')}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}