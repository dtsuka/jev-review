export function common(a: string[], b: string[]) {
  return a.filter((value) => b.includes(value));
}
