export async function proxy(targetUrl: string) {
  return fetch(targetUrl);
}
