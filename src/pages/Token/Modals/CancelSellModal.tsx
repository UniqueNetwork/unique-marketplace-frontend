import {FC, useEffect} from "react";
import useMarketplaceStages, {MarketType} from "../../../hooks/useMarketplaceStages";
import DefaultMarketStages from "./StagesModal";

export const CancelSellFixStagesModal: FC<any> = ({ collectionId, tokenId, onModalClose }) => {
  const { stages, status, initiate } = useMarketplaceStages(MarketType.cancelSellFix, collectionId, tokenId, {});
  useEffect(() => { initiate(); }, []);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onModalClose={onModalClose} />
    </div>
  );
};
