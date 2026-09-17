export function requiredHeader(headers: Record<string, string | undefined>) {
  return headers['x-request-id']!.toLowerCase();
}
