import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { web3FromSource } from '@polkadot/extension-dapp';
import { stringToHex } from '@polkadot/util';

export const getSignature = async (collectionId: number, tokenId: number, account: InjectedAccountWithMeta) => {
  const injector = await web3FromSource(account.meta.source);
  if (!injector.signer.signRaw) throw new Error('Web3 not available');

  const timestamp = Date.now();
  const payload = `timestamp=${timestamp}&collectionId=${collectionId}&tokenId=${tokenId}`;

  const { signature } = await injector.signer.signRaw({ address: account.address, type: 'bytes', data: stringToHex(payload) });

  return {
    signature,
    params: {
      collectionId,
      tokenId,
      timestamp
    }
  };
};
