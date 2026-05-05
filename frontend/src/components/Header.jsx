import React from "react";

export default function Header({ agent, setAgent, model, setModel, agents, models, onClear }) {
  return (
    <div className="header glass">
      <div className="header-controls">
        <div className="control-group">
          <label>Agent</label>
          <select 
            value={agent} 
            onChange={e => setAgent(e.target.value)}
            className="header-select"
          >
            {agents.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div className="control-group">
          <label>Model</label>
          <select 
            value={model} 
            onChange={e => setModel(e.target.value)}
            className="header-select"
          >
            {models.length ? models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)
              : <option>llama3.2</option>}
          </select>
        </div>
      </div>

      <button onClick={onClear} className="clear-btn">
        Clear Session
      </button>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          margin: 0 0 10px 0;
          border-radius: 0 0 16px 16px;
          border-top: none;
        }

        .header-controls {
          display: flex;
          gap: 20px;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .control-group label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 1px;
        }

        .header-select {
          background: rgba(0, 0, 0, 0.4);
          font-size: 13px;
          padding: 6px 10px;
          min-width: 120px;
        }

        .clear-btn {
          background: transparent;
          border: 1px solid rgba(255, 100, 100, 0.2);
          color: rgba(255, 100, 100, 0.6);
          padding: 6px 14px;
          font-size: 12px;
          border-radius: 8px;
        }

        .clear-btn:hover {
          background: rgba(255, 100, 100, 0.1);
          color: rgba(255, 100, 100, 0.9);
          border-color: rgba(255, 100, 100, 0.4);
        }
      `}</style>
    </div>
  );
}
