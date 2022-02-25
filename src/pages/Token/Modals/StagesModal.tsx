import { FC, useEffect } from 'react';
import { Stage, StageStatus } from '../../../types/MarketTypes';

type TStagesModalProps = {
  stages: Stage[],
  status: StageStatus,
  onFinish: () => void, // TODO: copy-pasted
}

const DefaultMarketStages: FC<TStagesModalProps> = ({ stages, status, onFinish }) => {
  useEffect(() => {
    if (status === StageStatus.success || status === StageStatus.error) {
      setTimeout(() => onFinish(), 500);
    }
  }, [status]);

  return (
    <div>
      {stages.map((stage, index) => (<div key={`stage-${index}`}>{stage.status} - {stage.title}</div>))}
    </div>
  );
};

export default DefaultMarketStages;
