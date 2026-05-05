import { useState, useEffect, useRef } from "react"
import { API_BASE } from "./constants"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import ChatWindow from "./components/ChatWindow"
import AgentCreator from "./components/AgentCreator"
import MemoryViewer from "./components/MemoryViewer"

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [agent, setAgent] = useState("default")
  const [model, setModel] = useState("llama3.2")
  const [agents, setAgents] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState("chat")
  const [newAgent, setNewAgent] = useState({ name: "", description: "" })
  const [stats, setStats] = useState(null)
  const bottom = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const fetchData = async () => {
    try {
      const [agentsData, modelsData, statsData] = await Promise.all([
        fetch(`${API_BASE}/agents`).then(r => r.json()),
        fetch(`${API_BASE}/models`).then(r => r.json()),
        fetch(`${API_BASE}/memory/stats/all`).then(r => r.json())
      ])
      setAgents(agentsData.agents || [])
      setModels(modelsData.models || [])
      setStats(statsData)
    } catch (e) {
      console.error("Failed to fetch initial data", e)
    }
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
        body: JSON.stringify({ message: currentInput, agent, model })
      })
      const d = await r.json()
      setMessages(m => [...m, { role: "assistant", content: d.reply }])
      // Refresh stats
      fetch(`${API_BASE}/memory/stats/all`).then(r => r.json()).then(setStats)
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "⚠️ Connection error. Please check if the backend and Ollama are running." }])
    }
    setLoading(false)
  }

  const clearMemory = async () => {
    if (!window.confirm("Clear all memory for this agent?")) return
    await fetch(`${API_BASE}/memory/${agent}`, { method: "DELETE" })
    setMessages([])
    fetch(`${API_BASE}/memory/stats/all`).then(r => r.json()).then(setStats)
  }

  const createAgent = async () => {
    if (!newAgent.name || !newAgent.description) return
    try {
      await fetch(`${API_BASE}/agents/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAgent)
      })
      const d = await fetch(`${API_BASE}/agents`).then(r => r.json())
      setAgents(d.agents || [])
      setNewAgent({ name: "", description: "" })
      alert(`Agent ${newAgent.name} created!`)
    } catch (e) {
      alert("Failed to create agent.")
    }
  }

  return (
    <div className="app-container">
      <Sidebar view={view} setView={setView} stats={stats} />

      <div className="main-content">
        <Header 
          agent={agent} 
          setAgent={(val) => { setAgent(val); setMessages([]) }} 
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

          {view === "agents" && (
            <AgentCreator 
              newAgent={newAgent} 
              setNewAgent={setNewAgent} 
              onCreate={createAgent} 
              agents={agents} 
            />
          )}

          {view === "memory" && (
            <MemoryViewer agent={agent} />
          )}
        </main>
      </div>

      <style>{`
        .app-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: radial-gradient(circle at top right, #1a1a2e, #0a0a0f);
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: relative;
        }

        .view-area {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 20px;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
