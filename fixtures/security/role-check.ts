type Actor = { id: string; role: 'user' | 'admin' };
export async function deleteAccount(db: { deleteUser(id: string): Promise<void> }, actor: Actor, id: string) { if (actor.role !== 'admin' && actor.id !== id) throw new Error('Forbidden'); await db.deleteUser(id); }
