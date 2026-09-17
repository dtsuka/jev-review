export function getTotal(payload: any): number {
  return payload.order.items[0].price * payload.order.items[0].quantity;
}
