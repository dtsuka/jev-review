type UserInput = { name: string; email: string; address: { street: string; city: string; country: string; postal: string }; phone?: string; locale: string; timezone: string };
export function createUser(input: UserInput) { return input; }
