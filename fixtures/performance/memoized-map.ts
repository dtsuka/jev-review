export function indexUsers(users: { id: string }[]) { return new Map(users.map((user) => [user.id, user])); }
