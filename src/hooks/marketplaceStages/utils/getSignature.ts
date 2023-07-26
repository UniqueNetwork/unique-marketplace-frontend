import { web3FromSource } from '@polkadot/extension-dapp';
import { MarketAccount } from 'account/types';
import { Signer as EthersSigner } from 'ethers';
import { Signer as UniqueSigner } from '@unique-nft/sdk';

export const isEthersSigner = (signer: any): signer is EthersSigner =>
  (signer instanceof EthersSigner);

export const isUniqueSigner = (signer: any): signer is UniqueSigner =>
  !!(signer as UniqueSigner).sign;

export const getSignature = async (account: MarketAccount): Promise<{
  signature: string | null,
  message: string,
  type: 'keyring' | 'metamask' | null
}> => {
  if (isEthersSigner(account.signer)) {
    const message = `${Date.now()}`;
    const signature = await account.signer.signMessage(message);
    return {
      signature,
      message,
      type: 'metamask'
    };
  }

  if (isUniqueSigner(account.signer)) {
    // @ts-ignore
    const injector = await web3FromSource(account.signer.injectedAccount.meta.source);
    if (!injector.signer.signRaw) throw new Error('Web3 not available');
    const { signature } = await injector.signer.signRaw({ address: account.address, type: 'bytes', data: '' });
    return {
      signature,
      message: '',
      type: 'keyring'
    };
  }

  return Promise.resolve({ signature: null, type: null, message: '' });
};
