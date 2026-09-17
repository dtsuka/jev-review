// Intentionally vulnerable benchmark fixture.
export async function findUser(db: { query(sql: string): Promise<unknown> }, name: string) {
  return db.query(`SELECT * FROM users WHERE name = '${name}'`);
}
