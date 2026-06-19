export function safeArray<T>(arr: any, fallback: T[] = []) {
  return Array.isArray(arr) ? arr : fallback;
}

export function safeDivide(a: any, b: any, fallback = 0) {
  const x = safeNumber(a);
  const y = safeNumber(b);

  if (y === 0) return fallback;

  const result = x / y;
  return Number.isFinite(result) ? result : fallback;
}

export function clamp(value: any, min = 0, max = 100) {
  const v = safeNumber(value);
  return Math.max(min, Math.min(max, v));
}

export function safeObject<T>(obj: any, fallback: T): T {
  return obj && typeof obj === "object" ? obj : fallback;
}

export function safeNumber(n: any, fallback = 0): number {
  return typeof n === "number" && !isNaN(n) ? n : fallback;
}