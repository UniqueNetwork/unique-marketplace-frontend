export const shortcutText = (text: string) => {
  // Cut it to the first and last 5 symbols
  const [_, start, end] = /^(.{5}).*(.{5})$/.exec(text) || [];

  return start && end ? `${start}...${end}` : text;
};

export const formatKusamaBalance = (balance: string | number, decimals: number = 12) => {
  const balanceValue = Number(balance);
  return (balanceValue / Math.pow(10, decimals)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};
