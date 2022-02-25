import Web3 from 'web3';
import { subToEthLowercase } from './decoder';

export const getEthAccount = (account: string) => {
  if (!account) throw new Error('Account was not provided');
  const ethAccount = Web3.utils.toChecksumAddress(subToEthLowercase(account));
  return ethAccount.toLowerCase();
};
