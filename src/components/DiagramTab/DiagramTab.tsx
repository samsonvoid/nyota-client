import { useEffect } from 'react'
import mermaid from 'mermaid'

export default function DiagramTab() {
  useEffect(() => {
    mermaid.initialize({ theme: 'dark', securityLevel: 'loose', startOnLoad: true })
    mermaid.run()
  }, [])

  return (
    <div className="flex-1 min-w-0 flex flex-col p-4 sm:p-6 xl:p-8 overflow-y-auto">
      <div className="w-full max-w-[1800px] mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 glow-blue">Nyota Jarvis Core - Use Case Framework</h2>
          <p className="text-xs text-slate-400 mt-1">
            Uhusiano na maingiliano ya makundi yote (Actors) na Python background core engine na upande wa ulinzi wa Supabase.
          </p>
        </div>

        <div className="bg-[#03050a] border border-[#1a2238] rounded-xl p-6 flex justify-center items-center min-h-[480px]">
          <pre className="mermaid text-center">
{`graph TD
    subgraph Admin_Samson [Admin: Samson on Windows]
        style Admin_Samson fill:#070d19,stroke:#00f0ff,stroke-width:1.5px;
        A1["Trigger Vulnerability Audit"]:::nodeStyle
        A2["Toggle Active System Mode"]:::nodeStyle
        A3["Monitor Client Inquiry Reports"]:::nodeStyle
    end

    subgraph Client_Users [External Client Users]
        style Client_Users fill:#0e0513,stroke:#bd00ff,stroke-width:1.5px;
        C1["Request Project Case Study / Demo"]:::nodeStyle
        C2["Provide Requirements via WhatsApp"]:::nodeStyle
    end

    subgraph Core_Daemon [Windows Background Daemon (Python 3.13)]
        style Core_Daemon fill:#0e0d04,stroke:#ff5e00,stroke-width:1.5px;
        D1["Enforce Gemini API Limits"]:::nodeStyle
        D2["Run Complex Code Evaluation"]:::nodeStyle
        D3["Predict Project Complexity & Price"]:::nodeStyle
    end

    Admin_Samson --> D2
    Client_Users --> D1
    D3 --> SUB[(Supabase Cloud Postgres)]:::dbStyle
    D1 --> SUB

    classDef nodeStyle fill:#05070e,stroke:#1a2238,color:#cbd5e1,font-size:11px;
    classDef dbStyle fill:#041312,stroke:#00f0ff,color:#00f0ff,stroke-width:1.5px;`}
          </pre>
        </div>
      </div>
    </div>
  )
}
