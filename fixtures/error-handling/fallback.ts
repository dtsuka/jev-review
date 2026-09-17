export async function loadOptional(run: () => Promise<string>) {
  try { return await run(); } catch { return null; }
}
