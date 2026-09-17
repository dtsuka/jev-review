// Intentionally buggy benchmark fixture.
export function last<T>(items: T[]): T | undefined {
  return items[items.length];
}
