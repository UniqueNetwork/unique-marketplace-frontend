import { useMemo } from 'react';
import { UniqueChain } from 'sdk-2';
import { ethers, parseUnits } from 'ethers';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { InternalStage, StageStatus } from 'types/StagesTypes';
import useStages from 'hooks/useStages';
import { Address } from '@unique-nft/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { UniqueNFTFactory } from '@unique-nft/solidity-interfaces';
import { useEthersSigner } from 'account/WalletConnectContext/useSigner';
import { TokenForOrder } from 'api/chainApi/adapters/IMarketContractAdapter';
import { TTransaction } from 'api/chainApi/types';

export const useSellBulkStages = (tokensForListing: TokenForOrder[]) => {
  const { api, currentChainId, baseURL } = useApi();
  
  const { accounts, selectedAccount } = useAccounts();
  const marketApi = api?.market;
  const signer = useEthersSigner();
  const accountAddress = selectedAccount?.address;
  const chainUrl = `https://rest.unique.network/v2/${currentChainId}`;

  const uniqueChain = useMemo(() => {
    if (!accountAddress) return null;
    return UniqueChain({
      baseUrl: chainUrl,
      //@ts-ignore
      account: selectedAccount,
    });
  }, [accountAddress, chainUrl, accounts]);

  const contractAddress = useMemo(() => marketApi?.getActualContract().address, [marketApi]);

  const transferStages: InternalStage<any>[] = useMemo(() => [
    {
      title: 'Approving Tokens',
      description: 'Setting up token approvals for marketplace.',
      status: StageStatus.default,
      action: async () => {
        if (!uniqueChain || !contractAddress) return;

        if (isEthereumAddress(selectedAccount?.address)) {
          if (!signer) throw Error('No signer provided');
          const collectionIds = tokensForListing.reduce<number[]>((accum, token) => {
            if (!accum.includes(token.collectionId)) {
              accum.push(token.collectionId);
            }
            return accum;
          }, []);
          
          for (const collectionId of collectionIds) {
            const nftFactory = await UniqueNFTFactory(collectionId, signer);
            const checkApprove = await nftFactory.isApprovedForAll(signer.address, contractAddress);
          
            if (!checkApprove) {
              await (await nftFactory.setApprovalForAll(contractAddress, true, { gasLimit: 500_000 })).wait();
            }
          }
          return;
        } else {
          const batchOperations = tokensForListing.map((token) =>
            uniqueChain.token.approve.encode({
              collectionId: token.collectionId,
              tokenId: token.tokenId,
              spender: contractAddress,
            })
          );
          await uniqueChain.utility.batchAll(batchOperations);
        }
      }
    },
    {
      title: 'Listing Tokens',
      description: 'Submitting tokens for listing on the marketplace.',
      status: StageStatus.default,
      action: async (): Promise<void | TTransaction> => {
        if (!accountAddress) throw new Error('No account selected');
        const result = await marketApi?.sellBatchFix(tokensForListing, selectedAccount);
        return result;
      }
    }
  ], [uniqueChain, contractAddress, tokensForListing, accountAddress, accounts, marketApi]);

  const { stages, error, status, initiate } = useStages<any>(transferStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
