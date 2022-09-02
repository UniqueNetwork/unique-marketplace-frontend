import React, { useCallback, useMemo } from 'react';
import { Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { Grey300 } from 'styles/colors';
import NodeView from 'components/BundleTree/NodeView';
import dataSource from 'components/TreeView/mockData';
import { IData } from 'components/BundleTree/types';
import { NestedSection } from 'components/BundleTree/NestedSection/NestedSection';
import BundleTree from 'components/TreeView/BundleTree';

const areNodesEqual = (a: IData, b: IData) => a.collectionId === b.collectionId && a.tokenId === b.tokenId;

const getKey = (a: IData) => `T${a.tokenId}C${a.collectionId}`;

function BundleTreeSection() {
  // const [selectedToken, setSelectedToken] = useState<IData | null>(null);
  const onNodeClicked = useCallback((data: IData) => {
    console.log('onNodeClicked');
  }, []);

  const tokensCount = useMemo(() => {
    let count = 1;
    const countChildren = (nodeChildren: IData[]) => {
      if (nodeChildren.length === 0) return count;
      else {
        count += nodeChildren.length;
        nodeChildren.forEach((child) => countChildren(child.nestingChildTokens || []));
      }
    };
    // @ts-ignore
    countChildren(dataSource.nestingChildTokens || []);
    return count;
  }, []);

  return (
    <BundlePagePaper>
      <HeaderStyled>
        <Heading size={'2'}>Bundle tree structure</Heading>
        <Text color='grey-500' size='m'>{tokensCount} items total</Text>
      </HeaderStyled>
      <Content>
        <BundleTree<IData>
          // @ts-ignore
          dataSource={[dataSource]}
          nodeView={NodeView}
          onNodeClicked={onNodeClicked}
          nestedSectionView={NestedSection}
          className={'tree-container'}
          compareNodes={areNodesEqual}
          childrenProperty={'nestingChildTokens'}
          getKey={getKey}
        />
      </Content>
    </BundlePagePaper>
  );
}

const BundlePagePaper = styled(PagePaper)`
  .tree-container {
    width: 536px;
    @media (max-width: 768px) {
      width: 100%;
    }
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
