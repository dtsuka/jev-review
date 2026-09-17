export function intersection(a: string[], b: string[]) {
  const lookup = new Set(b);
  return a.filter((value) => lookup.has(value));
}
