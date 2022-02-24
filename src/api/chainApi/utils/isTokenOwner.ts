import toAddress from './toAddress';
import { getEthAccount } from './getEthAccount';

export const isTokenOwner = (account: string, tokenOwner: { Substrate?: string, Ethereum?: string }): boolean => {
  const ethAccount = getEthAccount(account);
  const normalizeSubstrate = toAddress(tokenOwner.Substrate);

  return normalizeSubstrate === account || tokenOwner.Ethereum?.toLowerCase() === ethAccount;
};
