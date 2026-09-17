const VALID = /^[a-z0-9_-]+$/i;
export function valid(values: string[]) { return values.filter((value) => VALID.test(value)); }
