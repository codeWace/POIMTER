const companyMemoryStore: Record<string, any> = {};

export function saveCompanyMemory(userId: string, data: any) {
  companyMemoryStore[userId] = {
    ...companyMemoryStore[userId],
    ...data,
  };
}

export function getCompanyMemory(userId: string) {
  return companyMemoryStore[userId] || null;
}