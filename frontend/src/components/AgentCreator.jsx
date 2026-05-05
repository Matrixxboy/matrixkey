import React from "react";

export default function AgentCreator({ newAgent, setNewAgent, onCreate, agents }) {
  return (
    <div className="agent-creator fade-in">
      <div className="view-header">
        <h2>Spawn New Entity</h2>
        <p>Define a new persona and expertise for your <span>AIOS</span></p>
      </div>

      <div className="creation-form glass">
        <div className="form-group">
          <label>Agent Identifier</label>
          <input 
            placeholder="e.g. Code_Architect" 
            value={newAgent.name}
            onChange={e => setNewAgent(a => ({ ...a, name: e.target.value.replace(/\s/g, "_") }))}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Core Expertise / Persona</label>
          <textarea 
            placeholder="e.g. Senior Python developer focused on microservices and security." 
            value={newAgent.description}
            onChange={e => setNewAgent(a => ({ ...a, description: e.target.value }))}
            rows={4}
            className="form-textarea"
          />
        </div>

        <button 
          onClick={onCreate} 
          disabled={!newAgent.name || !newAgent.description}
          className="create-btn"
        >
          Initialize Agent
        </button>
      </div>

      <div className="existing-agents">
        <h3>Current Entities</h3>
        <div className="agent-chips">
          {agents.map(a => (
            <span key={a} className="agent-chip">
              {a}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .agent-creator {
          max-width: 700px;
          padding: 20px;
        }

        .creation-form {
          padding: 32px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 40px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-group label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--accent-primary);
          letter-spacing: 1.5px;
        }

        .form-input, .form-textarea {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 14px;
          font-size: 14px;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: var(--accent-primary);
        }

        .form-textarea {
          resize: none;
        }

        .create-btn {
          background: linear-gradient(135deg, var(--accent-primary), #5e35b1);
          color: white;
          padding: 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          margin-top: 10px;
          box-shadow: 0 4px 15px rgba(124, 77, 255, 0.3);
        }

        .create-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: var(--text-muted);
          box-shadow: none;
        }

        .existing-agents h3 {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .agent-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .agent-chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          color: var(--accent-secondary);
        }
      `}</style>
    </div>
  );
}
