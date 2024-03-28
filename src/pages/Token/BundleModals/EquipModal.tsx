import { TokenByIdResponse } from '@unique-nft/sdk';
import { Button, Heading, Loader } from 'components/UI';
import { INestingToken } from 'components/BundleTree/types';
import { useApi } from 'hooks/useApi';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { mockWearables } from '../constants';
import { TokenItem } from '../types';
import { BaseOffersModal } from './BaseOffersModal';
import { TBundleTransferModalBodyProps } from './BundleTransferModal';
import { TokensCard } from './components/TokenCard';
import { CustomizeModal } from './CustomizeModal';
import { useGetBaseTokens } from './hooks/useGetBaseTokens';
import { GQLToken } from 'api/scanApi/types';

export const EquipModal = ({
  token,
  onFinish,
  setIsClosable
}: TBundleTransferModalBodyProps) => {
  const { currentChainId } = useApi();
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const { fetchBaseTokens, isFetching } = useGetBaseTokens();
  const [baseToken, setBaseToken] = useState<INestingToken | TokenByIdResponse | undefined>();

  useEffect(() => {
    void (async () => {
      if (!currentChainId) return;
      const baseCollectionIds = mockWearables[currentChainId].find(({ collectionId }) => collectionId === token.collectionId)?.baseCollections || [];
      const tokens = await fetchBaseTokens(baseCollectionIds);
      if (!tokens) return;

      if (tokens.length === 1) {
        setBaseToken(tokens[0] as unknown as INestingToken);
        return;
      }
      setTokens(tokens);
    })();
  }, [token, currentChainId, fetchBaseTokens]);

  const onSelectBaseToken = useCallback((token: INestingToken) => () => {
    setBaseToken(token);
  }, []);

  if (baseToken) {
    return <CustomizeModal
      token={baseToken}
      onFinish={onFinish}
      setIsClosable={setIsClosable}
      selectedWearable={token as unknown as GQLToken}
      testid={'customize-modal'}
    />;
  }

  if (!isFetching && tokens.length === 0) {
    return <BaseOffersModal
      token={token}
      onFinish={onFinish}
      setIsClosable={setIsClosable}
      testid={'offers-modal'}
    />;
  }

  return <>
    <Content>
      <Heading size='2'>Select base NFT</Heading>
    </Content>
    <CreateBundleModalWrapper>
      <EquipsSection>
        <EquipsListWrapper>
          {tokens.map((token) => <TokensCard
            testid={''}
            key={`${token?.tokenId}_${token?.collectionId}`}
            token={token}
            onClick={onSelectBaseToken?.(token as unknown as INestingToken)}
          />)}
        </EquipsListWrapper>
      </EquipsSection>
      <ActionsWrapper>
        <Button role='outlined'
          size='middle'
          title='Cancel'
          onClick={onFinish}
        />
      </ActionsWrapper>
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

const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--prop-gap);
  justify-content: flex-end;
  align-items: center;
  &>div {
    margin: 0;
  } 
  button {
    min-width: 140px;
  }
`;

const EquipsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--prop-gap);
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
