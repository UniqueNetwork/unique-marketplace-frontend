import { TokenByIdResponse } from '@unique-nft/sdk';
import { Heading, Loader } from '@unique-nft/ui-kit';
import { INestingToken } from 'components/BundleTree/types';
import { useApi } from 'hooks/useApi';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TBundleTransferModalBodyProps } from './BundleTransferModal';
import { Address } from '@unique-nft/utils';
import { StatusTransactionModal } from './components/StatusTransactionModal';
import { useNotifications } from 'components/UI';
import { useAccounts } from 'hooks/useAccounts';

export const UnequipModal = ({
  token,
  onFinish,
  setIsClosable
}: TBundleTransferModalBodyProps) => {
  const { currentChainId, api } = useApi();
  const { selectedAccount } = useAccounts();
  const [baseToken, setBaseToken] = useState<INestingToken | TokenByIdResponse | undefined>();
  const [isFetching, setIsFetching] = useState(false);
  const [stagesModalIsVisible, setStagesModalIsVisible] = useState(false);
  const [totalToTransfer, setTotalToTransfer] = useState(0);
  const [progress, setProgress] = useState(1);
  const [fee, setFee] = useState<string>();
  const [transferStage, setTransferStage] = useState<'transferring' | 'done'>('transferring');
  const { error } = useNotifications();

  useEffect(() => {
    void (async () => {
      if (!token || !selectedAccount) return;
      setIsFetching(true);
      const { collectionId, tokenId } = Address.nesting.addressToIds(token.owner);
      const baseToken = await api?.nft?.getToken(collectionId, tokenId);
      if (!baseToken) return;

      setBaseToken(baseToken);
      setIsFetching(false);
      setTransferStage('transferring');
      setProgress(0);
      setStagesModalIsVisible(true);
      setTotalToTransfer(1);
      try {
        const feeResponse = await api?.nft?.getUnnestFee(
          token.collectionId,
          token.tokenId,
          token.owner,
          'NFT',
          1,
          { account: selectedAccount }
        );
        setFee(feeResponse);

        await api?.nft?.unnest(token.collectionId, token.tokenId, token.owner, 'NFT', 1, { account: selectedAccount });
      } catch (e: any) {
        error(e.message);
        setStagesModalIsVisible(false);
      }
      setProgress(1);
      setTransferStage('done');
    })();
  }, [token, currentChainId, api?.nft, selectedAccount, error]);

  if (baseToken) {
    return <StatusTransactionModal
      title={transferStage === 'transferring' ? 'Please wait' : 'Done'}
      isVisible={stagesModalIsVisible}
      total={totalToTransfer}
      progress={progress}
      stage={transferStage}
      fee={fee}
      onComplete={() => {
        setStagesModalIsVisible(false);
        onFinish();
      }}
      onContinue={() => {
        setStagesModalIsVisible(false);
        onFinish();
      } }
    />;
  }
  return <>
    <Content>
      <Heading size='2'>Searching base NFT</Heading>
    </Content>
    <CreateBundleModalWrapper>
      {isFetching && <LoaderWrapper><Loader /></LoaderWrapper>}
    </CreateBundleModalWrapper>
  </>;
};
const Content = styled.div`
  && h2 {
    margin-bottom: 32px;
  }
`;

const CreateBundleModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--gap);
`;

const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--gap);
  justify-content: flex-end;
  align-items: center;
  &>div {
    margin: 0;
  } 
  button {
    min-width: 140px;
  }
`;

const TokenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--gap) / 2);
`;

const TokenMediaWrapper = styled.div`
  display: flex;

  width: 400px;
  height: 450px;
  position: relative;
  &>div {
    position: absolute;
    top: 0;
  }
`;

const EquipsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--gap);
`;

const EquipsListWrapper = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  width: 700px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
  height: 100%;
  @media (max-width: 1280px) {
    grid-template-columns: 1fr 1fr 1fr;
    min-width: auto;
    width: 550px;
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
    width: auto;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    width: auto;
  }
`;

const LoaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,0.7);
`;
