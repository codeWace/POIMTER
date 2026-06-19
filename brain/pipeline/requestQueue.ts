let activeRequest: Promise<any> | null = null;

export async function queueIntelligence(fn: () => Promise<any>) {
  return await fn();
}