type Shape = { kind: 'circle'; r: number } | { kind: 'square'; size: number };
export function area(shape: Shape) { switch (shape.kind) { case 'circle': return Math.PI * shape.r ** 2; case 'square': return shape.size ** 2; } }
