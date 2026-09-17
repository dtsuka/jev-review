export function parsePort(value: string | undefined) {
  const port = Number(value ?? '3000');
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : 3000;
}
