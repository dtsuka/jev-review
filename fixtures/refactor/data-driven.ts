const rates: Record<string, [number, number]> = { a: [.01,1], b:[.02,2], c:[.03,3], d:[.04,4], e:[.05,5], f:[.06,6], g:[.07,7], h:[.08,8] };
export function fee(type: string, amount: number) { const rate = rates[type]; if (!rate) throw new Error('unknown'); return amount * rate[0] + rate[1]; }
