const cache = new Map();

export function getCachedLocation(key: string) {
  return cache.get(key);
}

export function setCachedLocation(
  key: string,
  value: any
) {
  cache.set(key, value);
}