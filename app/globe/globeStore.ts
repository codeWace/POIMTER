export let globeCache: any = {
  points: [],
  arcs: [],
  query: ""
};

export const setGlobeCache = (data: any) => {
  globeCache = { ...globeCache, ...data };
};