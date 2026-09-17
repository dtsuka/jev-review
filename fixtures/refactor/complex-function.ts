// Intentionally over-complex benchmark fixture.
export function classify(a: number, b: number, active: boolean, admin: boolean) {
  if (active) {
    if (admin) {
      if (a > 10) return b > 10 ? 'A' : 'B';
      return b > 5 ? 'C' : 'D';
    }
    if (a > 0) return b > 0 ? 'E' : 'F';
  } else if (admin) {
    if (a > 100) return 'G';
  }
  return 'H';
}
