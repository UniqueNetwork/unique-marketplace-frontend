import React, { useCallback, useMemo, useState } from 'react';
import { Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { Grey300 } from 'styles/colors';
import NodeView from 'components/BundleTree/Node/NodeView';
import dataSource from 'components/TreeView/mockData';
import { INestingToken } from 'components/BundleTree/types';
import { NestedSection } from 'components/BundleTree/NestedSection/NestedSection';
import BundleTree from 'components/TreeView/BundleTree';
import { useNavigate } from 'react-router-dom';
import { NFTToken } from '../../api/uniqueSdk/types';
import MobileBundleTreeSection from './MobileBundleTreeSection';

const areNodesEqual = (a: INestingToken, b: INestingToken) => a.collectionId === b.collectionId && a.tokenId === b.tokenId;

const getKey = (a: INestingToken) => `T${a.tokenId}C${a.collectionId}`;

interface IProps {
  onViewTokenDetails(token: NFTToken): void
}

function BundleTreeSection({ onViewTokenDetails: onViewTokenDetailsProps }: IProps) {
  const navigate = useNavigate();
  const [isMobileViewVisible, setIsMobileViewVisible] = useState(false);

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
    let count = 1;
    const countChildren = (tokenChildren: INestingToken[]) => {
      if (tokenChildren.length === 0) return count;
      else {
        count += tokenChildren.length;
        tokenChildren.forEach((child) => countChildren(child.nestingChildTokens || []));
      }
    };
    // @ts-ignore
    countChildren(dataSource.nestingChildTokens || []);
    return count;
  }, []);

  const onViewTokenDetails = useCallback((token: INestingToken) => {
    navigate(`/token/${token.collectionId}/${token.tokenId}`);
    onViewTokenDetailsProps({
      ...token,
      id: token.tokenId,
      imageUrl: token.image
    });
    if (isMobileViewVisible) closeView();
  }, [onViewTokenDetailsProps, isMobileViewVisible, closeView]);

  return (
    <>
      <MobileBundleTreeSection
        isVisible={isMobileViewVisible}
        closeView={closeView}
        openView={openView}
        bundleTreeComponent={
          <BundleTree<INestingToken>
            // @ts-ignore
            dataSource={[dataSource]}
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
            // @ts-ignore
            dataSource={[dataSource]}
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
