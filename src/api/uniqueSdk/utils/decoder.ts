import { addressToEvm } from '@polkadot/util-crypto';

// decimals: 15 - opal, 18 - eth
export const subToEthLowercase = (address: string): string => {
  const bytes = addressToEvm(address);

  return '0x' + Buffer.from(bytes).toString('hex');
};
