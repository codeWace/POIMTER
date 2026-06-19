import jsPDF from "jspdf";

function addSection(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(0, 20, 0);
  doc.rect(8, y, 194, 7, "F");
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title, 12, y + 5);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  return y + 12;
}

function addRow(doc: jsPDF, label: string, value: string, y: number, labelColor?: number[]): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...(labelColor ?? [80, 80, 80]) as [number, number, number]);
  doc.text(label, 12, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const lines = doc.splitTextToSize(String(value ?? "N/A"), 130);
  doc.text(lines, 70, y);
  return y + lines.length * 5 + 2;
}

function checkPage(doc: jsPDF, y: number): number {
  if (y > 270) {
    doc.addPage();
    return 15;
  }
  return y;
}

export function downloadReportPDF(item: any) {
  const doc = new jsPDF();
  const report = item?.internalData ?? {};
  const signals = item?.marketSignal ?? {};
  const articles = item?.articles ?? [];
  const topMarkets = item?.topMarkets ?? [];
  let y = 0;

  // =========================
  // COVER PAGE
  // =========================
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 220, 50, "F");

  doc.setTextColor(34, 197, 94);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("POIMTER", 12, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("MARKET INTELLIGENCE REPORT", 12, 30);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${new Date(item?.timestamp ?? Date.now()).toLocaleString()}`, 12, 40);
  doc.text(`Confidential — For Internal Use Only`, 120, 40);

  y = 60;

  // =========================
  // QUERY + META
  // =========================
  y = addSection(doc, "INTELLIGENCE BRIEF", y);

  const queryLines = doc.splitTextToSize(item?.query ?? "N/A", 180);
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(queryLines, 12, y);
  y += queryLines.length * 5 + 4;

  y = addRow(doc, "Primary Market:", item?.country ?? "Global", y);
  y = addRow(doc, "Best Expansion Market:", item?.bestMarket ?? "N/A", y, [34, 197, 94]);
  y = addRow(doc, "Entry Timing:", item?.timing ?? "N/A", y);
  y = checkPage(doc, y);

  // =========================
  // DEMAND + SCORES
  // =========================
  y = addSection(doc, "MARKET METRICS", y);
  y = addRow(doc, "Demand Score:", String(report?.demand?.score ?? 40), y);
  y = addRow(doc, "Growth:", `${report?.demand?.growth ?? 0}%`, y);
  y = addRow(doc, "Competition:", report?.demand?.competition ?? "medium", y);
  y = addRow(doc, "Recommendation:", report?.recommendation ?? "N/A", y);
  y = addRow(doc, "Confidence:", `${report?.confidence?.level ?? "medium"} (${report?.confidence?.score?.toFixed(2) ?? "0.5"})`, y);
  y = addRow(doc, "Risk-Adjusted Return:", String(report?.investorView?.riskAdjustedReturn ?? 0), y);
  y = addRow(doc, "Rating:", report?.investorView?.rating ?? "N/A", y);
  y = checkPage(doc, y);

  // =========================
  // AI RECOMMENDED MARKETS
  // =========================
  if (topMarkets.length > 0) {
    y = addSection(doc, "AI RECOMMENDED EXPANSION MARKETS", y);
    topMarkets.forEach((m: string, i: number) => {
      doc.setFontSize(9);
      doc.setTextColor(i === 0 ? 34 : 0, i === 0 ? 197 : 0, i === 0 ? 94 : 0);
      doc.text(`#${i + 1}  ${m}${i === 0 ? "  ← BEST MARKET" : ""}`, 12, y);
      y += 6;
    });
    doc.setTextColor(0, 0, 0);
    if (item?.recommendation) {
      const recLines = doc.splitTextToSize(item.recommendation, 180);
      doc.setFontSize(8);
      doc.text(recLines, 12, y);
      y += recLines.length * 5 + 4;
    }
    y = checkPage(doc, y);
  }

  // =========================
  // AGENT VOTES
  // =========================
  if (item?.agentVotes) {
    y = addSection(doc, "AGENT CONSENSUS VOTES", y);
    y = addRow(doc, "Market Agent:", `${(item.agentVotes.market * 100).toFixed(0)}% confidence`, y);
    y = addRow(doc, "Geo Agent:", `${(item.agentVotes.geo * 100).toFixed(0)}% confidence`, y);
    y = addRow(doc, "News Agent:", `${(item.agentVotes.news * 100).toFixed(0)}% confidence`, y);
    y = checkPage(doc, y);
  }

  // =========================
  // EXECUTIVE SUMMARY
  // =========================
  y = addSection(doc, "EXECUTIVE SUMMARY", y);
  const summaryLines = doc.splitTextToSize(report?.executiveSummary ?? report?.insight?.summary ?? "N/A", 180);
  doc.setFontSize(9);
  doc.text(summaryLines, 12, y);
  y += summaryLines.length * 5 + 6;
  y = checkPage(doc, y);

  // =========================
  // AI ANALYST NOTE
  // =========================
  if (item?.aiAnalystSummary) {
    y = addSection(doc, "AI ANALYST NOTE", y);
    const aiLines = doc.splitTextToSize(item.aiAnalystSummary, 180);
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text(aiLines, 12, y);
    doc.setTextColor(0, 0, 0);
    y += aiLines.length * 4.5 + 6;
    y = checkPage(doc, y);
  }

  // =========================
  // EXTERNAL SIGNALS
  // =========================
  y = addSection(doc, "MARKET SIGNALS", y);
  y = addRow(doc, "Google Trends:", `${((signals?.googleTrends ?? 0) * 100).toFixed(0)}%`, y);
  y = addRow(doc, "Reddit Sentiment:", `${((signals?.redditSentiment ?? 0) * 100).toFixed(0)}%`, y);
  y = addRow(doc, "News Spike:", signals?.newsSpike ? "YES" : "NO", y);
  y = addRow(doc, "Instagram:", `${((signals?.social?.instagram?.sentiment ?? 0) * 100).toFixed(0)}% sentiment`, y);
  y = addRow(doc, "X (Twitter):", `${((signals?.social?.x?.sentiment ?? 0) * 100).toFixed(0)}% sentiment`, y);
  y = addRow(doc, "Facebook:", `${((signals?.social?.facebook?.sentiment ?? 0) * 100).toFixed(0)}% sentiment`, y);
  y = checkPage(doc, y);

  // =========================
  // RISKS
  // =========================
  y = addSection(doc, "RISK ANALYSIS", y);
  const risks = report?.risks ?? {};
  Object.entries(risks).forEach(([category, list]: any) => {
    if (list?.length > 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(150, 0, 0);
      doc.text(`${category.toUpperCase()} RISKS`, 12, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      list.forEach((r: any) => {
        const rLines = doc.splitTextToSize(`• ${r.text}`, 180);
        doc.text(rLines, 14, y);
        y += rLines.length * 4.5 + 1;
      });
      y += 2;
    }
    y = checkPage(doc, y);
  });

  // =========================
  // TOP ACTIONS
  // =========================
  y = addSection(doc, "TOP STRATEGIC ACTIONS", y);
  (report?.topActions ?? []).forEach((a: string, i: number) => {
    const aLines = doc.splitTextToSize(`${i + 1}. ${a}`, 180);
    doc.setFontSize(9);
    doc.text(aLines, 12, y);
    y += aLines.length * 5 + 2;
    y = checkPage(doc, y);
  });

  // =========================
  // LIVE NEWS
  // =========================
  if (articles.length > 0) {
    y = addSection(doc, "LIVE MARKET NEWS", y);
    articles.slice(0, 5).forEach((a: any) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const titleLines = doc.splitTextToSize(`• ${a.title}`, 180);
      doc.text(titleLines, 12, y);
      y += titleLines.length * 4.5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`  ${a.source} — ${new Date(a.publishedAt).toLocaleDateString()}`, 12, y);
      y += 6;
      y = checkPage(doc, y);
    });
  }

  // =========================
  // INVESTOR VIEW
  // =========================
  y = addSection(doc, "INVESTOR INTELLIGENCE", y);
  y = addRow(doc, "Outlook:", report?.investorView?.outlook ?? "N/A", y);
  y = addRow(doc, "Risk-Adjusted Return:", String(report?.investorView?.riskAdjustedReturn ?? 0), y);
  y = addRow(doc, "Rating:", report?.investorView?.rating ?? "N/A", y);
  y = checkPage(doc, y);

  // =========================
  // SCORE BREAKDOWN
  // =========================
  y = addSection(doc, "SCORE BREAKDOWN", y);
  y = addRow(doc, "Demand:", String(report?.scoreBreakdown?.demand ?? 0), y);
  y = addRow(doc, "Competition:", String(report?.scoreBreakdown?.competition ?? 0), y);
  y = addRow(doc, "Volatility:", String(report?.scoreBreakdown?.volatility ?? 0), y);

  // =========================
  // FOOTER
  // =========================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("POIMTER Intelligence Engine — Confidential", 12, 290);
    doc.text(`Page ${i} of ${pageCount}`, 170, 290);
  }

  const filename = `poimter-report-${(item?.query ?? "report").slice(0, 30).replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}