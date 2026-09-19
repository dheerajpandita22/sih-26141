import { useState } from "react";
import { Atom, FileSignature, ServerIcon } from "lucide-react";
import { SimulationProvider } from "./hooks/useSimulation";
import { ClientPage } from "./components/ClientPage";
import { ServerPage } from "./components/ServerPage";

type Page = "client" | "server";

function TopNav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-base-600/60 bg-base-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-glow/10 text-cyan-glow ring-1 ring-cyan-glow/25">
            <Atom size={16} />
          </div>
          <div className="leading-tight">
            <p className="text-[12.5px] font-bold tracking-wide text-slate-100">SIH26141</p>
            <p className="text-[10px] text-slate-500">Quantum Signature Verification &amp; Threat Detection</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 rounded-xl border border-base-600/70 bg-base-900/70 p-1">
          <button
            onClick={() => setPage("client")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition ${
              page === "client" ? "bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/30" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <FileSignature size={14} />
            Client
          </button>
          <button
            onClick={() => setPage("server")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition ${
              page === "server" ? "bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/30" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <ServerIcon size={14} />
            Server
          </button>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("client");

  return (
    <SimulationProvider>
      <div className="min-h-screen bg-grid-overlay">
        <TopNav page={page} setPage={setPage} />
        {page === "client" ? <ClientPage /> : <ServerPage />}
      </div>
    </SimulationProvider>
  );
}
