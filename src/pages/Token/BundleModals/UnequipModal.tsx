import { TokenByIdResponse } from '@unique-nft/sdk';
import { INestingToken } from 'components/BundleTree/types';
import { useApi } from 'hooks/useApi';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { TBundleTransferModalBodyProps } from './BundleTransferModal';
import { Address } from '@unique-nft/utils';
import { StatusTransactionModal } from './components/StatusTransactionModal';
import { useNotifications, Heading, Loader } from 'components/UI';
import { useAccounts } from 'hooks/useAccounts';

export const UnequipModal = ({
  token,
  onFinish,
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
      } catch (e) {
        error((e as { message: string }).message);
        setStagesModalIsVisible(false);
      }
      setProgress(1);
      setTransferStage('done');
    })();
  }, [token, currentChainId, api?.nft, selectedAccount, error]);

  const onComplete = useCallback(() => {
    setStagesModalIsVisible(false);
    onFinish();

  }, [onFinish]);

  if (baseToken) {
    return <StatusTransactionModal
      title={transferStage === 'transferring' ? 'Please wait' : 'Done'}
      isVisible={stagesModalIsVisible}
      total={totalToTransfer}
      progress={progress}
      stage={transferStage}
      fee={fee}
      onComplete={onComplete}
      onContinue={onComplete}
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
  gap: var(--prop-gap);
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
