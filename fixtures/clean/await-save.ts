export async function saveAndReturn(repo: { save(): Promise<void> }) {
  await repo.save();
  return { saved: true };
}
