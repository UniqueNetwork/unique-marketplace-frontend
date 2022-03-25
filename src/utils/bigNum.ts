import BN from 'bn.js';

export const fromStringToBnString = (value: string, decimals = 12) => {
  if (!value || !Number(value)) return '0';

  const parts = value.toString().split('.');

  if (parts[1]) {
    if (parts[1].length >= decimals) return parts[0] + parts[1].slice(0, decimals);
    return parts[0] + parts[1].padEnd(decimals, '0');
  }
  const multiplier = new BN(10).pow(new BN(decimals));
  return new BN(parts[0]).mul(multiplier).toString();
};
