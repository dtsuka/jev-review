export function label(active: boolean, admin: boolean) {
  if (!active) return 'inactive';
  return admin ? 'admin' : 'user';
}
