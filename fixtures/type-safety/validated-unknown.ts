type User = { name: string };
export function parseUser(value: unknown): User | null {
  if (typeof value !== 'object' || value === null || !('name' in value) || typeof value.name !== 'string') return null;
  return { name: value.name };
}
