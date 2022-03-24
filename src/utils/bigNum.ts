import BN from 'bn.js';

export const fromStringToBnString = (value: string, decimals = 12) => {
  if (!value || !Number(value)) return '0';

  const parts = value.toString().split('.');

  if (parts[1]) {
    const multiplier = new BN(10).pow(new BN(decimals - parts[1].length));
    const bnValue = new BN(parts[1]).mul(multiplier);

    return parts[0] + bnValue.toString();
  }

  return parts[0];
};
