type Deps = { db: any; mail: any; audit: any };
function normalize(email: string) { const v = email.trim().toLowerCase(); if (!v.includes('@')) throw new Error('bad email'); return v; }
export async function register(email: string, deps: Deps) { const user = await deps.db.insert({ email: normalize(email) }); await deps.mail.send(user.email, 'welcome'); await deps.audit.write('user_created', user.id); return user; }
