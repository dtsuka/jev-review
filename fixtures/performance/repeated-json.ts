export function equalMany(values: unknown[], target: unknown) { return values.filter((value) => JSON.stringify(value) === JSON.stringify(target)); }
