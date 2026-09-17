export async function fetchConfig(fetcher: () => Promise<string>) {
  const raw = await fetcher();
  return JSON.parse(raw);
}
