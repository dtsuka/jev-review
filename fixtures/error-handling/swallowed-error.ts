// Intentionally problematic benchmark fixture.
export async function sync(run: () => Promise<void>) {
  try {
    await run();
  } catch {
    // Failure is silently ignored.
  }
}
