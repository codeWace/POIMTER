"use client";

import { useState, useRef, useEffect } from "react";
import { brainStore } from "@/core/brainStore";

type Message = {
  role: "user" | "analyst";
  content: string;
  timestamp: number;
};

export default function MarketAnalystChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "analyst",
      content: "Good morning. I am your Poimter Market Intelligence Analyst. I have access to your current market signals, geo data, and report. What would you like to explore?",
      timestamp: Date.now(),
    }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const state = brainStore.getState();
      const session = state.activeSession;
      const report = session?.report;

      const context = `
You are a senior market intelligence analyst and hedge fund advisor working for Poimter.
You speak with precision, confidence, and insight — like a Bloomberg terminal analyst.
You have access to the following live market data:

QUERY: ${state.query || report?.meta?.query || "No query yet"}
DEMAND SCORE: ${report?.demand?.score ?? "N/A"}
COMPETITION: ${report?.demand?.competition ?? "N/A"}
RECOMMENDATION: ${report?.recommendation ?? "N/A"}
BEST EXPANSION MARKET: ${session?.bestMarket ?? "N/A"}
TOP MARKETS: ${session?.topMarkets?.join(", ") ?? "N/A"}
AI RECOMMENDATION: ${session?.recommendation ?? "N/A"}
EXECUTIVE SUMMARY: ${report?.executiveSummary ?? "N/A"}
INVESTOR OUTLOOK: ${report?.investorView?.outlook ?? "N/A"}
RISK-ADJUSTED RETURN: ${report?.investorView?.riskAdjustedReturn ?? "N/A"}
NEWS SPIKE: ${session?.marketSignal?.newsSpike ? "YES" : "NO"}
GOOGLE TRENDS: ${((session?.marketSignal?.googleTrends ?? 0) * 100).toFixed(0)}%

Respond as a market analyst. Be direct, specific, and insightful.
Never say you cannot access data — use what is provided above.
Keep responses under 150 words unless asked for detail.
Use financial/market language naturally.
`;

      const history = messages.slice(-6).map(m => ({
        role: m.role === "analyst" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    context,
    messages: [
      ...history,
      { role: "user", content: userMsg.content },
    ],
  }),
});

const data = await res.json();
// CORRECT
const reply = data?.reply ?? "Signal lost. Please try again.";

      setMessages(prev => [...prev, {
        role: "analyst",
        content: reply,
        timestamp: Date.now(),
      }]);

    } catch (e) {
      setMessages(prev => [...prev, {
        role: "analyst",
        content: "Connection interrupted. Market data feed temporarily unavailable.",
        timestamp: Date.now(),
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">

      {/* CHAT PANEL */}
      {open && (
        <div className="mb-3 w-[360px] h-[480px] bg-black border border-green-500/30 rounded-xl flex flex-col overflow-hidden shadow-2xl shadow-green-500/10">

          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-green-500/20 bg-black">
            <div>
              <div className="text-green-400 text-xs tracking-[0.3em] font-bold">POIMTER ANALYST</div>
              <div className="text-white/40 text-[10px]">Market Intelligence AI</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[10px]">LIVE</span>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 historyScroll">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-green-500/20 text-white border border-green-500/30"
                    : "bg-white/5 text-white/85 border border-white/10"
                }`}>
                  {m.role === "analyst" && (
                    <div className="text-green-400 text-[9px] tracking-widest mb-1">ANALYST</div>
                  )}
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* QUICK PROMPTS */}
          <div className="px-3 py-2 border-t border-white/5 flex gap-2 overflow-x-auto historyScroll">
            {["Best market to enter?", "What are the risks?", "Should I expand now?", "Competitor analysis"].map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="whitespace-nowrap text-[9px] text-green-400 border border-green-400/20 px-2 py-1 rounded hover:bg-green-400/10 transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* INPUT */}
          <div className="px-3 py-3 border-t border-green-500/20 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask the analyst..."
              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none placeholder-white/30 focus:border-green-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-green-500 text-black text-xs px-3 py-2 rounded hover:bg-green-400 disabled:opacity-50 font-bold"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-black border border-green-500/40 text-green-400 px-4 py-2 rounded-full text-xs hover:bg-green-500/10 transition shadow-lg shadow-green-500/10"
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        {open ? "Close Analyst" : "Ask Analyst"}
      </button>

    </div>
  );
}
