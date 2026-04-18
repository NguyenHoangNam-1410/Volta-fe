export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const getCurrency = (value: string): number => {
  return parseFloat(value.replace(/[$,]/g, ""));
};
