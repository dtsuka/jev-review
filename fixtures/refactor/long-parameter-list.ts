export function createUser(name: string, email: string, street: string, city: string, country: string, postal: string, phone: string, locale: string, timezone: string) {
  return { name, email, street, city, country, postal, phone, locale, timezone };
}
