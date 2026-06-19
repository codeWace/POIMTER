import googleTrends from "google-trends-api";

export async function getGoogleTrends(query: string) {
  try {
    // extract just the product keywords for trends
    const coreKeyword = query
      .toLowerCase()
      .replace(/in (usa|germany|india|uk|china|australia|pakistan|canada|france|brazil|japan|uae)/gi, "")
      .replace(/\b(market|expand|expansion|manufacturer|business|company)\b/gi, "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join(" ");

    const result = await googleTrends.interestOverTime({
      keyword: coreKeyword,
      geo: "GLOBAL"
    });

    const parsed = JSON.parse(result);

    const last = parsed.default.timelineData.at(-1);

    const value = last?.value?.[0] || 50;

    return {
  interest: value / 100,
  raw: value // optional debug
};
  } catch (e) {
    return { interest: 0.5 };
  }
}