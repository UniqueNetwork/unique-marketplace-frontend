import { Account } from 'account/types';
import { Signer as EthersSigner } from 'ethers';
import { Signer as UniqueSigner } from '@unique-nft/sdk';

export const isEthersSigner = (signer: any): signer is EthersSigner =>
  (signer instanceof EthersSigner);

export const isUniqueSigner = (signer: any): signer is UniqueSigner =>
  !!(signer as UniqueSigner).sign;

export const getSignature = async (account: Account): Promise<{
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

  if (isUniqueSigner(account)) {
    // @ts-ignore
    const { signature } = await account.walletMetaInformation.signRaw('');

    return {
      signature,
      message: '',
      type: 'keyring'
    };
  }

  return Promise.resolve({ signature: null, type: null, message: '' });
};
