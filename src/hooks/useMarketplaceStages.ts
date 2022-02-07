import { useCallback, useState } from 'react';
import { sleep } from '../utils/helpers';

export enum MarketType {
  default = 'Not started', // initial state
  purchase = 'Purchase', // fix price
  bid = 'Bid',
  sellFix = 'Sell for fixed price',
  sellAuction = 'Auction'
}

export enum StageStatus {
  default = 'Default',
  inProgress = 'InProgress',
  success = 'Success',
  error = 'Error'
}

export type Stage = {
  title: string;
  description?: string;
  status: StageStatus;
  error?: Error
};

export interface InternalStage extends Stage {
  action: (tokenId: number) => Promise<void>;
}

export type useMarketplaceStagesReturn = {
  stages: Stage[],
  initiate: () => void,
  status: StageStatus, // status for all stages combined, not for current stage
  error: Error | undefined | null
}

// todo: auction | fixPrice objects to be provided
export type TTxParams = any;

// TODO: to separate files
const purchaseStages = [{
  title: 'Approve sponsorship',
  description: 'We need to add you to a whitelist. It\'s a one time operation.',
  status: StageStatus.default,
  action: () => { throw new Error('Not implemented'); } // api.NFT.whiteList(api.accounts.selectedAccount)
}] as InternalStage[];

const bidStages = [{
  title: 'Approve sponsorship',
  description: 'We need to add you to a whitelist. It\'s a one time operation.',
  status: StageStatus.default,
  action: () => { throw new Error('Not implemented'); } // api.NFT.whiteList(api.accounts.selectedAccount)
}] as InternalStage[];

const sellFixStages = [{
  title: 'Example: Approve sponsorship',
  description: 'We need to add you to a whitelist. It\'s a one time operation.',
  status: StageStatus.default,
  action: async () => { await sleep(5 * 1000); }
},
{
  title: 'Example: Send to eth',
  description: '',
  status: StageStatus.default,
  action: async () => { await sleep(4 * 1000); }
},
{
  title: 'Example: Operation failure',
  description: '',
  status: StageStatus.default,
  action: async () => { await sleep(3 * 1000); throw new Error('Failure example'); }
},
{
  title: 'Example: Won\'t reach due to error before',
  description: '',
  status: StageStatus.default,
  action: async () => { await sleep(2 * 1000); }
}] as InternalStage[];

const sellAuctionStages = [{
  title: 'Approve sponsorship',
  description: 'We need to add you to a whitelist. It\'s a one time operation.',
  status: StageStatus.default,
  action: () => { throw new Error('Not implemented'); } // api.NFT.whiteList(api.accounts.selectedAccount)
}] as InternalStage[];

const getInternalStages = (type: MarketType) => {
  switch (type) {
    case MarketType.bid:
      return bidStages;
    case MarketType.sellFix:
      return sellFixStages;
    case MarketType.sellAuction:
      return sellAuctionStages;
    case MarketType.purchase:
      return purchaseStages;
    case MarketType.default:
    default:
      throw new Error(`Incorrect stage type received ${type}`);
  }
};

// TODO: txParams depends on stage type (it is usually a price, but for auction it could contain some extra params like minBid)
const useMarketplaceStages = (type: MarketType, tokenId: number, txParams: TTxParams): useMarketplaceStagesReturn => {
  const [internalStages, setInternalStages] = useState<InternalStage[]>(getInternalStages(type));
  const [marketStagesStatus, setMarketStagesStatus] = useState<StageStatus>(StageStatus.default);
  const [executionError, setExecutionError] = useState<Error | undefined | null>(null);

  const updateStage = useCallback((index: number, newStage: InternalStage) => {
    const copy = [...internalStages];
    copy[index] = newStage;
    setInternalStages(copy);
  }, [internalStages, setInternalStages]);
  const executeStep = useCallback(async (stage: InternalStage, index: number) => {
    updateStage(index, { ...stage, status: StageStatus.inProgress });
    try {
      await stage.action(tokenId);
      updateStage(index, { ...stage, status: StageStatus.success });
    } catch (e) {
      updateStage(index, { ...stage, status: StageStatus.error });
      console.error('Execute stage failed', stage, e);
      throw new Error(`Execute stage "${stage.title}" failed`);
    }
  }, [tokenId, updateStage]);

  const initiate = useCallback(async () => {
    setMarketStagesStatus(StageStatus.inProgress);
    for (const [index, internalStage] of internalStages.entries()) {
      try {
        await executeStep(internalStage, index);
      } catch (e) {
        setMarketStagesStatus(StageStatus.error);
        setExecutionError(new Error(`Stage "${internalStage.title}" failed`));
        return;
      }
    }
    setMarketStagesStatus(StageStatus.success);
  }, [executeStep, internalStages]);

  return {
    // we don't want our components to know or have any way to interact with stage.actions, everything else is fine
    // TODO: consider to split them apart like InternalStages = [{ stage, action }, ...] instead
    stages: internalStages.map((internalStage: InternalStage) => {
      const { action, ...other } = internalStage;
      return {
        ...other
      };
    }),
    error: executionError,
    status: marketStagesStatus,
    initiate
  };
};

export default useMarketplaceStages;
