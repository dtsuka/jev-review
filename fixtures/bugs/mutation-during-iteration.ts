export function removeNegatives(values: number[]) {
  values.forEach((value, index) => {
    if (value < 0) values.splice(index, 1);
  });
  return values;
}
