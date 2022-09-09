import { addressToEvm, encodeAddress } from '@polkadot/util-crypto';
import { keyring } from '@polkadot/ui-keyring';
import Web3 from 'web3';
import { Address } from '@unique-nft/substrate-client/types';
import { isEthereumAddress } from '@unique-nft/substrate-client/utils';

export const subToEthLowercase = (address: Address): string => {
  const bytes = addressToEvm(address);

  return '0x' + Buffer.from(bytes).toString('hex');
};

export const compareEncodedAddresses = (subAddress1: string, subAddress2: string): boolean => {
  if (!subAddress1 || !subAddress2) return false;
  return encodeAddress(subAddress1) === encodeAddress(subAddress2);
};

export const getEthAccount = (account: Address) => {
  if (!account) throw new Error('Account was not provided');
  const ethAccount = Web3.utils.toChecksumAddress(subToEthLowercase(account));
  return ethAccount.toLowerCase();
};

export const isTokenOwner = (account: Address, tokenOwner: Address): boolean => {
  if (isEthereumAddress(tokenOwner)) {
    return getEthAccount(account).toLowerCase() === tokenOwner.toLowerCase();
  }

  return compareEncodedAddresses(account, tokenOwner);
};

export function toChainFormatAddress (address: Address, ss58Format: number) {
  if (isEthereumAddress(address)) return address;
  return keyring.encodeAddress(address, ss58Format);
}

export function collectionIdToAddress (address: number): Address {
  if (address >= 0xffffffff || address < 0) {
    throw new Error('id overflow');
  }

  const buf = Buffer.from([0x17, 0xc4, 0xe6, 0x45, 0x3c, 0xc4, 0x9a, 0xaa, 0xae, 0xac, 0xa8, 0x94, 0xe6, 0xd9, 0x68, 0x3e,
    address >> 24,
    (address >> 16) & 0xff,
    (address >> 8) & 0xff,
    address & 0xff
  ]);

  return Web3.utils.toChecksumAddress('0x' + buf.toString('hex'));
}
