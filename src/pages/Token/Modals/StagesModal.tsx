import { FC, useEffect } from 'react';
import { Stage, StageStatus } from '../../../hooks/useMarketplaceStages';

type TStagesModalProps = {
  stages: Stage[],
  status: StageStatus,
  onModalClose: () => void, // TODO: copy-pasted
}
const DefaultMarketStages: FC<TStagesModalProps> = ({ stages, status, onModalClose }) => {
  useEffect(() => {
    if (status === StageStatus.success) {
      setTimeout(() => onModalClose(), 500);
    }
  }, [status]);
  return (
    <div>
      {stages.map((stage) => (<div>{stage.status} - {stage.title}</div>))}
    </div>
  );
};

export default DefaultMarketStages;
