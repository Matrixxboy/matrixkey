import React, { useState, useEffect } from "react";
import { API_BASE } from "../constants";

export default function MemoryViewer({ agent }) {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/memory/${agent}`)
      .then(r => r.json())
      .then(d => {
        setMsgs(d.messages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agent]);

  return (
    <div className="memory-view fade-in">
      <div className="view-header">
        <h2>Neural Memory Bank</h2>
        <p>Analyzing long-term persistence for <span>{agent}</span></p>
      </div>

      <div className="memory-list">
        {loading ? (
          <div className="loading-state">Accessing neural patterns...</div>
        ) : msgs.length === 0 ? (
          <div className="empty-memory">
            <p>No long-term memories found for this agent.</p>
          </div>
        ) : (
          msgs.map((m, i) => (
            <div key={i} className={`memory-item ${m.role}`}>
              <div className="memory-meta">{m.role} • {new Date(m.ts * 1000).toLocaleString()}</div>
              <div className="memory-content">{m.content}</div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .memory-view {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .view-header h2 {
          font-size: 24px;
          margin-bottom: 8px;
          background: linear-gradient(to right, #fff, var(--text-muted));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .view-header p {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 30px;
        }

        .view-header p span {
          color: var(--accent-secondary);
          font-weight: 600;
        }

        .memory-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-right: 12px;
        }

        .memory-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          transition: transform 0.2s;
        }

        .memory-item:hover {
          transform: translateX(4px);
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent-primary);
        }

        .memory-meta {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          color: var(--accent-primary);
        }

        .memory-item.assistant .memory-meta {
          color: var(--accent-secondary);
        }

        .memory-content {
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-main);
          white-space: pre-wrap;
        }

        .loading-state {
          text-align: center;
          padding: 40px;
          color: var(--accent-primary);
          font-style: italic;
        }

        .empty-memory {
          text-align: center;
          padding: 60px;
          border: 1px dashed var(--border-color);
          border-radius: 20px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
