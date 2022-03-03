import { encodeAddress } from '@polkadot/util-crypto';

export const compareEncodedAddresses = (subAddress1: string, subAddress2: string): boolean => {
  if (!subAddress1 || !subAddress2) return false;
  return encodeAddress(subAddress1) === encodeAddress(subAddress2);
};
