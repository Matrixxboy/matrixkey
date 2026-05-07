import React, { useState, useEffect } from 'react';
import { API_BASE } from '../constants';

const IconTerminal = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>;
const IconUsers = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

export default function AgentManager({ agents: initialAgents, onCreate }) {
  const [agents, setAgents] = useState([]);
  const [skills, setSkills] = useState([]);
  const [editingAgent, setEditingAgent] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [activeTab, setActiveTab] = useState('agents');

  const [agentForm, setAgentForm] = useState({ name: '', description: '', persona: '' });
  const [skillForm, setSkillForm] = useState({ name: '', code: '' });

  useEffect(() => {
    fetchAgents();
    fetchSkills();
  }, []);

  const fetchAgents = async () => {
    const res = await fetch(`${API_BASE}/agents/`);
    const data = await res.json();
    setAgents(data.agents);
  };

  const fetchSkills = async () => {
    const res = await fetch(`${API_BASE}/skills/`);
    const data = await res.json();
    setSkills(data.skills);
  };

  const saveAgent = async () => {
    const method = editingAgent ? 'PUT' : 'POST';
    const url = editingAgent ? `${API_BASE}/agents/${editingAgent}` : `${API_BASE}/agents/create`;
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentForm)
    });
    
    setEditingAgent(null);
    setAgentForm({ name: '', description: '', persona: '' });
    fetchAgents();
    if (onCreate) onCreate();
  };

  const deleteAgent = async (name) => {
    if (!window.confirm(`Delete agent ${name}?`)) return;
    await fetch(`${API_BASE}/agents/${name}`, { method: 'DELETE' });
    fetchAgents();
  };

  const editAgent = async (name) => {
    const res = await fetch(`${API_BASE}/agents/${name}`);
    const data = await res.json();
    setEditingAgent(name);
    setAgentForm({ name: data.name, description: data.description, persona: data.persona });
  };

  const saveSkill = async () => {
    const method = editingSkill ? 'PUT' : 'POST';
    const url = editingSkill ? `${API_BASE}/skills/${editingSkill}` : `${API_BASE}/skills/`;
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skillForm)
    });
    
    setEditingSkill(null);
    setSkillForm({ name: '', code: '' });
    fetchSkills();
  };

  const deleteSkill = async (name) => {
    if (!window.confirm(`Delete skill ${name}?`)) return;
    await fetch(`${API_BASE}/skills/${name}`, { method: 'DELETE' });
    fetchSkills();
  };

  const editSkill = async (name) => {
    const res = await fetch(`${API_BASE}/skills/${name}`);
    const data = await res.json();
    setEditingSkill(name);
    setSkillForm({ name: data.name, code: data.code });
  };

  return (
    <div className="agent-manager glass fade-in">
      <div className="manager-header">
        <div className="manager-tabs">
          <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>
            <IconUsers />
            <span>Agent Personas</span>
          </button>
          <button className={activeTab === 'skills' ? 'active' : ''} onClick={() => setActiveTab('skills')}>
            <IconTerminal />
            <span>Core Skills</span>
          </button>
        </div>
      </div>

      <div className="manager-content">
        {activeTab === 'agents' ? (
          <div className="section-layout">
            <div className="form-column">
              <div className="column-label">{editingAgent ? 'Configure Essence' : 'New Essence'}</div>
              <input 
                placeholder="Agent Identifier" 
                value={agentForm.name} 
                onChange={e => setAgentForm({...agentForm, name: e.target.value})}
              />
              <input 
                placeholder="Operational Role" 
                value={agentForm.description} 
                onChange={e => setAgentForm({...agentForm, description: e.target.value})}
              />
              <textarea 
                placeholder="System Directives / Persona Definition" 
                value={agentForm.persona} 
                onChange={e => setAgentForm({...agentForm, persona: e.target.value})}
              />
              <div className="form-actions">
                <button onClick={saveAgent} className="primary">{editingAgent ? 'Update' : 'Initialize'}</button>
                {editingAgent && <button onClick={() => {setEditingAgent(null); setAgentForm({name:'',description:'',persona:''})}}>Cancel</button>}
              </div>
            </div>

            <div className="list-column">
              <div className="column-label">Active Agents</div>
              <div className="item-grid">
                {agents.map(a => (
                  <div key={a} className="glass-card item-card">
                    <span className="item-name">{a}</span>
                    <div className="item-actions">
                      <button onClick={() => editAgent(a)}>Edit</button>
                      <button onClick={() => deleteAgent(a)} className="text-danger">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="section-layout">
            <div className="form-column wide">
              <div className="column-label">{editingSkill ? 'Refine Logic' : 'Integrate New Skill'}</div>
              <input 
                placeholder="Skill Identifier (lowercase_underscore)" 
                value={skillForm.name} 
                onChange={e => setSkillForm({...skillForm, name: e.target.value})}
              />
              <textarea 
                placeholder="Python Script Implementation" 
                className="code-editor"
                value={skillForm.code} 
                onChange={e => setSkillForm({...skillForm, code: e.target.value})}
              />
              <div className="form-actions">
                <button onClick={saveSkill} className="primary">{editingSkill ? 'Refine' : 'Install Skill'}</button>
                {editingSkill && <button onClick={() => {setEditingSkill(null); setSkillForm({name:'',code:''})}}>Cancel</button>}
              </div>
            </div>

            <div className="list-column">
              <div className="column-label">Global Skill Library</div>
              <div className="item-grid">
                {skills.map(s => (
                  <div key={s} className="glass-card item-card">
                    <span className="item-name">{s}.py</span>
                    <div className="item-actions">
                      <button onClick={() => editSkill(s)}>Edit</button>
                      <button onClick={() => deleteSkill(s)} className="text-danger">Purge</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .agent-manager {
          padding: 40px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .manager-tabs {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px;
          border-radius: var(--radius-sm);
          width: fit-content;
        }

        .manager-tabs button {
          padding: 10px 20px;
          background: transparent;
          color: var(--text-dim);
          font-size: 13px;
        }

        .manager-tabs button.active {
          background: white;
          color: black;
        }

        .manager-content {
          flex: 1;
          overflow: hidden;
        }

        .section-layout {
          display: flex;
          gap: 48px;
          height: 100%;
        }

        .column-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--text-dim);
          margin-bottom: 20px;
        }

        .form-column {
          width: 400px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-column.wide { width: 600px; }

        input, textarea {
          font-size: 14px;
        }

        textarea { height: 120px; resize: none; }
        .code-editor { font-family: 'JetBrains Mono', monospace; height: 350px; font-size: 13px; line-height: 1.6; }

        .list-column {
          flex: 1;
          overflow-y: auto;
        }

        .item-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }

        .item-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          text-align: center;
        }

        .item-name {
          font-size: 14px;
          font-weight: 600;
        }

        .item-actions {
          display: flex;
          gap: 8px;
        }

        .item-actions button {
          font-size: 11px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05);
        }

        .item-actions button:hover { background: rgba(255, 255, 255, 0.1); }
        .text-danger { color: var(--danger) !important; }
      `}</style>
    </div>
  );
}
