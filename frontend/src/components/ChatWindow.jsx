import React from "react";

export default function ChatWindow({ messages, loading, input, setInput, onSend, agent, bottomRef }) {
  return (
    <div className="chat-container">
      <div className="messages-list">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <p>Ready to assist. Chatting with <span>{agent}</span></p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`message-wrapper ${m.role}`}>
            <div className="message-bubble">
              {m.content}
            </div>
            <div className="message-time">
              {m.ts ? new Date(m.ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-wrapper assistant loading">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-area glass">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSend()}
          placeholder={`Type a message...`}
          className="chat-input"
        />
        <button 
          onClick={onSend} 
          disabled={loading || !input.trim()} 
          className="send-btn"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

      <style>{`
        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          opacity: 0.6;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          color: var(--accent-primary);
        }

        .empty-state span {
          color: var(--accent-secondary);
          font-weight: 600;
        }

        .message-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 80%;
          animation: messageSlide 0.3s ease-out;
        }

        @keyframes messageSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-wrapper.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message-wrapper.assistant {
          align-self: flex-start;
          align-items: flex-start;
        }

        .message-bubble {
          padding: 12px 18px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
          white-space: pre-wrap;
        }

        .user .message-bubble {
          background: linear-gradient(135deg, var(--accent-primary), #5e35b1);
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 15px rgba(124, 77, 255, 0.2);
        }

        .assistant .message-bubble {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
          border: 1px solid var(--border-color);
          border-bottom-left-radius: 4px;
        }

        .message-time {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 5px;
          padding: 0 4px;
        }

        .input-area {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          margin-top: 10px;
          border-radius: 16px 16px 0 0;
          border-bottom: none;
        }

        .chat-input {
          flex: 1;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          font-size: 14px;
          padding: 12px 16px;
        }

        .send-btn {
          background: var(--accent-primary);
          color: white;
          padding: 0 24px;
          border-radius: 12px;
          font-weight: 600;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: var(--text-muted);
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: var(--accent-primary);
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
