export function startJob(run: () => Promise<void>, log: (e: unknown) => void) {
  void run().catch(log);
}
