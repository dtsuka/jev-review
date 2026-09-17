const ALLOWED = new Set(['api.example.com']);
export async function proxy(target: string) {
  const url = new URL(target);
  if (url.protocol !== 'https:' || !ALLOWED.has(url.hostname)) throw new Error('Target not allowed');
  return fetch(url);
}
