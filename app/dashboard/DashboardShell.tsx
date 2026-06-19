"use client";

import { brainStore } from "@/core/brainStore";
import { initialPoimterState, PoimterState } from "./poimterState";
import { generateNodeActions, generateSwarmSignals } from "@/brain/phase9Engine";
import { computeSystemThought } from "@/brain/phase10Engine";
import { createBrainConnection } from "@/brain/brainClient";
import { generateAutonomousActions } from "@/system/swarmController";
import { computeSystemState } from "@/system/systemBrain";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { setGlobeCache } from "@/app/globe/globeStore";
import { startBrainCycle } from "@/brain/runBrainCycle";
import { runSearchToReport } from "@/searchNode/searchNodeAdapter";
import { parseCompanyContext } from "@/brain/companyContextParser";
import { downloadReportPDF } from "@/brain/exportReportPDF";
import { createReportFromInternal } from "@/brain/report/reportMapper";
import MarketAnalystChat from "./MarketAnalystChat";



type Node = {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
};

type Connection = {
  from: string;
  to: string;
  strength: number;
};

type InternalDataItem = {
  id: string;
  text: string;
  score: number;
  savedToReport: boolean;
  edited: boolean;
  timestamp: number;
};

export default function DashboardShell() {
  const [networkMessage, setNetworkMessage] = useState("");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [systemThought, setSystemThought] = useState("");
  const router = useRouter();
  const [showMemory, setShowMemory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [sharedBrain, setSharedBrain] = useState(brainStore.getState());
  const topOpportunity = sharedBrain.opportunities?.[0];
  const [companyInfo, setCompanyInfo] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const isSavingRef = useRef(false);
  const triggerIntelligence = async (input: string) => {
  try {
    const res = await fetch("/api/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input }),
    });

    if (!res.ok) {
      console.error("Intelligence API failed:", res.status);
      return;
    }

    const text = await res.text();
    if (!text) {
      console.error("Empty response from API");
      return;
    }

    const data = JSON.parse(text);

    if (data?.ok) {
      brainStore.setState({
        activeSession: data.session ?? null,
        internalData: data.internalData ?? [],
        opportunities: data.opportunities ?? [],
        mapSignals: data.mapSignals ?? [],
        geoHeatMap: data.geoHeatMap ?? {},
        geoNodes: data.geoNodes ?? [],
        selectedLocation: data.selectedLocation ?? null,
        selectedProduct: data.selectedProduct ?? null,
        queryHistory: data.queryHistory ?? [],
        marketSignal: data.marketSignal ?? null,
        articles: data.articles ?? [],
      });
    }
  } catch (e) {
    console.error("triggerIntelligence error:", e);
  }
};
  const current = brainStore.getState();
  const handleSaveToReport = (itemId: string) => {
  if (isSavingRef.current) return;
  isSavingRef.current = true;

  const state = brainStore.getState();
  const found = state.internalData?.find(x => x.id === itemId);

  if (!found) {
    isSavingRef.current = false;
    return;
  }

  const exists = state.reportData?.some(r =>
    r.sourceInternalIds?.includes(found.id)
  );

  if (exists) {
    isSavingRef.current = false;
    return;
  }

  const reportItem = createReportFromInternal({
    ...found,
    sourceInternalIds: [found.id],
  });

  brainStore.setState({
    reportData: [...(state.reportData || []), reportItem],
  });

  setTimeout(() => {
    isSavingRef.current = false;
  }, 300);
};

  const handleSearch = () => {
  if (!search.trim() || isRunning) return;

  setIsRunning(true);

  triggerIntelligence(search);

  setTimeout(() => setIsRunning(false), 2000);
};

const handleCompanyContextCommit = () => {
  const state = brainStore.getState();

  const context = state.companyContext?.description;

  if (!context || context.trim().length < 5) return;

  triggerIntelligence(context);
};

const commitCompanyContext = () => {
  const value = companyInfo;

  if (!value || value.trim().length < 5) return;

  const parsed = parseCompanyContext(value);

  brainStore.setState({
    companyContext: {
      description: value,
      products: parsed.products,
      markets: parsed.markets,
      goals: parsed.goals,
      constraints: parsed.constraints,
    },
  });

  triggerIntelligence(value);
};


const saveToReport = (item: any) => {
  console.log("🔥 SAVE START:", item?.id);

  const state = brainStore.getState();

  // 1. Validate item
  if (!item || !item.id) {
    console.log("❌ INVALID ITEM");
    return;
  }

  // 2. Find latest version from store (IMPORTANT FIX)
  const latestItem = state.internalData?.find(
    (x) => x.id === item.id
  );

  if (!latestItem) {
    console.log("❌ ITEM NOT FOUND IN STORE");
    return;
  }

  // 3. Build report safely
  const reportItem = createReportFromInternal({
    ...latestItem,
    sourceInternalIds: [latestItem.id],
  });

  // 4. Prevent duplicates (IMPORTANT FIX)
  const alreadyExists = state.reportData?.some(
    (r) => r.sourceInternalIds?.includes(latestItem.id)
  );

  if (alreadyExists) {
    console.log("⚠️ ALREADY SAVED - SKIPPING");
    return;
  }

  // 5. Update store safely
  brainStore.setState({
    reportData: [
      ...(state.reportData || []),
      reportItem,
    ],
  });

  console.log("✅ SAVED SUCCESSFULLY");
  console.log("REPORT SIZE:", brainStore.getState().reportData?.length);
};

  useEffect(() => {
    const unsub = brainStore.subscribe(setSharedBrain);
    return() => unsub();
  }, []);

  useEffect(() => {
  startBrainCycle();
}, []);

useEffect(() => {
  console.log("INTERNAL DATA LIVE:", sharedBrain.internalData);
}, [sharedBrain.internalData]);


useEffect(() => {
  console.log("REPORT DATA:", sharedBrain.reportData);
}, [sharedBrain.reportData]);


const buildGlobePoints = (mapSignals: any[] = []) => {
  return mapSignals.map((s) => ({
    id: s.id,
    lat: s.lat ?? Math.random() * 180 - 90,
    lng: s.lng ?? Math.random() * 360 - 180,
    intensity: s.value ?? 50,
    label: s.label ?? s.id,
  }));
};

    const latestSummary =
      sharedBrain.internalData?.slice(-1)?.[0]?.summary;

    const dominantNode =
      sharedBrain.query || "idle";

    const getNodeAction = (nodeId: string) => {
      return (
        sharedBrain.internalData?.find((d) => d.nodeId === nodeId)?.action ||
        sharedBrain.externalData?.find((d) => d.nodeId === nodeId)?.action ||
        ""
      );
    };


  // ================= PHASE 6 (PACKETS) =================
  const [packets, setPackets] = useState<
    { id: number; from: string; to: string; progress: number }[]
  >([]);

  const [metrics, setMetrics] = useState<Record<string, number>>({
    search: 62,
    map: 44,
    report: 78,
  });

  // ================= PHASE 7 PREP (AI AGENT STATE) =================
  const [nodeMemory, setNodeMemory] = useState<Record<string, string[]>>({
    search: [],
    map: [],
    report: [],
  });

  const [livePackets, setLivePackets] = useState<
    { id: number; from: string; to: string; progress: number }[]
  >([]);

  useEffect(() => {
  const socket = createBrainConnection((data) => {
    if (data.type === "BRAIN_TICK") {
      setSystemThought(data.systemThought);
      setNetworkMessage(data.networkMessage);
    } else {
      brainStore.setState({
  externalData: data.externalData ?? brainStore.getState().externalData,
  opportunities: data.opportunities ?? brainStore.getState().opportunities,
  mapSignals: data.mapSignals ?? brainStore.getState().mapSignals,
      });

      setSystemThought(data.systemThought);
      setNetworkMessage(data.networkMessage);
    }
  });

  return () => socket.close();
}, []);

  const nodes: Node[] = [
    { id: "search", label: "SEARCH NODE", description: "Processes market signals.", x: 28, y: 30 },
    { id: "map", label: "MAP FIELD", description: "Geospatial intelligence grid.", x: 68, y: 42 },
    { id: "report", label: "REPORT CORE", description: "Structured analysis engine.", x: 48, y: 72 },
  ];

  const connections: Connection[] = [
    { from: "search", to: "map", strength: 0.9 },
    { from: "map", to: "report", strength: 0.7 },
    { from: "search", to: "report", strength: 0.5 },
  ];

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
  };

  // ================= METRICS ENGINE =================
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((key) => {
          const drift = Math.random() * 6 - 3;
          updated[key] = Math.max(10, Math.min(100, updated[key] + drift));
        });

        return updated;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // ================= PACKET ENGINE (PHASE 6) =================
  useEffect(() => {
    let id = 0;

    const t = setInterval(() => {
      const c = connections[Math.floor(Math.random() * connections.length)];

      setPackets((prev) => [
        ...prev,
        { id: id++, from: c.from, to: c.to, progress: 0 },
      ]);
    }, 1200);

    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setPackets((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + 0.02 }))
          .filter((p) => p.progress <= 1)
      );
    }, 40);

    return () => clearInterval(t);
  }, []);

  // ================= SHIFT SYSTEM (FIX YOU REQUESTED) =================
  const shiftX = activeNode ? -60 : 0;

  return (
    <div
      className="h-screen w-full bg-[#0B0C0E] text-white relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >

      {/* ================= GRID ================= */}
      <div className="absolute inset-0 bg-[#0B0C0E]" />

      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.10) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.10) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* ================= CURSOR GLOW ================= */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: mouse.x,
          top: mouse.y,
          width: "380px",
          height: "380px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(34,197,94,0.12), transparent 60%)",
          filter: "blur(30px)",
        }}
      />

      {/* ================= SEARCH BAR ================= */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl z-50">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
            
          placeholder="Search Products and Areas..."
          className="bg-transparent outline-none text-sm w-[260px] text-white/80"
        />
        
        {isRunning && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 text-xs text-green-400">
            Running intelligence loop...
          </div>
        )}

        <button
          onClick={handleSearch}
          className="text-xs text-green-400"
        >
          run
        </button>

        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"
            stroke="#22c55e" strokeWidth="1.5" />
          <path d="M19 11a7 7 0 0 1-14 0"
            stroke="#22c55e" strokeWidth="1.5" />
          <path d="M12 18v3"
            stroke="#22c55e" strokeWidth="1.5" />
        </svg>
      </div>

        {systemThought && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-xs text-green-400 opacity-70 tracking-wider">
              {systemThought}
            <div className="text-center text-[10px] text-white/40 mt-1">
            dominant node: {
              sharedBrain.mapSignals?.reduce((max, s) =>
                s.value > (max?.value || 0) ? s : max
              , null)?.id || "idle"
              }
            </div>
          </div>
        )}

        <div className="absolute top-32 left-1/2 -translate-x-1/2 text-center">
  
  {/* LINE 1: product + location */}
  <div className="text-green-400 text-xs">
    {sharedBrain.selectedProduct} {" | "} {sharedBrain.selectedLocation}
  </div>

  {/* LINE 2: company context */}
  <div className="text-xs mt-2">
  {sharedBrain.companyContext?.description ? (
    <div className="text-white/70">
      ● Internal context active
    </div>
  ) : (
    <div className="text-white/40">
      ○ No internal context provided yet
    </div>
  )}
