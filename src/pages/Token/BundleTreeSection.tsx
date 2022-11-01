import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { Grey300 } from 'styles/colors';
import NodeView from 'components/BundleTree/Node/NodeView';
import { INestingToken } from 'components/BundleTree/types';
import { NestedSection } from 'components/BundleTree/NestedSection/NestedSection';
import BundleTree from 'components/TreeView/BundleTree';
import { useNavigate } from 'react-router-dom';
import MobileBundleTreeSection from './MobileBundleTreeSection';
import { useApi } from 'hooks/useApi';
import Skeleton from '../../components/Skeleton/Skeleton';
import { Offer } from '../../api/restApi/offers/types';
import BundleModal from './BundleModals/BundleTrunsferModal';
import { BundleModalType } from './BundleModals/types';
import { countNestedChildren } from '../../utils/helpers';
import { Token } from 'api/graphQL';

const areNodesEqual = (a: INestingToken, b: INestingToken) => a.collectionId === b.collectionId && a.tokenId === b.tokenId;

const getKey = (a: INestingToken) => `T${a.tokenId}C${a.collectionId}`;

const addIsCurrentAccountOwnerToBundleAndSort = (bundle: INestingToken, isOwner: boolean) => {
  bundle.isCurrentAccountOwner = isOwner;
  if (bundle.nestingChildTokens?.length === 0) return bundle;
  bundle.nestingChildTokens = bundle.nestingChildTokens?.sort((a, b) => a.tokenId > b.tokenId ? 1 : -1).map((token) => addIsCurrentAccountOwnerToBundleAndSort(token, isOwner));
  bundle.opened = true;
  return bundle;
};

interface IProps {
  token?: Token
  offer?: Offer
  onViewTokenDetails: Dispatch<SetStateAction<Token | undefined>>
  testid?: string
  isOwner: boolean
}

function BundleTreeSection({ onViewTokenDetails: onViewTokenDetailsProps, token, offer, testid, isOwner }: IProps) {
  const navigate = useNavigate();
  const { uniqueSdk } = useApi();
  const [isMobileViewVisible, setIsMobileViewVisible] = useState(false);
  const [bundle, setBundle] = useState<INestingToken[]>();
  const [isBundleLoading, setIsBundleLoading] = useState(true);
  const [modalType, setModalType] = useState(BundleModalType.default);
  const [selectedToken, setSelectedToken] = useState<INestingToken>();

  const onActionClick = useCallback((action: BundleModalType) => (token: INestingToken) => {
    setSelectedToken(token);
    setModalType(action);
  }, []);

  useEffect(() => {
    if (bundle && bundle[0].isCurrentAccountOwner === isOwner) return;
    (async () => {
      if (offer && offer.tokenDescription.nestingChildTokens) {
        const bundle: INestingToken = {
          ...offer.tokenDescription,
          tokenId: offer.tokenId,
          collectionId: offer.collectionId,
          nestingChildTokens: offer.tokenDescription.nestingChildTokens
        };
        setBundle([addIsCurrentAccountOwnerToBundleAndSort(bundle, isOwner)]);
      } else if (token) {
        setIsBundleLoading(true);
        const response = await uniqueSdk?.tokens.getBundle({ collectionId: token.collectionId, tokenId: token.tokenId });
        if (response) {
          setBundle([addIsCurrentAccountOwnerToBundleAndSort(response, isOwner)]);
        }
      }
      setIsBundleLoading(false);
    })();
  }, [uniqueSdk, token, offer, bundle, isOwner]);

  const closeView = useCallback(() => {
    setIsMobileViewVisible(false);
  }, []);

  const openView = useCallback(() => {
    setIsMobileViewVisible(true);
  }, []);

  const onNodeClicked = useCallback((data: INestingToken) => {
  }, []);

  const onFinish = useCallback(() => {
    setModalType(BundleModalType.default);
    setBundle(undefined);
  }, []);

  const onClose = useCallback(() => {
    setModalType(BundleModalType.default);
  }, []);

  const tokensCount = useMemo(() => {
    if (!bundle || !bundle[0]?.nestingChildTokens) return 0;
    return countNestedChildren(bundle[0].nestingChildTokens);
  }, [bundle]);

  const onViewTokenDetails = useCallback((token: INestingToken) => {
    navigate(`/token/${token.collectionId}/${token.tokenId}`);
    onViewTokenDetailsProps(token);
    if (isMobileViewVisible) closeView();
  }, [onViewTokenDetailsProps, isMobileViewVisible, closeView]);

  if (isBundleLoading) return (<BundleIsLoading />);

  return (
    <>
      <MobileBundleTreeSection
        isVisible={isMobileViewVisible}
        closeView={closeView}
        openView={openView}
        bundleTreeComponent={
          <BundleTree<INestingToken>
            dataSource={bundle || []}
            nodeView={NodeView}
            onNodeClicked={onNodeClicked}
            nestedSectionView={NestedSection}
            className={'tree-container'}
            compareNodes={areNodesEqual}
            childrenProperty={'nestingChildTokens'}
            getKey={getKey}
            onViewNodeDetails={onViewTokenDetails}
            onTransferClick={onActionClick(BundleModalType.nestedTransfer)}
            onUnnestClick={onActionClick(BundleModalType.unnest)}
          />
        }
      />
      <BundlePagePaper>
        <HeaderStyled id={'bundle'}>
          <Heading size={'2'}>Bundle tree structure</Heading>
          <Text color='grey-500' size='m'>{tokensCount + 1} items total</Text>
        </HeaderStyled>
        <Content>
          <BundleTree<INestingToken>
            dataSource={bundle || []}
            nodeView={NodeView}
            onNodeClicked={onNodeClicked}
            nestedSectionView={NestedSection}
            className={'tree-container'}
            compareNodes={areNodesEqual}
            childrenProperty={'nestingChildTokens'}
            getKey={getKey}
            onViewNodeDetails={onViewTokenDetails}
            onTransferClick={onActionClick(BundleModalType.nestedTransfer)}
            onUnnestClick={onActionClick(BundleModalType.unnest)}
          />
        </Content>
      </BundlePagePaper>
      <BundleModal
        token={selectedToken}
        bundleModalType={modalType}
        onFinish={onFinish}
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
  border: 1px solid ${Grey300};
  border-radius: 4px;
`;

export default BundleTreeSection;

const BundleIsLoading = () => (
  <BundlePagePaper>
    <HeaderStyled>
      <Heading size={'2'}>Bundle tree structure</Heading>
    </HeaderStyled>
    <Skeleton height={60} width={'100%'} />
  </BundlePagePaper>
);
