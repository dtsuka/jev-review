export async function load(run: () => Promise<string>) {
  try {
    return await run();
  } catch (error) {
    throw new Error('Failed to load configuration', { cause: error });
  }
}
