import { useMemo } from 'react';
import { UniqueChain } from 'sdk-2';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { InternalStage, StageStatus } from 'types/StagesTypes';
import useStages from 'hooks/useStages';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { UniqueNFTFactory } from '@unique-nft/solidity-interfaces';
import { useEthersSigner } from 'account/WalletConnectContext/useSigner';
import { TokenForOrder } from 'api/chainApi/adapters/IMarketContractAdapter';
import { TTransaction } from 'api/chainApi/types';

export const useSellBulkStages = (tokensForListing: TokenForOrder[]) => {
  const { api, currentChainId, currencyMap } = useApi();
  const { accounts, selectedAccount } = useAccounts();
  const marketApi = api?.market;
  const signer = useEthersSigner();
  const accountAddress = selectedAccount?.address;
  const chainUrl = `https://rest.unique.network/v2/${currentChainId}`;

  const uniqueChain = useMemo(() => {
    if (!accountAddress) return null;
    return UniqueChain({
      baseUrl: chainUrl,
      account: selectedAccount as any
    });
  }, [accountAddress, chainUrl, accounts]);

  const contractAddress = useMemo(
    () => marketApi?.getActualContract().address,
    [marketApi]
  );

  const transferStages: InternalStage<any>[] = useMemo(
    () => [
      {
        title: 'Approving Tokens',
        description: 'Setting up token approvals for marketplace.',
        status: StageStatus.default,
        action: async () => {
          if (!uniqueChain || !contractAddress) return;
          if (isEthereumAddress(selectedAccount?.address)) {
            if (!signer) throw Error('No signer provided');
            const collectionIds = tokensForListing.reduce<number[]>(
              (acc, token) => {
                if (!acc.includes(token.collectionId))
                  acc.push(token.collectionId);
                return acc;
              },
              []
            );
            for (const collectionId of collectionIds) {
              const nftFactory = await UniqueNFTFactory(collectionId, signer);
              const checkApprove = await nftFactory.isApprovedForAll(
                signer.address,
                contractAddress
              );
              if (!checkApprove) {
                await (
                  await nftFactory.setApprovalForAll(contractAddress, true, {
                    gasLimit: 500_000
                  })
                ).wait();
              }
            }
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
          console.log(tokensForListing, 'TOKENS_FOR_LISTING');
          
          return await marketApi?.sellBatchFix(
            tokensForListing.map((token) => ({
              ...token,
              price: BigInt(Math.round((token.price as number) * (10 ** (currencyMap.get(String(token.currency))?.decimals || 18))))
            })),
            selectedAccount
          );
        }
      }
    ],
    [tokensForListing, accountAddress, signer, selectedAccount, currencyMap]
  );

  const { stages, error, status, initiate } = useStages<any>(
    transferStages,
    selectedAccount
  );

  return { stages, error, status, initiate };
};
