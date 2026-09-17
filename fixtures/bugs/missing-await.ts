// Intentionally buggy benchmark fixture.
export async function saveAndReturn(repo: { save(): Promise<void> }) {
  repo.save();
  return { saved: true };
}
