import React, { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { BlueGrey300, Grey300 } from 'styles/colors';
import { INestingToken } from 'components/BundleTree/types';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from 'hooks/useApi';
import Skeleton from '../../components/Skeleton/Skeleton';
import { Offer } from '../../api/restApi/offers/types';
import BundleModal from './BundleModals/BundleTransferModal';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { Address } from '@unique-nft/utils';
import { TokenContext } from './context/TokenContext';
import TokenCard from 'components/BundleTree/NestedSection/TokenCard';
import { MarketType } from 'types/MarketTypes';

const addIsCurrentAccountOwnerToBundleAndSort = (bundle: INestingToken, isOwner: boolean, parent?: INestingToken) => {
  bundle.isCurrentAccountOwner = isOwner;
  bundle.nestingParentToken = parent;
  if (bundle.nestingChildTokens?.length === 0) return bundle;
  bundle.nestingChildTokens = bundle.nestingChildTokens?.sort((a, b) => a.tokenId > b.tokenId ? 1 : -1).map((token) => addIsCurrentAccountOwnerToBundleAndSort(token, isOwner, bundle));
  bundle.opened = true;
  return bundle;
};

interface IProps {
  token?: TokenByIdResponse
  offer?: Offer
  testid?: string
  isOwner: boolean
  onFinish(): void
}

function BundleTreeSection({ testid, onFinish }: IProps) {
  const navigate = useNavigate();
  const { currentChainId } = useApi();
  const [isMobileViewVisible, setIsMobileViewVisible] = useState(false);
  const { bundle, isFetching, fetchToken } = useContext(TokenContext);
  const [modalType, setModalType] = useState(MarketType.default);
  const [selectedToken, setSelectedToken] = useState<INestingToken>();

  const onActionClick = useCallback((action: MarketType) => (token: INestingToken) => {
    setSelectedToken(token);
    setModalType(action);
  }, []);

  const closeView = useCallback(() => {
    setIsMobileViewVisible(false);
  }, []);

  const onFinishAction = useCallback(() => {
    setModalType(MarketType.default);
    // setBundle(undefined);
    void fetchToken();

    onFinish();
  }, [onFinish, fetchToken]);

  const onClose = useCallback(() => {
    setModalType(MarketType.default);
  }, []);

  const onViewTokenDetails = useCallback((token: INestingToken, mode: string) => {
    if (mode === 'ReFungible' && token.nestingParentToken) {
      const parentOwner = Address.nesting.idsToAddress(token.nestingParentToken.collectionId, token.nestingParentToken.tokenId);
      navigate(`/${currentChainId}/token/${parentOwner}/${token.collectionId}/${token.tokenId}`);
    } else {
      navigate(`/${currentChainId}/token/${token.collectionId}/${token.tokenId}`);
    }
    if (isMobileViewVisible) closeView();
  }, [isMobileViewVisible, closeView, currentChainId]);

  if (!bundle?.children?.length) return null;

  if (isFetching) return (<BundleIsLoading />);

  return (
    <>
      <BundlePagePaper>
        <HeaderStyled id={'bundle'}>
          <Heading size={'2'}>NFT Wearables</Heading>
        </HeaderStyled>
        <ChildrenWraper>
          {bundle.children.map((token) => <TokenCard
            key={token.tokenId}
            tokenId={token.tokenId}
            collectionId={token.collectionId}
            onTransferClick={onActionClick(MarketType.nestedTransfer)}
            onUnnestClick={onActionClick(MarketType.unnest)}
            onViewNodeDetails={onViewTokenDetails}
          />)}
        </ChildrenWraper>
      </BundlePagePaper>
      <BundleModal
        setModalType={() => {}}
        token={selectedToken}
        bundleModalType={modalType}
        onFinish={onFinishAction}
        testid={`${testid}-modal`}
        onClose={onClose}
      />
    </>
  );
}

const BundlePagePaper = styled(PagePaper)`
  display: block;
  .tree-container {
    width: 536px;
    @media (max-width: 768px) {
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
    }
  }
  @media (max-width: 567px) {
    display: none;
  }
`;

const HeaderStyled = styled.div`
  display: flex;
  gap: var(--gap);
  & > span {
    padding-top: 12px;
  }
`;

const ChildrenWraper = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 32px;
  min-height: 300px;

  @media (max-width: 1919px) {
    grid-template-columns: repeat(5, 1fr);
  }

  @media (max-width: 1489px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 1223px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 567px) {
    display: flex;
    flex-direction: column;
  }
  & > div {
    border: 1px solid ${BlueGrey300};
    border-radius: 8px;
  }
`;

export default BundleTreeSection;

const BundleIsLoading = () => (
  <BundlePagePaper>
    <HeaderStyled>
      <Heading size={'2'}>NFT Wearables</Heading>
    </HeaderStyled>
    <Skeleton height={60} width={'100%'} />
  </BundlePagePaper>
);
