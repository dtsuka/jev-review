// Intentionally unsafe benchmark fixture.
export function userName(payload: unknown): string {
  return (payload as { user: { name: string } }).user.name;
}
