import React, { useState, useEffect } from 'react';
import { API_BASE } from '../constants';

// --- SVG Icons ---
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconChevron = ({ open }) => <svg width="14" height="14" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconClock = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconLayout = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>;

// --- Components ---

const TaskCard = ({ 
  task, 
  tasks, 
  isSub = false, 
  expandedTask, 
  setExpandedTask, 
  editingTaskId, 
  setEditingTaskId, 
  editTitle, 
  setEditTitle,
  updateTaskTitle,
  deleteTask,
  addTask,
  formatDate,
  onDragStart
}) => {
  const subtasks = tasks.filter(t => t.parent_id === task.id);
  const isOpen = expandedTask === task.id;
  const isEditing = editingTaskId === task.id;

  return (
    <div 
      className={`task-card glass-card ${isSub ? 'subtask' : ''}`}
      draggable={!isSub && !isEditing}
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <div className="task-main" onClick={() => !isEditing && setExpandedTask(isOpen ? null : task.id)}>
        <div className="task-info">
          {isEditing ? (
            <input 
              autoFocus
              className="edit-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => updateTaskTitle(task.id, editTitle)}
              onKeyDown={(e) => e.key === 'Enter' && updateTaskTitle(task.id, editTitle)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="title-row">
              <span className="task-uid text-dim">{task.uid}</span>
              <span className="task-title">{task.title}</span>
            </div>
          )}
          <div className="task-meta text-dim">
            <IconClock /> <span>{formatDate(task.ts)}</span>
            {subtasks.length > 0 && <span>· {subtasks.length} iterations</span>}
          </div>
        </div>
        <div className="task-actions">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setEditingTaskId(task.id); 
              setEditTitle(task.title); 
            }} 
            className="icon-btn"
          >
            <IconEdit />
          </button>
          {!isSub && <IconChevron open={isOpen} />}
          <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="icon-btn text-danger">
            <IconTrash />
          </button>
        </div>
      </div>

      {isOpen && !isSub && (
        <div className="subtasks-area">
          {subtasks.map(st => (
            <TaskCard 
              key={st.id} 
              task={st} 
              tasks={tasks}
              isSub={true} 
              expandedTask={expandedTask}
              setExpandedTask={setExpandedTask}
              editingTaskId={editingTaskId}
              setEditingTaskId={setEditingTaskId}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              updateTaskTitle={updateTaskTitle}
              deleteTask={deleteTask}
              addTask={addTask}
              formatDate={formatDate}
              onDragStart={onDragStart}
            />
          ))}
          <button className="add-sub-btn" onClick={() => addTask(task.status, task.id)}>
            <IconPlus /> <span>New Dependency</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function Workspace({ companyId, refreshTrigger = 0 }) {
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const statuses = ['tasks', 'pending', 'completed', 'blocked'];

  useEffect(() => {
    fetchPages();
  }, [companyId]);

  useEffect(() => {
    if (refreshTrigger > 0 && activePage) {
      loadPage(activePage);
    } else if (refreshTrigger > 0) {
      fetchPages();
    }
  }, [refreshTrigger]);

  const fetchPages = async () => {
    try {
      const res = await fetch(`${API_BASE}/workspace/pages?company_id=${companyId}`);
      const data = await res.json();
      setPages(data);
      if (data.length > 0) {
        loadPage(data[0].id);
      } else {
        setActivePage(null);
        setTasks([]);
        setLoading(false);
      }
    } catch (e) { console.error(e); setLoading(false); }
  };

  const addPage = async () => {
    const title = prompt("Operation Group Name (e.g. Project X):");
    if (!title) return;
    try {
      await fetch(`${API_BASE}/workspace/pages?company_id=${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: "{}" })
      });
      fetchPages();
    } catch (e) { console.error(e); }
  };

  const loadPage = async (id) => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/workspace/pages/${id}?company_id=${companyId}`).then(r => r.json()),
        fetch(`${API_BASE}/workspace/pages/${id}/tasks?company_id=${companyId}`).then(r => r.json())
      ]);
      setActivePage(pRes);
      setTasks(tRes);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const addTask = async (status, parentId = null) => {
    if (!activePage) return;
    const title = prompt(parentId ? "Dependency Description:" : "Objective Title:");
    if (!title) return;

    try {
      await fetch(`${API_BASE}/workspace/tasks?company_id=${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: activePage.id,
          title,
          status,
          parent_id: parentId,
          position: tasks.filter(t => t.status === status && t.parent_id === parentId).length
        })
      });
      loadPage(activePage.id);
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await fetch(`${API_BASE}/workspace/tasks/${id}`, { method: 'DELETE' });
      loadPage(activePage.id);
    } catch (e) { console.error(e); }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      await fetch(`${API_BASE}/workspace/tasks/${id}?company_id=${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      loadPage(activePage.id);
    } catch (e) { console.error(e); }
  };

  const updateTaskTitle = async (id, newTitle) => {
    try {
      await fetch(`${API_BASE}/workspace/tasks/${id}?company_id=${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      setEditingTaskId(null);
      loadPage(activePage.id);
    } catch (e) { console.error(e); }
  };

  const formatDate = (ts) => {
    const d = new Date(ts * 1000);
    return `${d.toLocaleDateString()}`;
  };

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDrop = (e, status) => {
    const taskId = e.dataTransfer.getData('taskId');
    updateTaskStatus(taskId, status);
  };

  return (
    <div className="workspace-container fade-in">
      <div className="workspace-sidebar glass">
        <div className="ws-sidebar-header">
          <label className="sidebar-label">Operations</label>
          <button onClick={addPage} className="icon-btn"><IconPlus /></button>
        </div>
        <div className="pages-list">
          {pages.map(p => (
            <div key={p.id} className={`page-item ${activePage?.id === p.id ? 'active' : ''}`} onClick={() => loadPage(p.id)}>
              <IconLayout /> {p.title}
            </div>
          ))}
        </div>

        {activePage && (
          <div className="page-insights glass-card">
            <span className="sidebar-label">Strategy Insights</span>
            <div className="insight-row">
              <span className="text-muted">Resolution</span>
              <span className="stat-bold">{Math.round((tasks.filter(t => t.status === 'completed').length / (tasks.length || 1)) * 100)}%</span>
            </div>
            <div className="insight-row">
              <span className="text-muted">Impediments</span>
              <span className="stat-bold text-danger">{tasks.filter(t => t.status === 'blocked').length}</span>
            </div>
          </div>
        )}
      </div>

      <div className="board-area">
        {loading ? (
          <div className="loading-state text-dim">Synchronizing Operations...</div>
        ) : activePage ? (
          <div className="board-content">
            <header className="board-header">
              <h1 className="page-title">{activePage.title}</h1>
              <div className="board-stats text-muted">
                {tasks.length} Operational Units Indexed
              </div>
            </header>

            <div className="kanban-grid">
              {statuses.map(status => (
                <div 
                  key={status} 
                  className="status-column"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, status)}
                >
                  <div className="column-header">
                    <span className={`status-dot ${status}`}></span>
                    <span className="status-label">{status}</span>
                    <button onClick={() => addTask(status)} className="icon-btn-sm"><IconPlus /></button>
                  </div>
                  
                  <div className="column-tasks">
                    {tasks.filter(t => t.status === status && !t.parent_id).map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        tasks={tasks}
                        expandedTask={expandedTask}
                        setExpandedTask={setExpandedTask}
                        editingTaskId={editingTaskId}
                        setEditingTaskId={setEditingTaskId}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        updateTaskTitle={updateTaskTitle}
                        deleteTask={deleteTask}
                        addTask={addTask}
                        formatDate={formatDate}
                        onDragStart={onDragStart}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <h2 className="text-muted">Workspace Unit Not Initialized</h2>
              <p className="text-dim">Create an Operation Group in the sidebar to begin tracking units.</p>
              <button onClick={addPage} className="primary" style={{marginTop: '24px'}}>
                <IconPlus /> Initialize Operation Group
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .workspace-container {
          display: flex;
          height: 100%;
          gap: 32px;
        }

        .workspace-sidebar {
          width: 280px;
          display: flex;
          flex-direction: column;
          padding: 24px;
          gap: 32px;
        }

        .ws-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--text-dim);
          display: block;
        }

        .page-item {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: var(--text-secondary);
          transition: 0.2s;
        }

        .page-item:hover { background: rgba(255, 255, 255, 0.05); color: white; }
        .page-item.active { background: rgba(255, 255, 255, 0.08); color: white; font-weight: 600; }

        .page-insights {
          margin-top: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .insight-row { display: flex; justify-content: space-between; align-items: center; }
        .stat-bold { font-size: 18px; font-weight: 600; }

        .board-area { flex: 1; overflow-x: auto; }
        .board-header { margin-bottom: 40px; }
        .page-title { font-size: 40px; font-weight: 700; margin-bottom: 8px; letter-spacing: -1px; }

        .kanban-grid {
          display: flex;
          gap: 32px;
          height: calc(100% - 120px);
          min-width: 1100px;
        }

        .status-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 280px;
        }

        .column-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 4px;
        }

        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.tasks { background: white; opacity: 0.2; }
        .status-dot.pending { background: white; opacity: 0.5; }
        .status-dot.completed { background: var(--success); }
        .status-dot.blocked { background: var(--danger); }

        .status-label { font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px; }

        .column-tasks {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .task-card {
          padding: 20px;
          border-radius: var(--radius-sm);
        }

        .task-main { display: flex; justify-content: space-between; align-items: flex-start; }
        .task-info { flex: 1; display: flex; flex-direction: column; gap: 12px; }
        .title-row { display: flex; flex-direction: column; gap: 4px; }
        .task-uid { font-size: 10px; font-weight: 700; letter-spacing: 1px; }
        .task-title { font-size: 16px; font-weight: 600; line-height: 1.5; }
        .task-meta { display: flex; align-items: center; gap: 16px; font-size: 11px; }

        .task-actions {
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: 0.2s;
        }

        .task-card:hover .task-actions { opacity: 1; }

        .icon-btn, .icon-btn-sm { background: transparent; color: var(--text-dim); }
        .icon-btn:hover, .icon-btn-sm:hover { color: white; background: rgba(255, 255, 255, 0.1); }
        
        .text-danger { color: var(--danger) !important; }

        .subtasks-area {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .subtask { padding: 12px; background: rgba(255, 255, 255, 0.01); border: none; }

        .add-sub-btn {
          width: 100%;
          padding: 12px;
          font-size: 12px;
          color: var(--text-dim);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          background: transparent;
        }

        .add-sub-btn:hover { color: white; border-color: rgba(255, 255, 255, 0.3); }

        .edit-input { width: 100%; padding: 4px 0; background: transparent; border: none; border-bottom: 1px solid white; border-radius: 0; }

        .loading-state, .empty-state { height: 100%; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
}
