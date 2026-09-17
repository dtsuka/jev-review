export function equalMany(values: unknown[], target: unknown) { const expected = JSON.stringify(target); return values.filter((value) => JSON.stringify(value) === expected); }
