export async function connect(run: () => Promise<void>) {
  while (true) {
    try { await run(); return; } catch { /* retry forever without delay or limit */ }
  }
}
