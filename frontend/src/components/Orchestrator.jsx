import React, { useState, useEffect } from 'react';
import { API_BASE } from '../constants';

const IconLink = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function Orchestrator({ agents }) {
  const [hierarchy, setHierarchy] = useState([]);
  const [parent, setParent] = useState('');
  const [child, setChild] = useState('');

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    try {
      const res = await fetch(`${API_BASE}/orchestrator/hierarchy`);
      const data = await res.json();
      setHierarchy(data.links);
    } catch (e) {
      console.error(e);
    }
  };

  const assign = async () => {
    if (!parent || !child || parent === child) return;
    try {
      await fetch(`${API_BASE}/orchestrator/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_agent: parent, child_agent: child })
      });
      fetchHierarchy();
    } catch (e) {
      console.error(e);
    }
  };

  const unassign = async (p, c) => {
    try {
      await fetch(`${API_BASE}/orchestrator/unassign?parent=${p}&child=${c}`, {
        method: 'DELETE'
      });
      fetchHierarchy();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="orchestrator-container glass fade-in">
      <div className="orch-header">
        <h1>Command Structure</h1>
        <p className="text-muted">Define hierarchical reporting lines and operational dependencies between agents.</p>
      </div>

      <div className="orch-tools glass-card">
        <div className="assign-form">
          <div className="select-group">
            <label className="text-dim">Subordinate</label>
            <select value={child} onChange={e => setChild(e.target.value)}>
              <option value="">Choose Agent</option>
              {agents.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          
          <div className="arrow-text text-dim">Reports to</div>

          <div className="select-group">
            <label className="text-dim">Authority</label>
            <select value={parent} onChange={e => setParent(e.target.value)}>
              <option value="">Choose Manager</option>
              {agents.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <button onClick={assign} className="primary">
            <IconLink />
            <span>Establish Link</span>
          </button>
        </div>
      </div>

      <div className="hierarchy-viz">
        <label className="section-label">Active Chain of Command</label>
        {hierarchy.length === 0 ? (
          <div className="empty-hierarchy text-dim">No operational links defined.</div>
        ) : (
          <div className="links-list">
            {hierarchy.map((link, i) => (
              <div key={i} className="link-card glass-card">
                <div className="node child-node">{link.target}</div>
                <div className="connector">
                  <div className="line"></div>
                  <div className="label text-dim">DELEGATED TO</div>
                </div>
                <div className="node parent-node">{link.source}</div>
                <button onClick={() => unassign(link.source, link.target)} className="icon-btn text-danger">
                  <IconX />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .orchestrator-container {
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          height: 100%;
          overflow-y: auto;
        }

        .orch-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .orch-tools {
          padding: 32px;
        }

        .assign-form {
          display: flex;
          align-items: flex-end;
          gap: 32px;
        }

        .select-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .select-group label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .arrow-text {
          font-size: 12px;
          font-weight: 500;
          padding-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .section-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--text-dim);
          display: block;
          margin-bottom: 24px;
        }

        .links-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .link-card {
          display: flex;
          align-items: center;
          padding: 24px;
          gap: 24px;
        }

        .node {
          padding: 12px 24px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 14px;
          min-width: 140px;
          text-align: center;
        }

        .child-node { background: rgba(255, 255, 255, 0.05); color: white; border: 1px solid rgba(255, 255, 255, 0.1); }
        .parent-node { background: white; color: black; }

        .connector {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .connector .line {
          width: 100%;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .connector .label {
          font-size: 9px;
          font-weight: 700;
          background: #000;
          padding: 4px 12px;
          position: absolute;
          top: -10px;
          letter-spacing: 1px;
        }

        .icon-btn { background: transparent; padding: 8px; border-radius: 50%; }
        .icon-btn:hover { background: rgba(255, 71, 87, 0.1); }

        .empty-hierarchy {
          text-align: center;
          padding: 64px;
          border: 1px dashed rgba(255, 255, 255, 0.05);
          border-radius: var(--radius);
        }
      `}</style>
    </div>
  );
}
