const cache = new Map<string, any>();

export function getCache(key: string) {
  const item = cache.get(key);
  if (!item) return null;

  const expired = Date.now() - item.timestamp > 1000 * 60 * 5; // 5 min TTL
  if (expired) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

export function setCache(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}