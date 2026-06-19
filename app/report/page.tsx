"use client";

import { brainStore } from "@/core/brainStore";
import { useEffect, useState } from "react";
import { downloadReportPDF } from "@/brain/exportReportPDF";
import { safeNumber } from "@/lib/utils/safeNumber";

export default function ReportPage() {
  // REPLACE WITH:
const [session, setSession] = useState<any>(null);
const [articles, setArticles] = useState<any[]>([]);

const [isThinking, setIsThinking] = useState(false);
const [thinkingStep, setThinkingStep] = useState(0);

const thinkingSteps = [
  "Analyzing market signals...",
  "Processing news intelligence...",
  "Evaluating demand trends...",
  "Assessing competitive pressure...",
  "Fusing multi-source insights...",
  "Generating final reasoning..."
];

useEffect(() => {
  const unsub = brainStore.subscribe((state) => {
    setSession(state.activeSession);
    // read articles from BOTH places, whichever has them
    const a =
      state.activeSession?.articles?.length > 0
        ? state.activeSession.articles
        : (state as any).articles ?? [];
    setArticles(a);
  });
  return () => unsub();
}, []);

useEffect(() => {
  if (!session) return;

  setIsThinking(true);
  setThinkingStep(0);

  let i = 0;

  const interval = setInterval(() => {
    i++;

    if (i < thinkingSteps.length) {
      setThinkingStep(i);
    } else {
      clearInterval(interval);
      setIsThinking(false);
    }
  }, 700);

  return () => clearInterval(interval);
}, [session]);

const r = session?.report;
const signals = session?.marketSignal ?? null;


  if (!r) {
    return (
      <div className="text-white bg-black h-screen p-10">
        No report available
      </div>
    );
  }

  const risks = r?.risks ?? {};
  const riskEntries = Object.entries(risks).filter(
    ([_, list]) => Array.isArray(list) && list.length > 0
  );
  const hasRisks = riskEntries.length > 0;

  return (
    <div className="bg-black text-white min-h-screen p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl text-green-400">Market Intelligence Report</h1>
        <button
          onClick={() => downloadReportPDF({ 
  query: r?.meta?.query, 
  timestamp: Date.now(), 
  country: r?.meta?.country,
  internalData: r,
  marketSignal: session?.marketSignal,
  articles: session?.articles,
  topMarkets: session?.topMarkets,
  bestMarket: session?.bestMarket,
  recommendation: session?.recommendation,
  timing: session?.timing,
  agentVotes: session?.agentVotes,
  aiAnalystSummary: session?.aiAnalystSummary,
})}
          className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-400"
        >
          Download PDF
        </button>
      </div>

      {/* META */}
      <div className="mb-6 text-sm text-gray-400">
        {r.meta.query} • {r.meta.country}
      </div>

      {/* SCORE */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 border border-gray-800 rounded">
          <div className="text-gray-400">Demand Score</div>
          <div className="text-green-400 text-xl">{safeNumber(r?.demand?.score)}</div>
        </div>
        <div className="p-4 border border-gray-800 rounded">
          <div className="text-gray-400">Growth</div>
          <div className="text-white text-xl">{safeNumber(r?.demand?.growth)}%</div>
        </div>
        <div className="p-4 border border-gray-800 rounded">
          <div className="text-gray-400">Competition</div>
          <div>{r?.demand?.competition ?? "unknown"}</div>
        </div>
      </div>

      {/* INSIGHT */}
      <div className="mb-6">
        <h2 className="text-green-400 mb-2">Insight</h2>
        <p>{r.insight?.summary}</p>
        <p className="text-gray-400 text-sm mt-2">{r.insight?.explanation}</p>
      </div>

      {/* RISKS */}
      <div className="mb-6">
        <h2 className="text-green-400 mb-2">Risk Analysis</h2>
        {hasRisks ? (
          riskEntries.map(([category, list]: any) => (
            <div key={category} className="mb-4">
              <div className="text-white/70 text-sm capitalize mb-1">{category} risks</div>
              <ul className="list-disc ml-5 text-white/80">
                {list.map((item: any, i: number) => (
                  <li key={i}>{item.text}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="text-white/40 text-sm">No significant risks detected</div>
        )}
      </div>

      {/* OPPORTUNITIES */}
      <div className="mb-6">
        <h2 className="text-green-400 mb-2">Opportunities</h2>
        <ul className="list-disc ml-5">
          {(r.opportunities ?? []).map((o: any, i: number) => (
            <li key={i}>{o.title || o}</li>
          ))}
        </ul>
      </div>

      {/* RECOMMENDATION */}
      <div className="mb-6 p-4 border border-gray-800 rounded">
        <h2 className="text-green-400 mb-2">Recommendation</h2>
        <p>{r.recommendation}</p>
      </div>

      {/* CONFIDENCE */}
      <div className="mb-4">
        <h2 className="text-green-400">Confidence</h2>
        <p>{r.confidence?.level} ({r.confidence?.score})</p>
        <p className="text-gray-400 text-sm">{r.confidence?.explanation}</p>
      </div>

      {/* INVESTOR PANEL */}
      <div className="mb-6 p-4 border border-green-500/30 rounded">
        <h2 className="text-green-400 mb-2">Investor Intelligence</h2>
        <p className="text-white mb-2">
          <span className="text-gray-400">Outlook:</span> {r.investorView?.outlook}
        </p>
        <p className="text-white mb-2">
          <span className="text-gray-400">Risk-Adjusted Return:</span> {r.investorView?.riskAdjustedReturn}
        </p>
        <p className="text-white">
          <span className="text-gray-400">Rating:</span> {r.investorView?.rating}
        </p>
      </div>

      {/* STRATEGIC ALIGNMENT */}
      <div className="mb-6">
        <h2 className="text-green-400 mb-2">Strategic Alignment</h2>
        <p className="text-white">{r.conflictAnalysis?.summary}</p>
        <p className="text-gray-400 text-sm">Severity: {r.conflictAnalysis?.severity}</p>
      </div>

      {/* ONLINE TRENDS */}
      <div className="mb-6 p-4 border border-green-500/30 rounded">
        <h2 className="text-green-400 mb-2">Online Market Trends</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">

          <div className="p-3 border border-gray-800 rounded">
            <div className="text-gray-400 text-sm">Google Trends</div>
            <div className="text-green-400 text-xl">
              {((signals?.googleTrends ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="h-1 bg-green-500 mt-2" style={{ width: `${(signals?.googleTrends ?? 0) * 100}%` }} />
          </div>

          <div className="p-3 border border-gray-800 rounded">
            <div className="text-gray-400 text-sm">Reddit Sentiment</div>
            <div className="text-white text-xl">
              {((signals?.redditSentiment ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="h-1 bg-orange-500 mt-2" style={{ width: `${Math.abs(signals?.redditSentiment ?? 0) * 100}%` }} />
          </div>

          <div className="p-3 border border-gray-800 rounded">
            <div className="text-gray-400 text-sm">News Spike</div>
            <div className={`text-xl ${signals?.newsSpike ? "text-green-400" : "text-gray-500"}`}>
              {signals?.newsSpike ? "YES" : "NO"}
            </div>
          </div>

        </div>
      </div>

      {/* LIVE MARKET NEWS */}
      {articles.length > 0 && (
        <div className="mb-6 p-4 border border-green-500/30 rounded">
          <h2 className="text-green-400 mb-4">Live Market News</h2>
          <div className="space-y-3">
            {articles.map((a: any, i: number) => (
              <div key={i} className="border border-gray-800 rounded p-3">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm hover:text-green-400"
                >
                  {a.title}
                </a>
                <p className="text-gray-400 text-xs mt-1">{a.description}</p>
                <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                  <span>{a.source}</span>
                  <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOCIAL INTELLIGENCE */}
      <div className="mb-6 p-4 border border-green-500/30 rounded">
        <h2 className="text-green-400 mb-2">Social Intelligence Layer</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">

          <div className="p-3 border border-gray-800 rounded">
            <div className="text-gray-400 text-sm">Instagram</div>
            <div className="text-green-400 text-xl">
              {((signals?.social?.instagram?.sentiment ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Buzz: {((signals?.social?.instagram?.buzz ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="h-1 bg-green-500 mt-2" style={{ width: `${(signals?.social?.instagram?.buzz ?? 0) * 100}%` }} />
          </div>

          <div className="p-3 border border-gray-800 rounded">
            <div className="text-gray-400 text-sm">X (Twitter)</div>
            <div className="text-green-400 text-xl">
              {((signals?.social?.x?.sentiment ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Buzz: {((signals?.social?.x?.buzz ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="h-1 bg-green-400 mt-2" style={{ width: `${(signals?.social?.x?.buzz ?? 0) * 100}%` }} />
          </div>

          <div className="p-3 border border-gray-800 rounded">
            <div className="text-gray-400 text-sm">Facebook</div>
            <div className="text-green-300 text-xl">
              {((signals?.social?.facebook?.sentiment ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Buzz: {((signals?.social?.facebook?.buzz ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="h-1 bg-blue-600 mt-2" style={{ width: `${(signals?.social?.facebook?.buzz ?? 0) * 100}%` }} />
          </div>

        </div>
      </div>

      {/* FUTURE INTELLIGENCE */}
      <div className="mb-6">
        <h2 className="text-green-400 mb-2">Future Intelligence</h2>
        <p className="text-white mb-2">
          <span className="text-gray-400">Entry Timing:</span> {r.futureIntelligence?.marketEntryTiming}
        </p>
        <p className="text-white mb-2">
          <span className="text-gray-400">Competitor Outlook:</span> {r.futureIntelligence?.competitorPrediction}
        </p>
        <div className="text-gray-400 text-sm mb-1">Opportunities</div>
        <ul className="list-disc ml-5 text-white/80">
          {(r.futureIntelligence?.opportunities ?? []).map((o: any, i: number) => (
            <li key={i}>{o.theme}: {o.insight}</li>
          ))}
        </ul>
      </div>

      <div style={{
  marginTop: "20px",
  padding: "20px",
  borderRadius: "12px",
  background: "rgba(0, 255, 204, 0.06)",
  border: "1px solid rgba(0, 255, 204, 0.25)",
  boxShadow: "0 0 25px rgba(0, 255, 204, 0.08)"
}}>
  
  <div style={{
    fontWeight: "bold",
    color: "#00ffcc",
    marginBottom: "12px",
    fontSize: "16px"
  }}>
   AI Intelligence Core
  </div>

  {isThinking && (
    <div>
      <div style={{ color: "#00ffcc", marginBottom: "10px" }}>
        Processing Intelligence Pipeline...
      </div>

      {thinkingSteps.slice(0, thinkingStep + 1).map((step, i) => (
        <div key={i} style={{
          color: "#00ffcc",
          margin: "6px 0",
          fontFamily: "monospace"
        }}>
          ✓ {step}
        </div>
      ))}

      <div style={{ color: "#00ffcc" }}>▋</div>
    </div>
  )}

  {!isThinking && (
    <div>
      <div style={{
        fontWeight: 600,
        marginBottom: "10px"
      }}>
        Final Analyst Summary
      </div>

      <div style={{
        color: "#e6e6e6",
        lineHeight: "1.6"
      }}>
        {session?.aiAnalystSummary}
      </div>
    </div>
  )}

</div>

      {/* TOP ACTIONS */}
      <div className="mb-6">
        <h2 className="text-green-400 mb-2">Top Strategic Actions</h2>
        <ol className="list-decimal ml-5 text-white/90">
          {r.topActions?.map((a: string, i: number) => (
            <li key={i}>{a}</li>
          ))}
        </ol>
      </div>

      {/* PITCH SNAPSHOT */}
      <div className="mb-6">
        <h2 className="text-green-400 mb-2">Investor Pitch Snapshot</h2>
        <div className="text-white/80 text-sm space-y-2">
          <p><b>Opportunity:</b> {r.pitchDeck?.slide3_opportunity}</p>
          <p><b>Risk:</b> {r.pitchDeck?.slide5_risks}</p>
          <p><b>Timing:</b> {r.pitchDeck?.slide6_timing}</p>
          <p><b>Conclusion:</b> {r.pitchDeck?.slide7_conclusion}</p>
        </div>
      </div>

      {/* GEO */}
      <div className="mb-4">
        <h2 className="text-green-400">Geo Analysis</h2>
        <p>Primary: {r.geoAnalysis?.primaryRegion ?? "Unknown"}</p>
        <ul>
          {(r.geoAnalysis?.hotspots ?? []).map((h: any, i: number) => (
            <li key={i}>{h.name} - {h.score}</li>
          ))}
        </ul>
      </div>

      {/* AI RECOMMENDED MARKETS */}
{session?.topMarkets?.length > 0 && (
  <div className="mb-6 p-4 border border-green-500/30 rounded">
    <h2 className="text-green-400 mb-2">AI Recommended Expansion Markets</h2>
    <p className="text-gray-400 text-sm mb-3">Best Market: <span className="text-green-400">{session?.bestMarket}</span></p>
    <div className="flex flex-wrap gap-2">
      {session.topMarkets.map((m: string, i: number) => (
        <span key={i} className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded text-sm">
          #{i + 1} {m}
        </span>
      ))}
    </div>
    <p className="text-gray-400 text-sm mt-3">{session?.recommendation}</p>
    <p className="text-gray-400 text-xs mt-1">Timing: {session?.timing}</p>
  </div>
)}

      {/* TREND */}
      <div className="mb-4">
        <h2 className="text-green-400">Trend</h2>
        <p>{r.trend?.direction} ({r.trend?.velocity})</p>
        <ul>
          {r.trend?.dataPoints?.map((d: any, i: number) => (
            <li key={i}>{d.t}: {d.value}</li>
          ))}
        </ul>
      </div>

      {/* FUTURE DEMAND */}
      <div className="mb-6 p-4 border border-gray-800 rounded">
        <h2 className="text-green-400 mb-2">Future Demand Forecast</h2>
        <div className="text-gray-400 text-sm space-y-1">
          <p><b>Short Term:</b> {r.futureDemand?.shortTerm}</p>
          <p><b>Mid Term:</b> {r.futureDemand?.midTerm}</p>
          <p><b>Long Term:</b> {r.futureDemand?.longTerm}</p>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          <b>Drivers:</b>
          <ul className="list-disc ml-5">
            {r.futureDemand?.emergingDrivers?.map((d: string, i: number) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* V2 INTELLIGENCE */}
      <div className="mb-6 p-4 border border-gray-800 rounded">
        <h2 className="text-green-400 mb-2">Market Intelligence (V2)</h2>
        <p className="text-white mb-2">Lifecycle: {r.v2Intelligence?.industryLifecycle?.stage}</p>
        <p className="text-gray-400 text-sm mb-2">{r.v2Intelligence?.industryLifecycle?.insight}</p>
        <div className="text-sm text-gray-300">
          <p><b>Competition:</b> {r.v2Intelligence?.competitorPrediction}</p>
          <p><b>Trend:</b> {r.v2Intelligence?.competitorTrend}</p>
          <p className="mt-2"><b>Saturation:</b> {r.v2Intelligence?.saturation?.stage}</p>
          <p className="text-gray-400">{r.v2Intelligence?.saturation?.risk}</p>
        </div>
        <div className="mt-2">
          <p className="text-sm text-green-300">What to build next:</p>
          <ul className="list-disc ml-5 text-gray-300 text-sm">
            {r.v2Intelligence?.nextBuildIdeas?.map((b: string, i: number) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* STRATEGY ENGINE */}
      <div className="mb-6 p-4 border border-gray-800 rounded">
        <h2 className="text-green-400 mb-2">Autonomous Strategy Engine</h2>
        <div className="text-sm text-white space-y-2">
          <p><b>Business Models:</b></p>
          <ul className="list-disc ml-5 text-gray-300">
            {r.v2Intelligence?.strategyEngine?.businessModels?.map((m: string, i: number) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          <p className="mt-3"><b>Pricing:</b> {r.v2Intelligence?.strategyEngine?.pricingStrategy}</p>
          <p className="mt-2"><b>Go-To-Market:</b></p>
          <ul className="list-disc ml-5 text-gray-300">
            {r.v2Intelligence?.strategyEngine?.goToMarketPlan?.map((g: string, i: number) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* INVESTOR PITCH */}
      <div className="mb-6 p-4 border border-gray-800 rounded">
        <h2 className="text-green-400 mb-2">Investor Pitch Generator</h2>
        <div className="text-sm text-gray-300 space-y-2">
          <p><b>Problem:</b> {r.v2Intelligence?.strategyEngine?.investorPitch?.problem}</p>
          <p><b>Opportunity:</b> {r.v2Intelligence?.strategyEngine?.investorPitch?.opportunity}</p>
          <p><b>Why Now:</b> {r.v2Intelligence?.strategyEngine?.investorPitch?.whyNow}</p>
          <p><b>Edge:</b> {r.v2Intelligence?.strategyEngine?.investorPitch?.edge}</p>
        </div>
      </div>

      {/* COMPETITIVE POSITIONING */}
      <div className="mb-6 p-4 border border-gray-800 rounded">
        <h2 className="text-green-400 mb-2">Competitive Positioning</h2>
        <p className="text-gray-300">
          Market Leader: {r.v2Intelligence?.strategyEngine?.competitorTable?.insights?.marketLeader}
        </p>
        <p className="text-gray-300">
          Challenger Opportunity: {r.v2Intelligence?.strategyEngine?.competitorTable?.insights?.challengerOpportunity}
        </p>
        <p className="text-gray-400 text-sm">
          {r.v2Intelligence?.strategyEngine?.competitorTable?.insights?.advantageGap}
        </p>
      </div>

      {/* SCORE BREAKDOWN */}
      <div>
        <h2 className="text-green-400 mb-2">Score Breakdown</h2>
        <pre className="text-xs text-gray-400">
          {JSON.stringify(r.scoreBreakdown, null, 2)}
        </pre>
      </div>

    </div>
  );
}