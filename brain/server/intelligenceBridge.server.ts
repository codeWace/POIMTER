import { brainStore } from "@/core/brainStore";
import { buildReport } from "@/brain/buildReport";

export const runAIIntelligenceBridge = async (query: string, result: any) => {
  console.log("🧠 AI BRIDGE ACTIVE");

  const state = brainStore.getState();

  const companyContext = state.companyContext || {};
  const internalData = state.internalData || [];
  const externalData = state.externalData || [];
  const mapSignals = state.mapSignals || [];

  console.log("INTERNAL DATA COUNT:", internalData.length);

  const aiContext = {
    query,
    internalData,
    externalData,
    companyContext,
    mapSignals,
  };

  console.log("🧠 AI CONTEXT READY");

  const report = buildReport({
    query,
    result,
    marketSignal: result?.marketSignal || {},
    geoCluster: result?.geoCluster || {},
    internalData,
    externalData,
    companyContext,
  });

  brainStore.setState({
    reportData: [...(state.reportData || []), report],
  });

  console.log("✅ REPORT CREATED");

  return report;
};