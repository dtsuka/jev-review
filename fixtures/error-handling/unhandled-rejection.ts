export function startJob(run: () => Promise<void>) {
  run();
}
