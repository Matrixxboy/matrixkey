import { useState, useEffect, useRef } from "react"
import { API_BASE } from "./constants"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import ChatWindow from "./components/ChatWindow"
import AgentCreator from "./components/AgentCreator"
import MemoryViewer from "./components/MemoryViewer"
import Workspace from "./components/Workspace"
import Orchestrator from "./components/Orchestrator"
import GlobalChat from "./components/GlobalChat"

const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconChat = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [agent, setAgent] = useState("Orion")
  const [model, setModel] = useState("llama3.2")
  const [agents, setAgents] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState("chat")
  const [newAgent, setNewAgent] = useState({ name: "", description: "" })
  const [stats, setStats] = useState(null)
  const [showGlobalChat, setShowGlobalChat] = useState(false)
  const [companyId, setCompanyId] = useState(1)
  
  // New States
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [workspaceRefreshCounter, setWorkspaceRefreshCounter] = useState(0)
  
  const bottom = useRef(null)

  useEffect(() => {
    fetchData()
  }, [companyId])

  useEffect(() => {
    if (view === "chat") {
      fetchSessions()
    }
  }, [companyId, agent, view])

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const fetchData = async () => {
    try {
      const [agentsData, modelsData, statsData] = await Promise.all([
        fetch(`${API_BASE}/agents`).then(r => r.json()),
        fetch(`${API_BASE}/models`).then(r => r.json()),
        fetch(`${API_BASE}/memory/stats/all?company_id=${companyId}`).then(r => r.json())
      ])
      setAgents(agentsData.agents || [])
      setModels(modelsData.models || [])
      setStats(statsData)
    } catch (e) {
      console.error("Failed to fetch initial data", e)
    }
  }

  const fetchSessions = async () => {
    try {
      const r = await fetch(`${API_BASE}/chat/sessions?company_id=${companyId}&agent=${agent}`)
      const data = await r.json()
      setSessions(data)
      
      // Auto-load the most recent session if none is selected
      if (data.length > 0 && !currentSessionId) {
        loadSession(data[0].id)
      }
    } catch (e) { console.error(e) }
  }

  const loadSession = (sessionId) => {
    setCurrentSessionId(sessionId)
    setMessages([])
    fetch(`${API_BASE}/chat/messages?session_id=${sessionId}&company_id=${companyId}`)
      .then(r => r.json())
      .then(msgs => setMessages(msgs))
      .catch(console.error)
  }

  const startNewSession = () => {
    setCurrentSessionId(null)
    setMessages([])
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: "user", content: input }
    setMessages(m => [...m, userMsg])
    const currentInput = input
    setInput("")
    setLoading(true)
    try {
      const r = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput, agent, model, company_id: companyId, session_id: currentSessionId })
      })
      const d = await r.json()
      
      if (d.session_id && d.session_id !== currentSessionId) {
        setCurrentSessionId(d.session_id)
        fetchSessions() // Refresh sidebar list to show new session
      }

      if (d.switched) {
        setAgent(d.agent)
      }
      
      if (d.workspace_modified) {
        setWorkspaceRefreshCounter(c => c + 1)
      }

      setMessages(m => [...m, { role: "assistant", content: d.reply }])
      fetch(`${API_BASE}/memory/stats/all?company_id=${companyId}`).then(r => r.json()).then(setStats)
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Connection error. Please check if the backend is running." }])
    }
    setLoading(false)
  }

  const clearMemory = async () => {
    if (!window.confirm("Delete this session?")) return
    if (!currentSessionId) return
    await fetch(`${API_BASE}/chat/sessions/${currentSessionId}?company_id=${companyId}`, { method: "DELETE" })
    startNewSession()
    fetchSessions()
  }

  return (
    <div className="app-container">
      <Sidebar 
        view={view} 
        setView={setView} 
        stats={stats} 
        currentCompanyId={companyId}
        setCurrentCompanyId={setCompanyId}
        sessions={sessions}
        currentSessionId={currentSessionId}
        loadSession={loadSession}
        startNewSession={startNewSession}
        fetchSessions={fetchSessions}
      />

      <div className="main-content">
        <Header 
          agent={agent} 
          setAgent={(val) => { setAgent(val); startNewSession(); }} 
          model={model} 
          setModel={setModel} 
          agents={agents} 
          models={models} 
          onClear={clearMemory} 
        />

        <main className="view-area">
          {view === "chat" && (
            <ChatWindow 
              messages={messages} 
              loading={loading} 
              input={input} 
              setInput={setInput} 
              onSend={send} 
              agent={agent} 
              bottomRef={bottom} 
            />
          )}

          {view === "workspace" && (
            <Workspace companyId={companyId} refreshTrigger={workspaceRefreshCounter} />
          )}

          {view === "orchestrator" && (
            <Orchestrator agents={agents} companyId={companyId} />
          )}

          {view === "agents" && (
            <AgentCreator agents={agents} onCreate={fetchData} />
          )}

          {view === "memory" && (
            <div className="memory-view glass-card fade-in">
              <h3 className="text-muted">Persistence Layer</h3>
              <p className="text-dim">Vector embeddings active and indexed for current company.</p>
            </div>
          )}
        </main>
      </div>

      <GlobalChat 
        isOpen={showGlobalChat} 
        setIsOpen={setShowGlobalChat} 
        currentAgent={agent} 
        model={model}
      />

      <button 
        className="fab-toggle primary"
        onClick={() => setShowGlobalChat(!showGlobalChat)}
      >
        {showGlobalChat ? <IconX /> : <IconChat />}
      </button>

      <style>{`
        .app-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: var(--bg-dark);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 24px 32px 32px 32px;
          gap: 24px;
        }

        .view-area {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .fab-toggle {
          position: fixed;
          right: 32px;
          bottom: 32px;
          width: 64px;
          height: 64px;
          border-radius: 32px;
          z-index: 1000;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }

        .fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .memory-view {
          padding: 64px;
          text-align: center;
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>
    </div>
  )
}
