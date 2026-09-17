type Result = { ok: true; value: string } | { ok: false; error: string };
export function message(result: Result) { return result.ok ? result.value : result.error; }
