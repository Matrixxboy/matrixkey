import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../constants';

export default function GlobalChat({ isOpen, setIsOpen, currentAgent, model }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const text = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, agent: currentAgent, model })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to agent.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="global-chat-panel glass">
      <div className="chat-header">
        <div className="header-info">
          <span className="dot"></span>
          <h3>Quick Assistant</h3>
          <span className="agent-badge">{currentAgent}</span>
        </div>
        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            <div className="msg-bubble">{msg.content}</div>
          </div>
        ))}
        {loading && <div className="msg assistant loading">Thinking...</div>}
      </div>

      <div className="chat-input-area">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask anything..."
        />
        <button onClick={send}>Send</button>
      </div>

      <style>{`
        .global-chat-panel {
          position: fixed;
          right: 20px;
          bottom: 90px;
          width: 350px;
          height: 500px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-header {
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #00ff88;
          border-radius: 50%;
          box-shadow: 0 0 10px #00ff88;
        }

        .chat-header h3 {
          font-size: 14px;
          margin: 0;
          color: white;
        }

        .agent-badge {
          font-size: 10px;
          background: rgba(124, 77, 255, 0.3);
          padding: 2px 8px;
          border-radius: 10px;
          color: #b388ff;
        }

        .close-btn {
          background: none;
          border: none;
          color: #aaa;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .msg {
          display: flex;
          flex-direction: column;
        }

        .msg.user { align-items: flex-end; }
        .msg.assistant { align-items: flex-start; }

        .msg-bubble {
          max-width: 85%;
          padding: 10px 14px;
          font-size: 13px;
          line-height: 1.4;
          border-radius: 15px;
        }

        .user .msg-bubble {
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 2px;
        }

        .assistant .msg-bubble {
          background: rgba(255, 255, 255, 0.1);
          color: #eee;
          border-bottom-left-radius: 2px;
        }

        .chat-input-area {
          padding: 16px;
          display: flex;
          gap: 8px;
          background: rgba(0, 0, 0, 0.2);
        }

        .chat-input-area input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 8px 12px;
          color: white;
          font-size: 13px;
        }

        .chat-input-area button {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
