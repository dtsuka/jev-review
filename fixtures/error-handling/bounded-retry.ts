export async function connect(run: () => Promise<void>) {
  let last: unknown;
  for (let attempt = 0; attempt < 3; attempt++) { try { await run(); return; } catch (e) { last = e; } }
  throw new Error('Connection failed after retries', { cause: last });
}
