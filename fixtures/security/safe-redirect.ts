export function redirect(next: string) {
  const url = new URL(next, 'https://example.com');
  if (url.origin !== 'https://example.com') throw new Error('Invalid redirect');
  return new Response(null, { status: 302, headers: { location: url.pathname + url.search } });
}
