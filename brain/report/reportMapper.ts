export function createReportFromInternal(item) {
  return {
    id: crypto.randomUUID(),

    internalData: item,

    sourceInternalIds: item.id ? [item.id] : [],

    query: item.product || item.query || "",

    timestamp: Date.now(),
  };
}