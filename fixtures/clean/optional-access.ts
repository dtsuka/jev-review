type User = { profile?: { name: string } };
export function displayName(user: User) {
  return user.profile?.name?.toUpperCase() ?? 'Anonymous';
}
