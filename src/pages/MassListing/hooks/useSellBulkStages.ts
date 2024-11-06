import { useMemo } from 'react';
import { UniqueChain } from 'sdk-2';
import { ethers, parseUnits } from 'ethers';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { TokenWithPrice } from '../NFTLine';
import { InternalStage, StageStatus } from 'types/StagesTypes';
import useStages from 'hooks/useStages';
import { Address } from '@unique-nft/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { UniqueNFTFactory } from '@unique-nft/solidity-interfaces';
import { useEthersSigner } from 'account/WalletConnectContext/useSigner';

const CREATE_CONTRACT_ADDRESS = '0x204aEa6a4950Cd48ccB318A427084Ec75fB56348';

export const useSellBulkStages = (tokensForListing: TokenWithPrice[]) => {
  const { api, currentChainId } = useApi();
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
          const nftFactory = await UniqueNFTFactory(tokensForListing[0].collectionId, signer);
          const result = await (await nftFactory.setApprovalForAll(contractAddress, true, { gasLimit: 500_000 })).wait();

          console.log(result, 'RESULT_APPROVE')
          return result;
        } else {

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
      }
    },
    {
      title: 'Listing Tokens',
      description: 'Submitting tokens for listing on the marketplace.',
      status: StageStatus.default,
      action: async () => {
        if (!uniqueChain || !contractAddress || !accountAddress) return;
        if (isEthereumAddress(selectedAccount?.address)) {
          if (!signer) throw new Error('No Reown wallet provider found');
          const batchSaleContract = new ethers.Contract(CREATE_CONTRACT_ADDRESS, (await import('./BatchSaleContract.json')).default, signer);

          const sellTx = await batchSaleContract.batchSell(
            contractAddress,
            tokensForListing,
            selectedAccount.address,
            { gasLimit: 3_500_000 }
          );
          const sellReceipt = await sellTx.wait();
          if (!sellReceipt) throw Error("No receipt from sell");

          console.log("Sell transaction receipt:", sellReceipt);

        } else {

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
