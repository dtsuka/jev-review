type Order = { items: { price: number; quantity: number }[] };
export function getTotal(payload: Order) { return payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0); }
