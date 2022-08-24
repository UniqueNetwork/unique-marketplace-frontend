import React, { useCallback } from 'react';
import { Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { Grey100, Grey300 } from 'styles/colors';
import { Tree } from '../TreeView/Tree';
import NodeView from '../TreeView/NodeViewExample';
import dataSource from '../TreeView/mockData';

function BundleTree() {
  const onNodeClicked = useCallback((tokenId, collectionId) => {
    console.log('tokenId, collectionId', tokenId, collectionId);
  }, []);

  // console.log('dataSource', dataSource);

  return (
    <BundlePagePaper>
      <HeaderStyled>
        <Heading size={'2'}>Bundle tree structure</Heading>
        <Text color='grey-500' size='m'>13 items total</Text>
      </HeaderStyled>
      <Content>
        <TreeContainer>
          <Tree
            // @ts-ignore
            dataSource={[dataSource]}
            nodeView={NodeView}
            onNodeClicked={onNodeClicked}
          />
        </TreeContainer>
        <NestedDetails>
          <Text color='additional-dark' size='l'>Nested in magi #5</Text>
        </NestedDetails>
      </Content>
    </BundlePagePaper>
  );
}

const BundlePagePaper = styled(PagePaper)`
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

const TreeContainer = styled.div`
  width: 536px;
`;

const NestedDetails = styled.div`
  padding: 16px 32px;
  background-color: ${Grey100};
  width: 100%;
`;

export default BundleTree;
