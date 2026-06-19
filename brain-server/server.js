const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8081 });

console.log("🧠 Brain Server running on ws://localhost:8081");

function randomMetric() {
  return {
    search: 30 + Math.random() * 70,
    map: 30 + Math.random() * 70,
    report: 30 + Math.random() * 70,
  };
}

function generateBrainPacket(metrics) {
  const dominant = Object.entries(metrics)
    .sort((a, b) => b[1] - a[1])[0][0];

  const nodeActions = {
    search:
      metrics.search > 75
        ? "scanning demand anomaly"
        : "monitoring market signals",

    map:
      metrics.map > 75
        ? "correlating regional clusters"
        : "mapping signal distribution",

    report:
      metrics.report > 75
        ? "building strategic synthesis"
        : "collecting intelligence",
  };

  const messages = [
    "search → map: anomaly detected",
    "map → report: correlation confirmed",
    "report → search: synthesis complete",
    "search → report: demand spike observed",
    "map → search: cluster instability",
  ];

  const memory = [
    "consumer demand rising",
    "regional anomaly observed",
    "trend acceleration detected",
    "signal confidence increased",
    "market volatility growing",
  ];

  return {
    type: "BRAIN_TICK",

    internalData: [
      { summary: "consumer demand rising" },
      { summary: "regional anomaly observed" }
    ],

    externalData: [
      { title: "market feed active" },
      { title: "social signal detected" }
    ],

    mapSignals: [
      { id: "search", value: metrics.search },
      { id: "map", value: metrics.map },
      { id: "report", value: metrics.report }
    ],

    query: null,

    systemThought:
      dominant === "search"
        ? "system: search dominance detected"
        : dominant === "map"
        ? "system: map clustering active"
        : "system: report synthesis active",
 
    networkMessage:
      messages[Math.floor(Math.random() * messages.length)],

    opportunities: [
      {
        title: "market signal opportunity",
        confidence: Math.round(metrics.report)
      }
    ],

    timestamp: Date.now()
  };
}

setInterval(() => {
  const metrics = randomMetric();
  const packet = generateBrainPacket(metrics);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(packet));
    }
  });
}, 1200);

wss.on("connection", (ws) => {
  console.log("⚡ Client connected");

  ws.send(
    JSON.stringify({
      type: "INIT",
      message: "brain connection established",
    })
  );
});