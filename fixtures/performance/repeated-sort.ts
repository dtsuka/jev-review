export function ranks(values: number[]) {
  return values.map((value) => [...values].sort((a, b) => b - a).indexOf(value) + 1);
}
