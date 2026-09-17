export function redirect(next: string) {
  return new Response(null, { status: 302, headers: { location: next } });
}
