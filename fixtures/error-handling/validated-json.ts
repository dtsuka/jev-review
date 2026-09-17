export function parseConfig(raw: string): unknown | null { try { return JSON.parse(raw); } catch { return null; } }
