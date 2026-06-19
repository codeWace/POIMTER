export function computeSystemState(metrics: Record<string, number>) {
  const { search, map, report } = metrics;

  const max = Math.max(search, map, report);

  if (max === search) {
    return {
      state: "SEARCH DOMINANCE",
      intention: "expanding demand discovery",
    };
  }

  if (max === map) {
    return {
      state: "GEOSPATIAL EMPHASIS",
      intention: "correlation clustering active",
    };
  }

  if (max === report) {
    return {
      state: "SYNTHESIS MODE",
      intention: "report intelligence forming",
    };
  }

  return {
    state: "BALANCED NETWORK",
    intention: "stable distributed cognition",
  };
}