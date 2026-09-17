export function authorizationHeader() {
  const token = process.env.API_TOKEN;
  if (!token) throw new Error('API_TOKEN is required');
  return `Bearer ${token}`;
}
