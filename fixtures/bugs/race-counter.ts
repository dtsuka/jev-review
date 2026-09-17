let balance = 100;
export async function withdraw(amount: number, persist: (n: number) => Promise<void>) {
  if (balance < amount) return false;
  await Promise.resolve();
  balance -= amount;
  await persist(balance);
  return true;
}
