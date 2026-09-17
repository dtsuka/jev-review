export async function findUser(db: { query(sql: string, values: unknown[]): Promise<unknown> }, name: string) {
  return db.query('SELECT * FROM users WHERE name = ?', [name]);
}
