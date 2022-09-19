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
import { TokenByIdResult } from '@unique-nft/substrate-client/tokens';
import BundleModal from './BundleModals/BundleModal';
import { BundleModalType } from './BundleModals/types';

const areNodesEqual = (a: INestingToken, b: INestingToken) => a.collectionId === b.collectionId && a.tokenId === b.tokenId;

const getKey = (a: INestingToken) => `T${a.tokenId}C${a.collectionId}`;

interface IProps {
  token?: TokenByIdResult
  offer?: Offer
  onViewTokenDetails: Dispatch<SetStateAction<TokenByIdResult | undefined>>
  testid?: string
}

function BundleTreeSection({ onViewTokenDetails: onViewTokenDetailsProps, token, offer, testid }: IProps) {
  const navigate = useNavigate();
  const { uniqueSdk } = useApi();
  const [isMobileViewVisible, setIsMobileViewVisible] = useState(false);
  const [bundle, setBundle] = useState<INestingToken[]>();
  const [isBundleLoading, setIsBundleLoading] = useState(true);
  const [modalType, setModalType] = useState(BundleModalType.default);
  const [selectedToken, setSelectedToken] = useState<INestingToken>();
  const [selectedParent, setSelectedParent] = useState<INestingToken>();

  const onActionClick = useCallback((action: BundleModalType) => (token: INestingToken, parent: INestingToken) => {
    setSelectedToken(token);
    setSelectedParent(parent);
    setModalType(action);
  }, []);

  useEffect(() => {
    if (bundle) return;
    (async () => {
      if (offer && offer.tokenDescription.nestingChildTokens) {
        const bundle: INestingToken = {
          ...offer.tokenDescription,
          tokenId: offer.tokenId,
          collectionId: offer.collectionId,
          nestingChildTokens: offer.tokenDescription.nestingChildTokens
        };
        setBundle([bundle]);
      } else if (token) {
        setIsBundleLoading(true);
        const response = await uniqueSdk?.tokens.getBundle({ collectionId: token.collectionId, tokenId: token.tokenId });
        if (response) {
          setBundle([response]);
        }
      }
      setIsBundleLoading(false);
    })();
  }, [uniqueSdk, token, offer, bundle]);

  const closeView = useCallback(() => {
    setIsMobileViewVisible(false);
  }, []);

  const openView = useCallback(() => {
    setIsMobileViewVisible(true);
  }, []);

  const onNodeClicked = useCallback((data: INestingToken) => {
    console.log('onNodeClicked');
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
    let count = 1;
    const countChildren = (tokenChildren: INestingToken[]) => {
      if (tokenChildren.length === 0) return count;
      else {
        count += tokenChildren.length;
        tokenChildren.forEach((child) => countChildren(child.nestingChildTokens || []));
      }
    };
    countChildren(bundle[0].nestingChildTokens || []);
    return count;
  }, [bundle]);

  const onViewTokenDetails = useCallback((token: TokenByIdResult) => {
    navigate(`/token/${token.collectionId}/${token.tokenId}`);
    onViewTokenDetailsProps(token);
    if (isMobileViewVisible) closeView();
  }, [onViewTokenDetailsProps, isMobileViewVisible, closeView]);

  if (isBundleLoading) return (<BundleIsLoading />);

  if (!token) return null;

  return (
    <>
      <MobileBundleTreeSection
        isVisible={isMobileViewVisible}
        closeView={closeView}
        openView={openView}
        bundleTreeComponent={
          <BundleTree<INestingToken>
            parent={{ ...token, nestingChildTokens: bundle || [] }}
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
        <HeaderStyled>
          <Heading size={'2'}>Bundle tree structure</Heading>
          <Text color='grey-500' size='m'>{tokensCount} items total</Text>
        </HeaderStyled>
        <Content>
          <BundleTree<INestingToken>
            parent={{ ...token, nestingChildTokens: bundle || [] }}
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
        parent={selectedParent}
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
`;

export default BundleTreeSection;

const BundleIsLoading = () => (
  <BundlePagePaper>
    <HeaderStyled>
      <Heading size={'2'}>Bundle tree structure</Heading>
    </HeaderStyled>
    <Skeleton height={58} width={'100%'} />
  </BundlePagePaper>
);
