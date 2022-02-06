import { useCallback, useState } from 'react';

export enum MarketType {
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

export type TMarketStagesProps = {
  type: MarketType;
  tokenId: number;
}

const purchaseStages = [{
  title: 'Approve sponsorship',
  description: 'We need to add you to a whitelist. It\'s a one time operation.',
  status: StageStatus.default,
  action: () => { throw new Error('Not implemented'); } // api.NFT.whiteList(api.accounts.selectedAccount)
}] as InternalStage[];
const bidStages = [] as InternalStage[];
const sellFixStages = [] as InternalStage[];
const sellAuctionStages = [] as InternalStage[];

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
  }
};

const useMarketplaceStages = (props: TMarketStagesProps) => {
  const { type, tokenId } = props;
  const [internalStages, setInternalStages] = useState<InternalStage[]>(getInternalStages(type));
  const [marketStagesStatus, setMarketStagesStatus] = useState<StageStatus>(StageStatus.default);

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
    marketStagesStatus,
    initiate
  };
};
