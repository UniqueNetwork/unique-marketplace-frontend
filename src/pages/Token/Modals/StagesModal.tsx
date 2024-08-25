import React, { FCC, useEffect } from 'react';
import styled from 'styled-components';
import { Text, Heading, Loader, Icon } from 'components/UI';
import { Stage, StageStatus } from '../../../types/StagesTypes';

type TStagesModalProps = {
  stages: Stage[],
  status: StageStatus,
  onFinish: () => void, // TODO: copy-pasted
  testid?: string
}

const DefaultMarketStages: FCC<TStagesModalProps> = ({ stages, status, onFinish, testid = '' }) => {
  useEffect(() => {
    if (status === StageStatus.success || status === StageStatus.error) {
      setTimeout(() => onFinish(), 500);
    }
  }, [status]);

  return (
    <ModalWrapper>
      <HeadingWrapper>
        <Heading size='2'>Please wait</Heading>
      </HeadingWrapper>
      <StageWrapper>
        {stages.map((stage, index) => (<React.Fragment key={`stage-${index}`}>
          <StatusWrapper>
            {(stage.status === StageStatus.inProgress || stage.status === StageStatus.awaitingSign) && <Loader isFullPage />}
            {stage.status === StageStatus.success && <Icon name={'check-circle'} size={24} color={'var(--color-additional-dark)'} />}
          </StatusWrapper>
          <TitleWrapper>
            <Text
              size={'m'}
              testid={`${testid}-stage${index + 1}`}
            >{stage.title}</Text>
            {stages.length > 1 && <Text size={'s'} color={'grey-500'}>
                {`Step ${index + 1}`}
              </Text>}
          </TitleWrapper>
        </React.Fragment>))}
      </StageWrapper>
    </ModalWrapper>
  );
};

export default DefaultMarketStages;

const StageWrapper = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr;
  grid-column-gap: var(--prop-gap);
  grid-row-gap: var(--prop-gap);
  align-items: flex-start;
`;

const StatusWrapper = styled.div`
  position: relative;
  height: 100%;
  > div {
    top: 12px;
  }
`;

const ModalWrapper = styled.div`
  min-width: 50vw;
`;

const HeadingWrapper = styled.div`
  margin-bottom: 16px;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
