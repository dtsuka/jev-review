// Intentionally vulnerable benchmark fixture: caller-provided user id is trusted without authorization.
export async function deleteAccount(db: { deleteUser(id: string): Promise<void> }, requestedUserId: string) {
  await db.deleteUser(requestedUserId);
}
