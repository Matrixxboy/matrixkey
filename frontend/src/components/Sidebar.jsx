import React, { useState, useEffect } from "react";
import { API_BASE } from "../constants";

const IconChat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconWorkspace = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>;
const IconOrchestrator = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconAgents = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconMemory = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>;
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default function Sidebar({ 
  view, 
  setView, 
  stats, 
  currentCompanyId, 
  setCurrentCompanyId,
  sessions = [],
  currentSessionId,
  loadSession,
  startNewSession,
  fetchSessions
}) {
  const [companies, setCompanies] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const res = await fetch(`${API_BASE}/company/`);
    const data = await res.json();
    setCompanies(data);
  };

  const addCompany = async () => {
    const name = prompt("Enter Company Name:");
    if (!name) return;
    await fetch(`${API_BASE}/company/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    fetchCompanies();
  };

  const renameSession = async (id) => {
    if (!editTitle.trim()) { setEditingSession(null); return; }
    await fetch(`${API_BASE}/chat/sessions/${id}?company_id=${currentCompanyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle })
    });
    setEditingSession(null);
    if (fetchSessions) fetchSessions();
  };

  const menuItems = [
    { id: "chat", label: "Assistant", icon: <IconChat /> },
    { id: "workspace", label: "Workspace", icon: <IconWorkspace /> },
    { id: "orchestrator", label: "Hierarchy", icon: <IconOrchestrator /> },
    { id: "agents", label: "Agents & Skills", icon: <IconAgents /> },
    { id: "memory", label: "Memory", icon: <IconMemory /> },
  ];

  return (
    <div className="sidebar glass">
      <div className="sidebar-logo">
        <span className="logo-text">MatrixKey</span>
        <span className="logo-sub">(AIOS)</span>
      </div>

      <div className="company-selector">
        <select value={currentCompanyId} onChange={(e) => setCurrentCompanyId(parseInt(e.target.value))}>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={addCompany} className="add-company-btn"><IconPlus /></button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            className={`nav-item ${view === item.id ? "active" : ""}`}
            onClick={() => setView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {view === "chat" && sessions.length > 0 && (
        <div className="sessions-list fade-in">
          <div className="sessions-header">
            <span className="stat-label">Recent Chats</span>
            <button onClick={startNewSession} className="icon-btn-sm" title="New Session"><IconPlus /></button>
          </div>
          <div className="sessions-scroll">
            {sessions.map(s => (
              <div 
                key={s.id} 
                className={`session-item ${currentSessionId === s.id ? 'active' : ''}`}
                onClick={() => { if (editingSession !== s.id) loadSession(s.id) }}
                onDoubleClick={() => { setEditingSession(s.id); setEditTitle(s.title); }}
              >
                {editingSession === s.id ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onBlur={() => renameSession(s.id)}
                    onKeyDown={e => e.key === 'Enter' && renameSession(s.id)}
                    className="edit-session-input"
                  />
                ) : (
                  <span className="session-title">{s.title}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && view !== "chat" && (
        <div className="sidebar-footer">
          <div className="stats-box glass-card">
            <span className="stat-label">System Memory</span>
            <span className="stat-value">{stats.total_messages} Units</span>
          </div>
        </div>
      )}

      <style>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 32px 16px;
          border-radius: 0;
          border-right: 1px solid var(--glass-border);
          border-top: none;
          border-bottom: none;
          border-left: none;
        }

        .sidebar-logo {
          padding: 0 16px;
          margin-bottom: 40px;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .logo-text {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .logo-sub {
          font-size: 12px;
          font-weight: 400;
          color: var(--text-secondary);
        }

        .company-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          padding: 0 8px;
        }

        .company-selector select {
          flex: 1;
          height: 40px;
          font-size: 13px;
        }

        .add-company-btn {
          width: 40px;
          height: 40px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          width: 100%;
          justify-content: flex-start;
          padding: 12px 16px;
          background: transparent;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
        }

        .nav-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
        }

        .sidebar-footer {
          margin-top: auto;
          padding: 16px 8px;
        }

        .stats-box {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-dim);
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
        }

        .sessions-list {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .sessions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 8px 12px 8px;
        }

        .sessions-scroll {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .session-item {
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 13px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
        }

        .session-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: white;
        }

        .session-item.active {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          font-weight: 500;
        }

        .session-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .edit-session-input {
          width: 100%;
          background: transparent;
          border: none;
          color: white;
          font-size: 13px;
          font-family: inherit;
          outline: none;
        }

        .icon-btn-sm {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn-sm:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

      `}</style>
    </div>
  );
}
