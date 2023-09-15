import React, { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { BlueGrey300, Grey300 } from 'styles/colors';
import NodeView from 'components/BundleTree/Node/NodeView';
import { INestingToken } from 'components/BundleTree/types';
import { NestedSection } from 'components/BundleTree/NestedSection/NestedSection';
import BundleTree from 'components/TreeView/BundleTree';
import { useNavigate, useParams } from 'react-router-dom';
import MobileBundleTreeSection from './MobileBundleTreeSection';
import { useApi } from 'hooks/useApi';
import Skeleton from '../../components/Skeleton/Skeleton';
import { Offer } from '../../api/restApi/offers/types';
import BundleModal from './BundleModals/BundleTrunsferModal';
import { BundleModalType } from './BundleModals/types';
import { countNestedChildren } from '../../utils/helpers';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { CollectionMode } from 'api/chainApi/types';
import { Address } from '@unique-nft/utils';
import { TokenContext } from './context/TokenContext';
import TokenCard from 'components/BundleTree/NestedSection/TokenCard';

const areNodesEqual = (a: INestingToken, b: INestingToken) => a.collectionId === b.collectionId && a.tokenId === b.tokenId;

const getKey = (a: INestingToken) => `T${a.tokenId}C${a.collectionId}`;

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

function BundleTreeSection({ token, offer, testid, onFinish, isOwner }: IProps) {
  const navigate = useNavigate();
  const { api, currentChainId } = useApi();
  const { address } = useParams<{ address: string }>();
  const [isMobileViewVisible, setIsMobileViewVisible] = useState(false);
  const { bundle, isFetching, fetchToken } = useContext(TokenContext);
  const [modalType, setModalType] = useState(BundleModalType.default);
  const [selectedToken, setSelectedToken] = useState<INestingToken>();

  const onActionClick = useCallback((action: BundleModalType) => (token: INestingToken) => {
    setSelectedToken(token);
    setModalType(action);
  }, []);

  const closeView = useCallback(() => {
    setIsMobileViewVisible(false);
  }, []);

  const openView = useCallback(() => {
    setIsMobileViewVisible(true);
  }, []);

  const onNodeClicked = useCallback((data: INestingToken) => {
  }, []);

  const onFinishAction = useCallback(() => {
    setModalType(BundleModalType.default);
    // setBundle(undefined);
    void fetchToken();

    onFinish();
  }, [onFinish, fetchToken]);

  const onClose = useCallback(() => {
    setModalType(BundleModalType.default);
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
            onTransferClick={onActionClick(BundleModalType.nestedTransfer)}
            onUnnestClick={onActionClick(BundleModalType.unnest)}
            onViewNodeDetails={onViewTokenDetails}
          />)}
        </ChildrenWraper>
      </BundlePagePaper>
      <BundleModal
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

const Content = styled.div`
  display: flex;
  /* border: 1px solid ${Grey300};
  border-radius: 4px; */
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