</div>

</div>

      {/* ================= CONNECTIONS ================= */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-700"
        style={{
          transform: `translateX(${shiftX}px)`,
        }}
      >
        {connections.map((c, i) => {
          const from = getNodeById(c.from);
          const to = getNodeById(c.to);
          if (!from || !to) return null;

          return (
            <line
              key={i}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="#ffffff"
              strokeOpacity={0.10}
              strokeWidth={0.5}
            />
          );
        })}

        {/* ================= PACKETS ================= */}
        {packets.map((p) => {
          const from = getNodeById(p.from);
          const to = getNodeById(p.to);
          if (!from || !to) return null;

          const x = from.x + (to.x - from.x) * p.progress;
          const y = from.y + (to.y - from.y) * p.progress;

          return (
            <circle
              key={p.id}
              cx={`${x}%`}
              cy={`${y}%`}
              r="2"
              fill="#22c55e"
            />
          );
        })}
      </svg>

      {/* ================= NODES ================= */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          transform: `translateX(${shiftX}px)`,
        }}
      >
        {nodes.map((node) => {
          const isActive = activeNode?.id === node.id;
          const isHover = hoveredNode === node.id;
          const agent = sharedBrain.agents[node.id];

          const value = agent?.signal ?? 0; // safest

          return (
            <div
              key={node.id}
              onClick={() => {
                if (node.id === "map") {
  setGlobeCache({
    points: sharedBrain.geoNodes || [],
    query: sharedBrain.query,
  });

  router.push("/map");

                } else {
                  setActiveNode(isActive ? null : node);
                }
              }}


              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute cursor-pointer"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="flex flex-col items-center relative">

                {/* NODE */}
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: isActive || isHover ? "#22c55e" : "#E8E5DE",
                    boxShadow: isActive || isHover
                      ? "0 0 16px rgba(34,197,94,0.8)"
                      : "none",
                  }}
                />

                {/* HOLLOW SIGNAL */}
                <div className="absolute top-[-10px] w-6 h-6 border border-green-400 opacity-25 rounded-full animate-ping" />

                <div className="mt-3 text-[10px] tracking-[0.3em]"
                  style={{ color: isActive || isHover ? "#22c55e" : "#E8E5DE" }}
                >
                  {node.label}
                </div>

                <div className="text-[9px] mt-1 text-green-400 opacity-70">
                  {value}% SIGNAL
                </div>
                <div className="text-[8px] text-green-400 mt-1">
                    {agent.lastAction?.type ?? "uninitialized"}</div>
              </div>
            </div>
          );
        })}
      </div>
       
            <div className="absolute top-6 left-6 w-[340px]">
  <button
    onClick={() => setShowMemory((v) => !v)}
    className="text-[10px] text-green-400 tracking-[0.3em] mb-3"
  >
    SWARM MEMORY ▾
  </button>

  {showMemory && (
  <div className="historyScroll border border-white/10 bg-black/40 p-3 rounded-xl max-h-[300px] w-[230px] overflow-auto">

    {brainStore.getState().queryHistory?.length ? (
      brainStore.getState().queryHistory.map((item: any, i: number) => (
        <div
          key={i}
          className="text-xs text-white/70 py-2 border-b border-white/10 flex justify-between items-start gap-2"
        >
          {/* LEFT SIDE (CLICK TO VIEW) */}
          <div
            className="flex-1 cursor-pointer hover:text-green-400"
            onClick={() => setSelectedHistoryItem(item)}
          >
            <div>{item.query}</div>

            <div className="text-[10px] text-white/40">
              {new Date(item.timestamp).toLocaleString()}
            </div>

            <div className="text-[10px] text-white/60 mt-1">
              {item.summary}
            </div>
          </div>

          {/* RIGHT SIDE (PDF BUTTON) */}
          <button
            onClick={() => downloadReportPDF(item)}
            className="text-[10px] text-green-400 border border-green-400/30 px-2 py-1 rounded hover:bg-green-400/10"
          >
            PDF
          </button>
        </div>
      ))
    ) : (
      <div className="text-white/40 text-xs">
        No history yet
      </div>
    )}

  </div>
)}
</div>

      {/* ================= TOP OPPORTUNITY CARD ================= */}
      {topOpportunity && (
        <div className="absolute bottom-6 right-6 w-[320px] bg-black/40 border border-green-400/20 p-4 rounded-xl">
          <div className="text-green-400 text-xs mb-2">TOP RESULT</div>
          <div className="text-white text-sm">{topOpportunity.title}</div>
          <div className="text-green-400 text-xs mt-2">
            Confidence: {topOpportunity.confidence}%
          </div>
        </div>
      )}

      <div className="text-xs text-white/70 mb-2">
        {sharedBrain.internalData?.slice(-1)?.[0]?.summary || ""}
      </div>

      <div className="text-xs text-cyan-400">
        {networkMessage}
      </div>

      {/* ================= SIDEBAR ================= */}
      <div
        className="absolute top-0 right-0 h-full w-[360px] bg-black/40 backdrop-blur-xl border-l border-white/10 p-6 transition-transform duration-700"
        style={{
          transform: activeNode ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {activeNode ? (
          <>
            <div className="text-[#22c55e] text-xs tracking-[0.4em] mb-3">
              NETWORK NODE ACTIVE
            </div>

            <div className="text-white text-lg mb-2">
              {activeNode.label}
            </div>

            <div className="text-white/60 text-sm mb-4">
              {activeNode.description}
            </div>

            <div className="text-xs text-green-400 mb-1">
              LAST ACTION
            </div>

            <div className="text-xs text-white/70 mb-4">
              {sharedBrain.agents?.[activeNode.id]?.lastAction?.type ?? "idle"}
            </div>

            <div className="text-xs text-green-400 mb-1">
              MEMORY
            </div>

            <div className="text-xs text-white/70 mb-6">
              {sharedBrain.agents?.[activeNode.id]?.memory?.join(", ") || "empty"}
            </div>

            {activeNode.id === "search" && (
              <>
                <div className="text-[#22c55e] text-xs tracking-[0.4em] mb-3">
                  SEARCH NODE INTELLIGENCE
                </div>

                <div className="mb-4">
                  <div className="text-xs text-white/50 mb-2">
                    INTERNAL DATA
                  </div>

                  <div className="border border-white/10 bg-black/30 backdrop-blur-xl rounded-lg p-4 space-y-4">

  {/* INTERNAL DATA */}
  <div>
    <div className="text-[10px] text-green-400 mb-2 tracking-[0.2em]">
      AI INTELLIGENCE
    </div>
    

    <div className="historyScroll max-h-[120px] overflow-y-auto space-y-2">
      {sharedBrain.internalData?.map((item: any) => {

  const isLinked = !!item.reportId;
  const coverage = item.savedToReport ? 1 : 0;

  return (
    <div key={item.id} className="border border-white/10 rounded p-3 flex flex-col gap-2">

      <div className="flex justify-between items-start">
        <div className="text-xs text-white/80">
          {item.product}
        </div>

        <div className="text-[10px] text-green-400">
          {Math.round(item.score)}%
        </div>
      </div>

      <div className="text-[10px] text-white/40">
        {item.notes || "No notes"}
      </div>

      {item.savedToReport && (
        <div className="text-green-400 text-[10px]">
          ✓ Saved to Report
        </div>
      )}

      <div className="flex justify-end">
        <button
  onClick={() => handleSaveToReport(item.id)}
  className="text-[10px] text-green-400 border border-green-400/30 px-2 py-1 rounded hover:bg-green-400/10"
>
  → Save To Report
</button>
      </div>

    </div>
  );
})}

</div>
  </div>

  {/* COMPANY CONTEXT */}
<div>
  <div className="text-[10px] text-green-400 mb-2 tracking-[0.2em]">
    COMPANY CONTEXT
  </div>

  <textarea
    value={companyInfo}
    onChange={(e) => {
      const value = e.target.value;
      setCompanyInfo(value);

      if (value.trim().length > 10) {
        brainStore.setState({
          internalSignalStatus: "captured",
        });
      }

      const parsed = parseCompanyContext(value);

      brainStore.setState({
        companyContext: {
          description: value,
          products: parsed.products,
          markets: parsed.markets,
          goals: parsed.goals,
          constraints: parsed.constraints,
        },
      });
    }}
    placeholder="Tell us about your company..."
    className="w-full h-[90px] bg-transparent border border-white/10 rounded p-3 resize-none outline-none text-xs text-white/80"
  />

  {/* ENTER BUTTON (OUTSIDE TEXTAREA) */}
  <button
    onClick={commitCompanyContext}
    className="text-[10px] text-green-400 border border-green-400/30 px-2 py-1 rounded mt-2"
  >
    Enter Context →
  </button>

  {companyInfo && (
    <div className="text-[10px] text-green-400 opacity-70 mt-2">
      ● context streaming to AI
    </div>
  )}
</div>

</div>
                </div>
              </>
            )}

            {activeNode.id === "map" && (
  <>
    <div className="text-[#22c55e] text-xs tracking-[0.4em] mb-3">
      MAP FIELD INTELLIGENCE
    </div>

    <div className="text-xs text-white/50 mb-2">
      SIGNAL CLUSTERS
    </div>

    <div className="space-y-2">
      {Object.values(sharedBrain.geoHeatMap || {}).map((node: any, i) => {
        const intensity = (node.demand ?? node.value ?? 0) * 100;

        return (
          <div key={i} className="border border-white/10 p-2 rounded mb-2">

            <div className="text-white text-xs flex justify-between">
              <span>{node.label || node.region || node.id || "Unknown Region"}</span>

              <span
                className={
                  intensity > 70
                    ? "text-red-400"
                    : intensity > 40
                    ? "text-yellow-400"
                    : "text-blue-400"
                }
              >
                {intensity > 70 ? "HOT" : intensity > 40 ? "WARM" : "COLD"}
              </span>
            </div>

            <div className="w-full bg-white/10 h-1 mt-2 rounded">
              <div
                className="h-1 bg-green-400 rounded"
                style={{ width: `${intensity}%` }}
              />
            </div>

            <div className="text-[10px] text-white/40 mt-1">
              momentum: {(node.momentum ?? 0).toFixed(3)}
            </div>

          </div>
        );
      })}
    </div>
  </>
)}

{activeNode.id === "report" && (
  <>
    <div className="text-[#22c55e] text-xs tracking-[0.4em] mb-3">
      REPORT ENGINE
    </div>

    <div className="text-xs text-white/70">
      {sharedBrain.internalData?.slice(-1)?.[0]?.summary ||
        "No report generated"}
    </div>

    <div className="mt-4 text-green-400 text-xs">
      Opportunities Found: {sharedBrain.opportunities?.length || 0}
    </div>
  </>
)}
          </>
        ) : (
          <div className="text-white/30 text-sm">
            Select node to view network structure
          </div>
        )}
      </div>
      <MarketAnalystChat /> 
    </div>
  );
}