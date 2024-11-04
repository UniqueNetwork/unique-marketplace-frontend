import { useMemo } from 'react';
import { UniqueChain } from 'sdk-2';
import { parseUnits } from 'ethers';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { TokenWithPrice } from '../NFTLine';
import { InternalStage, StageStatus } from 'types/StagesTypes';
import useStages from 'hooks/useStages';
import { Address } from '@unique-nft/utils';

export const useSellBulkStages = (tokensForListing: TokenWithPrice[]) => {
  const { api, currentChainId } = useApi();
  const { accounts, selectedAccount } = useAccounts();
  const marketApi = api?.market;

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
        const batchOperations = tokensForListing.map((token) => 
          uniqueChain.token.approve.encode({
            collectionId: token.collectionId,
            tokenId: token.id,
            spender: contractAddress,
          })
        );
        const result = await uniqueChain.utility.batchAll(batchOperations);
        return result.result.isSuccess ? undefined : Promise.reject('Approval failed');
      }
    },
    {
      title: 'Listing Tokens',
      description: 'Submitting tokens for listing on the marketplace.',
      status: StageStatus.default,
      action: async () => {
        if (!uniqueChain || !contractAddress || !accountAddress) return;
        const from = Address.extract.ethCrossAccountId(selectedAccount.address);

        const batchOperations = tokensForListing.map((token) => 
          uniqueChain.evm.send.encode({
            functionName: 'put',
            functionArgs: [
              token.collectionId,
              token.id,
              parseUnits(token.price.toString(), 18),
              0,
              1,
              from,
            ],
            contract: {
              address: contractAddress,
              //@ts-ignore
              abi: marketApi?.contractsAbi[contractAddress],
            },
            source: from.sub,
          })
        );
        const result = await uniqueChain.utility.batchAll(batchOperations);
        return result.result.isSuccess ? undefined : Promise.reject('Listing failed');
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
