// Intentionally inefficient benchmark fixture.
export function duplicates(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}
