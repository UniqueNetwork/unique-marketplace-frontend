import { addressToEvm, checkAddress, encodeAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { Address } from '@unique-nft/utils';
import { keyring } from '@polkadot/ui-keyring';

export const subToEthLowercase = (address: string): string => {
  const bytes = addressToEvm(address);

  return '0x' + Buffer.from(bytes).toString('hex');
};

export const compareEncodedAddresses = (subAddress1: string, subAddress2: string): boolean => {
  if (!subAddress1 || !subAddress2) return false;
  if (isEthereumAddress(subAddress1) || isEthereumAddress(subAddress2)) return false; // TODO: eth admins are not supported. Refactor this part
  return encodeAddress(subAddress1) === encodeAddress(subAddress2);
};

export const getEthAccount = (account: string) => {
  if (!account) throw new Error('Account was not provided');
  const ethAccount = Address.mirror.substrateToEthereum(account);
  return ethAccount.toLowerCase();
};

export const isTokenOwner = (account: string, tokenOwner: string): boolean => {
  if (isEthereumAddress(tokenOwner)) {
    return getEthAccount(account).toLowerCase() === tokenOwner.toLowerCase();
  }
  if (isEthereumAddress(account)) {
    return Address.mirror.ethereumToSubstrate(account).toLowerCase() === tokenOwner.toLowerCase();
  }

  return compareEncodedAddresses(account, tokenOwner);
};

export function toChainFormatAddress (address: string, ss58Format: number) {
  if (isEthereumAddress(address)) return address;
  return keyring.encodeAddress(address, ss58Format);
}

export function validateAddress(address: string, prefixes: number[]) {
  return Address.is.ethereumAddress(address) || Address.is.substrateAddressInAnyForm(address);
}
