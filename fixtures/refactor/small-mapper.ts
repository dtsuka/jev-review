export function toDto(user: { id: string; name: string }) { return { id: user.id, displayName: user.name }; }
