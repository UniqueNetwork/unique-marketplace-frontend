import { Account } from 'account/types';
import { Signer as EthersSigner } from 'ethers';
import { Signer as UniqueSigner } from '@unique-nft/sdk';
import { SignerPayloadRaw } from '@unique-nft/utils/extension';

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

  // if (isUniqueSigner(account)) {
  //   const payload: SignerPayloadRaw = {
  //     address: account.address,
  //     data: 'Your message or transaction data',
  //     type: 'bytes'
  //   };

  //   console.log('UPDAT_COLLECTION_METADATA');
    
  //   //@ts-ignore
  //   const { signature } = await account.walletMetaInformation.signRaw(payload);
  
  //   return {
  //     signature,
  //     message: payload.data,
  //     type: 'keyring'
  //   };
  }

  return Promise.resolve({ signature: null, type: null, message: '' });
};
