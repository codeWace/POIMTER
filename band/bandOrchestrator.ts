import { getBandClient } from "./bandClient";
import { runSearchAgent } from "@/agents/searchAgent";
import { runReportAgent } from "@/agents/reportAgent";
import { marketAgent } from "@/agents/marketAgent";
import { newsAgent } from "@/agents/newsAgent";
import { geoAgent } from "@/agents/geoAgent";
import { fusionAgent } from "@/agents/fusionAgent";
import { runMapAgent } from "@/agents/mapAgent";

export async function runBandOrchestration(query: string) {
  const band = getBandClient();
  const room = await band.rooms.create({ metadata: { query } });
  const roomId = room.id;

  // 1. Coordinator kicks off
  await band.messages.send(roomId, {
    role: "CoordinatorAgent",
    content: `@SearchAgent @MarketAgent @NewsAgent @GeoAgent @MapAgent @FusionAgent @ReportAgent — new intelligence request: "${query}". Dispatching all agents now.`,
  });

  // 2. SearchAgent
  const searchResult = await runSearchAgent(query, [], []);
  await band.messages.send(roomId, {
    role: "SearchAgent",
    content: JSON.stringify({
      agent: "SearchAgent",
      query,
      opportunitiesFound: searchResult.opportunitiesFound,
      results: searchResult.results ?? [],
      status: "complete",
      timestamp: new Date().toISOString(),
    }, null, 2),
  });

  // 3. MarketAgent
  const market = await marketAgent(query);
  await band.messages.send(roomId, {
    role: "MarketAgent",
    content: JSON.stringify({
      agent: "MarketAgent",
      query,
      demand: market.demand,
      competition: market.competition,
      opportunity: market.opportunity,
      confidence: market.confidence,
      reasoning: market.reasoning,
      googleTrends: market.googleTrends,
      redditSentiment: market.sentiment,
      redditVolume: market.redditVolume,
      status: "complete",
      timestamp: new Date().toISOString(),
    }, null, 2),
  });

  // 4. NewsAgent
  const news = await newsAgent(query);
  await band.messages.send(roomId, {
    role: "NewsAgent",
    content: JSON.stringify({
      agent: "NewsAgent",
      query,
      marketSignal: news.marketSignal,
      keyTheme: news.keyTheme,
      businessRelevance: news.businessRelevance,
      riskFlag: news.riskFlag,
      articleCount: news.articleCount,
      sentiment: news.aiSentiment,
      articles: news.articles.slice(0, 3).map((a: any) => a.title),
      status: "complete",
      timestamp: new Date().toISOString(),
    }, null, 2),
  });

  // 5. GeoAgent
  const geo = await geoAgent(query, market.demand);
  await band.messages.send(roomId, {
    role: "GeoAgent",
    content: JSON.stringify({
      agent: "GeoAgent",
      query,
      topMarkets: geo.topMarkets,
      primaryMarket: geo.primaryMarket?.name,
      primaryMarketScore: geo.primaryMarket?.opportunityScore,
      aiReasoning: geo.aiReasoning,
      status: "complete",
      timestamp: new Date().toISOString(),
    }, null, 2),
  });

  // 6. MapAgent
  const mapNodes = await runMapAgent(geo.mapSignals);
  await band.messages.send(roomId, {
    role: "MapAgent",
    content: JSON.stringify({
      agent: "MapAgent",
      query,
      nodesResolved: mapNodes.length,
      topNodes: mapNodes.slice(0, 5).map((n: any) => ({
        name: n.name,
        lat: n.lat,
        lng: n.lng,
        demandScore: n.demandScore,
      })),
      status: "complete",
      timestamp: new Date().toISOString(),
    }, null, 2),
  });

  // 7. FusionAgent
  const fusion = await fusionAgent(market, geo, news, query);
  await band.messages.send(roomId, {
    role: "FusionAgent",
    content: JSON.stringify({
      agent: "FusionAgent",
      query,
      demandScore: fusion.demandScore,
      finalOpportunity: fusion.finalOpportunity,
      confidence: fusion.confidence,
      recommendation: fusion.recommendation,
      topRisk: fusion.topRisk,
      bestMarket: fusion.bestMarket,
      timing: fusion.timing,
      agentVotes: fusion.agentVotes,
      executiveSummary: fusion.aiRisk?.executiveSummary,
      topActions: fusion.aiRisk?.topActions,
      status: "complete",
      timestamp: new Date().toISOString(),
    }, null, 2),
  });

  // 8. ReportAgent
  const report = await runReportAgent([searchResult]);
  await band.messages.send(roomId, {
    role: "ReportAgent",
    content: JSON.stringify({
      agent: "ReportAgent",
      query,
      summary: report.summary,
      confidence: report.confidence,
      opportunities: report.opportunities,
      fusionScore: fusion.demandScore,
      bestMarket: fusion.bestMarket,
      timing: fusion.timing,
      status: "complete",
      timestamp: new Date().toISOString(),
    }, null, 2),
  });

  // 9. Coordinator wraps up
  await band.messages.send(roomId, {
    role: "CoordinatorAgent",
    content: `@SearchAgent @MarketAgent @NewsAgent @GeoAgent @MapAgent @FusionAgent @ReportAgent — intelligence cycle complete for: "${query}". Final opportunity: ${fusion.finalOpportunity} | Confidence: ${Math.round(fusion.confidence * 100)}% | Best market: ${fusion.bestMarket}`,
  });

  return { searchResult, market, news, geo, mapNodes, fusion, report, bandRoomId: roomId };
}