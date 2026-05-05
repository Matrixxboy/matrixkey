import React from "react";

export default function Sidebar({ view, setView, stats }) {
  const menuItems = [
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "agents", label: "Agents", icon: "🤖" },
    { id: "memory", label: "Memory", icon: "🧠" },
  ];

  return (
    <div className="sidebar glass">
      <div className="sidebar-logo">⬡ AIOS</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setView(item.id)} 
            className={`nav-item ${view === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {stats && (
          <div className="stats-container">
            <div className="stat-row">
              <span>Memory Size:</span>
              <span className="stat-value">{stats.total_messages} msgs</span>
            </div>
            <div className="version-tag">v1.2.0-beta</div>
          </div>
        )}
      </div>

      <style>{`
        .sidebar {
          width: 240px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          z-index: 10;
        }

        .sidebar-logo {
          font-size: 20px;
          font-weight: 800;
          color: var(--accent-primary);
          margin-bottom: 32px;
          padding-left: 12px;
          letter-spacing: 2px;
          background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          color: var(--text-muted);
          border-radius: 12px;
          font-size: 14px;
          border: 1px solid transparent;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }

        .nav-item.active {
          background: rgba(124, 77, 255, 0.15);
          border-color: rgba(124, 77, 255, 0.3);
          color: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .nav-icon {
          font-size: 16px;
        }

        .sidebar-footer {
          margin-top: auto;
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }

        .stats-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
        }

        .stat-value {
          color: var(--accent-secondary);
          font-weight: 600;
        }

        .version-tag {
          opacity: 0.5;
          font-size: 10px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
