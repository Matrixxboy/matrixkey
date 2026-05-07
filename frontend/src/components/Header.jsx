import React from "react";

const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

export default function Header({ agent, setAgent, model, setModel, agents, models, onClear }) {
  return (
    <div className="header glass">
      <div className="header-controls">
        <div className="control-group">
          <label>Agent Configuration</label>
          <select 
            value={agent} 
            onChange={e => setAgent(e.target.value)}
          >
            {agents.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div className="control-group">
          <label>Compute Model</label>
          <select 
            value={model} 
            onChange={e => setModel(e.target.value)}
          >
            {models.length ? models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)
              : <option>llama3.2</option>}
          </select>
        </div>
      </div>

      <button onClick={onClear} className="clear-btn">
        <IconTrash />
        <span>Purge Memory</span>
      </button>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-radius: var(--radius);
        }

        .header-controls {
          display: flex;
          gap: 32px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .control-group label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-dim);
          letter-spacing: 1.5px;
        }

        select {
          background: transparent;
          border: none;
          padding: 0;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .clear-btn {
          padding: 10px 16px;
          color: var(--danger);
          font-size: 13px;
          border: 1px solid rgba(255, 71, 87, 0.1);
        }

        .clear-btn:hover {
          background: rgba(255, 71, 87, 0.05);
          border-color: rgba(255, 71, 87, 0.2);
        }
      `}</style>
    </div>
  );
}
