export const shortcutText = (text: string) => {
  // Cut it to the first and last 5 symbols
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, start, end] = /^(.{5}).*(.{5})$/.exec(text) || [];

  return start && end ? `${start}...${end}` : text;
};

export const ellipsisText = (text: string, allowSymbols = 30) => {
  if (text.length > allowSymbols) {
    const nextSpacePosition = text.indexOf(' ', allowSymbols);
    if (!nextSpacePosition) return text;
    return text.slice(0, nextSpacePosition) + '…';
  }
  return text;
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

/**
 *
 * @param balance Human format number
 * @param fractionDigits Amount of digits after the dot
 * @returns
 */
export const formatBalance = (balance: string | number, fractionDigits = 4, useGrouping = true) => {
  const balanceValue = Number(balance);
  return balanceValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
    useGrouping
  }).replaceAll(',', ' ');
};

export const formatLongNumber = (number = 0): string => {
  if (!number) {
    return '0';
  }

  if (number < 10000) {
    return formatBlockNumber(number);
  }

  if (number < 1000000) {
    return formatBlockNumber(Math.floor(number / 100) / 10) + 'K';
  }

  if (number < 1000000000) {
    return formatBlockNumber(Math.floor(number / 100000) / 10) + 'M';
  }

  return formatBlockNumber(Math.floor(number / 100000000) / 10) + 'B';
};

export const percentText = (percent: number) => {
  if (percent < 0.01) {
    return '<0.01 %';
  }
  if (percent > 99.99 && percent < 100) {
    return '>99.99 %';
  }
  return `${percent.toFixed(2)} %`;
};
