export const shortcutText = (text: string) => {
  // Cut it to the first and last 5 symbols
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, start, end] = /^(.{5}).*(.{5})$/.exec(text) || [];

  return start && end ? `${start}...${end}` : text;
};

export const capitalize = (text: string) => `${text[0].toUpperCase()}${text.slice(1)}`;

export const formatAmount = (amount: number | string) => {
  if (!amount) return '0';
  const parts = amount.toString().split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
};

export const formatBlockNumber = (blockNumber: number | undefined) => {
  if (!blockNumber) return '';

  return blockNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const formatKusamaBalance = (balance: string | number, options?: { decimals?: number, fractionDigits?: number }) => {
  const { decimals, fractionDigits } = options || {};
  const balanceValue = Number(balance);
  return (balanceValue / Math.pow(10, decimals || 12)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits || decimals || 12
  }).replaceAll(',', ' ');
};
