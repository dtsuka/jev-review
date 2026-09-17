export function valid(values: string[]) {
  return values.filter((value) => new RegExp('^[a-z0-9_-]+$', 'i').test(value));
}
