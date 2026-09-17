export function fee(type: string, amount: number) {
  switch (type) {
    case 'a': return amount * .01 + 1; case 'b': return amount * .02 + 2; case 'c': return amount * .03 + 3; case 'd': return amount * .04 + 4; case 'e': return amount * .05 + 5; case 'f': return amount * .06 + 6; case 'g': return amount * .07 + 7; case 'h': return amount * .08 + 8; default: throw new Error('unknown');
  }
}
