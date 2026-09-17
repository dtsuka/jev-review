export function recordMetric(send: () => Promise<void>) {
  void send().catch(() => { /* metrics are intentionally best-effort */ });
}
