import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { Grey300 } from 'styles/colors';
import NodeView from 'components/BundleTree/Node/NodeView';
import { INestingToken } from 'components/BundleTree/types';
import { NestedSection } from 'components/BundleTree/NestedSection/NestedSection';
import BundleTree from 'components/TreeView/BundleTree';
import { useNavigate } from 'react-router-dom';
import { NFTToken } from 'api/uniqueSdk/types';
import MobileBundleTreeSection from './MobileBundleTreeSection';
import { useApi } from 'hooks/useApi';
import Skeleton from '../../components/Skeleton/Skeleton';
import { Offer } from '../../api/restApi/offers/types';

const areNodesEqual = (a: INestingToken, b: INestingToken) => a.collectionId === b.collectionId && a.tokenId === b.tokenId;

const getKey = (a: INestingToken) => `T${a.tokenId}C${a.collectionId}`;

interface IProps {
  onViewTokenDetails(token: NFTToken): void
  token?: NFTToken
  offer?: Offer
  fetchOffer: (collectionId: number, tokenId: number) => Promise<Offer | null>
}

function BundleTreeSection({ onViewTokenDetails: onViewTokenDetailsProps, token, offer, fetchOffer }: IProps) {
  const navigate = useNavigate();
  const { uniqueSdk } = useApi();
  const [isMobileViewVisible, setIsMobileViewVisible] = useState(false);
  const [bundle, setBundle] = useState<INestingToken[]>();
  const [isBundleLoading, setIsBundleLoading] = useState(true);

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
        const response = await uniqueSdk?.tokens.getBundle({ collectionId: token.collectionId, tokenId: token.id });
        // console.log('getbundle response', response);
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

  const onViewTokenDetails = useCallback((token: INestingToken) => {
    navigate(`/token/${token.collectionId}/${token.tokenId}`);
    onViewTokenDetailsProps({
      ...token,
      id: token.tokenId,
      imageUrl: token.image,
      isBundle: true,
      tokenDescription: {
        collectionName: '', // TODO fix this
        collectionCover: '',
        description: '',
        image: token.image,
        prefix: '',
        attributes: token.attributes,
        nestingChildTokens: token.nestingChildTokens
      }
    });
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
            dataSource={bundle || []}
            nodeView={NodeView}
            onNodeClicked={onNodeClicked}
            nestedSectionView={NestedSection}
            className={'tree-container'}
            compareNodes={areNodesEqual}
            childrenProperty={'nestingChildTokens'}
            getKey={getKey}
            onViewNodeDetails={onViewTokenDetails}
          />
        </Content>
      </BundlePagePaper>
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
