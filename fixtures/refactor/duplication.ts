type Order = { subtotal: number };
export function domestic(order: Order) { const tax = order.subtotal * 0.1; const total = order.subtotal + tax; return { tax, total }; }
export function international(order: Order) { const tax = order.subtotal * 0.1; const total = order.subtotal + tax; return { tax, total }; }
export function wholesale(order: Order) { const tax = order.subtotal * 0.1; const total = order.subtotal + tax; return { tax, total }; }
