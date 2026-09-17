export async function register(input: { email: string }, db: any, mail: any, audit: any) {
  const email = input.email.trim().toLowerCase();
  if (!email.includes('@')) throw new Error('bad email');
  const user = await db.insert({ email });
  await mail.send(email, 'welcome');
  await audit.write('user_created', user.id);
  return `<p>Created ${user.id}</p>`;
}
