import React from "react";

const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageContent = ({ content }) => {
  // Extract <reasoning> tags
  const regex = /<reasoning>([\s\S]*?)<\/reasoning>/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add text before reasoning
    if (match.index > lastIndex) {
      parts.push(
        <div key={lastIndex} className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.substring(lastIndex, match.index)}
          </ReactMarkdown>
        </div>
      );
    }
    // Add reasoning block
    parts.push(
      <details key={match.index} className="reasoning-block">
        <summary>View AI Reasoning</summary>
        <div className="reasoning-content">{match[1].trim()}</div>
      </details>
    );
    lastIndex = match.index + match[0].length;
  }
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(
      <div key={lastIndex} className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content.substring(lastIndex)}
        </ReactMarkdown>
      </div>
    );
  }

  return parts.length > 0 ? parts : (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export default function ChatWindow({ messages, loading, input, setInput, onSend, agent, bottomRef }) {
  return (
    <div className="chat-container">
      <div className="messages-list">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-logo">MatrixKey</div>
            <p className="text-muted">Communication channel with <span>{agent}</span></p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`message-wrapper ${m.role}`}>
            <div className="message-header text-dim">
              {m.role === 'user' ? 'Local User' : agent}
            </div>
            <div className="message-bubble glass-card">
              <MessageContent content={m.content} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-wrapper assistant loading">
            <div className="message-bubble glass-card">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-area glass">
        <textarea 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
          }}
          placeholder={`Instruct ${agent}...`}
          className="chat-input"
          rows={1}
        />
        <button 
          onClick={onSend} 
          disabled={loading || !input.trim()} 
          className="send-btn primary"
        >
          {loading ? "..." : <IconSend />}
        </button>
      </div>

      <style>{`
        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.01);
          border-radius: var(--radius);
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }

        .empty-logo {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -1px;
          margin-bottom: 8px;
          opacity: 0.1;
        }

        .message-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 85%;
          animation: messageSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes messageSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-wrapper.user { align-self: flex-end; align-items: flex-end; }
        .message-wrapper.assistant { align-self: flex-start; align-items: flex-start; }

        .message-header {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          padding: 0 4px;
        }

        .message-bubble {
          padding: 16px 20px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .user .message-bubble {
          background: white;
          color: black;
          border: none;
        }

        .input-area {
          display: flex;
          gap: 12px;
          padding: 20px;
          margin: 0 32px 32px 32px;
          border-radius: var(--radius-sm);
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px 0;
          color: white;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          resize: none;
          min-height: 24px;
          max-height: 200px;
          overflow-y: auto;
          line-height: 1.5;
        }

        .chat-input::placeholder {
          color: var(--text-dim);
        }

        .send-btn {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
        }

        .typing-indicator {
          display: flex;
          gap: 6px;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          opacity: 0.3;
          animation: pulse 1.4s infinite ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.8; }
        }

        .reasoning-block {
          margin-bottom: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .reasoning-block summary {
          padding: 8px 12px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-dim);
          cursor: pointer;
          user-select: none;
          font-weight: 600;
        }
        
        .reasoning-block summary:hover {
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .reasoning-content {
          padding: 12px;
          font-size: 13px;
          color: var(--text-secondary);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          white-space: pre-wrap;
          font-style: italic;
        }

        .markdown-body {
          font-family: inherit;
          line-height: 1.6;
          font-size: 13px;
        }

        .markdown-body p {
          margin-bottom: 12px;
        }

        .markdown-body p:last-child {
          margin-bottom: 0;
        }

        .markdown-body ul, .markdown-body ol {
          margin-left: 20px;
          margin-bottom: 12px;
        }

        .markdown-body li {
          margin-bottom: 4px;
        }

        .markdown-body pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          margin-bottom: 12px;
        }

        .markdown-body code {
          font-family: 'Courier New', Courier, monospace;
          background: rgba(0, 0, 0, 0.2);
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 12px;
        }

        .markdown-body pre code {
          background: transparent;
          padding: 0;
        }

        .markdown-body table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }

        .markdown-body th, .markdown-body td {
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          text-align: left;
        }

        .markdown-body th {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
