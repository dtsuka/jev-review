export function ranks(values: number[]) {
  const sorted = [...values].sort((a, b) => b - a);
  const rank = new Map(sorted.map((value, index) => [value, index + 1]));
  return values.map((value) => rank.get(value)!);
}
